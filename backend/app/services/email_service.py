import asyncio
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import partial

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_config import EmailConfig
from app.models.ticket import Ticket
from app.models.user import User


def _send_email_sync(
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    sender_email: str,
    recipient_email: str,
    subject: str,
    body_html: str,
) -> None:
    """Send an email synchronously via SMTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = recipient_email
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(sender_email, recipient_email, msg.as_string())


async def send_email(
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    sender_email: str,
    recipient_email: str,
    subject: str,
    body_html: str,
) -> None:
    """Send an email asynchronously by running smtplib in an executor."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        partial(
            _send_email_sync,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_password,
            sender_email,
            recipient_email,
            subject,
            body_html,
        ),
    )


async def send_test_email(config: EmailConfig, recipient_email: str) -> None:
    """Send a test email to verify SMTP configuration."""
    subject = "Tuesday - בדיקת הגדרות דוא\"ל"
    body_html = """
    <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>בדיקת הגדרות דוא"ל</h2>
        <p>הודעה זו נשלחה כבדיקה ממערכת Tuesday.</p>
        <p>אם קיבלת הודעה זו, הגדרות הדוא"ל תקינות.</p>
    </div>
    """
    await send_email(
        smtp_host=config.smtp_host,
        smtp_port=config.smtp_port,
        smtp_user=config.smtp_user,
        smtp_password=config.smtp_password,
        sender_email=config.sender_email,
        recipient_email=recipient_email,
        subject=subject,
        body_html=body_html,
    )


async def get_overdue_tickets(db: AsyncSession) -> list[Ticket]:
    """Get all tickets that have been open for more than 5 days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=5)
    result = await db.execute(
        select(Ticket).where(
            Ticket.status == "open",
            Ticket.created_at <= cutoff,
        ).order_by(Ticket.created_at)
    )
    return list(result.scalars().all())


def _build_overdue_email_body(tickets: list[Ticket]) -> str:
    """Build an HTML email body in Hebrew listing the overdue tickets."""
    rows = ""
    for t in tickets:
        reporter_name = t.reporter.full_name if t.reporter else "לא ידוע"
        created = t.created_at.strftime("%d/%m/%Y") if t.created_at else ""
        rows += f"""
        <tr>
            <td style="border:1px solid #ccc; padding:8px;">{t.id}</td>
            <td style="border:1px solid #ccc; padding:8px;">{t.title}</td>
            <td style="border:1px solid #ccc; padding:8px;">{t.priority}</td>
            <td style="border:1px solid #ccc; padding:8px;">{reporter_name}</td>
            <td style="border:1px solid #ccc; padding:8px;">{created}</td>
        </tr>
        """

    body = f"""
    <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>התראה: קריאות פתוחות מעל 5 ימים</h2>
        <p>להלן רשימת הקריאות שפתוחות מעל 5 ימים ודורשות טיפול:</p>
        <table style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="border:1px solid #ccc; padding:8px;">מספר</th>
                    <th style="border:1px solid #ccc; padding:8px;">כותרת</th>
                    <th style="border:1px solid #ccc; padding:8px;">עדיפות</th>
                    <th style="border:1px solid #ccc; padding:8px;">מדווח</th>
                    <th style="border:1px solid #ccc; padding:8px;">תאריך פתיחה</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        <p>סה"כ קריאות פתוחות מעל 5 ימים: {len(tickets)}</p>
        <br>
        <p>הודעה זו נשלחה אוטומטית ממערכת Tuesday.</p>
    </div>
    """
    return body


async def send_overdue_alerts(db: AsyncSession) -> dict:
    """Send alert emails to all active users about tickets open more than 5 days."""
    # Get email config
    result = await db.execute(select(EmailConfig).order_by(EmailConfig.id.desc()).limit(1))
    config = result.scalar_one_or_none()
    if not config or not config.is_enabled:
        return {"status": "error", "detail": "Email configuration not found or not enabled"}

    # Get overdue tickets
    tickets = await get_overdue_tickets(db)
    if not tickets:
        return {"status": "ok", "detail": "No overdue tickets found", "emails_sent": 0}

    # Get all active approved users
    users_result = await db.execute(
        select(User).where(User.is_active == True, User.is_approved == True)
    )
    users = users_result.scalars().all()

    if not users:
        return {"status": "ok", "detail": "No active users to notify", "emails_sent": 0}

    subject = f"Tuesday - התראה: {len(tickets)} קריאות פתוחות מעל 5 ימים"
    body = _build_overdue_email_body(tickets)

    sent_count = 0
    errors = []
    for user in users:
        try:
            await send_email(
                smtp_host=config.smtp_host,
                smtp_port=config.smtp_port,
                smtp_user=config.smtp_user,
                smtp_password=config.smtp_password,
                sender_email=config.sender_email,
                recipient_email=user.email,
                subject=subject,
                body_html=body,
            )
            sent_count += 1
        except Exception as e:
            errors.append(f"{user.email}: {str(e)}")

    return {
        "status": "ok",
        "emails_sent": sent_count,
        "total_users": len(users),
        "overdue_tickets": len(tickets),
        "errors": errors,
    }

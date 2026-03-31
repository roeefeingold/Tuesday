from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_admin
from app.models.email_config import EmailConfig
from app.models.user import User
from app.schemas.email_config import EmailConfigCreate, EmailConfigOut, EmailConfigUpdate
from app.services.email_service import send_test_email, send_overdue_alerts

router = APIRouter(prefix="/api/email-config", tags=["email-config"])


def _config_to_out(config: EmailConfig) -> EmailConfigOut:
    password = config.smtp_password or ""
    if len(password) > 4:
        masked = password[:2] + "*" * (len(password) - 4) + password[-2:]
    else:
        masked = "****"
    return EmailConfigOut(
        id=config.id,
        smtp_host=config.smtp_host,
        smtp_port=config.smtp_port,
        smtp_user=config.smtp_user,
        smtp_password_masked=masked,
        sender_email=config.sender_email,
        is_enabled=config.is_enabled,
        created_at=config.created_at,
        updated_at=config.updated_at,
    )


@router.get("", response_model=EmailConfigOut)
async def get_email_config(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(EmailConfig).order_by(EmailConfig.id.desc()).limit(1))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email configuration not found")
    return _config_to_out(config)


@router.put("", response_model=EmailConfigOut)
async def create_or_update_email_config(
    config_in: EmailConfigCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(EmailConfig).order_by(EmailConfig.id.desc()).limit(1))
    config = result.scalar_one_or_none()

    if config:
        config.smtp_host = config_in.smtp_host
        config.smtp_port = config_in.smtp_port
        config.smtp_user = config_in.smtp_user
        config.smtp_password = config_in.smtp_password
        config.sender_email = config_in.sender_email
        config.is_enabled = config_in.is_enabled
    else:
        config = EmailConfig(
            smtp_host=config_in.smtp_host,
            smtp_port=config_in.smtp_port,
            smtp_user=config_in.smtp_user,
            smtp_password=config_in.smtp_password,
            sender_email=config_in.sender_email,
            is_enabled=config_in.is_enabled,
        )
        db.add(config)

    await db.flush()
    await db.refresh(config)
    return _config_to_out(config)


@router.post("/test")
async def test_email(
    body: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    recipient = body.get("recipient_email", admin.email)

    result = await db.execute(select(EmailConfig).order_by(EmailConfig.id.desc()).limit(1))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email configuration not found")

    try:
        await send_test_email(config, recipient)
        return {"status": "ok", "detail": f"Test email sent to {recipient}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}",
        )


@router.post("/send-alerts")
async def trigger_alerts(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await send_overdue_alerts(db)
    return result

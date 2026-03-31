from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.ticket import Ticket, TicketComment
from app.models.user import User
from app.schemas.ticket import (
    CommentCreate,
    CommentOut,
    TicketCreate,
    TicketOut,
    TicketStats,
    TicketStatusUpdate,
    TicketUpdate,
)

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def _ticket_to_out(ticket: Ticket) -> TicketOut:
    comments_out = []
    for c in ticket.comments:
        comments_out.append(
            CommentOut(
                id=c.id,
                ticket_id=c.ticket_id,
                author_id=c.author_id,
                author_name=c.author.full_name if c.author else "Unknown",
                body=c.body,
                created_at=c.created_at,
            )
        )
    return TicketOut(
        id=ticket.id,
        title=ticket.title,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        reporter_id=ticket.reporter_id,
        reporter_name=ticket.reporter.full_name if ticket.reporter else "Unknown",
        assignee_id=ticket.assignee_id,
        assignee_name=ticket.assignee.full_name if ticket.assignee else None,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        comments=comments_out,
    )


@router.get("/stats", response_model=TicketStats)
async def ticket_stats(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    # Count by status
    status_result = await db.execute(
        select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)
    )
    by_status = {row[0]: row[1] for row in status_result.all()}

    # Count by priority
    priority_result = await db.execute(
        select(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority)
    )
    by_priority = {row[0]: row[1] for row in priority_result.all()}

    total = sum(by_status.values())

    return TicketStats(by_status=by_status, by_priority=by_priority, total=total)


@router.get("", response_model=list[TicketOut])
async def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    assignee_id: Optional[UUID] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    query = select(Ticket)

    if status_filter:
        query = query.where(Ticket.status == status_filter)
    if assignee_id:
        query = query.where(Ticket.assignee_id == assignee_id)
    if priority:
        query = query.where(Ticket.priority == priority)
    if search:
        query = query.where(Ticket.title.ilike(f"%{search}%"))

    query = query.order_by(Ticket.created_at.desc())
    result = await db.execute(query)
    tickets = result.scalars().all()

    return [_ticket_to_out(t) for t in tickets]


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_in: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = Ticket(
        title=ticket_in.title,
        description=ticket_in.description,
        priority=ticket_in.priority,
        reporter_id=current_user.id,
        assignee_id=ticket_in.assignee_id,
    )
    db.add(ticket)
    await db.flush()
    await db.refresh(ticket)
    return _ticket_to_out(ticket)


@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return _ticket_to_out(ticket)


@router.patch("/{ticket_id}", response_model=TicketOut)
async def update_ticket(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    update_data = ticket_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)

    await db.flush()
    await db.refresh(ticket)
    return _ticket_to_out(ticket)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if ticket.status != "solved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket must be in 'solved' status to be deleted",
        )

    is_reporter = ticket.reporter_id == current_user.id
    is_admin = current_user.role == "admin"
    if not is_reporter and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the ticket reporter or an admin can delete this ticket",
        )

    await db.delete(ticket)
    await db.flush()


@router.patch("/{ticket_id}/status", response_model=TicketOut)
async def update_ticket_status(
    ticket_id: int,
    status_in: TicketStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    current_status = ticket.status
    new_status = status_in.status

    # State machine validation
    allowed_transitions = {
        "open": ["in_process"],
        "in_process": ["solved", "open"],
        "solved": ["open"],
    }

    if new_status not in allowed_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'",
        )

    # open -> in_process requires assignee
    if current_status == "open" and new_status == "in_process":
        if not ticket.assignee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot move to in_process without an assignee",
            )

    # solved -> open requires admin
    if current_status == "solved" and new_status == "open":
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can reopen solved tickets",
            )

    ticket.status = new_status
    await db.flush()
    await db.refresh(ticket)
    return _ticket_to_out(ticket)


@router.patch("/{ticket_id}/assign", response_model=TicketOut)
async def assign_ticket(
    ticket_id: int,
    body: dict,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    assignee_id = body.get("assignee_id")
    if not assignee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="assignee_id is required")

    try:
        assignee_uuid = UUID(assignee_id) if isinstance(assignee_id, str) else assignee_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignee_id")

    # Verify assignee exists
    assignee_result = await db.execute(select(User).where(User.id == assignee_uuid))
    assignee = assignee_result.scalar_one_or_none()
    if not assignee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignee not found")

    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    ticket.assignee_id = assignee_uuid
    await db.flush()
    await db.refresh(ticket)
    return _ticket_to_out(ticket)


@router.post("/{ticket_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def add_comment(
    ticket_id: int,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify ticket exists
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    comment = TicketComment(
        ticket_id=ticket_id,
        author_id=current_user.id,
        body=comment_in.body,
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment)

    return CommentOut(
        id=comment.id,
        ticket_id=comment.ticket_id,
        author_id=comment.author_id,
        author_name=current_user.full_name,
        body=comment.body,
        created_at=comment.created_at,
    )

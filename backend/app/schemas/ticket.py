from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    category: str = "bug"
    assignee_id: Optional[UUID] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assignee_id: Optional[UUID] = None


class TicketStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"open", "in_process", "solved"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v


class CommentCreate(BaseModel):
    body: str


class CommentOut(BaseModel):
    id: int
    ticket_id: int
    author_id: UUID
    author_name: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    category: str
    reporter_id: UUID
    reporter_name: str
    assignee_id: Optional[UUID] = None
    assignee_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: list[CommentOut] = []

    model_config = ConfigDict(from_attributes=True)


class TicketStats(BaseModel):
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    total: int = 0

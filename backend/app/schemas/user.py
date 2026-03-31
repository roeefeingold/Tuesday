from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_approved: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_approved: Optional[bool] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str

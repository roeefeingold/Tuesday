from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EmailConfigCreate(BaseModel):
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    sender_email: str
    is_enabled: bool = False


class EmailConfigUpdate(BaseModel):
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    sender_email: Optional[str] = None
    is_enabled: Optional[bool] = None


class EmailConfigOut(BaseModel):
    id: int
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password_masked: str
    sender_email: str
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

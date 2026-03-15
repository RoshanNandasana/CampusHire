import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    email: str
    role_id: uuid.UUID
    is_active: bool


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):

    id: uuid.UUID
    must_change_password: bool
    token_version: int
    last_login_at: datetime | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
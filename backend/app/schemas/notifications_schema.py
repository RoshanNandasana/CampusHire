import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    user_id: uuid.UUID
    title: str
    message: str
    is_read: bool


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    user_id: uuid.UUID | None = None
    title: str | None = None
    message: str | None = None
    is_read: bool | None = None


class NotificationResponse(NotificationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

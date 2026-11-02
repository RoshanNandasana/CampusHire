import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BlacklistBase(BaseModel):
    student_id: uuid.UUID | None
    company_id: uuid.UUID | None
    reason: str
    blacklisted_by: uuid.UUID
    expires_at: datetime | None


class BlacklistCreate(BlacklistBase):
    pass


class BlacklistUpdate(BaseModel):
    student_id: uuid.UUID | None = None
    company_id: uuid.UUID | None = None
    reason: str | None = None
    blacklisted_by: uuid.UUID | None = None
    expires_at: datetime | None = None


class BlacklistResponse(BlacklistBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

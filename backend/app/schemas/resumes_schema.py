import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeBase(BaseModel):
    student_id: uuid.UUID
    file_url: str


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    student_id: uuid.UUID | None = None
    file_url: str | None = None


class ResumeResponse(ResumeBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

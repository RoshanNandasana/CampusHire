import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobApplicationBase(BaseModel):
    student_id: uuid.UUID
    job_id: uuid.UUID
    status: str


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    student_id: uuid.UUID | None = None
    job_id: uuid.UUID | None = None
    status: str | None = None


class JobApplicationResponse(JobApplicationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobBase(BaseModel):
    company_id: uuid.UUID
    drive_id: uuid.UUID | None
    title: str
    description: str
    salary: int
    application_deadline: datetime


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    drive_id: uuid.UUID | None = None
    title: str | None = None
    description: str | None = None
    salary: int | None = None
    application_deadline: datetime | None = None


class JobResponse(JobBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

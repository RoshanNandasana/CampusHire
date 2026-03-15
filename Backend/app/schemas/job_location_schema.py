import uuid

from pydantic import BaseModel, ConfigDict


class JobLocationBase(BaseModel):
    job_id: uuid.UUID
    location: str


class JobLocationCreate(JobLocationBase):
    pass


class JobLocationUpdate(BaseModel):
    job_id: uuid.UUID | None = None
    location: str | None = None


class JobLocationResponse(JobLocationBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

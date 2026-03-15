import uuid

from pydantic import BaseModel, ConfigDict


class ResumeVersionBase(BaseModel):
    resume_id: uuid.UUID
    version_number: int
    file_url: str


class ResumeVersionCreate(ResumeVersionBase):
    pass


class ResumeVersionUpdate(BaseModel):
    resume_id: uuid.UUID | None = None
    version_number: int | None = None
    file_url: str | None = None


class ResumeVersionResponse(ResumeVersionBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

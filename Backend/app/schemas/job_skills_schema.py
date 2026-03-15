import uuid

from pydantic import BaseModel, ConfigDict


class JobSkillBase(BaseModel):
    job_id: uuid.UUID
    skill_name: str


class JobSkillCreate(JobSkillBase):
    pass


class JobSkillUpdate(BaseModel):
    job_id: uuid.UUID | None = None
    skill_name: str | None = None


class JobSkillResponse(JobSkillBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

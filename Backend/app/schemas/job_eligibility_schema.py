import uuid

from pydantic import BaseModel, ConfigDict


class JobEligibilityBase(BaseModel):
    job_id: uuid.UUID
    department_id: uuid.UUID
    min_cgpa: float
    max_backlogs: int


class JobEligibilityCreate(JobEligibilityBase):
    pass


class JobEligibilityUpdate(BaseModel):
    job_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    min_cgpa: float | None = None
    max_backlogs: int | None = None


class JobEligibilityResponse(JobEligibilityBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

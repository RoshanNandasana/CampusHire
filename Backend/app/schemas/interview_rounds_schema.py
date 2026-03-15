import uuid

from pydantic import BaseModel, ConfigDict


class InterviewRoundBase(BaseModel):
    job_id: uuid.UUID
    name: str
    round_order: int


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRoundUpdate(BaseModel):
    job_id: uuid.UUID | None = None
    name: str | None = None
    round_order: int | None = None


class InterviewRoundResponse(InterviewRoundBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InterviewFeedbackBase(BaseModel):
    application_id: uuid.UUID
    interview_round_id: uuid.UUID
    interviewer_id: uuid.UUID
    score: int | None
    decision: str
    remarks: str | None


class InterviewFeedbackCreate(InterviewFeedbackBase):
    pass


class InterviewFeedbackUpdate(BaseModel):
    application_id: uuid.UUID | None = None
    interview_round_id: uuid.UUID | None = None
    interviewer_id: uuid.UUID | None = None
    score: int | None = None
    decision: str | None = None
    remarks: str | None = None


class InterviewFeedbackResponse(InterviewFeedbackBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

import uuid

from pydantic import BaseModel, ConfigDict


class ApplicationStageHistoryBase(BaseModel):
    application_id: uuid.UUID
    interview_round_id: uuid.UUID
    status: str
    remarks: str | None


class ApplicationStageHistoryCreate(ApplicationStageHistoryBase):
    pass


class ApplicationStageHistoryUpdate(BaseModel):
    application_id: uuid.UUID | None = None
    interview_round_id: uuid.UUID | None = None
    status: str | None = None
    remarks: str | None = None


class ApplicationStageHistoryResponse(ApplicationStageHistoryBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

import uuid

from pydantic import BaseModel, ConfigDict


class OfferHistoryBase(BaseModel):
    offer_id: uuid.UUID
    status: str


class OfferHistoryCreate(OfferHistoryBase):
    pass


class OfferHistoryUpdate(BaseModel):
    offer_id: uuid.UUID | None = None
    status: str | None = None


class OfferHistoryResponse(OfferHistoryBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

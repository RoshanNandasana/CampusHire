import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OfferBase(BaseModel):
    application_id: uuid.UUID
    salary: int
    status: str
    offer_letter_url: str


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    application_id: uuid.UUID | None = None
    salary: int | None = None
    status: str | None = None
    offer_letter_url: str | None = None


class OfferResponse(OfferBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

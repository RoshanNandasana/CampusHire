import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyBase(BaseModel):
    user_id: uuid.UUID
    name: str
    website: str | None
    description: str | None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    user_id: uuid.UUID | None = None
    name: str | None = None
    website: str | None = None
    description: str | None = None


class CompanyResponse(CompanyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

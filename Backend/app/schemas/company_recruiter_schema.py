import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyRecruiterBase(BaseModel):
    company_id: uuid.UUID
    name: str
    email: str
    phone: str | None


class CompanyRecruiterCreate(CompanyRecruiterBase):
    pass


class CompanyRecruiterUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    name: str | None = None
    email: str | None = None
    phone: str | None = None


class CompanyRecruiterResponse(CompanyRecruiterBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyDocumentBase(BaseModel):
    company_id: uuid.UUID
    uploaded_by: uuid.UUID
    title: str
    document_type: str
    file_url: str


class CompanyDocumentCreate(CompanyDocumentBase):
    pass


class CompanyDocumentUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    uploaded_by: uuid.UUID | None = None
    title: str | None = None
    document_type: str | None = None
    file_url: str | None = None


class CompanyDocumentResponse(CompanyDocumentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

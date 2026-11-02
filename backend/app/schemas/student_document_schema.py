import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentDocumentBase(BaseModel):
    student_id: uuid.UUID
    document_type: str
    file_url: str


class StudentDocumentCreate(StudentDocumentBase):
    pass


class StudentDocumentUpdate(BaseModel):
    student_id: uuid.UUID | None = None
    document_type: str | None = None
    file_url: str | None = None


class StudentDocumentResponse(StudentDocumentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

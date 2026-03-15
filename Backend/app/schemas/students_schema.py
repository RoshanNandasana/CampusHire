import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentBase(BaseModel):
    user_id: uuid.UUID
    department_id: uuid.UUID
    enrollment_number: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    backlog_count: int


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    user_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    enrollment_number: str | None = None
    cgpa: float | None = None
    tenth_percentage: float | None = None
    twelfth_percentage: float | None = None
    backlog_count: int | None = None


class StudentResponse(StudentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

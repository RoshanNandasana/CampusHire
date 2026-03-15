import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudyMaterialBase(BaseModel):
    title: str
    category: str
    file_url: str
    created_by: uuid.UUID


class StudyMaterialCreate(StudyMaterialBase):
    pass


class StudyMaterialUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    file_url: str | None = None
    created_by: uuid.UUID | None = None


class StudyMaterialResponse(StudyMaterialBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

import uuid

from pydantic import BaseModel, ConfigDict


class MaterialAccessBase(BaseModel):
    material_id: uuid.UUID
    student_id: uuid.UUID


class MaterialAccessCreate(MaterialAccessBase):
    pass


class MaterialAccessUpdate(BaseModel):
    material_id: uuid.UUID | None = None
    student_id: uuid.UUID | None = None


class MaterialAccessResponse(MaterialAccessBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

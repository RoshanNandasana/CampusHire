import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TPOCoordinatorBase(BaseModel):
    user_id: uuid.UUID
    department_id: uuid.UUID


class TPOCoordinatorCreate(TPOCoordinatorBase):
    pass


class TPOCoordinatorUpdate(BaseModel):
    user_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None


class TPOCoordinatorResponse(TPOCoordinatorBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

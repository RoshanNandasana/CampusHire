import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RoleBase(BaseModel):
    name: str


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: str | None = None


class RoleResponse(RoleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

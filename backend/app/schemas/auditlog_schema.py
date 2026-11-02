import uuid

from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    user_id: uuid.UUID | None
    action: str
    entity_type: str
    entity_id: str
    metadata_json: dict


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogUpdate(BaseModel):
    user_id: uuid.UUID | None = None
    action: str | None = None
    entity_type: str | None = None
    entity_id: str | None = None
    metadata_json: dict | None = None


class AuditLogResponse(AuditLogBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

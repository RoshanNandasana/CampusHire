import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PlacementDriveBase(BaseModel):
    company_id: uuid.UUID
    name: str
    drive_date: datetime
    registration_deadline: datetime
    status: str


class PlacementDriveCreate(PlacementDriveBase):
    pass


class PlacementDriveUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    name: str | None = None
    drive_date: datetime | None = None
    registration_deadline: datetime | None = None
    status: str | None = None


class PlacementDriveResponse(PlacementDriveBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

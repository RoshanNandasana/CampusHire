from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RecruiterPostJobRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    description: str
    department_id: uuid.UUID | None = Field(default=None, alias="departmentId")
    openings: int = Field(ge=1)
    minCGPA: float = Field(ge=0, le=10)
    skills: list[str] = Field(default_factory=list)
    salaryLpa: float = Field(ge=0)
    location: str
    driveDate: str
    deadline: str
    contactName: str
    contactRole: str
    contactEmail: str
    contactPhone: str
    bondDurationMonths: int = Field(default=0, ge=0)
    bondDetails: str = "No bond required."
    requiredDocuments: list[str] = Field(default_factory=list)
    rounds: list[dict] = Field(default_factory=list)

    @field_validator('deadline', 'driveDate')
    @classmethod
    def validate_dates(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except (ValueError, TypeError):
            raise ValueError('Must be a valid ISO format date string')

    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v, info):
        try:
            deadline = datetime.fromisoformat(v)
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            if deadline < today:
                raise ValueError('Application deadline cannot be before today')
            
            # Check if driveDate exists in the data
            if 'driveDate' in info.data:
                drive_date = datetime.fromisoformat(info.data['driveDate'])
                if deadline > drive_date:
                    raise ValueError('Application deadline cannot be after the drive date')
            
            return v
        except ValueError as e:
            if 'cannot be' in str(e):
                raise
            raise ValueError('Invalid date format')


class RecruiterApplicationStatusUpdateRequest(BaseModel):
    status: str


class RecruiterOfferCreateRequest(BaseModel):
    salaryLpa: float = Field(ge=0)
    status: str = "PENDING"
    offerLetterUrl: str = ""


class RecruiterOfferStatusUpdateRequest(BaseModel):
    status: str

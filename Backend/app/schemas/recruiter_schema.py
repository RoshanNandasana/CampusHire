from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict, Field


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


class RecruiterApplicationStatusUpdateRequest(BaseModel):
    status: str


class RecruiterOfferCreateRequest(BaseModel):
    salaryLpa: float = Field(ge=0)
    status: str = "PENDING"
    offerLetterUrl: str = ""


class RecruiterOfferStatusUpdateRequest(BaseModel):
    status: str

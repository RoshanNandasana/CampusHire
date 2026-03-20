from __future__ import annotations

from pydantic import BaseModel, Field


class StudentProfileUpdateRequest(BaseModel):
    profileData: dict = Field(default_factory=dict)
    skills: list[str] = Field(default_factory=list)
    projects: list[dict] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    educationRecords: list[dict] = Field(default_factory=list)
    additionalDocs: list[dict] = Field(default_factory=list)


class StudentSimpleMessage(BaseModel):
    message: str

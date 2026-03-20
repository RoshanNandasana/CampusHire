from __future__ import annotations

from pydantic import BaseModel, ConfigDict
import uuid


# Project Schemas
class StudentProjectBase(BaseModel):
    title: str
    role: str
    organization: str
    start_date: str
    end_date: str | None = None
    is_ongoing: bool = False
    technologies: list[str]
    description: str
    impact: str | None = None
    project_url: str | None = None
    repository_url: str | None = None


class StudentProjectCreate(StudentProjectBase):
    pass


class StudentProjectUpdate(BaseModel):
    title: str | None = None
    role: str | None = None
    organization: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_ongoing: bool | None = None
    technologies: list[str] | None = None
    description: str | None = None
    impact: str | None = None
    project_url: str | None = None
    repository_url: str | None = None


class StudentProjectResponse(StudentProjectBase):
    id: uuid.UUID
    student_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


# Certification Schemas
class StudentCertificationBase(BaseModel):
    name: str
    issuer: str
    issue_date: str
    expiry_date: str | None = None
    no_expiry: bool = False
    credential_id: str | None = None
    credential_url: str | None = None
    skills_covered: list[str] = []


class StudentCertificationCreate(StudentCertificationBase):
    pass


class StudentCertificationUpdate(BaseModel):
    name: str | None = None
    issuer: str | None = None
    issue_date: str | None = None
    expiry_date: str | None = None
    no_expiry: bool | None = None
    credential_id: str | None = None
    credential_url: str | None = None
    skills_covered: list[str] | None = None


class StudentCertificationResponse(StudentCertificationBase):
    id: uuid.UUID
    student_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


# Enhanced Skill Schemas
class StudentSkillBase(BaseModel):
    skill_name: str
    proficiency: str = "intermediate"  # beginner, intermediate, advanced, expert
    years_of_experience: float = 0.0
    endorsement_count: int = 0


class StudentSkillCreate(BaseModel):
    skill_name: str
    proficiency: str = "intermediate"
    years_of_experience: float = 0.0


class StudentSkillUpdate(BaseModel):
    skill_name: str | None = None
    proficiency: str | None = None
    years_of_experience: float | None = None
    endorsement_count: int | None = None


class StudentSkillResponse(StudentSkillBase):
    id: uuid.UUID
    student_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


# Profile Schemas
class StudentProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    enrollment_number: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    backlog_count: int
    phone: str | None = None
    date_of_birth: str | None = None
    university_id: str | None = None
    preferred_role: str | None = None
    profile_image: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class StudentProfileUpdateRequest(BaseModel):
    phone: str | None = None
    date_of_birth: str | None = None
    university_id: str | None = None
    preferred_role: str | None = None
    profile_image: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None

    # For backward compatibility
    profileData: dict | None = None
    skills: list[str] | None = None
    projects: list[dict] | None = None
    certifications: list[str] | None = None
    educationRecords: list[dict] | None = None
    additionalDocs: list[dict] | None = None


class StudentSimpleMessage(BaseModel):
    message: str

"""
Schemas used exclusively by Super Admin endpoints.
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ── TPO ─────────────────────────────────────────────────────────────────────

class CreateTPORequest(BaseModel):
    name: str
    department_id: uuid.UUID
    email: EmailStr
    password: str


class TPOResponse(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    created_at: datetime
    name: str
    department_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class UpdateTPORequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[uuid.UUID] = None
    password: Optional[str] = None


# ── Company ──────────────────────────────────────────────────────────────────

class CreateCompanyRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    website: Optional[str] = None
    description: Optional[str] = None


class CompanyAdminResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    email: str
    website: Optional[str]
    description: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateCompanyRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


# ── Placement Cycle ──────────────────────────────────────────────────────────

class CreateCycleRequest(BaseModel):
    name: str                     # e.g. "2025-26"
    start_date: datetime
    end_date: datetime


class CycleResponse(BaseModel):
    id: uuid.UUID
    name: str
    status: str
    start_date: datetime
    end_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Dept-Cycle Enrollment ────────────────────────────────────────────────────

class EnrollDepartmentRequest(BaseModel):
    department_id: uuid.UUID
    application_open: datetime
    application_close: datetime


class DeptCycleEnrollmentResponse(BaseModel):
    id: uuid.UUID
    cycle_id: uuid.UUID
    department_id: uuid.UUID
    application_open: datetime
    application_close: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Admin creation ───────────────────────────────────────────────────────────

class CreateAdminRequest(BaseModel):
    email: EmailStr
    password: str


# ── Reset password ───────────────────────────────────────────────────────────

class ResetPasswordRequest(BaseModel):
    user_id: uuid.UUID
    password: str


# ── Offer override ───────────────────────────────────────────────────────────

class OfferOverrideRequest(BaseModel):
    new_status: str
    reason: str


# ── System config ────────────────────────────────────────────────────────────

class SystemConfigUpdate(BaseModel):
    ai_model: Optional[str] = None
    prompt_version: Optional[str] = None
    login_rate_limit: Optional[int] = None
    login_rate_window: Optional[int] = None


class SystemConfigResponse(BaseModel):
    ai_model: str
    prompt_version: str
    login_rate_limit: int
    login_rate_window: int

    model_config = ConfigDict(from_attributes=True)


# ── Analytics ────────────────────────────────────────────────────────────────

class PlatformAnalyticsResponse(BaseModel):
    total_placed: int
    total_companies: int
    avg_ctc: float
    total_students: int
    total_departments: int

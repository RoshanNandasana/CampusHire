import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class MaterialCategory(str, Enum):
    DSA = "DSA"
    APTITUDE = "Aptitude"
    SYSTEM_DESIGN = "System Design"
    CORE = "Core"
    OTHER = "Other"


class ApplicationStatus(str, Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    OFFERED = "OFFERED"
    PLACED = "PLACED"


class ReportType(str, Enum):
    PLACEMENT = "placement"
    COMPANY = "company"
    STUDENT = "student"


class StudentCreateByTPORequest(BaseModel):
    email: EmailStr
    password: str | None = Field(default=None, min_length=8)
    enrollment_number: str = Field(min_length=1, max_length=50)
    cgpa: float = Field(ge=0, le=10)
    tenth_percentage: float = Field(ge=0, le=100)
    twelfth_percentage: float = Field(ge=0, le=100)
    backlog_count: int = Field(ge=0)


class StudentBulkCreateRow(BaseModel):
    email: EmailStr
    password: str | None = None
    enrollment_number: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    backlog_count: int


class StudentProfileUpdateByTPORequest(BaseModel):
    cgpa: float | None = Field(default=None, ge=0, le=10)
    backlog_count: int | None = Field(default=None, ge=0)
    tenth_percentage: float | None = Field(default=None, ge=0, le=100)
    twelfth_percentage: float | None = Field(default=None, ge=0, le=100)


class StudentPasswordResetByTPORequest(BaseModel):
    new_password: str | None = Field(default=None, min_length=8)


class ApplicationStatusOverrideRequest(BaseModel):
    new_status: ApplicationStatus
    reason: str = Field(min_length=3, max_length=500)


class MaterialUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    category: MaterialCategory | None = None
    is_global: bool | None = None


class StudentListItem(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: EmailStr
    enrollment_number: str
    department_id: uuid.UUID
    department_name: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    backlog_count: int
    placement_status: str
    placed_company: str | None
    created_at: datetime
    updated_at: datetime


class MaterialListItem(BaseModel):
    id: uuid.UUID
    title: str
    category: MaterialCategory
    file_url: str
    is_global: bool
    department_id: uuid.UUID | None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    total_access_count: int
    download_count: int


class PlacementStatsResponse(BaseModel):
    cycle_id: uuid.UUID | None
    cycle_name: str | None
    placed_count: int
    placement_percentage: float
    avg_ctc: float
    total_students: int


class CompanyBreakdownItem(BaseModel):
    company_id: uuid.UUID
    company_name: str
    jobs_posted: int
    offers_made: int
    offers_accepted: int


class StudentReportItem(BaseModel):
    student_id: uuid.UUID
    enrollment_number: str
    email: EmailStr
    cgpa: float
    backlog_count: int
    application_count: int
    latest_interview_stage: str | None
    final_status: str
    placed_company: str | None


class EligibilitySnapshotResponse(BaseModel):
    application_id: uuid.UUID
    student_id: uuid.UUID
    job_id: uuid.UUID
    department_id: uuid.UUID
    min_cgpa: float | None
    max_backlogs: int | None
    student_cgpa: float
    student_backlogs: int
    is_eligible: bool
    captured_at: datetime


class StudentCreateResult(BaseModel):
    student_id: uuid.UUID
    user_id: uuid.UUID
    email: EmailStr
    enrollment_number: str
    generated_password: str | None = None


class StudentBulkUploadResult(BaseModel):
    created_count: int
    failed_count: int
    created_students: list[StudentCreateResult]
    errors: list[dict]


class SimpleMessageResponse(BaseModel):
    message: str


class TPOStudentDashboardResponse(BaseModel):
    students: list[StudentListItem]


class TPOMaterialDashboardResponse(BaseModel):
    materials: list[MaterialListItem]


class ModelBackedConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

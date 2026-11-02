from app.schemas.base import ORMBaseSchema
from app.schemas.application_stage_history_schema import *
from app.schemas.auditlog_schema import *
from app.schemas.blacklist_schema import *
from app.schemas.company_schema import *
from app.schemas.company_document_schema import *
from app.schemas.company_recruiter_schema import *
from app.schemas.departments_schema import *
from app.schemas.interview_feedback_schema import *
from app.schemas.interview_rounds_schema import *
from app.schemas.job_application_schema import *
from app.schemas.job_eligibility_schema import *
from app.schemas.job_location_schema import *
from app.schemas.job_skills_schema import *
from app.schemas.jobs_schema import *
from app.schemas.material_acces_schema import *
from app.schemas.notifications_schema import *
from app.schemas.offer_history_schema import *
from app.schemas.offers_schema import *
from app.schemas.placement_drives_schema import *
from app.schemas.resume_ai_analysis_schema import *
from app.schemas.resume_versions_schema import *
from app.schemas.resumes_schema import *
from app.schemas.roles_schema import *
from app.schemas.student_document_schema import *
from app.schemas.student_skills_schema import *
from app.schemas.students_schema import *
from app.schemas.study_materials_schema import *
from app.schemas.tpo_coordinator_schema import *
from app.schemas.user_schema import *

__all__ = [
    "ORMBaseSchema",
    "ApplicationStageHistoryBase",
    "ApplicationStageHistoryCreate",
    "ApplicationStageHistoryUpdate",
    "ApplicationStageHistoryResponse",
    "AuditLogBase",
    "AuditLogCreate",
    "AuditLogUpdate",
    "AuditLogResponse",
    "BlacklistBase",
    "BlacklistCreate",
    "BlacklistUpdate",
    "BlacklistResponse",
    "CompanyBase",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyResponse",
    "CompanyDocumentBase",
    "CompanyDocumentCreate",
    "CompanyDocumentUpdate",
    "CompanyDocumentResponse",
    "CompanyRecruiterBase",
    "CompanyRecruiterCreate",
    "CompanyRecruiterUpdate",
    "CompanyRecruiterResponse",
    "DepartmentBase",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentResponse",
    "InterviewFeedbackBase",
    "InterviewFeedbackCreate",
    "InterviewFeedbackUpdate",
    "InterviewFeedbackResponse",
    "InterviewRoundBase",
    "InterviewRoundCreate",
    "InterviewRoundUpdate",
    "InterviewRoundResponse",
    "JobApplicationBase",
    "JobApplicationCreate",
    "JobApplicationUpdate",
    "JobApplicationResponse",
    "JobEligibilityBase",
    "JobEligibilityCreate",
    "JobEligibilityUpdate",
    "JobEligibilityResponse",
    "JobLocationBase",
    "JobLocationCreate",
    "JobLocationUpdate",
    "JobLocationResponse",
    "JobSkillBase",
    "JobSkillCreate",
    "JobSkillUpdate",
    "JobSkillResponse",
    "JobBase",
    "JobCreate",
    "JobUpdate",
    "JobResponse",
    "MaterialAccessBase",
    "MaterialAccessCreate",
    "MaterialAccessUpdate",
    "MaterialAccessResponse",
    "NotificationBase",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationResponse",
    "OfferHistoryBase",
    "OfferHistoryCreate",
    "OfferHistoryUpdate",
    "OfferHistoryResponse",
    "OfferBase",
    "OfferCreate",
    "OfferUpdate",
    "OfferResponse",
    "PlacementDriveBase",
    "PlacementDriveCreate",
    "PlacementDriveUpdate",
    "PlacementDriveResponse",
    "ResumeAIAnalysisBase",
    "ResumeAIAnalysisCreate",
    "ResumeAIAnalysisUpdate",
    "ResumeAIAnalysisResponse",
    "ResumeVersionBase",
    "ResumeVersionCreate",
    "ResumeVersionUpdate",
    "ResumeVersionResponse",
    "ResumeBase",
    "ResumeCreate",
    "ResumeUpdate",
    "ResumeResponse",
    "RoleBase",
    "RoleCreate",
    "RoleUpdate",
    "RoleResponse",
    "StudentDocumentBase",
    "StudentDocumentCreate",
    "StudentDocumentUpdate",
    "StudentDocumentResponse",
    "StudentSkillBase",
    "StudentSkillCreate",
    "StudentSkillUpdate",
    "StudentSkillResponse",
    "StudentBase",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "StudyMaterialBase",
    "StudyMaterialCreate",
    "StudyMaterialUpdate",
    "StudyMaterialResponse",
    "TPOCoordinatorBase",
    "TPOCoordinatorCreate",
    "TPOCoordinatorUpdate",
    "TPOCoordinatorResponse",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
]

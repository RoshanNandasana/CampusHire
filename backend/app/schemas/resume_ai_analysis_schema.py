import uuid

from pydantic import BaseModel, ConfigDict


class ResumeAIAnalysisBase(BaseModel):
    resume_id: uuid.UUID
    ats_score: int
    detected_skills: dict
    skill_gaps: dict


class ResumeAIAnalysisCreate(ResumeAIAnalysisBase):
    pass


class ResumeAIAnalysisUpdate(BaseModel):
    resume_id: uuid.UUID | None = None
    ats_score: int | None = None
    detected_skills: dict | None = None
    skill_gaps: dict | None = None


class ResumeAIAnalysisResponse(ResumeAIAnalysisBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

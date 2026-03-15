import uuid

from pydantic import BaseModel, ConfigDict


class StudentSkillBase(BaseModel):
    student_id: uuid.UUID
    skill_name: str


class StudentSkillCreate(StudentSkillBase):
    pass


class StudentSkillUpdate(BaseModel):
    student_id: uuid.UUID | None = None
    skill_name: str | None = None


class StudentSkillResponse(StudentSkillBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

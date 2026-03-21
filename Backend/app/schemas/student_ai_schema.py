from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class StudentAIChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class StudentAIChatRequest(BaseModel):
    mode: Literal["ats_coach", "placement_assistant"] = "ats_coach"
    message: str = Field(min_length=1, max_length=2000)
    selected_job_ids: list[str] = Field(default_factory=list)
    history: list[StudentAIChatMessage] = Field(default_factory=list)


class StudentAIRecommendedJob(BaseModel):
    jobId: str
    company: str
    position: str
    matchScore: int
    why: str
    gaps: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)


class StudentAIATSBlock(BaseModel):
    currentScore: int
    estimatedScoreAfterImprovements: int
    summary: str
    improvements: list[str] = Field(default_factory=list)


class StudentAIChatResponse(BaseModel):
    answer: str
    recommendedJobs: list[StudentAIRecommendedJob] = Field(default_factory=list)
    ats: StudentAIATSBlock
    placementTips: list[str] = Field(default_factory=list)
    followUpQuestions: list[str] = Field(default_factory=list)

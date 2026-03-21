from __future__ import annotations

import json
import re
import uuid
from io import BytesIO
from typing import Any
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.resume_ai_analysis import ResumeAIAnalysis
from app.models.resumes import Resume
from app.models.student_skills import StudentSkill
from app.models.students import Student
from app.schemas.student_ai_schema import StudentAIChatRequest, StudentAIChatResponse
from app.services.student_service import StudentService
from app.storage import minio_client


class StudentAIService:
    @staticmethod
    async def analyze_resume_insights(
        *,
        student: Student,
        resume_text: str,
        profile_skills: list[str],
        jobs: list[dict[str, Any]],
        fallback_ats: int,
    ) -> dict[str, Any]:
        deterministic = StudentAIService._compute_deterministic_matches(
            {"skills": profile_skills, "resume_text": resume_text},
            jobs,
        )

        if not settings.openrouter_api_key or not resume_text.strip():
            return StudentAIService._fallback_resume_insights(
                fallback_ats=fallback_ats,
                profile_skills=profile_skills,
                deterministic=deterministic,
            )

        system_prompt = (
            "You are CampusHire Resume Analyzer. "
            "Use ONLY the provided resume text, profile skills, and jobs context. "
            "Return concise, practical ATS analysis for placement preparation."
        )

        schema = {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "atsScore": {"type": "integer", "minimum": 0, "maximum": 100},
                "skills": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "name": {"type": "string"},
                            "level": {"type": "integer", "minimum": 0, "maximum": 100},
                            "inBidding": {"type": "boolean"},
                        },
                        "required": ["name", "level", "inBidding"],
                    },
                },
                "skillGaps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "skill": {"type": "string"},
                            "demand": {"type": "integer", "minimum": 0, "maximum": 100},
                            "yourLevel": {"type": "integer", "minimum": 0, "maximum": 100},
                        },
                        "required": ["skill", "demand", "yourLevel"],
                    },
                },
                "suggestions": {"type": "array", "items": {"type": "string"}},
                "improvements": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["atsScore", "skills", "skillGaps", "suggestions", "improvements"],
        }

        prompt_data = {
            "student": {
                "cgpa": student.cgpa,
                "backlogs": student.backlog_count,
            },
            "resume": {
                "text_excerpt": resume_text[:9000],
                "profile_skills": profile_skills,
            },
            "jobs": [
                {
                    "position": job.get("position"),
                    "company": job.get("company"),
                    "skills": job.get("skills") or [],
                    "eligible": job.get("eligible"),
                }
                for job in jobs[:20]
            ],
            "required_behavior": [
                "Provide realistic ATS score from resume quality and relevance",
                "Detect skills from resume text, not only profile skills",
                "Identify top market skill gaps from provided job context",
                "Give concrete, non-generic suggestions and improvements",
            ],
        }

        try:
            response_json = await StudentAIService._call_openrouter_custom_schema(
                system_prompt=system_prompt,
                user_prompt=json.dumps(prompt_data, ensure_ascii=True, default=str),
                schema=schema,
                schema_name="student_resume_insights",
                max_tokens=900,
            )
            return StudentAIService._normalize_resume_insights_response(
                response_json=response_json,
                fallback_ats=fallback_ats,
                profile_skills=profile_skills,
                deterministic=deterministic,
            )
        except Exception:
            return StudentAIService._fallback_resume_insights(
                fallback_ats=fallback_ats,
                profile_skills=profile_skills,
                deterministic=deterministic,
            )

    @staticmethod
    async def chat(db: AsyncSession, current_user_id: uuid.UUID, payload: StudentAIChatRequest) -> StudentAIChatResponse:
        if not settings.openrouter_api_key:
            raise HTTPException(503, "OpenRouter is not configured. Set OPENROUTER_API_KEY in backend env.")

        student, user = await StudentService._get_student_or_404(db, current_user_id)
        job_payload = await StudentService.list_jobs(db, current_user_id)
        jobs = job_payload.get("jobs", [])
        if payload.selected_job_ids:
            selected = {str(x) for x in payload.selected_job_ids}
            jobs = [job for job in jobs if str(job.get("id")) in selected]

        resume_context = await StudentAIService._get_resume_context(db, student.id)
        deterministic = StudentAIService._compute_deterministic_matches(resume_context, jobs)

        system_prompt = StudentAIService._build_system_prompt()
        user_prompt = StudentAIService._build_user_prompt(
            student=student,
            email=user.email,
            mode=payload.mode,
            user_message=payload.message,
            resume_context=resume_context,
            jobs=jobs,
            deterministic=deterministic,
        )

        chat_history = []
        for item in payload.history[-8:]:
            chat_history.append({"role": item.role, "content": item.content[:2000]})

        response_json = await StudentAIService._call_openrouter(
            system_prompt=system_prompt,
            chat_history=chat_history,
            user_prompt=user_prompt,
        )

        normalized = StudentAIService._normalize_response(
            response_json=response_json,
            deterministic=deterministic,
            fallback_ats=resume_context.get("latest_ats", 65),
        )
        return StudentAIChatResponse(**normalized)

    @staticmethod
    def _extract_object_name_from_url(file_url: str) -> str | None:
        if not file_url or not isinstance(file_url, str):
            return None
        parsed = urlparse(file_url.strip())
        path = (parsed.path or "").lstrip("/")
        bucket_name = settings.minio_bucket_materials
        bucket_prefix = f"{bucket_name}/"
        if path.startswith(bucket_prefix):
            object_name = path[len(bucket_prefix):]
            return object_name or None
        return None

    @staticmethod
    def _extract_text_from_resume(content: bytes, file_url: str) -> str:
        lower_url = file_url.lower()
        if lower_url.endswith(".pdf"):
            try:
                from pypdf import PdfReader

                reader = PdfReader(BytesIO(content))
                pages = [page.extract_text() or "" for page in reader.pages]
                text = "\n".join(pages)
                return re.sub(r"\s+", " ", text).strip()
            except Exception:
                return ""

        try:
            text = content.decode("utf-8", errors="ignore")
        except Exception:
            text = ""
        return re.sub(r"\s+", " ", text).strip()

    @staticmethod
    async def _get_resume_context(db: AsyncSession, student_id: uuid.UUID) -> dict[str, Any]:
        resume_row = await db.execute(
            select(Resume)
            .where(Resume.student_id == student_id)
            .order_by(Resume.created_at.desc())
            .limit(1)
        )
        latest_resume = resume_row.scalar_one_or_none()

        resume_text = ""
        latest_ats = None

        if latest_resume:
            analysis_row = await db.execute(
                select(ResumeAIAnalysis)
                .where(ResumeAIAnalysis.resume_id == latest_resume.id)
                .order_by(ResumeAIAnalysis.id.desc())
                .limit(1)
            )
            analysis = analysis_row.scalar_one_or_none()
            if analysis:
                latest_ats = analysis.ats_score

            object_name = StudentAIService._extract_object_name_from_url(latest_resume.file_url)
            if object_name:
                try:
                    file_bytes, _ = minio_client.get_object_bytes(settings.minio_bucket_materials, object_name)
                    resume_text = StudentAIService._extract_text_from_resume(file_bytes, latest_resume.file_url)
                except Exception:
                    resume_text = ""

        skills_row = await db.execute(
            select(StudentSkill.skill_name)
            .where(StudentSkill.student_id == student_id)
            .order_by(StudentSkill.skill_name.asc())
        )
        skills = [row[0] for row in skills_row.all()]

        return {
            "latest_ats": int(latest_ats or min(90, 58 + len(skills) * 4)),
            "skills": skills,
            "resume_text": (resume_text or "")[:12000],
        }

    @staticmethod
    def _tokenize(value: str) -> set[str]:
        return {token for token in re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{1,}", (value or "").lower()) if len(token) > 2}

    @staticmethod
    def _compute_deterministic_matches(resume_context: dict[str, Any], jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        skill_tokens = {s.lower() for s in resume_context.get("skills", [])}
        resume_tokens = StudentAIService._tokenize(resume_context.get("resume_text", ""))
        base_tokens = skill_tokens | resume_tokens

        ranked: list[dict[str, Any]] = []
        for job in jobs:
            job_skill_tokens = {str(skill).lower() for skill in (job.get("skills") or [])}
            jd_tokens = StudentAIService._tokenize(f"{job.get('position', '')} {job.get('description', '')} {' '.join(job.get('skills') or [])}")

            overlap_skills = sorted(job_skill_tokens & base_tokens)
            overlap_jd = jd_tokens & base_tokens
            skill_ratio = (len(overlap_skills) / max(1, len(job_skill_tokens))) * 100
            jd_ratio = (len(overlap_jd) / max(1, len(jd_tokens))) * 100
            score = int(min(99, round((skill_ratio * 0.7) + (jd_ratio * 0.3))))

            missing_skills = sorted(job_skill_tokens - base_tokens)[:6]
            ranked.append(
                {
                    "jobId": str(job.get("id")),
                    "company": job.get("company", "Company"),
                    "position": job.get("position", "Role"),
                    "matchScore": score,
                    "overlapSkills": overlap_skills[:8],
                    "gaps": missing_skills,
                    "eligible": bool(job.get("eligible")),
                    "ctc": job.get("ctc", "N/A"),
                    "deadline": job.get("deadline"),
                }
            )

        ranked.sort(key=lambda item: item["matchScore"], reverse=True)
        return ranked[:8]

    @staticmethod
    def _build_system_prompt() -> str:
        return (
            "You are CampusHire ATS and Placement Copilot. "
            "You must answer ONLY using the provided student context, resume context, and job listings context. "
            "Do not invent companies, roles, or resume content. "
            "If context is missing, explicitly state what is missing. "
            "Give practical, concrete, short suggestions that improve ATS and placement readiness."
        )

    @staticmethod
    def _build_user_prompt(
        *,
        student: Student,
        email: str,
        mode: str,
        user_message: str,
        resume_context: dict[str, Any],
        jobs: list[dict[str, Any]],
        deterministic: list[dict[str, Any]],
    ) -> str:
        compact_jobs = [
            {
                "jobId": j.get("id"),
                "company": j.get("company"),
                "position": j.get("position"),
                "skills": j.get("skills") or [],
                "eligible": j.get("eligible"),
                "ctc": j.get("ctc"),
                "deadline": j.get("deadline"),
            }
            for j in jobs[:20]
        ]

        data = {
            "mode": mode,
            "student": {
                "email": email,
                "cgpa": student.cgpa,
                "backlogs": student.backlog_count,
            },
            "resume": {
                "latest_ats": resume_context.get("latest_ats", 0),
                "detected_skills": resume_context.get("skills", []),
                "text_excerpt": resume_context.get("resume_text", "")[:7000],
            },
            "jobs": compact_jobs,
            "deterministic_matches": deterministic[:5],
            "question": user_message,
            "required_behavior": [
                "Recommend best-fit jobs from provided jobs only",
                "Explain ATS gaps against target jobs",
                "Provide stepwise resume improvements",
                "Provide placement-specific advice grounded in context",
                "Keep concise and actionable",
            ],
            "response_shape": {
                "answer": "string",
                "recommendedJobs": [
                    {
                        "jobId": "string",
                        "company": "string",
                        "position": "string",
                        "matchScore": "integer 0-100",
                        "why": "string",
                        "gaps": ["string"],
                        "improvements": ["string"],
                    }
                ],
                "ats": {
                    "currentScore": "integer 0-100",
                    "estimatedScoreAfterImprovements": "integer 0-100",
                    "summary": "string",
                    "improvements": ["string"],
                },
                "placementTips": ["string"],
                "followUpQuestions": ["string"],
            },
        }
        return json.dumps(data, ensure_ascii=True, default=str)

    @staticmethod
    async def _call_openrouter(*, system_prompt: str, chat_history: list[dict[str, str]], user_prompt: str) -> dict[str, Any]:
        schema = {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "answer": {"type": "string"},
                "recommendedJobs": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "jobId": {"type": "string"},
                            "company": {"type": "string"},
                            "position": {"type": "string"},
                            "matchScore": {"type": "integer", "minimum": 0, "maximum": 100},
                            "why": {"type": "string"},
                            "gaps": {"type": "array", "items": {"type": "string"}},
                            "improvements": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["jobId", "company", "position", "matchScore", "why", "gaps", "improvements"],
                    },
                },
                "ats": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "currentScore": {"type": "integer", "minimum": 0, "maximum": 100},
                        "estimatedScoreAfterImprovements": {"type": "integer", "minimum": 0, "maximum": 100},
                        "summary": {"type": "string"},
                        "improvements": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["currentScore", "estimatedScoreAfterImprovements", "summary", "improvements"],
                },
                "placementTips": {"type": "array", "items": {"type": "string"}},
                "followUpQuestions": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["answer", "recommendedJobs", "ats", "placementTips", "followUpQuestions"],
        }

        return await StudentAIService._call_openrouter_custom_schema(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            schema=schema,
            schema_name="student_ats_chat_response",
            chat_history=chat_history,
            max_tokens=1000,
        )

    @staticmethod
    async def _call_openrouter_custom_schema(
        *,
        system_prompt: str,
        user_prompt: str,
        schema: dict[str, Any],
        schema_name: str,
        chat_history: list[dict[str, str]] | None = None,
        max_tokens: int = 1000,
    ) -> dict[str, Any]:
        import httpx

        endpoint = settings.openrouter_base_url.rstrip("/") + "/chat/completions"
        model = settings.openrouter_model

        messages = [{"role": "system", "content": system_prompt}]
        if chat_history:
            messages.extend(chat_history)
        messages.append({"role": "user", "content": user_prompt})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": max_tokens,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": schema_name,
                    "strict": True,
                    "schema": schema,
                },
            },
        }

        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
        }
        if settings.openrouter_site_url:
            headers["HTTP-Referer"] = settings.openrouter_site_url
        if settings.openrouter_app_name:
            headers["X-Title"] = settings.openrouter_app_name

        timeout = httpx.Timeout(45.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.post(endpoint, headers=headers, json=payload)
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise HTTPException(502, f"OpenRouter error: {exc.response.text[:300]}") from exc
            except Exception as exc:
                raise HTTPException(502, "Unable to reach OpenRouter") from exc

        body = response.json()
        content = (
            body.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "{}")
        )

        try:
            return json.loads(content)
        except Exception as exc:
            raise HTTPException(502, "Invalid JSON response from OpenRouter") from exc

    @staticmethod
    def _fallback_resume_insights(
        *,
        fallback_ats: int,
        profile_skills: list[str],
        deterministic: list[dict[str, Any]],
    ) -> dict[str, Any]:
        top_gaps: list[str] = []
        for row in deterministic[:4]:
            for gap in row.get("gaps", []):
                if gap not in top_gaps:
                    top_gaps.append(gap)
                if len(top_gaps) >= 4:
                    break
            if len(top_gaps) >= 4:
                break

        if not top_gaps:
            top_gaps = ["System Design", "Cloud Computing"]

        return {
            "atsScore": max(0, min(100, int(fallback_ats))),
            "skills": [
                {"name": skill, "level": 68, "inBidding": True}
                for skill in profile_skills[:10]
            ],
            "skillGaps": [
                {"skill": skill.title(), "demand": 86, "yourLevel": 38}
                for skill in top_gaps
            ],
            "suggestions": [
                "Tailor resume keywords to top target jobs.",
                "Add measurable outcomes in project bullet points.",
                "Strengthen weakest required skills with one practical project.",
            ],
            "improvements": [
                "Add ATS-friendly keywords in Experience and Skills sections.",
                "Rewrite top 3 bullets with quantified impact.",
                "Prioritize one portfolio project per target role.",
            ],
            "analysisSource": "fallback",
        }

    @staticmethod
    def _normalize_resume_insights_response(
        *,
        response_json: dict[str, Any],
        fallback_ats: int,
        profile_skills: list[str],
        deterministic: list[dict[str, Any]],
    ) -> dict[str, Any]:
        fallback = StudentAIService._fallback_resume_insights(
            fallback_ats=fallback_ats,
            profile_skills=profile_skills,
            deterministic=deterministic,
        )

        raw_skills = response_json.get("skills") or fallback["skills"]
        raw_gaps = response_json.get("skillGaps") or fallback["skillGaps"]

        skills: list[dict[str, Any]] = []
        for item in raw_skills[:12]:
            if not isinstance(item, dict):
                continue
            level = int(item.get("level") or 0)
            if 0 < level <= 10:
                level = level * 10
            skills.append(
                {
                    "name": str(item.get("name") or "Skill"),
                    "level": max(0, min(100, level)),
                    "inBidding": bool(item.get("inBidding")),
                }
            )

        gaps: list[dict[str, Any]] = []
        for item in raw_gaps[:8]:
            if not isinstance(item, dict):
                continue
            demand = int(item.get("demand") or 0)
            your_level = int(item.get("yourLevel") or 0)
            if 0 < demand <= 10:
                demand = demand * 20
            if 0 < your_level <= 10:
                your_level = your_level * 20
            gaps.append(
                {
                    "skill": str(item.get("skill") or "Skill Gap"),
                    "demand": max(0, min(100, demand)),
                    "yourLevel": max(0, min(100, your_level)),
                }
            )

        if not skills:
            skills = fallback["skills"]
        if not gaps:
            gaps = fallback["skillGaps"]

        return {
            "atsScore": int(response_json.get("atsScore") or fallback["atsScore"]),
            "skills": skills,
            "skillGaps": gaps,
            "suggestions": list((response_json.get("suggestions") or fallback["suggestions"])[:8]),
            "improvements": list((response_json.get("improvements") or fallback["improvements"])[:8]),
            "analysisSource": "ai",
        }

    @staticmethod
    def _normalize_response(*, response_json: dict[str, Any], deterministic: list[dict[str, Any]], fallback_ats: int) -> dict[str, Any]:
        recommended = response_json.get("recommendedJobs") or []
        if not recommended and deterministic:
            recommended = [
                {
                    "jobId": row["jobId"],
                    "company": row["company"],
                    "position": row["position"],
                    "matchScore": row["matchScore"],
                    "why": "Strong overlap with your current skills and resume signals.",
                    "gaps": row.get("gaps", []),
                    "improvements": ["Add project bullet points aligned to the required skills."],
                }
                for row in deterministic[:3]
            ]

        ats_block = response_json.get("ats") or {}
        current_score = int(ats_block.get("currentScore") or fallback_ats)
        estimated_score = int(ats_block.get("estimatedScoreAfterImprovements") or min(99, current_score + 8))

        return {
            "answer": (response_json.get("answer") or "I analyzed your resume and available jobs. Use the recommendations below to improve ATS and placement outcomes.")[:3000],
            "recommendedJobs": recommended[:5],
            "ats": {
                "currentScore": max(0, min(100, current_score)),
                "estimatedScoreAfterImprovements": max(0, min(100, estimated_score)),
                "summary": (ats_block.get("summary") or "Your ATS score can improve with job-specific keywords, quantified achievements, and stronger project impact statements.")[:600],
                "improvements": list((ats_block.get("improvements") or [])[:8]),
            },
            "placementTips": list((response_json.get("placementTips") or [])[:8]),
            "followUpQuestions": list((response_json.get("followUpQuestions") or [])[:6]),
        }

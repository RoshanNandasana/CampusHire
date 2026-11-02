import uuid
from datetime import datetime, timezone

from sqlalchemy import and_, case, delete, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application_eligibility_snapshot import ApplicationEligibilitySnapshot
from app.models.application_stage_history import ApplicationStageHistory
from app.models.company import Company
from app.models.departments import Department
from app.models.dept_cycle_enrollment import DeptCycleEnrollment
from app.models.interview_feedback import InterviewFeedback
from app.models.interview_rounds import InterviewRound
from app.models.job_application import JobApplication
from app.models.job_eligibility import JobEligibility
from app.models.job_location import JobLocation
from app.models.jobs import Job
from app.models.material_acces import MaterialAccess
from app.models.offers import Offer
from app.models.placement_drives import PlacementDrive
from app.models.placement_cycle import PlacementCycle
from app.models.resume_ai_analysis import ResumeAIAnalysis
from app.models.resume_versions import ResumeVersion
from app.models.resumes import Resume
from app.models.student_skills import StudentSkill
from app.models.students import Student
from app.models.study_materials import StudyMaterial
from app.models.tpo_coordinator import TPOCoordinator
from app.models.user import User


PLACED_OFFER_STATUSES = {"ACCEPTED", "JOINED", "ACCEPTED_BUT_NOT_JOINED"}


async def get_tpo_department_id(db: AsyncSession, user_id: uuid.UUID) -> uuid.UUID | None:
    result = await db.execute(
        select(TPOCoordinator.department_id).where(TPOCoordinator.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_department_name(db: AsyncSession, department_id: uuid.UUID) -> str | None:
    result = await db.execute(
        select(Department.name).where(Department.id == department_id)
    )
    return result.scalar_one_or_none()


async def get_student_by_id_in_department(
    db: AsyncSession,
    student_id: uuid.UUID,
    department_id: uuid.UUID,
) -> Student | None:
    result = await db.execute(
        select(Student)
        .where(Student.id == student_id)
        .where(Student.department_id == department_id)
    )
    return result.scalar_one_or_none()


async def get_student_by_enrollment(db: AsyncSession, enrollment_number: str) -> Student | None:
    result = await db.execute(
        select(Student).where(Student.enrollment_number == enrollment_number)
    )
    return result.scalar_one_or_none()


async def create_student(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    department_id: uuid.UUID,
    enrollment_number: str,
    cgpa: float,
    tenth_percentage: float,
    twelfth_percentage: float,
    backlog_count: int,
) -> Student:
    student = Student(
        user_id=user_id,
        department_id=department_id,
        enrollment_number=enrollment_number,
        cgpa=cgpa,
        tenth_percentage=tenth_percentage,
        twelfth_percentage=twelfth_percentage,
        backlog_count=backlog_count,
    )
    db.add(student)
    await db.flush()
    return student


async def update_student_profile(
    db: AsyncSession,
    student: Student,
    *,
    cgpa: float | None,
    backlog_count: int | None,
    tenth_percentage: float | None,
    twelfth_percentage: float | None,
) -> Student:
    if cgpa is not None:
        student.cgpa = cgpa
    if backlog_count is not None:
        student.backlog_count = backlog_count
    if tenth_percentage is not None:
        student.tenth_percentage = tenth_percentage
    if twelfth_percentage is not None:
        student.twelfth_percentage = twelfth_percentage
    await db.flush()
    return student


async def _get_student_offer_status_map(
    db: AsyncSession,
    student_ids: list[uuid.UUID],
) -> dict[uuid.UUID, dict]:
    if not student_ids:
        return {}

    result = await db.execute(
        select(
            JobApplication.student_id,
            Offer.status,
            Company.name,
        )
        .join(Offer, Offer.application_id == JobApplication.id)
        .join(Job, Job.id == JobApplication.job_id)
        .join(Company, Company.id == Job.company_id)
        .where(JobApplication.student_id.in_(student_ids))
    )

    mapping: dict[uuid.UUID, dict] = {}
    for student_id, offer_status, company_name in result.all():
        current = mapping.setdefault(
            student_id,
            {
                "has_offer": False,
                "is_placed": False,
                "placed_company": None,
            },
        )
        current["has_offer"] = True
        if offer_status in PLACED_OFFER_STATUSES:
            current["is_placed"] = True
            current["placed_company"] = company_name

    return mapping


async def list_department_students_with_status(
    db: AsyncSession,
    department_id: uuid.UUID,
) -> list[dict]:
    result = await db.execute(
        select(Student, User.email, Department.name)
        .join(User, User.id == Student.user_id)
        .join(Department, Department.id == Student.department_id)
        .where(Student.department_id == department_id)
        .order_by(Student.created_at.desc())
    )
    rows = result.all()

    students = [row[0] for row in rows]
    offer_map = await _get_student_offer_status_map(db, [s.id for s in students])

    payload: list[dict] = []
    for student, email, department_name in rows:
        offer_info = offer_map.get(student.id, {})
        if offer_info.get("is_placed"):
            placement_status = "PLACED"
        elif offer_info.get("has_offer"):
            placement_status = "OFFERED"
        else:
            has_application = await db.execute(
                select(func.count())
                .select_from(JobApplication)
                .where(JobApplication.student_id == student.id)
            )
            placement_status = "IN_PROCESS" if has_application.scalar_one() > 0 else "NOT_APPLIED"

        payload.append(
            {
                "id": student.id,
                "user_id": student.user_id,
                "email": email,
                "enrollment_number": student.enrollment_number,
                "department_id": student.department_id,
                "department_name": department_name,
                "cgpa": student.cgpa,
                "tenth_percentage": student.tenth_percentage,
                "twelfth_percentage": student.twelfth_percentage,
                "backlog_count": student.backlog_count,
                "placement_status": placement_status,
                "placed_company": offer_info.get("placed_company"),
                "created_at": student.created_at,
                "updated_at": student.updated_at,
            }
        )

    return payload


async def get_student_timeline(
    db: AsyncSession,
    student_id: uuid.UUID,
) -> dict:
    app_rows = await db.execute(
        select(
            JobApplication.id,
            JobApplication.status,
            JobApplication.created_at,
            JobApplication.updated_at,
            Job.id,
            Job.title,
            Job.salary,
            Job.application_deadline,
            Company.id,
            Company.name,
        )
        .join(Job, Job.id == JobApplication.job_id)
        .join(Company, Company.id == Job.company_id)
        .where(JobApplication.student_id == student_id)
        .order_by(JobApplication.created_at.desc())
    )
    applications_raw = app_rows.all()

    application_ids = [row[0] for row in applications_raw]
    job_ids = [row[4] for row in applications_raw]

    location_map: dict[uuid.UUID, str] = {}
    if job_ids:
        location_rows = await db.execute(
            select(JobLocation.job_id, JobLocation.location)
            .where(JobLocation.job_id.in_(job_ids))
            .order_by(JobLocation.job_id.asc())
        )
        for job_id, location in location_rows.all():
            if job_id not in location_map and location:
                location_map[job_id] = location

    stage_map: dict[uuid.UUID, list[dict]] = {}
    if application_ids:
        stage_rows = await db.execute(
            select(
                ApplicationStageHistory.application_id,
                ApplicationStageHistory.status,
                ApplicationStageHistory.remarks,
                InterviewRound.name,
                InterviewRound.round_order,
            )
            .join(InterviewRound, InterviewRound.id == ApplicationStageHistory.interview_round_id)
            .where(ApplicationStageHistory.application_id.in_(application_ids))
            .order_by(InterviewRound.round_order.asc())
        )
        for app_id, status, remarks, round_name, round_order in stage_rows.all():
            stage_map.setdefault(app_id, []).append(
                {
                    "status": status,
                    "remarks": remarks,
                    "round_name": round_name,
                    "round_order": round_order,
                }
            )

    feedback_map: dict[uuid.UUID, list[dict]] = {}
    if application_ids:
        feedback_rows = await db.execute(
            select(
                InterviewFeedback.application_id,
                InterviewFeedback.score,
                InterviewFeedback.decision,
                InterviewFeedback.remarks,
                InterviewRound.name,
                User.email,
                InterviewFeedback.created_at,
            )
            .join(InterviewRound, InterviewRound.id == InterviewFeedback.interview_round_id)
            .join(User, User.id == InterviewFeedback.interviewer_id)
            .where(InterviewFeedback.application_id.in_(application_ids))
            .order_by(InterviewFeedback.created_at.desc())
        )
        for app_id, score, decision, remarks, round_name, interviewer_email, created_at in feedback_rows.all():
            feedback_map.setdefault(app_id, []).append(
                {
                    "score": score,
                    "decision": decision,
                    "remarks": remarks,
                    "round_name": round_name,
                    "interviewer_email": interviewer_email,
                    "created_at": created_at,
                }
            )

    offer_map: dict[uuid.UUID, list[dict]] = {}
    if application_ids:
        offer_rows = await db.execute(
            select(
                Offer.application_id,
                Offer.id,
                Offer.salary,
                Offer.status,
                Offer.offer_letter_url,
                Offer.created_at,
                Offer.updated_at,
            )
            .where(Offer.application_id.in_(application_ids))
            .order_by(Offer.created_at.desc())
        )
        for app_id, offer_id, salary, status, offer_letter_url, created_at, updated_at in offer_rows.all():
            offer_map.setdefault(app_id, []).append(
                {
                    "id": offer_id,
                    "salary": salary,
                    "status": status,
                    "offer_letter_url": offer_letter_url,
                    "created_at": created_at,
                    "updated_at": updated_at,
                }
            )

    applications = []
    for (
        application_id,
        app_status,
        created_at,
        updated_at,
        job_id,
        job_title,
        job_salary,
        job_deadline,
        company_id,
        company_name,
    ) in applications_raw:
        applications.append(
            {
                "application_id": application_id,
                "status": app_status,
                "created_at": created_at,
                "updated_at": updated_at,
                "job": {
                    "id": job_id,
                    "title": job_title,
                    "salary": job_salary,
                    "application_deadline": job_deadline,
                    "location": location_map.get(job_id, ""),
                    "company": {
                        "id": company_id,
                        "name": company_name,
                    },
                },
                "stage_history": stage_map.get(application_id, []),
                "interview_feedback": feedback_map.get(application_id, []),
                "offers": offer_map.get(application_id, []),
            }
        )

    return {"applications": applications}


async def get_student_resume_analysis_history(
    db: AsyncSession,
    student_id: uuid.UUID,
) -> dict:
    resume_rows = await db.execute(
        select(
            Resume.id,
            Resume.file_url,
            Resume.created_at,
            Resume.updated_at,
        )
        .where(Resume.student_id == student_id)
        .order_by(Resume.created_at.desc())
    )
    resumes_raw = resume_rows.all()
    resume_ids = [row[0] for row in resumes_raw]

    version_map: dict[uuid.UUID, list[dict]] = {}
    analysis_map: dict[uuid.UUID, list[dict]] = {}

    if resume_ids:
        version_rows = await db.execute(
            select(
                ResumeVersion.resume_id,
                ResumeVersion.id,
                ResumeVersion.version_number,
                ResumeVersion.file_url,
            )
            .where(ResumeVersion.resume_id.in_(resume_ids))
            .order_by(ResumeVersion.version_number.desc())
        )
        for resume_id, version_id, version_number, file_url in version_rows.all():
            version_map.setdefault(resume_id, []).append(
                {
                    "id": version_id,
                    "version_number": version_number,
                    "file_url": file_url,
                }
            )

        analysis_rows = await db.execute(
            select(
                ResumeAIAnalysis.resume_id,
                ResumeAIAnalysis.id,
                ResumeAIAnalysis.ats_score,
                ResumeAIAnalysis.detected_skills,
                ResumeAIAnalysis.skill_gaps,
            )
            .where(ResumeAIAnalysis.resume_id.in_(resume_ids))
            .order_by(ResumeAIAnalysis.id.desc())
        )
        for resume_id, analysis_id, ats_score, detected_skills, skill_gaps in analysis_rows.all():
            analysis_map.setdefault(resume_id, []).append(
                {
                    "id": analysis_id,
                    "ats_score": ats_score,
                    "detected_skills": detected_skills,
                    "skill_gaps": skill_gaps,
                }
            )

    resume_payload = []
    for resume_id, file_url, created_at, updated_at in resumes_raw:
        resume_payload.append(
            {
                "id": resume_id,
                "file_url": file_url,
                "created_at": created_at,
                "updated_at": updated_at,
                "versions": version_map.get(resume_id, []),
                "ai_analysis": analysis_map.get(resume_id, []),
            }
        )

    return {"resumes": resume_payload}


async def list_active_jobs_for_department(db: AsyncSession, department_id: uuid.UUID) -> list[dict]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    rows = await db.execute(
        select(
            Job.id,
            Job.title,
            Job.description,
            Job.salary,
            Job.application_deadline,
            Job.created_at,
            Job.updated_at,
            PlacementDrive.status,
            Company.id,
            Company.name,
        )
        .join(Company, Company.id == Job.company_id)
        .outerjoin(PlacementDrive, PlacementDrive.id == Job.drive_id)
        .join(JobEligibility, JobEligibility.job_id == Job.id)
        .where(JobEligibility.department_id == department_id)
        .where(Job.application_deadline >= now)
        .order_by(Job.application_deadline.asc())
    )

    payload: list[dict] = []
    for (
        job_id,
        title,
        description,
        salary,
        application_deadline,
        created_at,
        updated_at,
        approval_status,
        company_id,
        company_name,
    ) in rows.all():
        pipeline = await get_job_pipeline_counts(db, job_id, department_id)
        payload.append(
            {
                "id": job_id,
                "title": title,
                "description": description,
                "salary": salary,
                "application_deadline": application_deadline,
                "created_at": created_at,
                "updated_at": updated_at,
                "approval_status": (approval_status or "PENDING").upper(),
                "company": {"id": company_id, "name": company_name},
                "pipeline": pipeline,
            }
        )
    return payload


async def list_active_jobs(db: AsyncSession) -> list[dict]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    rows = await db.execute(
        select(
            Job.id,
            Job.title,
            Job.description,
            Job.salary,
            Job.application_deadline,
            Job.created_at,
            Job.updated_at,
            PlacementDrive.status,
            Company.id,
            Company.name,
        )
        .join(Company, Company.id == Job.company_id)
        .outerjoin(PlacementDrive, PlacementDrive.id == Job.drive_id)
        .where(Job.application_deadline >= now)
        .order_by(Job.application_deadline.asc())
    )

    payload: list[dict] = []
    for (
        job_id,
        title,
        description,
        salary,
        application_deadline,
        created_at,
        updated_at,
        approval_status,
        company_id,
        company_name,
    ) in rows.all():
        payload.append(
            {
                "id": job_id,
                "title": title,
                "description": description,
                "salary": salary,
                "application_deadline": application_deadline,
                "created_at": created_at,
                "updated_at": updated_at,
                "approval_status": (approval_status or "PENDING").upper(),
                "company": {"id": company_id, "name": company_name},
            }
        )
    return payload


async def get_job_pipeline_counts(db: AsyncSession, job_id: uuid.UUID, department_id: uuid.UUID | None) -> dict:
    base_stmt = (
        select(
            JobApplication.id,
            JobApplication.status,
        )
        .join(Student, Student.id == JobApplication.student_id)
        .where(JobApplication.job_id == job_id)
    )
    if department_id:
        base_stmt = base_stmt.where(Student.department_id == department_id)
    app_rows = await db.execute(base_stmt)
    apps = app_rows.all()

    app_ids = [item[0] for item in apps]
    offered_count = 0
    placed_count = 0

    if app_ids:
        offer_rows = await db.execute(
            select(Offer.status).where(Offer.application_id.in_(app_ids))
        )
        statuses = [row[0] for row in offer_rows.all()]
        offered_count = len(statuses)
        placed_count = sum(1 for status in statuses if status in PLACED_OFFER_STATUSES)

    shortlisted_count = sum(1 for _, status in apps if status == "SHORTLISTED")

    return {
        "applied": len(apps),
        "shortlisted": shortlisted_count,
        "offered": offered_count,
        "placed": placed_count,
    }


async def get_application_in_department(
    db: AsyncSession,
    application_id: uuid.UUID,
    department_id: uuid.UUID,
) -> JobApplication | None:
    result = await db.execute(
        select(JobApplication)
        .join(Student, Student.id == JobApplication.student_id)
        .where(JobApplication.id == application_id)
        .where(Student.department_id == department_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_eligibility_snapshot(
    db: AsyncSession,
    application: JobApplication,
) -> ApplicationEligibilitySnapshot:
    existing = await db.execute(
        select(ApplicationEligibilitySnapshot).where(
            ApplicationEligibilitySnapshot.application_id == application.id
        )
    )
    snapshot = existing.scalar_one_or_none()
    if snapshot:
        return snapshot

    details_result = await db.execute(
        select(
            Student.id,
            Student.department_id,
            Student.cgpa,
            Student.backlog_count,
            Job.id,
        )
        .join(Job, Job.id == application.job_id)
        .where(Student.id == application.student_id)
    )
    student_id, department_id, student_cgpa, student_backlogs, job_id = details_result.one()

    eligibility_result = await db.execute(
        select(JobEligibility.min_cgpa, JobEligibility.max_backlogs)
        .where(JobEligibility.job_id == job_id)
        .where(JobEligibility.department_id == department_id)
    )
    eligibility_row = eligibility_result.one_or_none()

    min_cgpa = eligibility_row[0] if eligibility_row else None
    max_backlogs = eligibility_row[1] if eligibility_row else None
    is_eligible = (
        eligibility_row is not None
        and student_cgpa >= min_cgpa
        and student_backlogs <= max_backlogs
    )

    snapshot = ApplicationEligibilitySnapshot(
        application_id=application.id,
        student_id=student_id,
        job_id=job_id,
        department_id=department_id,
        min_cgpa=min_cgpa,
        max_backlogs=max_backlogs,
        student_cgpa=student_cgpa,
        student_backlogs=student_backlogs,
        is_eligible=is_eligible,
        captured_at=datetime.now(timezone.utc),
    )
    db.add(snapshot)
    await db.flush()
    return snapshot


async def create_study_material(
    db: AsyncSession,
    *,
    title: str,
    category: str,
    file_url: str,
    created_by: uuid.UUID,
    is_global: bool,
    department_id: uuid.UUID | None,
) -> StudyMaterial:
    material = StudyMaterial(
        title=title,
        category=category,
        file_url=file_url,
        created_by=created_by,
        is_global=is_global,
        department_id=department_id,
    )
    db.add(material)
    await db.flush()
    return material


async def get_study_material(
    db: AsyncSession,
    material_id: uuid.UUID,
) -> StudyMaterial | None:
    result = await db.execute(
        select(StudyMaterial).where(StudyMaterial.id == material_id)
    )
    return result.scalar_one_or_none()


async def list_study_materials_for_department(
    db: AsyncSession,
    department_id: uuid.UUID,
) -> list[dict]:
    rows = await db.execute(
        select(StudyMaterial)
        .where(
            or_(
                StudyMaterial.is_global.is_(True),
                StudyMaterial.department_id == department_id,
            )
        )
        .order_by(StudyMaterial.created_at.desc())
    )
    materials = rows.scalars().all()

    material_ids = [m.id for m in materials]
    access_counts: dict[uuid.UUID, dict] = {}
    if material_ids:
        access_rows = await db.execute(
            select(
                MaterialAccess.material_id,
                func.count().label("total_count"),
                func.sum(case((MaterialAccess.access_type == "DOWNLOAD", 1), else_=0)).label("download_count"),
            )
            .where(MaterialAccess.material_id.in_(material_ids))
            .group_by(MaterialAccess.material_id)
        )
        for material_id, total_count, download_count in access_rows.all():
            access_counts[material_id] = {
                "total_access_count": int(total_count or 0),
                "download_count": int(download_count or 0),
            }

    payload: list[dict] = []
    for material in materials:
        counts = access_counts.get(
            material.id,
            {
                "total_access_count": 0,
                "download_count": 0,
            },
        )
        payload.append(
            {
                "id": material.id,
                "title": material.title,
                "category": material.category,
                "file_url": material.file_url,
                "is_global": material.is_global,
                "department_id": material.department_id,
                "created_by": material.created_by,
                "created_at": material.created_at,
                "updated_at": material.updated_at,
                "total_access_count": counts["total_access_count"],
                "download_count": counts["download_count"],
            }
        )
    return payload


async def update_study_material(
    db: AsyncSession,
    material: StudyMaterial,
    *,
    title: str | None,
    category: str | None,
    is_global: bool | None,
    department_id: uuid.UUID,
) -> StudyMaterial:
    if title is not None:
        material.title = title
    if category is not None:
        material.category = category
    if is_global is not None:
        material.is_global = is_global
        material.department_id = None if is_global else department_id
    await db.flush()
    return material


async def delete_study_material(db: AsyncSession, material: StudyMaterial) -> None:
    await db.execute(
        delete(MaterialAccess).where(MaterialAccess.material_id == material.id)
    )
    await db.delete(material)
    await db.flush()


async def get_material_access_logs(
    db: AsyncSession,
    material_id: uuid.UUID,
) -> list[dict]:
    rows = await db.execute(
        select(
            MaterialAccess.id,
            MaterialAccess.student_id,
            MaterialAccess.access_type,
            MaterialAccess.created_at,
            Student.enrollment_number,
            User.email,
        )
        .join(Student, Student.id == MaterialAccess.student_id)
        .join(User, User.id == Student.user_id)
        .where(MaterialAccess.material_id == material_id)
        .order_by(MaterialAccess.created_at.desc())
    )
    return [
        {
            "id": access_id,
            "student_id": student_id,
            "enrollment_number": enrollment_number,
            "email": email,
            "access_type": access_type,
            "created_at": created_at,
        }
        for access_id, student_id, access_type, created_at, enrollment_number, email in rows.all()
    ]


async def get_active_or_latest_cycle(db: AsyncSession) -> PlacementCycle | None:
    active = await db.execute(
        select(PlacementCycle)
        .where(PlacementCycle.status == "ACTIVE")
        .order_by(desc(PlacementCycle.created_at))
    )
    cycle = active.scalar_one_or_none()
    if cycle:
        return cycle

    latest = await db.execute(
        select(PlacementCycle)
        .order_by(desc(PlacementCycle.created_at))
    )
    return latest.scalars().first()


async def get_placement_stats_for_department(
    db: AsyncSession,
    department_id: uuid.UUID,
) -> dict:
    cycle = await get_active_or_latest_cycle(db)

    total_students_result = await db.execute(
        select(func.count())
        .select_from(Student)
        .where(Student.department_id == department_id)
    )
    total_students = int(total_students_result.scalar_one() or 0)

    placed_query = (
        select(func.count(func.distinct(JobApplication.student_id)))
        .select_from(Offer)
        .join(JobApplication, JobApplication.id == Offer.application_id)
        .join(Student, Student.id == JobApplication.student_id)
        .where(Student.department_id == department_id)
        .where(Offer.status.in_(PLACED_OFFER_STATUSES))
    )

    avg_ctc_query = (
        select(func.avg(Offer.salary))
        .select_from(Offer)
        .join(JobApplication, JobApplication.id == Offer.application_id)
        .join(Student, Student.id == JobApplication.student_id)
        .where(Student.department_id == department_id)
        .where(Offer.status.in_(PLACED_OFFER_STATUSES))
    )

    if cycle:
        enrollment_result = await db.execute(
            select(DeptCycleEnrollment)
            .where(DeptCycleEnrollment.cycle_id == cycle.id)
            .where(DeptCycleEnrollment.department_id == department_id)
        )
        enrollment = enrollment_result.scalar_one_or_none()
        if enrollment:
            placed_query = placed_query.where(
                Offer.created_at >= enrollment.application_open,
                Offer.created_at <= enrollment.application_close,
            )
            avg_ctc_query = avg_ctc_query.where(
                Offer.created_at >= enrollment.application_open,
                Offer.created_at <= enrollment.application_close,
            )

    placed_result = await db.execute(placed_query)
    placed_count = int(placed_result.scalar_one() or 0)

    avg_ctc_result = await db.execute(avg_ctc_query)
    avg_ctc = float(avg_ctc_result.scalar_one() or 0)

    placement_percentage = (placed_count / total_students * 100) if total_students else 0.0

    return {
        "cycle_id": cycle.id if cycle else None,
        "cycle_name": cycle.name if cycle else None,
        "placed_count": placed_count,
        "placement_percentage": round(placement_percentage, 2),
        "avg_ctc": round(avg_ctc, 2),
        "total_students": total_students,
    }


async def get_company_breakdown_for_department(
    db: AsyncSession,
    department_id: uuid.UUID,
) -> list[dict]:
    job_counts_rows = await db.execute(
        select(
            Company.id,
            Company.name,
            func.count(func.distinct(Job.id)).label("jobs_posted"),
        )
        .select_from(Job)
        .join(Company, Company.id == Job.company_id)
        .join(JobEligibility, JobEligibility.job_id == Job.id)
        .where(JobEligibility.department_id == department_id)
        .group_by(Company.id, Company.name)
        .order_by(Company.name.asc())
    )

    offer_counts_rows = await db.execute(
        select(
            Company.id,
            func.count(Offer.id).label("offers_made"),
            func.sum(case((Offer.status.in_(PLACED_OFFER_STATUSES), 1), else_=0)).label("offers_accepted"),
        )
        .select_from(Offer)
        .join(JobApplication, JobApplication.id == Offer.application_id)
        .join(Student, Student.id == JobApplication.student_id)
        .join(Job, Job.id == JobApplication.job_id)
        .join(Company, Company.id == Job.company_id)
        .where(Student.department_id == department_id)
        .group_by(Company.id)
    )

    offers_map = {
        company_id: {
            "offers_made": int(offers_made or 0),
            "offers_accepted": int(offers_accepted or 0),
        }
        for company_id, offers_made, offers_accepted in offer_counts_rows.all()
    }

    payload: list[dict] = []
    for company_id, company_name, jobs_posted in job_counts_rows.all():
        offer_info = offers_map.get(company_id, {"offers_made": 0, "offers_accepted": 0})
        payload.append(
            {
                "company_id": company_id,
                "company_name": company_name,
                "jobs_posted": int(jobs_posted or 0),
                "offers_made": offer_info["offers_made"],
                "offers_accepted": offer_info["offers_accepted"],
            }
        )

    return payload


async def get_student_report_for_department(
    db: AsyncSession,
    department_id: uuid.UUID,
) -> list[dict]:
    rows = await db.execute(
        select(
            Student.id,
            Student.enrollment_number,
            User.email,
            Student.cgpa,
            Student.backlog_count,
        )
        .join(User, User.id == Student.user_id)
        .where(Student.department_id == department_id)
        .order_by(Student.enrollment_number.asc())
    )

    payload: list[dict] = []
    for student_id, enrollment_number, email, cgpa, backlog_count in rows.all():
        app_count_result = await db.execute(
            select(func.count())
            .select_from(JobApplication)
            .where(JobApplication.student_id == student_id)
        )
        application_count = int(app_count_result.scalar_one() or 0)

        latest_stage_result = await db.execute(
            select(InterviewRound.name)
            .select_from(ApplicationStageHistory)
            .join(InterviewRound, InterviewRound.id == ApplicationStageHistory.interview_round_id)
            .join(JobApplication, JobApplication.id == ApplicationStageHistory.application_id)
            .where(JobApplication.student_id == student_id)
            .order_by(ApplicationStageHistory.id.desc())
            .limit(1)
        )
        latest_stage = latest_stage_result.scalar_one_or_none()

        latest_offer_result = await db.execute(
            select(Offer.status, Company.name)
            .select_from(Offer)
            .join(JobApplication, JobApplication.id == Offer.application_id)
            .join(Job, Job.id == JobApplication.job_id)
            .join(Company, Company.id == Job.company_id)
            .where(JobApplication.student_id == student_id)
            .order_by(Offer.created_at.desc())
            .limit(1)
        )
        latest_offer = latest_offer_result.one_or_none()

        if latest_offer and latest_offer[0] in PLACED_OFFER_STATUSES:
            final_status = "PLACED"
            placed_company = latest_offer[1]
        elif latest_offer:
            final_status = "OFFERED"
            placed_company = None
        elif application_count > 0:
            final_status = "IN_PROCESS"
            placed_company = None
        else:
            final_status = "NOT_APPLIED"
            placed_company = None

        payload.append(
            {
                "student_id": student_id,
                "enrollment_number": enrollment_number,
                "email": email,
                "cgpa": cgpa,
                "backlog_count": backlog_count,
                "application_count": application_count,
                "latest_interview_stage": latest_stage,
                "final_status": final_status,
                "placed_company": placed_company,
            }
        )

    return payload
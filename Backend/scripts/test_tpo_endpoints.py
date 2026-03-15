"""
Integration test for all TPO endpoints.
Run from Backend/: python scripts/test_tpo_endpoints.py
"""

import csv
import io
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

import psycopg2
import requests
from psycopg2.extras import Json

BASE = "http://localhost:8000/api/v1"
DB_DSN = "dbname=cpms_db user=cpms password=cpms host=localhost port=5432"

PASS = "[PASS]"
FAIL = "[FAIL]"

results: list[tuple[bool, str]] = []
SHOW_ALL_RESPONSES = os.getenv("SHOW_ALL_RESPONSES", "0") == "1"


def _print_response_payload(resp: requests.Response):
    content_type = (resp.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        try:
            print("   response:", resp.json())
            return
        except Exception:
            pass
    body = resp.text
    if len(body) > 500:
        body = body[:500] + "..."
    print("   response:", body)


def check(label: str, resp: requests.Response, expect: int = 200, content_type_contains: str | None = None):
    ok = resp.status_code == expect
    if ok and content_type_contains:
        ok = content_type_contains in (resp.headers.get("content-type") or "")

    print(f"{PASS if ok else FAIL} [{resp.status_code}] {label}")
    if SHOW_ALL_RESPONSES:
        _print_response_payload(resp)
    if not ok:
        try:
            print("   ->", resp.json())
        except Exception:
            print("   ->", resp.text[:500])

    results.append((ok, label))
    return ok


def check_json(label: str, resp: requests.Response, expect: int = 200):
    check(label, resp, expect=expect)
    try:
        return resp.json()
    except Exception:
        return {}


def headers(token: str | None = None, content_json: bool = True):
    h = {}
    if content_json:
        h["Content-Type"] = "application/json"
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def login_admin() -> str:
    for password in ("Admin@1234", "Admin@5678"):
        r = requests.post(
            f"{BASE}/auth/login",
            json={"email": "admin@campushire.com", "password": password},
            headers=headers(),
            timeout=30,
        )
        if r.status_code == 200:
            body = r.json()
            print(f"{PASS} Admin login succeeded with known credential set")
            return body["access_token"]
    print(f"{FAIL} Admin login failed for known credentials")
    sys.exit(1)


def insert_seed_data(
    *,
    student_id: str,
    department_id: str,
    company_id: str,
) -> dict:
    now = datetime.now(timezone.utc)
    created_at = now
    updated_at = now

    job_id = str(uuid.uuid4())
    interview_round_id = str(uuid.uuid4())
    application_id = str(uuid.uuid4())
    offer_id = str(uuid.uuid4())
    resume_id = str(uuid.uuid4())
    resume_version_id = str(uuid.uuid4())
    resume_ai_id = str(uuid.uuid4())

    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO jobs (id, company_id, drive_id, title, description, salary, application_deadline, created_at, updated_at)
                VALUES (%s, %s, NULL, %s, %s, %s, %s, %s, %s)
                """,
                (
                    job_id,
                    company_id,
                    "Software Engineer Intern",
                    "TPO integration test job",
                    1200000,
                    now + timedelta(days=30),
                    created_at,
                    updated_at,
                ),
            )

            cur.execute(
                """
                INSERT INTO job_eligibilities (id, job_id, department_id, min_cgpa, max_backlogs)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), job_id, department_id, 7.0, 2),
            )

            cur.execute(
                """
                INSERT INTO interview_rounds (id, job_id, name, round_order)
                VALUES (%s, %s, %s, %s)
                """,
                (interview_round_id, job_id, "Technical Round 1", 1),
            )

            cur.execute(
                """
                INSERT INTO job_applications (id, student_id, job_id, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (application_id, student_id, job_id, "APPLIED", created_at, updated_at),
            )

            cur.execute(
                """
                INSERT INTO application_stage_history (id, application_id, interview_round_id, status, remarks)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), application_id, interview_round_id, "SCHEDULED", "Initial schedule"),
            )

            cur.execute(
                """
                INSERT INTO offers (id, application_id, salary, status, offer_letter_url, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    offer_id,
                    application_id,
                    1200000,
                    "ACCEPTED",
                    "https://example.com/offer-letter.pdf",
                    created_at,
                    updated_at,
                ),
            )

            cur.execute(
                """
                INSERT INTO resumes (id, student_id, file_url, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (resume_id, student_id, "https://example.com/resume-v1.pdf", created_at, updated_at),
            )

            cur.execute(
                """
                INSERT INTO resume_versions (id, resume_id, version_number, file_url)
                VALUES (%s, %s, %s, %s)
                """,
                (resume_version_id, resume_id, 1, "https://example.com/resume-v1.pdf"),
            )

            cur.execute(
                """
                INSERT INTO resume_ai_analysis (id, resume_id, ats_score, detected_skills, skill_gaps)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    resume_ai_id,
                    resume_id,
                    82,
                    Json({"skills": ["Python", "SQL", "FastAPI"]}),
                    Json({"missing": ["System Design"]}),
                ),
            )

    return {
        "job_id": job_id,
        "application_id": application_id,
        "offer_id": offer_id,
    }


def insert_material_access(material_id: str, student_id: str):
    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO material_access (id, material_id, student_id, access_type)
                VALUES (%s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), material_id, student_id, "DOWNLOAD"),
            )


def main():
    suffix = datetime.now().strftime("%Y%m%d%H%M%S")

    # 0) Health + Admin login
    r = requests.get(f"{BASE}/health", timeout=30)
    check("GET /health", r, 200)

    admin_token = login_admin()

    # 1) Create Department
    dept_name = f"TPO Test Dept {suffix}"
    r = requests.post(
        f"{BASE}/admin/departments",
        json={"name": dept_name},
        headers=headers(admin_token),
        timeout=30,
    )
    dept_body = check_json("POST /admin/departments", r, 201)
    department_id = dept_body.get("id")

    # 2) Create TPO and login
    tpo_email = f"tpo.{suffix}@campushire.com"
    tpo_password = "Tpo@1234"
    r = requests.post(
        f"{BASE}/admin/tpos",
        json={
            "name": f"TPO {suffix}",
            "department_id": department_id,
            "email": tpo_email,
            "password": tpo_password,
        },
        headers=headers(admin_token),
        timeout=30,
    )
    check("POST /admin/tpos", r, 201)

    r = requests.post(
        f"{BASE}/auth/login",
        json={"email": tpo_email, "password": tpo_password},
        headers=headers(),
        timeout=30,
    )
    tpo_login = check_json("POST /auth/login (TPO)", r, 200)
    tpo_token = tpo_login.get("access_token")

    # 3) Create Company
    company_email = f"company.{suffix}@campushire.com"
    company_password = "Company@1234"
    r = requests.post(
        f"{BASE}/admin/companies",
        json={
            "name": f"Company {suffix}",
            "email": company_email,
            "password": company_password,
            "website": "https://example.com",
            "description": "TPO test company",
        },
        headers=headers(admin_token),
        timeout=30,
    )
    company_body = check_json("POST /admin/companies", r, 201)
    company_id = company_body.get("id")

    # 4) Create cycle + enrollment for report scoping
    now = datetime.now(timezone.utc)
    r = requests.post(
        f"{BASE}/admin/cycles",
        json={
            "name": f"Cycle-{suffix}",
            "start_date": (now - timedelta(days=10)).isoformat(),
            "end_date": (now + timedelta(days=30)).isoformat(),
        },
        headers=headers(admin_token),
        timeout=30,
    )
    cycle_body = check_json("POST /admin/cycles", r, 201)
    cycle_id = cycle_body.get("id")

    r = requests.post(
        f"{BASE}/admin/cycles/{cycle_id}/activate",
        headers=headers(admin_token, content_json=False),
        timeout=30,
    )
    check("POST /admin/cycles/{id}/activate", r, 200)

    r = requests.post(
        f"{BASE}/admin/cycles/{cycle_id}/enroll-department",
        json={
            "department_id": department_id,
            "application_open": (now - timedelta(days=2)).isoformat(),
            "application_close": (now + timedelta(days=10)).isoformat(),
        },
        headers=headers(admin_token),
        timeout=30,
    )
    check("POST /admin/cycles/{id}/enroll-department", r, 201)

    # 5) TPO student management routes
    student_email = f"student.{suffix}@campushire.com"
    student_password = "Student@1234"

    r = requests.post(
        f"{BASE}/tpo/students",
        json={
            "email": student_email,
            "password": student_password,
            "enrollment_number": f"ENR-{suffix}",
            "cgpa": 8.2,
            "tenth_percentage": 88.5,
            "twelfth_percentage": 86.0,
            "backlog_count": 0,
        },
        headers=headers(tpo_token),
        timeout=30,
    )
    student_create = check_json("POST /tpo/students", r, 201)
    student_id = student_create.get("student_id")

    r = requests.get(f"{BASE}/tpo/students", headers=headers(tpo_token, content_json=False), timeout=30)
    students_list = check_json("GET /tpo/students", r, 200)

    r = requests.put(
        f"{BASE}/tpo/students/{student_id}",
        json={"cgpa": 8.6, "backlog_count": 1, "tenth_percentage": 89.0, "twelfth_percentage": 87.0},
        headers=headers(tpo_token),
        timeout=30,
    )
    check("PUT /tpo/students/{student_id}", r, 200)

    r = requests.post(
        f"{BASE}/tpo/students/{student_id}/reset-password",
        json={"new_password": "NewStudent@1234"},
        headers=headers(tpo_token),
        timeout=30,
    )
    check("POST /tpo/students/{student_id}/reset-password", r, 200)

    # Bulk upload
    csv_buf = io.StringIO()
    writer = csv.DictWriter(
        csv_buf,
        fieldnames=["email", "password", "enrollment_number", "cgpa", "tenth_percentage", "twelfth_percentage", "backlog_count"],
    )
    writer.writeheader()
    writer.writerow(
        {
            "email": f"bulk.{suffix}@campushire.com",
            "password": "Bulk@1234",
            "enrollment_number": f"BULK-{suffix}",
            "cgpa": 7.9,
            "tenth_percentage": 84,
            "twelfth_percentage": 82,
            "backlog_count": 0,
        }
    )

    files = {"file": ("students.csv", csv_buf.getvalue(), "text/csv")}
    r = requests.post(
        f"{BASE}/tpo/students/bulk-upload",
        files=files,
        headers={"Authorization": f"Bearer {tpo_token}"},
        timeout=30,
    )
    check("POST /tpo/students/bulk-upload", r, 200)

    # 6) Seed job/application/resume data for timeline/jobs/eligibility/report endpoints
    seeded = insert_seed_data(student_id=student_id, department_id=department_id, company_id=company_id)
    application_id = seeded["application_id"]

    r = requests.get(
        f"{BASE}/tpo/students/{student_id}/application-timeline",
        headers=headers(tpo_token, content_json=False),
        timeout=30,
    )
    check("GET /tpo/students/{student_id}/application-timeline", r, 200)

    r = requests.get(
        f"{BASE}/tpo/students/{student_id}/resume-ai-history",
        headers=headers(tpo_token, content_json=False),
        timeout=30,
    )
    check("GET /tpo/students/{student_id}/resume-ai-history", r, 200)

    r = requests.get(f"{BASE}/tpo/jobs/active", headers=headers(tpo_token, content_json=False), timeout=30)
    check("GET /tpo/jobs/active", r, 200)

    r = requests.post(
        f"{BASE}/tpo/applications/{application_id}/override-status",
        json={"new_status": "SHORTLISTED", "reason": "Manual correction after recruiter call"},
        headers=headers(tpo_token),
        timeout=30,
    )
    check("POST /tpo/applications/{application_id}/override-status", r, 200)

    r = requests.get(
        f"{BASE}/tpo/applications/{application_id}/eligibility-snapshot",
        headers=headers(tpo_token, content_json=False),
        timeout=30,
    )
    check("GET /tpo/applications/{application_id}/eligibility-snapshot", r, 200)

    # 7) Materials + MinIO routes
    files = {
        "file": ("dsa-sheet.pdf", b"sample content", "application/pdf"),
    }
    data = {
        "title": "DSA Sheet",
        "category": "DSA",
        "is_global": "false",
    }
    r = requests.post(
        f"{BASE}/tpo/materials",
        data=data,
        files=files,
        headers={"Authorization": f"Bearer {tpo_token}"},
        timeout=30,
    )
    material_body = check_json("POST /tpo/materials", r, 201)
    material_id = material_body.get("id")

    r = requests.get(f"{BASE}/tpo/materials", headers=headers(tpo_token, content_json=False), timeout=30)
    check("GET /tpo/materials", r, 200)

    insert_material_access(material_id=material_id, student_id=student_id)

    r = requests.get(
        f"{BASE}/tpo/materials/{material_id}/access-logs",
        headers=headers(tpo_token, content_json=False),
        timeout=30,
    )
    check("GET /tpo/materials/{material_id}/access-logs", r, 200)

    r = requests.get(
        f"{BASE}/tpo/materials/minio-objects",
        headers=headers(tpo_token, content_json=False),
        timeout=30,
    )
    check("GET /tpo/materials/minio-objects", r, 200)

    r = requests.put(
        f"{BASE}/tpo/materials/{material_id}",
        json={"title": "Updated DSA Sheet", "category": "Aptitude", "is_global": True},
        headers=headers(tpo_token),
        timeout=30,
    )
    check("PUT /tpo/materials/{material_id}", r, 200)

    # 8) Reports + CSV exports
    r = requests.get(f"{BASE}/tpo/reports/dashboard", headers=headers(tpo_token, content_json=False), timeout=30)
    check("GET /tpo/reports/dashboard", r, 200)

    for report_type in ("placement", "company", "student"):
        r = requests.get(
            f"{BASE}/tpo/reports/export",
            params={"report_type": report_type},
            headers=headers(tpo_token, content_json=False),
            timeout=30,
        )
        check(f"GET /tpo/reports/export?report_type={report_type}", r, 200, content_type_contains="text/csv")

    # 9) Delete material route
    r = requests.delete(
        f"{BASE}/tpo/materials/{material_id}",
        headers=headers(tpo_token, content_json=False),
        timeout=30,
    )
    check("DELETE /tpo/materials/{material_id}", r, 200)

    # Summary
    total = len(results)
    passed = sum(1 for ok, _ in results if ok)
    failed = total - passed

    print("\n" + "=" * 70)
    print(f"TPO endpoint test results: {passed}/{total} passed, {failed} failed")
    if failed:
        print("Failed checks:")
        for ok, label in results:
            if not ok:
                print(" -", label)
    print("=" * 70)

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()

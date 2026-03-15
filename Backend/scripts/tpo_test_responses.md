# TPO Endpoint Test Responses

Source: `scripts/test_tpo_endpoints.py` run with `SHOW_ALL_RESPONSES=1`

## Summary
- Total checks: 28
- Passed: 25
- Failed: 3
- Failed endpoints:
  - `GET /tpo/reports/dashboard` (500)
  - `GET /tpo/reports/export?report_type=placement` (500)
  - `DELETE /tpo/materials/{material_id}` (500)

## Endpoint-by-Endpoint Responses

### 1) GET /health
- Status: 200
- Response:
```json
{"status": "ok"}
```

### 2) POST /admin/departments
- Status: 201
- Response:
```json
{
  "id": "f67c2bed-07b3-4378-8537-7f7b8abf8c83",
  "created_at": "2026-03-14T06:42:34.141149+00:00",
  "name": "TPO Test Dept 20260314064233",
  "updated_at": "2026-03-14T06:42:34.141153+00:00"
}
```

### 3) POST /admin/tpos
- Status: 201
- Response:
```json
{
  "id": "5daafeea-ff66-455e-a48c-f17de4c5c7a9",
  "user_id": "0d49fc89-6dbc-4b36-bff6-15c68cdde076",
  "email": "tpo.20260314064233@campushire.com",
  "name": "TPO 20260314064233",
  "department_id": "f67c2bed-07b3-4378-8537-7f7b8abf8c83",
  "is_active": true,
  "created_at": "2026-03-14T06:42:34.264907+00:00"
}
```

### 4) POST /auth/login (TPO)
- Status: 200
- Response:
```json
{
  "access_token": "<paseto-token>",
  "refresh_token": "<paseto-token>"
}
```

### 5) POST /admin/companies
- Status: 201
- Response:
```json
{
  "id": "12c79bd3-194c-4705-b193-da9b0eb1de12",
  "user_id": "c85586b8-2589-4699-add4-f71bad71babe",
  "email": "company.20260314064233@campushire.com",
  "name": "Company 20260314064233",
  "website": "https://example.com",
  "description": "TPO test company",
  "is_active": true,
  "created_at": "2026-03-14T06:42:34.650723+00:00"
}
```

### 6) POST /admin/cycles
- Status: 201
- Response:
```json
{
  "start_date": "2026-03-04T06:42:34.657561+00:00",
  "end_date": "2026-04-13T06:42:34.657561+00:00",
  "name": "Cycle-20260314064233",
  "status": "DRAFT",
  "created_at": "2026-03-14T06:42:34.680465+00:00",
  "updated_at": "2026-03-14T06:42:34.680471+00:00",
  "id": "024a98b9-394b-47d5-8451-c453caa1c252"
}
```

### 7) POST /admin/cycles/{id}/activate
- Status: 200
- Response:
```json
{
  "start_date": "2026-03-04T06:42:34.657561+00:00",
  "end_date": "2026-04-13T06:42:34.657561+00:00",
  "name": "Cycle-20260314064233",
  "status": "ACTIVE",
  "created_at": "2026-03-14T06:42:34.680465+00:00",
  "updated_at": "2026-03-14T06:42:34.853268+00:00",
  "id": "024a98b9-394b-47d5-8451-c453caa1c252"
}
```

### 8) POST /admin/cycles/{id}/enroll-department
- Status: 201
- Response:
```json
{
  "department_id": "f67c2bed-07b3-4378-8537-7f7b8abf8c83",
  "application_close": "2026-03-24T06:42:34.657561+00:00",
  "cycle_id": "024a98b9-394b-47d5-8451-c453caa1c252",
  "created_at": "2026-03-14T06:42:34.866239+00:00",
  "application_open": "2026-03-12T06:42:34.657561+00:00",
  "id": "fa70e2e9-d602-4854-8439-abc238b854e4",
  "updated_at": "2026-03-14T06:42:34.866244+00:00"
}
```

### 9) POST /tpo/students
- Status: 201
- Response:
```json
{
  "student_id": "1d46e71a-4818-4fac-8caf-b741fb5aee22",
  "user_id": "9185b0d6-cb40-4252-b9dd-1ea2d80d57af",
  "email": "student.20260314064233@campushire.com",
  "enrollment_number": "ENR-20260314064233",
  "generated_password": null
}
```

### 10) GET /tpo/students
- Status: 200
- Response:
```json
{
  "students": [
    {
      "id": "1d46e71a-4818-4fac-8caf-b741fb5aee22",
      "user_id": "9185b0d6-cb40-4252-b9dd-1ea2d80d57af",
      "email": "student.20260314064233@campushire.com",
      "enrollment_number": "ENR-20260314064233",
      "department_id": "f67c2bed-07b3-4378-8537-7f7b8abf8c83",
      "department_name": "TPO Test Dept 20260314064233",
      "cgpa": 8.2,
      "tenth_percentage": 88.5,
      "twelfth_percentage": 86.0,
      "backlog_count": 0,
      "placement_status": "NOT_APPLIED",
      "placed_company": null,
      "created_at": "2026-03-14T06:42:35.044027+00:00",
      "updated_at": "2026-03-14T06:42:35.044031+00:00"
    }
  ]
}
```

### 11) PUT /tpo/students/{student_id}
- Status: 200
- Response:
```json
{"message": "Student profile updated"}
```

### 12) POST /tpo/students/{student_id}/reset-password
- Status: 200
- Response:
```json
{"message": "Student password reset", "generated_password": null}
```

### 13) POST /tpo/students/bulk-upload
- Status: 200
- Response:
```json
{
  "created_count": 1,
  "failed_count": 0,
  "created_students": [
    {
      "student_id": "3255b487-c72d-466e-b51c-c6a82433bf03",
      "user_id": "d1ec2f42-2160-4b42-bd5e-23bb97cd4a23",
      "email": "bulk.20260314064233@campushire.com",
      "enrollment_number": "BULK-20260314064233",
      "generated_password": null
    }
  ],
  "errors": []
}
```

### 14) GET /tpo/students/{student_id}/application-timeline
- Status: 200
- Response: JSON returned with full application timeline containing job details, stage history, and offer details.

### 15) GET /tpo/students/{student_id}/resume-ai-history
- Status: 200
- Response: JSON returned with resume(s), version(s), and AI analysis details (`ats_score`, `detected_skills`, `skill_gaps`).

### 16) GET /tpo/jobs/active
- Status: 200
- Response: JSON returned with active jobs and pipeline counts (`applied`, `shortlisted`, `offered`, `placed`).

### 17) POST /tpo/applications/{application_id}/override-status
- Status: 200
- Response:
```json
{
  "application_id": "01141a1a-d115-440c-a070-44f2e967cdc7",
  "old_status": "APPLIED",
  "new_status": "SHORTLISTED",
  "reason": "Manual correction after recruiter call"
}
```

### 18) GET /tpo/applications/{application_id}/eligibility-snapshot
- Status: 200
- Response:
```json
{
  "application_id": "01141a1a-d115-440c-a070-44f2e967cdc7",
  "student_id": "1d46e71a-4818-4fac-8caf-b741fb5aee22",
  "job_id": "32737180-1c76-456f-89a6-8d7962f99144",
  "department_id": "f67c2bed-07b3-4378-8537-7f7b8abf8c83",
  "min_cgpa": 7.0,
  "max_backlogs": 2,
  "student_cgpa": 8.6,
  "student_backlogs": 1,
  "is_eligible": true,
  "captured_at": "2026-03-14T06:42:35.499397Z"
}
```

### 19) POST /tpo/materials
- Status: 201
- Response:
```json
{
  "id": "909b708f-e416-4ee2-9e44-86784213bf94",
  "title": "DSA Sheet",
  "category": "DSA",
  "file_url": "http://localhost:9000/study-materials/materials/f67c2bed-07b3-4378-8537-7f7b8abf8c83/ea1cb921c01e464f9e0447c1df2f9a7d_dsa-sheet.pdf",
  "is_global": false,
  "department_id": "f67c2bed-07b3-4378-8537-7f7b8abf8c83",
  "created_by": "0d49fc89-6dbc-4b36-bff6-15c68cdde076",
  "created_at": "2026-03-14T06:42:35.523479",
  "updated_at": "2026-03-14T06:42:35.523483",
  "total_access_count": 0,
  "download_count": 0
}
```

### 20) GET /tpo/materials
- Status: 200
- Response: JSON returned list of visible materials with access counters.

### 21) GET /tpo/materials/{material_id}/access-logs
- Status: 200
- Response:
```json
{
  "material_id": "909b708f-e416-4ee2-9e44-86784213bf94",
  "access_logs": [
    {
      "id": "73ec46c1-b7b9-493e-be9a-a71ed86e0f26",
      "student_id": "1d46e71a-4818-4fac-8caf-b741fb5aee22",
      "enrollment_number": "ENR-20260314064233",
      "email": "student.20260314064233@campushire.com",
      "access_type": "DOWNLOAD",
      "created_at": "2026-03-14T06:42:35.543449+00:00"
    }
  ]
}
```

### 22) GET /tpo/materials/minio-objects
- Status: 200
- Response:
```json
{
  "bucket": "study-materials",
  "objects": [
    {
      "object_name": "materials/f67c2bed-07b3-4378-8537-7f7b8abf8c83/ea1cb921c01e464f9e0447c1df2f9a7d_dsa-sheet.pdf",
      "size": 14,
      "etag": "d524cc049aa9e17e50110b184db46691",
      "last_modified": "2026-03-14T06:42:35.510000+00:00"
    }
  ]
}
```

### 23) PUT /tpo/materials/{material_id}
- Status: 200
- Response:
```json
{
  "id": "909b708f-e416-4ee2-9e44-86784213bf94",
  "title": "Updated DSA Sheet",
  "category": "Aptitude",
  "file_url": "http://localhost:9000/study-materials/materials/f67c2bed-07b3-4378-8537-7f7b8abf8c83/ea1cb921c01e464f9e0447c1df2f9a7d_dsa-sheet.pdf",
  "is_global": true,
  "department_id": null,
  "created_by": "0d49fc89-6dbc-4b36-bff6-15c68cdde076",
  "created_at": "2026-03-14T06:42:35.523479+00:00",
  "updated_at": "2026-03-14T06:42:35.570000"
}
```

### 24) GET /tpo/reports/dashboard
- Status: 500
- Response:
```text
Internal Server Error
```

### 25) GET /tpo/reports/export?report_type=placement
- Status: 500
- Response:
```text
Internal Server Error
```

### 26) GET /tpo/reports/export?report_type=company
- Status: 200
- Response (CSV):
```csv
company_id,company_name,jobs_posted,offers_made,offers_accepted
12c79bd3-194c-4705-b193-da9b0eb1de12,Company 20260314064233,1,1,1
```

### 27) GET /tpo/reports/export?report_type=student
- Status: 200
- Response (CSV):
```csv
student_id,enrollment_number,email,cgpa,backlog_count,application_count,latest_interview_stage,final_status,placed_company
3255b487-c72d-466e-b51c-c6a82433bf03,BULK-20260314064233,bulk.20260314064233@campushire.com,7.9,0,0,,NOT_APPLIED,
1d46e71a-4818-4fac-8caf-b741fb5aee22,ENR-20260314064233,student.20260314064233@campushire.com,8.6,1,1,Technical Round 1,PLACED,Company 20260314064233
```

### 28) DELETE /tpo/materials/{material_id}
- Status: 500
- Response:
```text
Internal Server Error
```

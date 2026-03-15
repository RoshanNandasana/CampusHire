"""
End-to-end test script for CampusHire API.
Run from Backend/ directory:  python scripts/test_endpoints.py
"""
import sys
import json
import uuid
import requests

BASE = "http://localhost:8000/api/v1"
PASS = "\033[92m✓\033[0m"
FAIL = "\033[91m✗\033[0m"

results = []


def check(label, resp, expect=200):
    ok = resp.status_code == expect
    sym = PASS if ok else FAIL
    try:
        body = resp.json()
    except Exception:
        body = resp.text
    print(f"  {sym} [{resp.status_code}] {label}")
    if not ok:
        print(f"       → {body}")
    results.append((ok, label))
    return body


def h(token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


# ── 1. Health ────────────────────────────────────────────────────────────────
print("\n─── Health ───")
r = requests.get(f"{BASE}/health")
check("GET /health", r)

# ── 2. Auth: login as Super Admin ────────────────────────────────────────────
print("\n─── Auth ───")
r = requests.post(f"{BASE}/auth/login", json={"email": "admin@campushire.com", "password": "Admin@1234"}, headers=h())
body = check("POST /auth/login (super admin)", r)
ADMIN_TOKEN = body.get("access_token", "")

# Bad credentials
r = requests.post(f"{BASE}/auth/login", json={"email": "admin@campushire.com", "password": "wrong"}, headers=h())
check("POST /auth/login (bad password) → 401", r, 401)

# ── 3. Departments ────────────────────────────────────────────────────────────
print("\n─── Departments ───")
r = requests.post(f"{BASE}/admin/departments", json={"name": "Computer Science"}, headers=h(ADMIN_TOKEN))
body = check("POST /admin/departments", r, 201)
DEPT_ID = body.get("id")

r = requests.post(f"{BASE}/admin/departments", json={"name": "Mechanical Engineering"}, headers=h(ADMIN_TOKEN))
body2 = check("POST /admin/departments (second)", r, 201)
DEPT_ID2 = body2.get("id")

r = requests.get(f"{BASE}/admin/departments", headers=h(ADMIN_TOKEN))
check("GET /admin/departments", r)

r = requests.put(f"{BASE}/admin/departments/{DEPT_ID}", json={"name": "Computer Science & Engineering"}, headers=h(ADMIN_TOKEN))
check("PUT /admin/departments/:id", r)

# Unauthorized (no token) → 401 Not authenticated (HTTPBearer rejects before role check)
r = requests.post(f"{BASE}/admin/departments", json={"name": "X"})
check("POST /admin/departments (no token) → 401", r, 401)

# ── 4. TPO Coordinators ───────────────────────────────────────────────────────
print("\n─── TPO Coordinators ───")
r = requests.post(f"{BASE}/admin/tpos", json={
    "name": "Dr. Sharma",
    "department_id": DEPT_ID,
    "email": "tpo1@campushire.com",
    "password": "Tpo@1234"
}, headers=h(ADMIN_TOKEN))
body = check("POST /admin/tpos", r, 201)
TPO_USER_ID = body.get("user_id")
TPO_ID = body.get("id")

# Duplicate email
r = requests.post(f"{BASE}/admin/tpos", json={
    "name": "Dup TPO",
    "department_id": DEPT_ID,
    "email": "tpo1@campushire.com",
    "password": "Tpo@1234"
}, headers=h(ADMIN_TOKEN))
check("POST /admin/tpos (dup email) → 400", r, 400)

r = requests.get(f"{BASE}/admin/tpos", headers=h(ADMIN_TOKEN))
check("GET /admin/tpos", r)

r = requests.put(f"{BASE}/admin/tpos/{TPO_ID}", json={"name": "Dr. Sharma Updated"}, headers=h(ADMIN_TOKEN))
check("PUT /admin/tpos/:id", r)

# ── 5. TPO Login ──────────────────────────────────────────────────────────────
print("\n─── TPO Login & access ───")
r = requests.post(f"{BASE}/auth/login", json={"email": "tpo1@campushire.com", "password": "Tpo@1234"}, headers=h())
body = check("POST /auth/login (tpo)", r)
TPO_TOKEN = body.get("access_token", "")

# TPO can see departments (allowed)
r = requests.get(f"{BASE}/admin/departments", headers=h(TPO_TOKEN))
check("GET /admin/departments (as TPO) → 200", r, 200)

# TPO cannot create department
r = requests.post(f"{BASE}/admin/departments", json={"name": "Forbidden Dept"}, headers=h(TPO_TOKEN))
check("POST /admin/departments (as TPO) → 403", r, 403)

# TPO can see companies
r = requests.get(f"{BASE}/admin/companies", headers=h(TPO_TOKEN))
check("GET /admin/companies (as TPO) → 200", r, 200)

# TPO can see analytics
r = requests.get(f"{BASE}/admin/analytics", headers=h(TPO_TOKEN))
check("GET /admin/analytics (as TPO) → 200", r, 200)

# ── 6. Companies ──────────────────────────────────────────────────────────────
print("\n─── Companies ───")
r = requests.post(f"{BASE}/admin/companies", json={
    "name": "TechCorp Pvt Ltd",
    "email": "company1@techcorp.com",
    "password": "Company@1234",
    "website": "https://techcorp.com",
    "description": "A top tech company"
}, headers=h(ADMIN_TOKEN))
body = check("POST /admin/companies", r, 201)
COMPANY_USER_ID = body.get("user_id")
COMPANY_ID = body.get("id")

# TPO cannot create company
r = requests.post(f"{BASE}/admin/companies", json={
    "name": "X Corp",
    "email": "xcorp@test.com",
    "password": "X@12345"
}, headers=h(TPO_TOKEN))
check("POST /admin/companies (as TPO) → 403", r, 403)

r = requests.get(f"{BASE}/admin/companies", headers=h(ADMIN_TOKEN))
check("GET /admin/companies", r)

r = requests.put(f"{BASE}/admin/companies/{COMPANY_ID}", json={"name": "TechCorp International"}, headers=h(ADMIN_TOKEN))
check("PUT /admin/companies/:id", r)

# ── 7. Company Login ──────────────────────────────────────────────────────────
print("\n─── Company Login ───")
r = requests.post(f"{BASE}/auth/login", json={"email": "company1@techcorp.com", "password": "Company@1234"}, headers=h())
body = check("POST /auth/login (company)", r)
COMPANY_TOKEN = body.get("access_token", "")

# Company cannot access admin endpoints
r = requests.get(f"{BASE}/admin/departments", headers=h(COMPANY_TOKEN))
check("GET /admin/departments (as COMPANY) → 403", r, 403)

# ── 8. Placement Cycles ───────────────────────────────────────────────────────
print("\n─── Placement Cycles ───")
r = requests.post(f"{BASE}/admin/cycles", json={
    "name": "2025-26",
    "start_date": "2025-08-01T00:00:00Z",
    "end_date": "2026-05-31T00:00:00Z"
}, headers=h(ADMIN_TOKEN))
body = check("POST /admin/cycles", r, 201)
CYCLE_ID = body.get("id")

r = requests.get(f"{BASE}/admin/cycles", headers=h(ADMIN_TOKEN))
check("GET /admin/cycles", r)

r = requests.post(f"{BASE}/admin/cycles/{CYCLE_ID}/activate", headers=h(ADMIN_TOKEN))
check("POST /admin/cycles/:id/activate", r)

# ── 9. Enroll Department into Cycle ──────────────────────────────────────────
print("\n─── Dept-Cycle Enrollment ───")
r = requests.post(f"{BASE}/admin/cycles/{CYCLE_ID}/enroll-department", json={
    "department_id": DEPT_ID,
    "application_open": "2025-09-01T00:00:00Z",
    "application_close": "2025-11-30T00:00:00Z"
}, headers=h(ADMIN_TOKEN))
check("POST /admin/cycles/:id/enroll-department", r, 201)

# Duplicate enrollment
r = requests.post(f"{BASE}/admin/cycles/{CYCLE_ID}/enroll-department", json={
    "department_id": DEPT_ID,
    "application_open": "2025-09-01T00:00:00Z",
    "application_close": "2025-11-30T00:00:00Z"
}, headers=h(ADMIN_TOKEN))
check("POST enroll-department (dup) → 400", r, 400)

r = requests.get(f"{BASE}/admin/cycles/{CYCLE_ID}/enrollments", headers=h(ADMIN_TOKEN))
check("GET /admin/cycles/:id/enrollments", r)

# Close cycle
r = requests.post(f"{BASE}/admin/cycles/{CYCLE_ID}/close", headers=h(ADMIN_TOKEN))
check("POST /admin/cycles/:id/close", r)

# ── 10. User Deactivation & Password Reset ────────────────────────────────────
print("\n─── User Management ───")
r = requests.post(f"{BASE}/admin/users/{TPO_USER_ID}/deactivate", headers=h(ADMIN_TOKEN))
check("POST /admin/users/:id/deactivate", r)

r = requests.post(f"{BASE}/admin/users/reset-password", json={
    "user_id": COMPANY_USER_ID,
    "password": "NewCompany@5678"
}, headers=h(ADMIN_TOKEN))
check("POST /admin/users/reset-password", r)

# Deactivated TPO cannot login
r = requests.post(f"{BASE}/auth/login", json={"email": "tpo1@campushire.com", "password": "Tpo@1234"}, headers=h())
check("POST /auth/login (deactivated user) → 401", r, 401)

# ── 11. System Config ─────────────────────────────────────────────────────────
print("\n─── System Config ───")
r = requests.put(f"{BASE}/admin/system-config", json={
    "ai_model": "gpt-4o",
    "prompt_version": "v2",
    "login_rate_limit": 10,
    "login_rate_window": 600
}, headers=h(ADMIN_TOKEN))
check("PUT /admin/system-config", r)

r = requests.get(f"{BASE}/admin/system-config", headers=h(ADMIN_TOKEN))
check("GET /admin/system-config", r)

# ── 12. Audit Logs ────────────────────────────────────────────────────────────
print("\n─── Audit Logs ───")
r = requests.get(f"{BASE}/admin/audit-logs?limit=50&offset=0", headers=h(ADMIN_TOKEN))
body = check("GET /admin/audit-logs", r)
log_count = len(body) if isinstance(body, list) else "?"
print(f"       → {log_count} log entries found")

# ── 13. Analytics ─────────────────────────────────────────────────────────────
print("\n─── Analytics ───")
r = requests.get(f"{BASE}/admin/analytics", headers=h(ADMIN_TOKEN))
check("GET /admin/analytics", r)

# ── 14. Auth: change-password & logout ───────────────────────────────────────
print("\n─── Auth: change-password & logout ───")
r = requests.post(f"{BASE}/auth/change-password", json={
    "old_password": "Admin@1234",
    "new_password": "Admin@5678"
}, headers=h(ADMIN_TOKEN))
check("POST /auth/change-password", r)

# Login with new password
r = requests.post(f"{BASE}/auth/login", json={"email": "admin@campushire.com", "password": "Admin@5678"}, headers=h())
body = check("POST /auth/login (new password)", r)
NEW_TOKEN = body.get("access_token", "")

# Old token should now be invalid (token_version bumped on logout)
r = requests.post(f"{BASE}/auth/logout", headers=h(NEW_TOKEN))
check("POST /auth/logout", r)

# After logout old token is invalid
r = requests.get(f"{BASE}/admin/departments", headers=h(NEW_TOKEN))
check("GET /admin/departments (after logout) → 401", r, 401)

# ── Summary ───────────────────────────────────────────────────────────────────
total = len(results)
passed = sum(1 for ok, _ in results if ok)
failed = total - passed
print(f"\n{'='*50}")
print(f"Results: {passed}/{total} passed  ({failed} failed)")
if failed:
    print("Failed tests:")
    for ok, label in results:
        if not ok:
            print(f"  - {label}")
print('='*50)
sys.exit(0 if failed == 0 else 1)

# CampusHire: Company-Recruiter Relationship Analysis

## Executive Summary
The company-recruiter relationship is fundamentally sound but has a **frontend display issue** where company name shows as email. The backend properly creates companies for recruiters, but the frontend doesn't persist/display this information correctly.

---

## 1. COMPANY-RECRUITER RELATIONSHIP

### Data Model
```
User (recruiter with COMPANY role)
    ↓ (1:1 relationship via unique foreign key)
Company (user_id)
    ↓
Jobs, PlacementDrives, Applicants
```

### Key Details
- **Location**: [Backend/app/models/company.py](Backend/app/models/company.py#L1-L35)
- **Relationship Type**: 1:1 (one company per recruiter user)
- **Constraint**: `user_id` is unique in companies table
- **Relationship Definition**:
  ```python
  user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True)
  user = relationship("User", back_populates="company")
  ```

### How Company Gets Assigned to Recruiter
There are 2 ways a recruiter gets a company:

#### Option 1: Via Seed Script (Current Test Setup) ✅
**Location**: [Backend/seed.py](Backend/seed.py#L101-L117)

```python
async def _ensure_company_profile(db, user: User) -> None:
    # Check if company already exists
    row = await db.execute(select(Company).where(Company.user_id == user.id))
    company = row.scalar_one_or_none()
    
    if company:
        if not company.name:
            company.name = "CampusHire Recruiters"
        return
    
    # Create new company for recruiter
    db.add(Company(
        user_id=user.id,
        name="CampusHire Recruiters",
        website="https://example.com",
        description="Recruitment partner for CampusHire demo.",
    ))
```

**When it runs**: During `seed.py` execution - automatically creates company when recruiter user is created.

#### Option 2: Via Admin API (Super Admin Creates Company) ✅
**Location**: [Backend/app/services/admin_service.py](Backend/app/services/admin_service.py#L120-L145)

```python
@staticmethod
async def create_company(db: AsyncSession, data, admin_user_id):
    # 1. Create user with email and password
    user = await user_repo.create_user(db, data.email, password_hash, "COMPANY")
    
    # 2. Create company linked to user
    company = await company_repo.create_company(
        db, user.id, data.name, data.website, data.description
    )
    # Admin creates both user + company in one operation
```

**When it happens**: Super admin explicitly creates a new recruiter company through admin endpoints.

---

## 2. JOB POSTING LOGIC

### Flow Diagram
```
POST /recruiter/jobs (RecruiterPostJobRequest)
    ↓
RecruiterService.post_job()
    ↓
_get_company_or_404(current_user_id)  ← CRITICAL GATE
    ↓
SELECT Company WHERE user_id = current_user_id
    ↓
If company exists → Continue to create job/drive
If company NOT found → 404 "Recruiter company profile not found"
```

### Code Implementation
**Location**: [Backend/app/services/recruiter_service.py](Backend/app/services/recruiter_service.py#L27-L35)

```python
@staticmethod
async def _get_company_or_404(db: AsyncSession, current_user_id: uuid.UUID) -> Company:
    row = await db.execute(select(Company).where(Company.user_id == current_user_id))
    company = row.scalar_one_or_none()
    if not company:
        raise HTTPException(404, "Recruiter company profile not found")
    return company

@staticmethod
async def post_job(db: AsyncSession, current_user_id: uuid.UUID, data) -> dict:
    # 1. THIS IS MANDATORY - will fail if company not found
    company = await RecruiterService._get_company_or_404(db, current_user_id)
    
    # 2. Create PlacementDrive with company name
    drive = PlacementDrive(
        company_id=company.id,
        name=f"{company.name} - {data.title}",  ← Uses actual company name
        ...
    )
    
    # 3. Create Job linked to company
    job = Job(
        company_id=company.id,
        ...
    )
```

### Validation Checks (Pre-Job Creation)
1. ✅ **Company Exists** - Must have 1:1 company record
2. ✅ **Date Parsing** - `driveDate` and `deadline` must be ISO format
3. ✅ **Openings** - Must be ≥ 1
4. ✅ **CGPA** - Must be 0-10
5. ✅ **Skills Array** - Converted to JobSkill records
6. ✅ **Interview Rounds** - At least one round required (with name + date)
7. ✅ **Salary** - Converted to paise (LPA × 100000)

### What Could Prevent Job Posting
| Reason | Error | Status |
|--------|-------|--------|
| Recruiter has no company | 404 "Recruiter company profile not found" | Critical |
| Invalid date format | ValueError during `datetime.fromisoformat()` | Critical |
| Missing required fields | Validation error from Pydantic | HTTP 422 |
| No interview rounds | Job appears but may be incomplete | Partial |
| Invalid CGPA (not 0-10) | Validation error from Pydantic | HTTP 422 |

---

## 3. RECRUITER REGISTRATION & LOGIN FLOW

### Registration Flow (Frontend Only)
**Location**: [frontend/src/pages/auth/Register.jsx](frontend/src/pages/auth/Register.jsx#L1-L90)

```javascript
// FRONTEND: Hardcoded company resolution
const resolveRecruiterCompany = (email) => {
  if (email.includes('technova') || email.includes('recruiter')) {
    return { companyId: 'TECHNOVA', companyName: 'TechNova Systems' };
  }
  if (email.includes('dataspring')) {
    return { companyId: 'DATASPRING', companyName: 'DataSpring Labs' };
  }
  return { companyId: 'DEFAULT', companyName: 'Recruiter Company' };
};

// When recruiter registers:
if (formData.role === 'recruiter') {
  const companyMeta = resolveRecruiterCompany(formData.email);
  user.companyId = companyMeta.companyId;      // ← LOCAL ONLY
  user.companyName = companyMeta.companyName;  // ← LOCAL ONLY
}

register(user); // Stores in localStorage
```

### Important: No Backend Registration Endpoint ❌
- There is **NO** `/auth/register` endpoint in the backend
- Seed script is the **ONLY way** to create test users with proper database records
- Frontend registration is **LOCAL ONLY** - sets localStorage but doesn't persist to database

### Login Flow
**Location**: [Backend/app/services/auth_service.py](Backend/app/services/auth_service.py#L12-L56)

```python
async def login_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    
    # Build response
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_id": str(user.id),
        "email": user.email,
        "role": frontend_role,  # "recruiter" (not "company")
        "student_id": None,  # Only set for students
        "department_id": None,  # Only set for TPO
        # ❌ NO company_id
        # ❌ NO company_name
    }
```

### Critical Issue: Login Response Missing Company Data ❌
Login response **does NOT include**:
- `company_id`
- `company_name`

This is why UI has no server-side company data to display!

---

## 4. CURRENT SEED DATA STATE

### Seed Data Setup
**Location**: [Backend/seed.py](Backend/seed.py#L125-L170)

```python
async def main():
    # Create roles
    student_role = await _ensure_role(db, "STUDENT")
    company_role = await _ensure_role(db, "COMPANY")
    
    # Create test recruiter with COMPANY role
    recruiter_user = await _upsert_user(
        db,
        email="recruiter@example.com",
        password="recruiter123",
        role_id=company_role.id,  # Role is COMPANY
    )
    
    # ✅ AUTOMATICALLY CREATES COMPANY
    await _ensure_company_profile(db, recruiter_user)
    
    await db.commit()
    
    print("✓ Recruiter : recruiter@example.com / recruiter123")
```

### Current Database State After Seed

| Entity | Value |
|--------|-------|
| User Email | `recruiter@example.com` |
| User Role | `COMPANY` |
| User Password | `recruiter123` |
| Company Name | `"CampusHire Recruiters"` ✅ |
| Company Website | `"https://example.com"` |
| Company Description | `"Recruitment partner for CampusHire demo."` |
| 1:1 Link | User.id → Company.user_id ✅ |

### Summary
✅ **Company IS created in database** when recruiter is seeded  
✅ **1:1 relationship is properly established**  
✅ **Recruiter can post jobs** (IF they use backend API directly)  
❌ **Frontend has no server data about company**

---

## 5. DATA FLOW FOR COMPANY DISPLAY

### The Missing Link: Login Response

```
Backend returns:
{
  "user_id": "uuid-here",
  "email": "recruiter@example.com",
  "role": "recruiter",
  "access_token": "...",
  "refresh_token": "...",
  // ❌ MISSING:
  // "company_id": "...",
  // "company_name": "CampusHire Recruiters"
}

Frontend receives:
{
  user_id: "uuid-here",
  email: "recruiter@example.com",
  role: "recruiter",
  companyId: undefined,    // ← Not from server!
  companyName: undefined,  // ← Not from server!
}
```

### Why Company Name Shows as Email

**Location**: [frontend/src/pages/recruiter/RecruiterPostJob.jsx](frontend/src/pages/recruiter/RecruiterPostJob.jsx#L157-L161)

```jsx
<div className="form-group">
  <label>Company Name</label>
  <input
    type="text"
    value={user?.email || 'Recruiter account'}  // ❌ SHOWS EMAIL
    className="form-input"
    readOnly
  />
</div>
```

**The Issue Chain**:
1. Backend login API doesn't return company info
2. Frontend stores `user` object from login response in localStorage
3. AuthContext exposes this `user` object
4. RecruiterPostJob.jsx tries to display `user?.companyName`
5. Since `companyName` is undefined, it displays `user?.email` as fallback
6. Result: **Email address displayed instead of company name**

### Other Endpoints That Return Company Name ✅

These work correctly because they query the database:

| Endpoint | Returns Company As |
|----------|-------------------|
| `/recruiter/jobs` | `company.name` in each job object |
| `/recruiter/applicants` | `company.name` in each applicant object |
| `/recruiter/offers` | `company.name` in each offer object |
| `/recruiter/dashboard` | `company.name` in recent applications |

**Example Response**:
```python
{
  "jobs": [
    {
      "id": "...",
      "company": company.name,  # ✅ "CampusHire Recruiters"
      "position": "Software Engineer",
      ...
    }
  ]
}
```

---

## 6. SUMMARY: Current State vs What's Missing

### What's Working ✅

| Component | Status | Details |
|-----------|--------|---------|
| Company Creation | ✅ Working | Seed creates company automatically |
| 1:1 Relationship | ✅ Working | Proper unique FK on user_id |
| Job Posting Validation | ✅ Working | _get_company_or_404() gates the flow |
| Job List Display | ✅ Working | Returns company.name from DB |
| Applicants List | ✅ Working | Returns company.name from DB |
| Offers List | ✅ Working | Returns company.name from DB |
| Admin Creates Company | ✅ Working | Endpoint properly links user + company |

### What's Missing/Broken ❌

| Component | Issue | Impact |
|-----------|-------|--------|
| Login Response | Doesn't include company info | Frontend can't display company name |
| RecruiterPostJob Form | Shows email instead of company | UI displays wrong company identifier |
| Frontend Company Data | Only hardcoded in Register.jsx | No persistence from actual DB company |

---

## 7. WHY JOB POSTING WORKS DESPITE UI ISSUE

The job posting **succeeds** because:

1. ✅ Database lookup via `_get_company_or_404()` finds the real company
2. ✅ Job is created with correct `company_id`
3. ✅ PlacementDrive name uses actual `company.name` from database
4. ✅ Frontend UI glitch (showing email) doesn't affect API submission

The UI issue is **purely cosmetic** - you see email in the form, but the backend knows the real company.

---

## 8. RECOMMENDED FIXES

### Priority 1: Fix Login Response (High Impact)
Add company info to login response:

```python
# In auth_service.py
async def login_user(...):
    # ... existing code ...
    
    company_id = None
    company_name = None
    
    if role_name == "COMPANY":
        company_row = await db.execute(
            select(Company).where(Company.user_id == user.id)
        )
        company = company_row.scalar_one_or_none()
        if company:
            company_id = str(company.id)
            company_name = company.name
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_id": str(user.id),
        "email": user.email,
        "role": frontend_role,
        "company_id": company_id,      # ✅ NEW
        "company_name": company_name,  # ✅ NEW
        ...
    }
```

### Priority 2: Fix RecruiterPostJob Display (Medium Impact)
```jsx
// In RecruiterPostJob.jsx
<input
  type="text"
  value={user?.companyName || user?.email || 'Recruiter account'}  // ✅ FIXED
  className="form-input"
  readOnly
/>
```

### Priority 3: Add Recruiter Profile Endpoint (Nice to Have)
Create `/recruiter/profile` that returns authenticated recruiter's company details:

```python
@router.get("/profile")
async def recruiter_profile(
    db: AsyncSession = Depends(get_db),
    current_user=_recruiter_only,
):
    company = await RecruiterService._get_company_or_404(db, current_user.id)
    return {
        "id": str(company.id),
        "name": company.name,
        "website": company.website,
        "description": company.description,
    }
```

---

## File References

- **Models**: [Backend/app/models/company.py](Backend/app/models/company.py)
- **User Model**: [Backend/app/models/user.py](Backend/app/models/user.py)
- **RecruiterService**: [Backend/app/services/recruiter_service.py](Backend/app/services/recruiter_service.py)
- **Admin Service**: [Backend/app/services/admin_service.py](Backend/app/services/admin_service.py)
- **Auth Service**: [Backend/app/services/auth_service.py](Backend/app/services/auth_service.py)
- **Seed Script**: [Backend/seed.py](Backend/seed.py)
- **RecruiterPostJob Component**: [frontend/src/pages/recruiter/RecruiterPostJob.jsx](frontend/src/pages/recruiter/RecruiterPostJob.jsx)
- **Register Component**: [frontend/src/pages/auth/Register.jsx](frontend/src/pages/auth/Register.jsx)

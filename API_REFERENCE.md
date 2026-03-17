# CampusHire - API Reference & Architecture

Comprehensive API documentation and system architecture overview.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CampusHire System                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Student UI  │  │   TPO UI     │  │   Recruiter UI       │   │
│  │  Dashboard   │  │  Dashboard   │  │   Dashboard          │   │
│  │  Profile     │  │  Students    │  │   Post Jobs          │   │
│  │  Jobs        │  │  Jobs        │  │   Applicants         │   │
│  │  Apps        │  │  Analytics   │  │   Offers             │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          React Router + Context API (AuthContext)      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                      │
│  ┌─────────────────────────▼─────────────────────────────┐      │
│  │      Axios Service Layer (api.js)                    │      │
│  │  - Request/Response Interceptors                     │      │
│  │  - Token Management                                 │      │
│  │  - Organized Endpoint Methods                        │      │
│  └─────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────┬───────────────────────┘
                                          │
                                    HTTP/REST
                                          │
┌─────────────────────────────────────────▼───────────────────────────┐
│                        BACKEND (FastAPI)                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  CORS Middleware                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │    Authentication Routes                                  │    │
│  │  - POST /api/auth/login                                   │    │
│  │  - POST /api/auth/register                                │    │
│  │  - GET  /api/auth/profile                                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌───────────────────┬──────────────────┬──────────────────┐       │
│  │  Student Routes   │  TPO Routes      │ Recruiter Routes │       │
│  │                   │                  │                  │       │
│  │ - Dashboard       │ - Dashboard      │ - Dashboard      │       │
│  │ - Profile         │ - Students       │ - Post Job       │       │
│  │ - Jobs            │ - Jobs           │ - Jobs           │       │
│  │ - Applications    │ - Eligibility    │ - Applicants     │       │
│  │ - Resume Upload   │ - Applications   │ - Offers         │       │
│  │ - Resume Insights │ - Analytics      │                  │       │
│  └───────────────────┴──────────────────┴──────────────────┘       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         Business Logic Layer                              │    │
│  │    (Data processing, validation, calculations)            │    │
│  └────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────┬───────────────────────────┘
                                          │
                                     Database
                                          │
                    ┌─────────────────────▼─────────────────────┐
                    │     Database (SQLite/PostgreSQL)          │
                    │  - Users                                  │
                    │  - Students                               │
                    │  - Jobs                                   │
                    │  - Applications                           │
                    │  - Offers                                 │
                    │  - Eligibility Rules                      │
                    └───────────────────────────────────────────┘
```

## API Endpoint Reference

### Base URL
```
Development:  http://localhost:8000
Production:   https://api.yourdomain.com
```

### Authentication Endpoints

#### Login
```
POST /api/auth/login

Body:
{
  "email": "student@example.com",
  "password": "student123",
  "role": "student"
}

Response:
{
  "status": "success",
  "user": {
    "id": "1",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "token": "token-1"
  }
}
```

#### Register
```
POST /api/auth/register

Body:
{
  "name": "New Student",
  "email": "new@example.com",
  "password": "password123",
  "role": "student"
}

Response: Same as Login
```

#### Get Profile
```
GET /api/auth/profile

Headers:
Authorization: Bearer token-1

Response:
{
  "status": "success",
  "user": {...}
}
```

### Student Endpoints

#### Get Dashboard
```
GET /api/student/dashboard

Response:
{
  "status": "success",
  "data": {
    "profileCompletion": 85,
    "placementReadiness": 72,
    "applicationsCount": 4,
    "shortlistedCount": 1
  }
}
```

#### Get Profile
```
GET /api/student/profile

Response:
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "student@example.com",
    "cgpa": 8.2,
    "branch": "Computer Science",
    "year": "Final Year"
  }
}
```

#### Update Profile
```
PUT /api/student/profile

Body:
{
  "name": "John Doe",
  "cgpa": 8.5,
  "skills": ["Python", "JavaScript"]
}

Response:
{
  "status": "success",
  "message": "Profile updated"
}
```

#### Get Jobs
```
GET /api/student/jobs?minCGPA=7.0

Response:
{
  "status": "success",
  "jobs": [
    {
      "id": 1,
      "company": "Google",
      "position": "Software Engineer",
      "minCGPA": 7.5,
      "salary": "20 LPA",
      "skills": ["Python", "System Design"]
    }
  ]
}
```

#### Apply for Job
```
POST /api/student/apply/1

Response:
{
  "status": "success",
  "message": "Applied to job 1"
}
```

#### Get Applications
```
GET /api/student/applications

Response:
{
  "status": "success",
  "applications": [
    {
      "id": 1,
      "company": "Google",
      "position": "SWE",
      "status": "shortlisted"
    }
  ]
}
```

#### Get Resume Insights
```
GET /api/student/resume-insights

Response:
{
  "status": "success",
  "atsScore": 78,
  "skillGaps": [
    {"skill": "AWS", "demand": 95, "level": 20}
  ]
}
```

### TPO Endpoints

#### Get Dashboard
```
GET /api/tpo/dashboard

Response:
{
  "status": "success",
  "data": {
    "totalStudents": 485,
    "totalApplications": 1250,
    "placedStudents": 312,
    "placementRate": 64.3
  }
}
```

#### Get All Students
```
GET /api/tpo/students?branch=CSE&minCGPA=7.0

Response:
{
  "status": "success",
  "students": [
    {
      "id": 1,
      "name": "Raj Kumar",
      "cgpa": 8.5,
      "branch": "CSE",
      "placed": false
    }
  ]
}
```

#### Get All Jobs
```
GET /api/tpo/jobs

Response:
{
  "status": "success",
  "jobs": [
    {
      "id": 1,
      "company": "Google",
      "applicants": 145,
      "shortlisted": 32,
      "successRate": 22.1
    }
  ]
}
```

#### Set Eligibility Rules
```
POST /api/tpo/eligibility-rules

Body:
{
  "minCGPA": 7.0,
  "allowedBranches": ["CSE", "IT", "ECE"],
  "maxOffersPerStudent": 2
}

Response:
{
  "status": "success",
  "message": "Rules updated"
}
```

#### Get Analytics
```
GET /api/tpo/analytics

Response:
{
  "status": "success",
  "placementRate": 64.3,
  "topSkills": ["Python", "JavaScript", "SQL"]
}
```

### Recruiter Endpoints

#### Get Dashboard
```
GET /api/recruiter/dashboard

Response:
{
  "status": "success",
  "data": {
    "activeJobs": 5,
    "totalApplicants": 324,
    "shortlisted": 45,
    "offersMade": 12
  }
}
```

#### Post Job
```
POST /api/recruiter/jobs

Body:
{
  "title": "Software Engineer",
  "description": "Full stack role...",
  "minCGPA": 7.5,
  "skills": ["Python", "JavaScript"],
  "salary": "20 LPA",
  "locations": ["Bangalore", "Delhi"]
}

Response:
{
  "status": "success",
  "message": "Job posted"
}
```

#### Get My Jobs
```
GET /api/recruiter/jobs

Response:
{
  "status": "success",
  "jobs": [
    {
      "id": 1,
      "title": "Software Engineer",
      "applicants": 145,
      "successRate": 22.1
    }
  ]
}
```

#### Get Applicants
```
GET /api/recruiter/applicants?skills=Python&minCGPA=7.0

Response:
{
  "status": "success",
  "applicants": [
    {
      "id": 1,
      "name": "Raj Kumar",
      "cgpa": 8.5,
      "status": "applied"
    }
  ]
}
```

#### Update Application Status
```
PUT /api/recruiter/applications/1

Body:
{
  "status": "shortlisted"  # or "rejected", "interview", "offer"
}

Response:
{
  "status": "success",
  "message": "Status updated"
}
```

#### Release Offer
```
POST /api/recruiter/offers/1

Body:
{
  "salary": "20 LPA",
  "position": "Software Engineer",
  "joiningDate": "2024-06-01"
}

Response:
{
  "status": "success",
  "message": "Offer released"
}
```

## Data Models

### User Model
```python
User {
  id: string,
  email: string (unique),
  name: string,
  password: string (hashed),
  role: "student" | "tpo" | "recruiter",
  createdAt: datetime,
  updatedAt: datetime
}
```

### Student Model
```python
Student {
  id: string,
  userId: string (FK),
  cgpa: float (0-10),
  branch: string,
  year: string,
  skills: string[],
  resume: string (URL),
  placementStatus: "unplaced" | "placed",
  placedCompany: string,
  createdAt: datetime
}
```

### Job Model
```python
Job {
  id: string,
  recruiterId: string (FK),
  title: string,
  description: string,
  minCGPA: float,
  skills: string[],
  salary: string,
  locations: string[],
  applicantCount: integer,
  shortlistedCount: integer,
  createdAt: datetime
}
```

### Application Model
```python
Application {
  id: string,
  studentId: string (FK),
  jobId: string (FK),
  status: "applied" | "shortlisted" | "rejected" | "interview" | "offer" | "accepted" | "rejected_offer",
  appliedDate: datetime,
  updatedAt: datetime
}
```

### Offer Model
```python
Offer {
  id: string,
  applicationId: string (FK),
  salary: string,
  position: string,
  joiningDate: date,
  status: "pending" | "accepted" | "rejected",
  createdAt: datetime
}
```

## Error Responses

### 400 - Bad Request
```json
{
  "status": "error",
  "message": "Invalid email format"
}
```

### 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### 403 - Forbidden
```json
{
  "status": "error",
  "message": "Access denied"
}
```

### 404 - Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting

To prevent abuse, the following limits are recommended:
- 100 requests per minute per IP
- 1000 requests per hour per user

## Security Considerations

1. **Authentication**: All endpoints (except login/register) require JWT token
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict to trusted origins
4. **Input Validation**: Validate all inputs with Pydantic
5. **Password**: Hash passwords using bcrypt
6. **SQL Injection**: Use parameterized queries
7. **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

For more details, visit http://localhost:8000/docs (Swagger UI)

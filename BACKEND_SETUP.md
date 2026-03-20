# CampusHire Backend - Setup & Integration Guide

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended for full stack)
- Python 3.10+ (for local development)
- Node.js 16+ (for frontend)
- PostgreSQL 13+ (if not using Docker)

### Option 1: Docker Compose (Recommended - Full Stack)

```bash
# Navigate to project root
cd /workspaces/CampusHire

# Copy environment file
cp Backend/.env.example Backend/.env

# Update SECRET_KEY in Backend/.env (optional but recommended)
# vim Backend/.env

# Start all services (PostgreSQL, MinIO, Backend, Frontend)
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - MinIO Console: http://localhost:9001
#   - Access with: minioadmin / minioadmin
```

### Option 2: Local Development (Backend Only)

```bash
# 1. Setup Backend
cd Backend

# Copy environment file
cp .env.example .env

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# 2. Setup Database (PostgreSQL)
# Make sure PostgreSQL is running locally
# Create database:
# psql -U postgres -c "CREATE DATABASE campushire_db;"
# psql -U postgres -d campushire_db -c "CREATE USER campushire WITH PASSWORD 'campushire';"
# psql -U postgres -d campushire_db -c "ALTER ROLE campushire WITH SUPERUSER;"

# 3. Run migrations (if any)
# Currently using SQLAlchemy ORM, models auto-create tables on first run

# 4. Start backend server
python main.py
# Server will be available at http://localhost:8000
```

## API Documentation

### Backend API Structure

```
/api/v1/
├── /auth              # Authentication endpoints
│   ├── POST /login    # User login
│   ├── POST /logout   # User logout
│   └── POST /change-password  # Change password
│
├── /student           # Student endpoints (requires STUDENT role)
│   ├── Dashboard & Profile
│   │   ├── GET /dashboard          # Student dashboard
│   │   ├── GET /profile            # Get profile
│   │   └── PUT /profile            # Update profile
│   │
│   ├── Job & Applications
│   │   ├── GET /jobs               # List available jobs
│   │   ├── POST /apply/{job_id}    # Apply for job
│   │   ├── GET /applications       # List applications
│   │   └── GET /applications/{id}  # Get application status
│   │
│   ├── Resume Management
│   │   ├── POST /resume-upload     # Upload resume
│   │   └── GET /resume-insights    # Get resume AI insights
│   │
│   ├── Projects CRUD
│   │   ├── POST /projects          # Create project
│   │   ├── GET /projects           # List projects
│   │   ├── GET /projects/{id}      # Get project
│   │   ├── PUT /projects/{id}      # Update project
│   │   └── DELETE /projects/{id}   # Delete project
│   │
│   ├── Certifications CRUD
│   │   ├── POST /certifications    # Create certification
│   │   ├── GET /certifications     # List certifications
│   │   ├── GET /certifications/{id} # Get certification
│   │   ├── PUT /certifications/{id} # Update certification
│   │   └── DELETE /certifications/{id} # Delete certification
│   │
│   ├── Skills CRUD
│   │   ├── POST /skills            # Create skill
│   │   ├── GET /skills             # List skills
│   │   ├── GET /skills/{id}        # Get skill
│   │   ├── PUT /skills/{id}        # Update skill
│   │   └── DELETE /skills/{id}     # Delete skill
│   │
│   └── Learning Materials
│       └── GET /materials          # List study materials
│
├── /recruiter         # Recruiter endpoints (requires RECRUITER role)
│   ├── GET /dashboard              # Recruiter dashboard
│   ├── POST /jobs                  # Post new job
│   ├── GET /jobs                   # Get posted jobs
│   ├── GET /applicants             # Get applicants
│   ├── GET /applicants/{id}        # Get applicant profile
│   ├── PUT /applications/{id}      # Update application status
│   ├── POST /offers/{app_id}       # Release offer
│   └── GET /offers                 # Get released offers
│
└── /tpo              # TPO/Admin endpoints (requires TPO role)
    ├── GET /dashboard                     # TPO dashboard
    ├── Student Management
    │   ├── GET /students                  # List students
    │   ├── POST /students                 # Create student
    │   ├── PUT /students/{id}             # Update student
    │   ├── POST /students/bulk-upload     # Bulk upload students
    │   ├── GET /students/{id}             # Get student detail
    │   └── POST /students/{id}/reset-password # Reset password
    │
    ├── Job & Application Management
    │   ├── GET /jobs                      # List jobs
    │   └── GET /applications              # List applications
    │
    ├── Analytics
    │   ├── GET /analytics                 # Get analytics
    │   ├── GET /students/{id}/eligibility-snapshot
    │   └── GET /students/{id}/application-timeline
    │
    └── Reports
        └── GET /reports/{type}            # Generate reports
```

## Students Table Fields

```python
students:
  - id: UUID (Primary Key)
  - user_id: UUID (Foreign Key to users)
  - department_id: UUID (Foreign Key to departments)
  - enrollment_number: String (Unique)
  - cgpa: Float
  - tenth_percentage: Float
  - twelfth_percentage: Float
  - backlog_count: Integer
  
  # NEW: Profile & Placement Fields
  - phone: String (optional)
  - date_of_birth: String (optional)
  - university_id: String (optional, read-only after registration)
  - preferred_role: String (optional)
  - profile_image: Text (base64 encoded)
  - linkedin_url: String (optional)
  - github_url: String (optional)
  - portfolio_url: String (optional)
```

## New CRUD Models

### student_projects
```python
- id: UUID
- student_id: UUID
- title: String
- role: String
- organization: String
- start_date: String (YYYY-MM-DD)
- end_date: String (optional)
- is_ongoing: Boolean
- technologies: Text (JSON array)
- description: Text
- impact: Text (optional)
- project_url: String (optional)
- repository_url: String (optional)
- created_at: DateTime
- updated_at: DateTime
```

### student_certifications
```python
- id: UUID
- student_id: UUID
- name: String
- issuer: String
- issue_date: String (YYYY-MM-DD)
- expiry_date: String (optional)
- no_expiry: Boolean
- credential_id: String (optional)
- credential_url: String (optional)
- skills_covered: Text (JSON array)
- created_at: DateTime
- updated_at: DateTime
```

### student_skills (Enhanced)
```python
- id: UUID
- student_id: UUID
- skill_name: String
- proficiency: String (beginner, intermediate, advanced, expert)
- years_of_experience: Float
- endorsement_count: Integer
- created_at: DateTime
- updated_at: DateTime
```

## Frontend-Backend Integration

### API Client Setup
The frontend API client is configured in `/frontend/src/services/api.js`:

```javascript
// Automatically includes Bearer token from localStorage
// Handles 401 errors by redirecting to login
// Base URL: http://localhost:8000/api/v1 (in production, set via REACT_APP_API_BASE_URL)
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql+asyncpg://campushire:campushire@localhost:5432/campushire_db
SECRET_KEY=your-super-secret-key
CORS_ORIGINS=["http://localhost:3000"]
DEBUG=true
```

**Frontend (.env)**
```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

## Authentication Flow

1. **Login**
   ```
   POST /auth/login
   {
     "email": "student@example.com",
     "password": "password"
   }
   
   Returns:
   {
     "access_token": "jwt_token",
     "token_type": "bearer",
     "user": {
       "id": "uuid",
       "email": "email",
       "role": "STUDENT"
     }
   }
   ```

2. **Token Storage**
   - Token saved to localStorage
   - Automatically included in all requests via Authorization header

3. **Protected Routes**
   - Backend enforces role-based access via `require_roles` decorator
   - Frontend routes protected via ProtectedRoute component

## Data Sync: Frontend ↔ Backend

### Profile Management
```
Frontend (StudentProfile.jsx)
    ↓ (PUT /student/profile)
Backend (StudentService.update_profile)
    ↓
PostgreSQL (students table + student_documents for metadata)
```

### Projects CRUD
```
Frontend (Modal Forms)
    ↓ (POST/PUT/DELETE /student/projects/{id})
Backend (StudentService + student_projects table)
    ↓
PostgreSQL
```

### Skills Management
```
Frontend (Skills Section)
    ↓ (POST/PUT/DELETE /student/skills/{id})
Backend (StudentService + student_skills table)
    ↓
PostgreSQL (stores proficiency, experience years, endorsements)
```

## Database Migration

Create Tables:
```bash
# Run from Backend directory
# Models are auto-created on first application run via SQLAlchemy
# For controlled migrations, use Alembic:

# Initialize alembic (if not already done)
alembic init migrations

# Create new migration
alembic revision --autogenerate -m "Add student profile fields"

# Run migration
alembic upgrade head
```

## Troubleshooting

### Database Connection Errors
```bash
# Check PostgreSQL is running
docker-compose ps

# View containerized postgres logs 
docker-compose logs postgres

# Common issue: Database not created
# Solution: Restart services to trigger auto-creation
docker-compose restart backend
```

### API CORS Errors
```
Solution: Update CORS_ORIGINS in Backend/.env to include frontend URL
```

### File Upload Issues
```
Check MinIO is running and accessible:
curl http://localhost:9000/minio/health/live

Access MinIO Console: http://localhost:9001
```

## Testing Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}'

# Get Dashboard (include JWT token from login response)
curl -X GET http://localhost:8000/api/v1/student/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create Project
curl -X POST http://localhost:8000/api/v1/student/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Chatbot",
    "role": "Backend Developer",
    "organization": "Personal",
    "start_date": "2024-01-01",
    "is_ongoing": true,
    "technologies": ["Python", "FastAPI"],
    "description": "Built an AI chatbot"
  }'
```

### Using API Documentation

Visit: http://localhost:8000/docs (Swagger UI)
or: http://localhost:8000/redoc (ReDoc)

All endpoints are fully documented with request/response schemas.

## Production Deployment

1. **Update Environment Variables**
   ```bash
   # Set strong SECRET_KEY
   # Update CORS_ORIGINS
   # Set DEBUG=false
   # Use production database
   ```

2. **Build Docker Images**
   ```bash
   docker-compose -f docker-compose.yml build
   ```

3. **Push to Registry**
   ```bash
   docker tag campushire-backend your-registry/campushire-backend:v1
   docker push your-registry/campushire-backend:v1
   ```

4. **Deploy to Kubernetes/Cloud**
   Use provided docker-compose or Kubernetes manifests

## Support & Documentation

- **API Docs**: http://localhost:8000/docs
- **Source Code**: /workspaces/CampusHire/Backend
- **Frontend**: /workspaces/CampusHire/frontend

# CampusHire

A full-stack campus placement platform connecting **students**, **TPO coordinators**, and **recruiters** — built as a modern MERN-style Python/React project.

> 🚀 **Live demo:** [campus-hire-henna.vercel.app](https://campus-hire-henna.vercel.app)

---

## What this app does

The system has four roles, each with its own portal:

### Student portal (`/student`)
- Dashboard — upcoming drives, recent notices, placement stats
- Browse and apply for open job listings
- Manage resume versions and get AI-powered resume insights (via OpenRouter)
- Track application status through every interview round
- Upload projects, certifications, and skills to a profile
- Download study materials shared by the TPO

### TPO portal (`/tpo`)
- Dashboard with department-level placement analytics
- Manage students — create, update, bulk upload via CSV
- Approve or reject job postings from recruiters
- Upload and manage study materials (PDF, DOCX, etc.)
- View all applications and track their pipeline

### Recruiter portal (`/recruiter`)
- Post and manage job listings with eligibility criteria
- Browse eligible applicants and view their profiles
- Advance candidates through interview rounds
- Release offer letters to selected students

### Super Admin (`/admin`)
- Manage TPO coordinators and recruiter companies
- Create and manage departments and placement cycles
- Override offers, deactivate users, reset passwords
- View system-wide analytics and audit logs
- Configure system settings

---

## Demo credentials

After seeding the database, use these to log in:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@campushire.com` | `Admin@1234` |
| Student | `student@example.com` | `student123` |
| TPO | `tpo@example.com` | `tpo123` |
| Recruiter | `recruiter@example.com` | `recruiter123` |

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, React Router v6, Axios, react-icons |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2 (async), Alembic |
| Auth | PASETO v4 tokens (argon2 password hashing) |
| Database | PostgreSQL (asyncpg driver) |
| File storage | MinIO (local) — optional, can be disabled |
| AI features | OpenRouter API (resume analysis) — optional |
| Email | FastAPI-Mail + SMTP — optional |

---

## Project structure

```
CampusHire/
├── backend/                  # FastAPI app (Python 3.12)
│   ├── app/
│   │   ├── api/v1/routes/    # auth, admin, tpo, student, recruiter, health
│   │   ├── core/             # config, db, auth, permissions
│   │   ├── models/           # SQLAlchemy ORM models (37 tables)
│   │   ├── repositories/     # DB query layer
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/         # Business logic
│   │   ├── storage/          # MinIO client (optional)
│   │   └── tasks/            # Background scheduler
│   ├── alembic/              # Database migrations
│   ├── seed.py               # Demo data seed script
│   ├── main.py               # Uvicorn entry point
│   ├── pyproject.toml        # Python dependencies
│   ├── requirements.txt      # Pinned deps (for Render / pip)
│   └── .env.example          # Environment variable template
└── frontend/                 # React app (Create React App)
    ├── src/
    │   ├── pages/            # student, tpo, recruiter, admin, auth
    │   ├── components/       # Shared UI components
    │   ├── context/          # AuthContext
    │   └── services/         # Axios API client
    ├── vercel.json           # SPA route rewrites for Vercel
    └── .env.example          # Environment variable template
```

---

## Run locally

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL (local install **or** a free [Neon](https://neon.tech) / [Supabase](https://supabase.com) cluster)
- *(Optional)* Docker — for running PostgreSQL via container

### 1. Clone

```bash
git clone https://github.com/RoshanNandasana/CampusHire.git
cd CampusHire
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your local .env
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and PASETO_SECRET_KEY
```

Start a local PostgreSQL database (if using Docker):

```bash
docker run -d \
  --name campushire-pg \
  -e POSTGRES_USER=campushire \
  -e POSTGRES_PASSWORD=campushire \
  -e POSTGRES_DB=campushire_db \
  -p 5432:5432 \
  postgres:15-alpine
```

Run the API (tables are auto-created and seeded on first start):

```bash
python main.py
```

API runs at **http://localhost:8000** — Swagger docs at `/docs`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

App opens at **http://localhost:3000**. The dev server proxies `/api` to the backend automatically — no frontend `.env` needed for local development.

### 4. Log in

Go to `http://localhost:3000/login` and use the [demo credentials](#demo-credentials) above.

---

## Production deployment

| Service | Host | Purpose |
|---------|------|---------|
| Frontend | Vercel | React SPA + route rewrites |
| Backend | Render | FastAPI + auto-seed on startup |
| Database | Neon / Render PostgreSQL | Persistent relational data |
| File storage | MinIO (optional) | Resume and material uploads |
| AI | OpenRouter | Resume analysis (optional) |

### Frontend → Vercel

1. Import the repo into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add the environment variable:
   - `REACT_APP_API_BASE_URL` → `https://your-render-app.onrender.com/api/v1`
4. Deploy. Client-side routes (`/student/dashboard`, `/login`, etc.) work on page refresh thanks to `frontend/vercel.json`.

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Build command**: `pip install -r requirements.txt`
4. Set **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see `backend/.env.example` for the full list):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host/db` |
| `PASETO_SECRET_KEY` | strong random string (≥32 chars) |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` |
| `DEBUG` | `false` |
| `ENABLE_EMAIL` | `false` (or configure SMTP) |
| `MINIO_ENDPOINT` | leave blank to disable file uploads |

6. Deploy and confirm `https://your-render-app.onrender.com/api/v1/health` returns `{"status":"ok"}`.

> **Database:** The backend automatically runs Alembic migrations and seeds demo data on every cold start — no manual step required.

> **File uploads on Render:** Render's disk is ephemeral. If you need file uploads (resumes, study materials) in production, point `MINIO_ENDPOINT` to a self-hosted MinIO instance or an S3-compatible provider. Leaving it blank disables file uploads gracefully — the rest of the app works normally.

---

## Optional features

### Email notifications

Add these to `backend/.env` (or Render env vars):

```env
ENABLE_EMAIL=true
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@campushire.com
```

### AI resume analysis

Sign up at [openrouter.ai](https://openrouter.ai) and add:

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-4o-mini
```

---

## Scripts

| Command | Where | What it does |
|---------|-------|-------------|
| `python main.py` | `backend/` | Start API with auto-reload |
| `uvicorn app.main:app ...` | `backend/` | Production start |
| `python seed.py` | `backend/` | Re-seed demo data manually |
| `alembic upgrade head` | `backend/` | Run pending migrations |
| `alembic revision --autogenerate -m "..."` | `backend/` | Create a new migration |
| `npm start` | `frontend/` | Start Vite dev server |
| `npm run build` | `frontend/` | Production build |

---

## License

This project is for educational purposes — campus placement assignment.  
Not licensed for commercial use without permission from the project owner.

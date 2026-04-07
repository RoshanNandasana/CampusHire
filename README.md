# CampusHire

CampusHire is a full-stack campus placement platform for three roles:

- Students
- TPO (Training and Placement Officer)
- Recruiters

It includes role-based dashboards, job/application flows, and backend APIs.

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL
- Object Storage: MinIO

## Project Structure

```text
CampusHire/
├── frontend/                 # React app (port 3000)
├── Backend/                  # FastAPI app (port 8000)
├── docker-compose.yml        # Postgres + MinIO + optional app services
├── setup.sh
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- Python 3.10+
- pip
- Docker (recommended for Postgres/MinIO)

## Quick Start (Recommended)

### 1) Start infrastructure (Postgres + MinIO)

From project root:

```bash
docker compose up -d postgres minio
```

### 2) Start backend

```bash
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create local env file if needed
cp .env.example .env

# Create/update tables and seed demo users
python seed.py

# Run API
python main.py
```

Backend URLs:

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### 3) Start frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend URL:

- App: http://localhost:3000

## Demo Login

Use seeded users:

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | student123 |
| TPO | tpo@example.com | tpo123 |
| Recruiter | recruiter@example.com | recruiter123 |

## Useful Commands

From root:

```bash
# Start infra
docker compose up -d postgres minio

# Stop infra
docker compose down
```

From Backend:

```bash
# Activate environment
source venv/bin/activate

# Run backend
python main.py

# Reseed demo data
python seed.py
```

From frontend:

```bash
npm start
npm run build
npm test
```

## Troubleshooting

- Backend fails to connect DB:
    - Check Postgres container is running: `docker ps`
    - Confirm `DATABASE_URL` in `Backend/.env`

- Frontend cannot call API:
    - Confirm backend is running on port 8000
    - Confirm frontend is running on port 3000

- Login fails:
    - Run `python seed.py` in Backend again
    - Retry with demo credentials above

## Security Note

- `.env` is ignored by git.
- Do not commit real secrets.

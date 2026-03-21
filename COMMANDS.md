#!/bin/bash
# CampusHire Commands Reference

echo "════════════════════════════════════════════════════════════════"
echo "CampusHire - Complete Backend Implementation"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Display all available commands
cat << 'EOF'

🚀 GETTING STARTED (Choose one)

  Option 1: Quick Start (Recommended)
  ──────────────────────────────────
  $ cd /workspaces/CampusHire
  $ docker-compose -f docker-compose.yml up --build

  Note:
  - Use only the root compose file: /workspaces/CampusHire/docker-compose.yml
  - Do not use Backend/compose.yml (deprecated and removed)
  
  Then visit:
  - Frontend: http://localhost:3000
  - API Docs: http://localhost:8000/docs
  - Login: student@example.com / Student@123

  Option 2: Local Development
  ──────────────────────────────
  $ cd /workspaces/CampusHire/Backend
  $ python -m venv venv
  $ source venv/bin/activate
  $ pip install -r requirements.txt
  $ python main.py


📊 USEFUL COMMANDS

  Check Service Status
  ────────────────────
  $ docker-compose ps
  $ docker-compose logs backend
  $ docker-compose logs postgres
  $ docker-compose logs frontend

  Stop/Start Services
  ───────────────────
  $ docker-compose -f docker-compose.yml down              # Stop all services
  $ docker-compose -f docker-compose.yml up                # Start all services
  $ docker-compose -f docker-compose.yml up -d             # Start in background
  $ docker-compose -f docker-compose.yml restart backend   # Restart backend only

  Database Access
  ────────────────
  $ psql -h localhost -U campushire -d campushire_db
  
  Then in psql:
  > SELECT * FROM student_projects;      # View projects
  > SELECT * FROM student_certifications; # View certifications
  > SELECT * FROM student_skills;         # View skills
  > \dt                                   # List all tables
  > \q                                    # Quit

  MinIO Console
  ────────────
  Open: http://localhost:9001
  Login: minioadmin / minioadmin


🧪 TESTING ENDPOINTS

  API Documentation (Interactive)
  ───────────────────────────────
  $ open http://localhost:8000/docs     # macOS
  $ xdg-open http://localhost:8000/docs # Linux
  $ start http://localhost:8000/docs    # Windows

  Using cURL
  ──────────
  # Login and save token
  $ TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"student@example.com","password":"Student@123"}' \
    | jq -r '.access_token')

  # Create project
  $ curl -X POST http://localhost:8000/api/v1/student/projects \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "AI Chatbot",
      "role": "Backend Developer",
      "organization": "Personal",
      "start_date": "2024-01-01",
      "is_ongoing": true,
      "technologies": ["Python", "FastAPI"],
      "description": "AI chatbot project"
    }'

  # List projects
  $ curl -X GET http://localhost:8000/api/v1/student/projects \
    -H "Authorization: Bearer $TOKEN"

  # Update project
  $ curl -X PUT http://localhost:8000/api/v1/student/projects/{project_id} \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title": "Updated Title"}'

  # Delete project
  $ curl -X DELETE http://localhost:8000/api/v1/student/projects/{project_id} \
    -H "Authorization: Bearer $TOKEN"

  Using Python
  ────────────
  $ python
  >>> import requests
  >>> url = "http://localhost:8000/api/v1/auth/login"
  >>> data = {"email": "student@example.com", "password": "Student@123"}
  >>> r = requests.post(url, json=data)
  >>> token = r.json()["access_token"]
  >>> print(token)

  # Now use token for any request
  >>> headers = {"Authorization": f"Bearer {token}"}
  >>> r = requests.get("http://localhost:8000/api/v1/student/projects", headers=headers)
  >>> print(r.json())


📚 DOCUMENTATION

  Files to Read:
  ──────────────
  1. BACKEND_IMPLEMENTATION_SUMMARY.md  ← Start here!
  2. BACKEND_SETUP.md                   ← Installation guide
  3. DEVELOPER_REFERENCE.md             ← API reference
  4. IMPLEMENTATION_STATUS.md           ← Feature checklist


⚙️ CONFIGURATION

  Update Backend Settings
  ────────────────────────
  1. Edit Backend/.env
  2. Key variables:
     - DATABASE_URL       (Database connection string)
     - SECRET_KEY         (JWT secret - change in production!)
     - DEBUG              (true for dev, false for prod)
     - CORS_ORIGINS       (Allowed frontend origins)

  Update Frontend Settings
  ─────────────────────────
  1. Edit frontend/.env
  2. Key variables:
     - REACT_APP_API_BASE_URL (Backend API URL)


🔍 DEBUGGING

  View Logs
  ─────────
  $ docker-compose logs backend -f   # Follow backend logs
  $ docker-compose logs postgres -f  # Follow database logs
  $ docker-compose logs frontend -f  # Follow frontend logs

  View Container Shell
  ──────────────────────
  $ docker-compose exec backend bash
  $ docker-compose exec postgres bash
  $ cd /app && ls -la               # Inside container

  Test Database Connection
  ────────────────────────
  $ docker-compose exec backend python
  >>> from app.core.db import engine
  >>> import asyncio
  >>> asyncio.run(engine.connect())
  # If successful, database is connected!


📈 COMMON WORKFLOWS

  Full Reset (Clear Everything)
  ───────────────────────────────
  $ docker-compose down -v          # Remove all containers and volumes
  $ docker-compose up --build       # Rebuild from scratch

  Restart Backend Only
  ─────────────────────
  $ docker-compose restart backend

  Add Test Data
  ──────────────
  $ cd /workspaces/CampusHire/Backend
  $ python scripts/init_db.py

  View Real-Time Logs
  ────────────────────
  $ docker-compose logs -f backend
  # Press Ctrl+C to stop

  Database Backup
  ────────────────
  $ docker-compose exec postgres pg_dump -U campushire campushire_db > backup.sql

  Database Restore
  ─────────────────
  $ cat backup.sql | docker-compose exec -T postgres psql -U campushire campushire_db


🎯 QUICK VERIFICATION

  1. Check all services running
     $ docker-compose ps
     # All should show "Up"

  2. Check frontend
     $ curl http://localhost:3000
     # Should return HTML

  3. Check backend
     $ curl http://localhost:8000
     # Should return JSON

  4. Check API docs
     $ open http://localhost:8000/docs
     # Should show Swagger UI

  5. Test database
     $ curl -X GET http://localhost:8000/api/v1/student/projects \
       -H "Authorization: Bearer <token>"
     # Should return JSON with projects


💾 IMPORTANT FILES

  Backend
  ───────
  Backend/main.py                             # Entry point
  Backend/app/models/                         # Database models
  Backend/app/services/student_service.py    # Business logic
  Backend/app/api/v1/routes/student.py       # API endpoints
  Backend/.env.example                        # Configuration template

  Frontend
  ────────
  frontend/src/services/api.js               # API client
  frontend/src/pages/student/                # Student pages
  frontend/src/components/                   # Reusable components

  Configuration
  ──────────────
  docker-compose.yml                         # Service configuration
  Backend/requirements.txt                   # Python dependencies
  frontend/package.json                      # Node.js dependencies


🆘 TROUBLESHOOTING

  Service Won't Start
  ──────────────────
  $ docker-compose logs <service>  # Check error logs
  $ docker-compose down -v         # Clean restart
  $ docker-compose up --build      # Rebuild

  Database Connection Failed
  ───────────────────────────
  $ docker-compose logs postgres   # Check postgres logs
  $ docker-compose restart postgres # Restart postgres
  $ docker-compose up              # Restart everything

  Port Already in Use
  ──────────────────
  # Find process using port:
  $ lsof -i :8000              # Backend
  $ lsof -i :3000              # Frontend
  $ lsof -i :5432              # Database
  
  # Kill process:
  $ kill -9 <PID>

  CORS Errors
  ───────────
  $ vim Backend/.env
  # Update CORS_ORIGINS to include frontend URL
  $ docker-compose restart backend


📞 SUPPORT

  Check API Documentation
  ───────────────────────
  http://localhost:8000/docs      (Swagger UI)
  http://localhost:8000/redoc     (ReDoc)

  Read Documentation Files
  ─────────────────────────
  /workspaces/CampusHire/BACKEND_IMPLEMENTATION_SUMMARY.md
  /workspaces/CampusHire/BACKEND_SETUP.md
  /workspaces/CampusHire/DEVELOPER_REFERENCE.md

  View Source Code
  ────────────────
  Backend: /workspaces/CampusHire/Backend/app/
  Frontend: /workspaces/CampusHire/frontend/src/


════════════════════════════════════════════════════════════════════
                       Ready to Use! 🚀
════════════════════════════════════════════════════════════════════

Start with:
$ cd /workspaces/CampusHire
$ docker-compose up --build

Then visit:
http://localhost:3000       (Frontend)
http://localhost:8000/docs  (API Documentation)

Login with:
Email: student@example.com
Password: Student@123

For complete guide, read: BACKEND_IMPLEMENTATION_SUMMARY.md

════════════════════════════════════════════════════════════════════
EOF

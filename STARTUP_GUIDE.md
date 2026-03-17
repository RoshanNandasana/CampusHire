# CampusHire - Startup Guide

This guide will help you get CampusHire up and running locally in minutes.

## System Requirements

- **Node.js**: v18 or higher (with npm)
- **Python**: v3.9 or higher (with pip)
- **Operating System**: Windows, macOS, or Linux
- **RAM**: 2GB minimum
- **Disk Space**: 500MB minimum

## Installation Steps

### Step 1: Frontend Setup

Open a terminal and navigate to the project directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

This will install:
- react (19.2.4)
- react-router-dom (6.21.0)
- axios (1.6.5)

### Step 2: Backend Setup

Open a **new terminal** and navigate to the Backend folder:

```bash
cd Backend
```

Create and activate a virtual environment (optional but recommended):

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

This will install:
- fastapi (0.104.1)
- uvicorn (0.24.0)
- pydantic (2.5.0)
- And other dependencies

## Running the Application

### Step 1: Start the Backend Server

In your Backend terminal (from the `/Backend` directory):

```bash
python main.py
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

**Backend URL**: http://localhost:8000

Verify backend is working:
- Visit http://localhost:8000/health (should return `{"status": "ok"}`)
- API Docs: http://localhost:8000/docs

### Step 2: Start the Frontend Application

In your frontend terminal (from the `/frontend` directory):

```bash
npm start
```

The frontend will automatically open in your default browser.

**Frontend URL**: http://localhost:3000

## Logging In

Once both servers are running:

1. **Open http://localhost:3000** (should already be open)
2. You'll see the Login page
3. Click one of the **Role Demo Buttons**:
   - **Student** - Pre-fills student@example.com / student123
   - **TPO** - Pre-fills tpo@example.com / tpo123
   - **Recruiter** - Pre-fills recruiter@example.com / recruiter123
4. Click **Login**

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | student123 |
| TPO | tpo@example.com | tpo123 |
| Recruiter | recruiter@example.com | recruiter123 |

## Exploring the Application

### 👨‍🎓 Student Features

After logging in as a student, you can access:
- **Dashboard** - View placement statistics
- **Profile** - Edit academic info, skills, projects
- **Job Listings** - Browse available jobs
- **Applications** - Track your applications with status timeline
- **Resume Insights** - Check ATS score and skill gap analysis
- **Preparation** - Track interview preparation progress

### 👔 TPO Features

After logging in as TPO, you can access:
- **Dashboard** - View placement analytics
- **Students** - Manage and filter students
- **Jobs** - Monitor active job postings
- **Eligibility** - Set placement rules
- **Applications** - Track all applications
- **Analytics** - View placement insights

### 🏢 Recruiter Features

After logging in as recruiter, you can access:
- **Dashboard** - View recruitment overview
- **Post Job** - Create new job postings
- **Jobs** - Manage your posted jobs
- **Applicants** - View all applicants
- **Offers** - Track offers sent

## Troubleshooting

### Frontend Error: "Could not connect to backend"

**Solution:**
- Verify backend is running on http://localhost:8000
- Check browser console (F12 → Console tab)
- Ensure backend terminal shows no errors

### Backend Error: "Port 8000 already in use"

**Solution:**
```bash
# Find process using port 8000 and kill it
# Then restart: python main.py

# Alternatively, run on a different port:
python main.py --host localhost --port 8001
```

### Frontend Error: "Node modules not installed"

**Solution:**
```bash
cd frontend
npm install
npm start
```

### Python Error: "ModuleNotFoundError"

**Solution:**
```bash
cd Backend
# Ensure virtual environment is activated
pip install -r requirements.txt
```

### Page Keeps Showing "Loading...

**Solution:**
- Wait a few seconds
- Check backend terminal for errors
- Clear browser cache: F12 → Application → Clear All
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Useful Commands

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

### Backend Commands

```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Access API documentation
# Visit http://localhost:8000/docs
```

## API Documentation

Once backend is running, access full API documentation:

**Swagger UI**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc

Try API endpoints directly from the Swagger UI interface!

## Project Structure

```
CampusHire/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Role-specific pages
│   │   ├── context/            # AuthContext for state
│   │   ├── services/           # API integration
│   │   ├── styles/             # CSS files
│   │   ├── App.jsx             # Main router
│   │   └── index.js            # Entry point
│   ├── public/                 # Static files
│   └── package.json            # Dependencies
│
└── Backend/                     # FastAPI application
    ├── main.py                 # API server
    ├── requirements.txt        # Python dependencies
    └── README.md              # Backend docs
```

## Important Notes

- **Demo Data**: All data is currently mock/demo data. For production, you'll need a database.
- **localStorage**: Authentication state is saved in your browser's localStorage
- **CORS**: Backend allows requests from localhost:3000 during development
- **Terminal Separation**: Keep backend and frontend in separate terminals

## Next Steps

### For Testing
1. ✅ Follow this guide to start both servers
2. ✅ Log in with demo credentials
3. ✅ Explore all features in each role
4. ✅ Test responsive design (browser DevTools → responsive mode)

### For Development
1. 📝 Explore the code in `frontend/src/` and `Backend/main.py`
2. 🎨 Customize styling in `frontend/src/styles/global.css`
3. 🔌 Modify API endpoints in `Backend/main.py`
4. 📦 Add new dependencies as needed

### For Production
1. 🗄️ Set up a proper database (PostgreSQL/MongoDB)
2. 🔐 Implement JWT authentication
3. 📤 Add file upload handling
4. 📧 Configure email notifications
5. 🚀 Deploy to a server

## Support & Debugging

### Check if Services are Running

**Terminal 1 - Backend:**
```bash
# Should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

**Terminal 2 - Frontend:**
```bash
# Should see:
# Compiled successfully!
# You can now view frontend in the browser.
```

### Clear Browser Cache

If you see stale data:
1. Open DevTools (F12)
2. Application tab → LocalStorage
3. Click "Clear All"
4. Hard refresh (Ctrl+Shift+R)

### Enable Browser Console Logs

1. Open DevTools (F12)
2. Console tab
3. Watch for error messages

## Common Use Cases

### Want to change the port?

**Frontend** - Edit `frontend/package.json`:
```json
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

**Backend** - Edit command:
```bash
python main.py --port 8001
```

### Want to access from another computer?

**Backend** - Use your machine IP instead of localhost:
```bash
# Find your IP (shows as 192.168.x.x on Windows/Mac)
python main.py --host 0.0.0.0

# Then connect from other computer to: http://YOUR_IP:8000
```

### Want to use the API with Postman/cURL?

```bash
# Login example
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "student123",
    "role": "student"
  }'
```

## Quick Reference

| Task | Command | Location |
|------|---------|----------|
| Start frontend | `npm start` | `frontend/` |
| Start backend | `python main.py` | `Backend/` |
| API docs | http://localhost:8000/docs | Browser |
| Frontend app | http://localhost:3000 | Browser |
| Edit components | `frontend/src/components/` | Editor |
| Edit pages | `frontend/src/pages/` | Editor |
| Edit API | `Backend/main.py` | Editor |
| Edit styling | `frontend/src/styles/global.css` | Editor |

## Happy Coding! 🚀

You're all set! Start exploring CampusHire and test all the features.

If you encounter any issues, check the troubleshooting section or review the main README.md file.

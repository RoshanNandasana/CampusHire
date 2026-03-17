# CampusHire - Complete Setup & Testing Guide

## Overview

CampusHire is a full-stack campus placement system with:
- **Frontend**: React SPA with role-based UIs (27 components)
- **Backend**: FastAPI REST API with 27+ endpoints
- **Database**: Demo mode (mock data for testing)
- **Auth**: localStorage + demo credentials

## File Tree

```
CampusHire/
├─── README.md                    # Main project README
├─── STARTUP_GUIDE.md             # This guide
│
├─── frontend/                    # React Application
│    ├─── package.json            # Dependencies
│    ├─── README.md               # Frontend README
│    ├─── public/
│    │    ├─── index.html
│    │    └─── manifest.json
│    └─── src/
│         ├─── App.jsx             # Main router (17+ routes)
│         ├─── App.css
│         ├─── index.js            # Entry point
│         ├─── index.css
│         ├─── context/
│         │    └─── AuthContext.jsx (Global auth state)
│         ├─── services/
│         │    └─── api.js         (API calls)
│         ├─── styles/
│         │    └─── global.css     (Theme & utilities)
│         ├─── components/
│         │    ├─── common/
│         │    │    ├─── Navbar.jsx & .css
│         │    │    ├─── Sidebar.jsx & .css
│         │    │    ├─── Footer.jsx & .css
│         │    │    ├─── Card.jsx & .css
│         │    │    ├─── Modal.jsx & .css
│         │    │    └─── ProtectedRoute.jsx
│         │    ├─── student/
│         │    ├─── tpo/
│         │    └─── recruiter/
│         └─── pages/
│              ├─── auth/
│              │    ├─── Login.jsx & .css (3 demo buttons)
│              │    └─── Register.jsx & .css
│              ├─── student/            (6 pages)
│              │    ├─── StudentDashboard.jsx
│              │    ├─── StudentProfile.jsx
│              │    ├─── StudentJobListings.jsx
│              │    ├─── StudentApplications.jsx
│              │    ├─── StudentResumeInsights.jsx
│              │    └─── StudentPreparation.jsx
│              ├─── tpo/                (6 pages)
│              │    ├─── TPODashboard.jsx
│              │    ├─── TPOStudents.jsx
│              │    ├─── TPOJobs.jsx
│              │    ├─── TPOEligibility.jsx
│              │    ├─── TPOApplications.jsx
│              │    └─── TPOAnalytics.jsx
│              └─── recruiter/          (5 pages)
│                   ├─── RecruiterDashboard.jsx
│                   ├─── RecruiterPostJob.jsx
│                   ├─── RecruiterJobs.jsx
│                   ├─── RecruiterApplicants.jsx
│                   └─── RecruiterOffers.jsx
│
└─── Backend/                     # FastAPI Application
     ├─── main.py                 # 27+ API endpoints
     ├─── requirements.txt        # Python dependencies
     └─── README.md               # Backend README
```

## Quick Start (3 Steps)

### Step 1: Start Backend

```bash
cd Backend
pip install -r requirements.txt
python main.py
```

✅ Backend running on http://localhost:8000

### Step 2: Start Frontend

```bash
cd frontend
npm install
npm start
```

✅ Frontend running on http://localhost:3000

### Step 3: Login with Demo Credentials

1. Open http://localhost:3000/login
2. Click **"Student"** button (auto-fills credentials)
3. Click **"Login"**

Done! 🎉 You're now logged in as a student.

## Demo Credentials Summary

All three roles available with one-click login:

```
┌──────────┬────────────────────────┬────────────┐
│   Role   │        Email           │ Password   │
├──────────┼────────────────────────┼────────────┤
│ Student  │ student@example.com    │ student123 │
│   TPO    │ tpo@example.com        │ tpo123     │
│ Recruiter│ recruiter@example.com  │ recruiter123
└──────────┴────────────────────────┴────────────┘
```

**Fastest way to test:** Click demo button on login page!

## What to Test

### Student Role (`student@example.com` / `student123`)

✅ **Dashboard**
- View placement statistics
- Check profile completion
- See placement readiness score

✅ **Profile**
- Edit personal information
- Add/remove skills
- Upload resume

✅ **Job Listings**
- Browse available jobs
- Filter by company name
- Check eligibility (CGPA requirement)

✅ **Applications**
- View application timeline
- See status progression
- Check shortlist status

✅ **Resume Insights**
- View ATS score (78/100)
- See skill proficiency
- Check skill gap analysis

✅ **Preparation**
- Track preparation progress
- View learning resources
- Check module completion

### TPO Role (`tpo@example.com` / `tpo123`)

✅ **Dashboard**
- View placement analytics
- See top recruiting companies
- Check placement by branch

✅ **Students**
- Filter by branch/CGPA
- View student list
- Check placement status

✅ **Jobs**
- Monitor active jobs
- See applicants count
- Track success rate

✅ **Eligibility Rules**
- Set minimum CGPA
- Set max offers per student
- Select allowed branches

✅ **Applications**
- View all applications
- Track status
- Filter by company

✅ **Analytics**
- View placement rate
- See in-demand skills
- Check key insights

### Recruiter Role (`recruiter@example.com` / `recruiter123`)

✅ **Dashboard**
- View recruitment overview
- See recent applications
- Check offers made

✅ **Post Job**
- Create job posting
- Set requirements
- Add skills needed

✅ **Jobs**
- View posted jobs
- See applicant count
- Check posted date

✅ **Applicants**
- View all applicants
- Check CGPA
- See application status

✅ **Offers**
- View sent offers
- Track acceptance status
- Manage offers

## Testing Checklist

### Authentication
- [ ] Login with demo button works
- [ ] Login with manual credentials works
- [ ] Logout works
- [ ] Page refresh keeps user logged in
- [ ] Can't access protected routes without login
- [ ] Role-based redirection works

### Navigation
- [ ] Navbar shows user info
- [ ] Navbar logout button works
- [ ] Sidebar menu changes per role
- [ ] Sidebar links navigate correctly
- [ ] Mobile hamburger menu works
- [ ] Active route highlights in sidebar

### Responsiveness
- [ ] Desktop (1024px+): Full layout works
- [ ] Tablet (768px): Layout adapts correctly
- [ ] Mobile (<768px): Bottom bar appears, content stacks
- [ ] All tables are readable on mobile
- [ ] Forms are usable on mobile

### Functionality
- [ ] All role dashboards load
- [ ] All role-specific pages load
- [ ] Tables display data correctly
- [ ] Filters work (branch, CGPA, search)
- [ ] Modals open/close properly
- [ ] Forms can be filled and submitted

### Data Display
- [ ] Stats cards show numbers
- [ ] Progress bars display correctly
- [ ] Charts/tables render properly
- [ ] Badges show correct status colors
- [ ] Timeline visualizations display

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

## API Endpoints (Reference)

### Auth
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/profile
```

### Student
```
GET /api/student/dashboard
GET /api/student/profile
GET /api/student/jobs
GET /api/student/applications
POST /api/student/apply/{job_id}
GET /api/student/resume-insights
```

### TPO
```
GET /api/tpo/dashboard
GET /api/tpo/students
GET /api/tpo/jobs
POST /api/tpo/eligibility-rules
GET /api/tpo/applications
GET /api/tpo/analytics
```

### Recruiter
```
GET /api/recruiter/dashboard
POST /api/recruiter/jobs
GET /api/recruiter/jobs
GET /api/recruiter/applicants
PUT /api/recruiter/applications/{id}
POST /api/recruiter/offers/{id}
```

**Full docs**: http://localhost:8000/docs

## Troubleshooting

### Issue: "Could not connect to backend"
**Solution:**
1. Ensure backend is running: `python main.py` in `/Backend`
2. Backend should show: `INFO: Uvicorn running on http://0.0.0.0:8000`
3. Check http://localhost:8000/health returns `{"status": "ok"}`

### Issue: "Page keeps loading"
**Solution:**
1. Check backend terminal for errors
2. Clear browser cache and refresh
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Try incognito mode

### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Kill the process using port 8000
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :8000
kill -9 <PID>
```

### Issue: "npm dependencies missing"
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: "localStorage not working"
**Solution:**
1. Clear browser data: DevTools → Application → Clear All
2. Try incognito mode
3. Login again

## Development Commands

```bash
# Frontend
cd frontend
npm install          # Install dependencies
npm start           # Start dev server (port 3000)
npm build           # Build for production
npm test            # Run tests

# Backend
cd Backend
pip install -r requirements.txt    # Install dependencies
python main.py                     # Start server (port 8000)
```

## Key Features Implemented

### ✅ Frontend
- [x] React 19 with functional components
- [x] React Router with protected routes
- [x] Context API for authentication
- [x] Axios API integration
- [x] Custom CSS with responsive design
- [x] Black & white minimalist theme
- [x] Role-based UIs (Student/TPO/Recruiter)
- [x] 6 Student pages
- [x] 6 TPO pages
- [x] 5 Recruiter pages
- [x] Demo data integration
- [x] localStorage persistence

### ✅ Backend
- [x] FastAPI framework
- [x] 27+ endpoints
- [x] CORS enabled
- [x] Demo user accounts
- [x] Role-based responses
- [x] Organized endpoint groups
- [x] Mock data for testing

### ⏳ Not Yet (Production only)
- [ ] Database (PostgreSQL/MongoDB)
- [ ] JWT authentication
- [ ] File uploads
- [ ] Email notifications
- [ ] Advanced AI features
- [ ] Logging & monitoring
- [ ] Unit tests
- [ ] CI/CD pipeline

## Project Statistics

| Metric | Count |
|--------|-------|
| Frontend Components | 27+ |
| Backend Endpoints | 27+ |
| CSS Files | 27+ |
| Student Pages | 6 |
| TPO Pages | 6 |
| Recruiter Pages | 5 |
| Auth Pages | 2 |
| Common Components | 6 |
| Demo Credentials | 3 |
| Lines of Code | 3000+ |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (User)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  React App (http://localhost:3000)                     │
│  ├─ AuthContext (localStorage)                         │
│  ├─ React Router (Protected Routes)                    │
│  ├─ Components (27)                                    │
│  ├─ Pages (17 role-based routes)                       │
│  └─ Axios API Client                                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│            API Calls (Axios Interceptors)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FastAPI Server (http://localhost:8000)                │
│  ├─ CORS Middleware                                    │
│  ├─ Auth Endpoints (3)                                 │
│  ├─ Student Endpoints (6)                              │
│  ├─ TPO Endpoints (5)                                  │
│  ├─ Recruiter Endpoints (6)                            │
│  └─ Demo Data (Mock Users & Jobs)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## CSS Architecture

```css
/* Global Theme */
--primary-color: #000              /* Black */
--secondary-color: #333            /* Dark Gray */
--background-color: #f5f5f5        /* Light Gray */
--card-background: #fff            /* White */
--success-color: #4caf50
--warning-color: #ff9800
--danger-color: #f44336
--info-color: #2196f3

/* Responsive Breakpoints */
Desktop:  1024px+  (Full sidebar)
Tablet:   768px    (Adapted layout)
Mobile:   480px    (Bottom bar)
```

## Contact & Support

- **Main README**: See [README.md](README.md)
- **Frontend Docs**: See [frontend/README.md](frontend/README.md)
- **Backend Docs**: See [Backend/README.md](Backend/README.md)

---

## Next Steps

### For Testing
1. Follow Quick Start (3 steps above)
2. Test all 3 demo credentials
3. Explore each role's features
4. Test on mobile device

### For Development
1. Explore code structure
2. Modify components as needed
3. Update API endpoints
4. Customize styling

### For Production
1. Set up PostgreSQL database
2. Implement JWT tokens
3. Add file upload handling
4. Configure environment variables
5. Deploy to production

---

**You're all set! Start exploring CampusHire now.** 🚀

**Questions?** Check the troubleshooting section or review the individual README files.

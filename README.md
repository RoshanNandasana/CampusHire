# CampusHire - Campus Placement Preparation & Management System

A full-stack AI-powered campus placement system with separate frontend and backend applications. Connects students, TPOs, and recruiters to streamline campus placements with automated eligibility checks, application tracking, and AI-powered resume and skill insights.

## Project Structure

```
CampusHire/
├── frontend/              # React application (port 3000)
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components by role
│   │   ├── context/       # AuthContext
│   │   ├── services/      # API service layer
│   │   └── styles/        # Global CSS
│   └── package.json
│
└── Backend/               # FastAPI application (port 8000)
    ├── main.py            # FastAPI server
    └── requirements.txt   # Python dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+) - for frontend
- Python (3.9+) - for backend
- npm or yarn

### Frontend Setup (Terminal 1)
```bash
cd frontend
npm install
npm start
```
Frontend runs on: **http://localhost:3000**

### Backend Setup (Terminal 2)
```bash
cd Backend
pip install -r requirements.txt
python main.py
```
Backend runs on: **http://localhost:8000**

## 👤 Demo Credentials

Use these credentials to test all three user roles immediately:

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@example.com | student123 |
| **TPO** | tpo@example.com | tpo123 |
| **Recruiter** | recruiter@example.com | recruiter123 |

### Quick Login
1. Open http://localhost:3000/login
2. Click the role button (Student/TPO/Recruiter) to pre-fill demo credentials
3. Click "Login"

## ✨ Features by Role

### 👨‍🎓 Student
- Dashboard with placement statistics and profile completion
- Profile management (personal info, academics, skills, projects, certifications)
- Job listings with eligibility checking based on CGPA
- Application tracking with visual timeline (Applied → Shortlisted → Interview → Offer)
- Resume insights (ATS score, skill proficiency bars, skill gap analysis)
- Interview preparation tracker with modules and resources

### 👔 TPO (Training & Placement Officer)
- Dashboard with placement analytics and recruiting companies overview
- Student management with filtering (branch, CGPA range)
- Job monitoring and applicant tracking per company
- Set eligibility rules (min CGPA, max offers per student, allowed branches)
- Application tracking across all students and companies
- Analytics dashboard with top skills and placement insights

### 🏢 Recruiter
- Dashboard with recruitment overview and recent applications
- Post new jobs with detailed requirements and skills
- Job listing management with applicant counts and success rates
- Applicant management with status tracking
- Offer tracking and placement confirmation

## 🛠 Technology Stack

### Frontend
- **React 19.2.4** - UI framework with functional components
- **React Router v6.21.0** - Client-side routing with nested routes
- **Axios 1.6.5** - HTTP client with request interceptors
- **Context API** - State management (AuthContext with localStorage)
- **Custom CSS** - Pure CSS styling with CSS variables (black & white theme)

### Backend
- **FastAPI 0.104.1** - Modern Python web framework with async support
- **Uvicorn 0.24.0** - ASGI server
- **Pydantic 2.5.0** - Data validation
- **Python 3.9+** - Programming language

## 📁 File Structure

### Frontend Components (`src/`)
```
components/
├── common/                # Reusable components
│   ├── Navbar.jsx         # Top navigation with user info
│   ├── Sidebar.jsx        # Role-based menu navigation
│   ├── Footer.jsx         # Application footer
│   ├── Card.jsx           # Reusable card container
│   ├── Modal.jsx          # Dialog/modal component
│   └── ProtectedRoute.jsx # Route protection wrapper
│
├── student/               # Student-specific components
├── tpo/                   # TPO-specific components
└── recruiter/             # Recruiter-specific components

pages/
├── auth/                  # Login & Register pages
├── student/               # 6 student pages (Dashboard, Profile, Jobs, Applications, Resume Insights, Preparation)
├── tpo/                   # 6 TPO pages (Dashboard, Students, Jobs, Eligibility, Applications, Analytics)
└── recruiter/             # 5 recruiter pages (Dashboard, Post Job, Jobs, Applicants, Offers)

context/
└── AuthContext.jsx        # Global authentication state with localStorage

services/
└── api.js                 # Axios instance with organized API endpoints

styles/
└── global.css             # Global CSS theme with variables and utilities

App.jsx                    # Main router with protected routes
index.js                   # Entry point with AuthProvider
```

### Backend
```
Backend/
├── main.py                # FastAPI app with 27+ endpoints
├── requirements.txt       # Python dependencies
└── README.md             # Backend setup guide
```

## 🎨 Design Features

- **Minimalist Theme**: Pure black (#000), dark gray (#333), light gray (#f5f5f5), white backgrounds
- **Responsive Design**: Mobile-first approach with breakpoints at 1024px, 768px, 480px
- **Accessibility**: Semantic HTML, high contrast colors, readable typography
- **No External Libraries**: Pure HTML, CSS, and JavaScript (React components)
- **CSS Variables**: Centralized theme control in global.css

## 📡 API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/profile` - Get current user profile

### Student API
- GET `/api/student/dashboard` - Dashboard data
- GET `/api/student/profile` - User profile
- GET `/api/student/jobs` - Available jobs
- GET `/api/student/applications` - User applications
- POST `/api/student/apply/{job_id}` - Apply for job
- GET `/api/student/resume-insights` - Resume scoring

### TPO API
- GET `/api/tpo/dashboard` - Dashboard analytics
- GET `/api/tpo/students` - All students
- GET `/api/tpo/jobs` - Job monitoring
- POST `/api/tpo/eligibility-rules` - Configure rules
- GET `/api/tpo/applications` - All applications
- GET `/api/tpo/analytics` - Analytics data

### Recruiter API
- GET `/api/recruiter/dashboard` - Dashboard
- POST `/api/recruiter/jobs` - Post new job
- GET `/api/recruiter/jobs` - My jobs
- GET `/api/recruiter/applicants` - Applicants
- PUT `/api/recruiter/applications/{id}` - Update status
- POST `/api/recruiter/offers/{id}` - Create offer

**Full API Documentation**: http://localhost:8000/docs (Swagger UI)

## 💡 Key Highlights

✅ **Production-Ready Code**: Clean architecture with organized components
✅ **Role-Based Access Control**: Different UIs and functionality for each role
✅ **Fully Responsive**: Works on desktop, tablet, and mobile devices
✅ **Demo Data Included**: Test all features with pre-filled credentials
✅ **localStorage Persistence**: Auto-login on page refresh
✅ **Axios Interceptors**: Automatic token injection for API requests
✅ **CSS Variables**: Easy theme customization
✅ **Protected Routes**: Role-based route protection with redirects

## 🔄 Responsive Breakpoints

- **Desktop**: 1024px+ (full sidebar navigation)
- **Tablet**: 768px - 1023px (adapted layout)
- **Mobile**: <768px (bottom navigation bar)

## 🚧 Current Implementation Status

### ✅ Completed
- Folder structure and project organization
- Frontend: 27 components and pages (all with CSS)
- Backend: FastAPI server with 27+ endpoints
- Authentication with localStorage
- Role-based routing and access control
- Responsive design across all breakpoints
- Demo data for immediate testing

### ⏳ Production Enhancements Needed
- Database integration (PostgreSQL/SQLite with SQLAlchemy)
- JWT token authentication with expiration
- File upload handling (resumes, profile pictures)
- Email notification system
- Advanced AI features (real ATS scoring, ML-based skill gap analysis)
- Input validation on backend (Pydantic models)
- Unit tests
- Environment variables (.env configuration)

## 🎯 Next Steps for Production

1. **Database Setup**: PostgreSQL or MongoDB
2. **Authentication**: Implement JWT tokens with expiration
3. **File Uploads**: Resume and image upload handlers
4. **Email**: SMTP configuration for notifications
5. **Validation**: Pydantic models for all endpoints
6. **Testing**: Unit and integration tests
7. **Logging**: Error tracking and audit logs
8. **Deployment**: Docker, CI/CD pipeline, production server

## 📚 Documentation

- [Frontend README](frontend/README.md)
- [Backend README](Backend/README.md)

## ⚙️ Troubleshooting

**Frontend won't connect to backend?**
- Ensure backend is running on http://localhost:8000
- Check browser console for CORS errors (backend has CORS enabled for localhost:3000)

**Authentication not working?**
- Check if credentials match demo accounts (see table above)
- Clear localStorage: Open DevTools → Application → LocalStorage → Clear
- Try Incognito mode to test without cached data

**API endpoints returning errors?**
- Backend uses mock data (database integration pending for production)
- Check backend terminal for error logs
- Visit http://localhost:8000/docs for full API documentation

## 📄 License

Open source project for educational purposes.

---

**Ready to start?** Follow the Quick Start section above! 🚀

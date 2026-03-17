from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import math
import re

app = FastAPI(title="CampusHire API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get('/')
def root():
    """Welcome endpoint"""
    return {
        'message': 'Welcome to CampusHire API',
        'version': '1.0.0',
        'documentation': 'http://localhost:8000/docs',
        'status': 'Running',
        'demo_credentials': {
            'student': {'email': 'student@example.com', 'password': 'student123'},
            'tpo': {'email': 'tpo@example.com', 'password': 'tpo123'},
            'recruiter': {'email': 'recruiter@example.com', 'password': 'recruiter123'},
        }
    }

# ============================================================
# DEMO DATA STORAGE (In production, use database)
# ============================================================

demo_users = {
    'student@example.com': {
        'id': '1',
        'email': 'student@example.com',
        'name': 'John Doe',
        'password': 'student123',
        'role': 'student',
        'cgpa': 8.2,
        'branch': 'Computer Science',
        'year': 'Final Year',
    },
    'tpo@example.com': {
        'id': '2',
        'email': 'tpo@example.com',
        'name': 'Dr. Sharma',
        'password': 'tpo123',
        'role': 'tpo',
    },
    'recruiter@example.com': {
        'id': '3',
        'email': 'recruiter@example.com',
        'name': 'HR Manager',
        'password': 'recruiter123',
        'role': 'recruiter',
        'company': 'Google',
    },
}

resume_insights_store = {}

# ============================================================
# RESUME INSIGHTS HELPERS
# ============================================================

def _keyword_hits(text: str, keywords: list[str]) -> int:
    return sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text))


def _build_resume_insights(filename: str, content: bytes) -> dict:
    text = content.decode('latin-1', errors='ignore').lower()
    size_kb = max(1, int(len(content) / 1024))

    keyword_map = {
        'JavaScript': ['javascript', 'js'],
        'Python': ['python'],
        'React': ['react'],
        'SQL': ['sql'],
        'DSA': ['dsa', 'data structures', 'algorithms'],
        'AWS': ['aws', 'amazon web services'],
        'Machine Learning': ['machine learning', 'ml'],
        'System Design': ['system design'],
        'DevOps': ['devops', 'ci/cd', 'docker', 'kubernetes'],
    }

    hits = {name: _keyword_hits(text, keywords) for name, keywords in keyword_map.items()}
    skill_hits = sum(1 for k in ['JavaScript', 'Python', 'React', 'SQL', 'DSA'] if hits.get(k, 0) > 0)
    advanced_hits = sum(1 for k in ['AWS', 'Machine Learning', 'System Design', 'DevOps'] if hits.get(k, 0) > 0)

    size_score = min(25, int(math.log10(size_kb + 1) * 12))
    keyword_score = min(25, skill_hits * 4 + advanced_hits * 3)
    base_score = 45
    score = max(30, min(95, base_score + size_score + keyword_score))

    skills = [
        {
            'name': name,
            'level': 45 + min(50, hits[name] * 15),
            'inBidding': name in ['JavaScript', 'Python', 'React'],
        }
        for name in ['JavaScript', 'Python', 'React', 'SQL', 'DSA']
    ]

    skill_gaps = [
        {
            'skill': 'AWS/Cloud Computing',
            'demand': 95,
            'yourLevel': 15 + min(40, hits['AWS'] * 20),
        },
        {
            'skill': 'Machine Learning',
            'demand': 85,
            'yourLevel': 10 + min(40, hits['Machine Learning'] * 20),
        },
        {
            'skill': 'System Design',
            'demand': 80,
            'yourLevel': 10 + min(40, hits['System Design'] * 20),
        },
        {
            'skill': 'DevOps',
            'demand': 75,
            'yourLevel': 10 + min(40, hits['DevOps'] * 20),
        },
    ]

    suggestions = [
        'Good formatting and section hierarchy improves readability.',
        'Add measurable impact for projects and internships.',
        'Highlight certifications near the top for recruiters.',
    ]

    if hits['AWS'] == 0:
        suggestions.append('Add cloud exposure such as AWS, Azure, or GCP basics.')
    if hits['System Design'] == 0:
        suggestions.append('Include system design or architecture experience if available.')
    if hits['Machine Learning'] == 0:
        suggestions.append('Mention analytics or ML projects if you have them.')

    return {
        'atsScore': score,
        'skills': skills,
        'skillGaps': skill_gaps,
        'suggestions': suggestions,
        'fileName': filename,
        'sizeKB': size_kb,
    }

# ============================================================
# AUTHENTICATION ENDPOINTS
# ============================================================

@app.post('/api/auth/login')
def login(email: str, password: str, role: str):
    """Login endpoint"""
    user = demo_users.get(email)
    
    if not user or user['password'] != password or user['role'] != role:
        return {'status': 'error', 'message': 'Invalid credentials'}
    
    return {
        'status': 'success',
        'user': {
            'id': user.get('id'),
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'token': f'token-{user["id"]}',
        }
    }

@app.post('/api/auth/register')
def register(name: str, email: str, password: str, role: str):
    """Register endpoint"""
    if email in demo_users:
        return {'status': 'error', 'message': 'User already exists'}
    
    new_user = {
        'id': str(len(demo_users) + 1),
        'email': email,
        'name': name,
        'password': password,
        'role': role,
    }
    
    demo_users[email] = new_user
    
    return {
        'status': 'success',
        'user': {
            'id': new_user['id'],
            'email': new_user['email'],
            'name': new_user['name'],
            'role': new_user['role'],
            'token': f'token-{new_user["id"]}',
        }
    }

@app.get('/api/auth/profile')
def get_profile():
    """Get user profile"""
    return {'status': 'success'}

# ============================================================
# STUDENT ENDPOINTS
# ============================================================

@app.get('/api/student/dashboard')
def student_dashboard():
    """Get student dashboard data"""
    return {
        'status': 'success',
        'data': {
            'profileCompletion': 85,
            'placementReadiness': 72,
            'applicationsCount': 4,
            'shortlistedCount': 1,
        }
    }

@app.get('/api/student/profile')
def get_student_profile():
    """Get student profile"""
    return {'status': 'success', 'data': demo_users['student@example.com']}

@app.put('/api/student/profile')
def update_student_profile(data: dict):
    """Update student profile"""
    return {'status': 'success', 'message': 'Profile updated'}

@app.get('/api/student/applications')
def get_applications():
    """Get student applications"""
    return {
        'status': 'success',
        'applications': [
            {'id': 1, 'company': 'Google', 'status': 'shortlisted'},
            {'id': 2, 'company': 'Microsoft', 'status': 'applied'},
        ]
    }

@app.get('/api/student/jobs')
def get_job_listings(minCGPA: float = 5.0):
    """Get job listings"""
    return {
        'status': 'success',
        'jobs': [
            {'id': 1, 'company': 'Google', 'position': 'SWE', 'minCGPA': 7.5},
            {'id': 2, 'company': 'Microsoft', 'position': 'PM', 'minCGPA': 7.0},
        ]
    }

@app.post('/api/student/apply/{job_id}')
def apply_for_job(job_id: int):
    """Apply for a job"""
    return {'status': 'success', 'message': f'Applied to job {job_id}'}

@app.get('/api/student/resume-insights')
def resume_insights():
    """Get resume insights"""
    default_payload = {
        'atsScore': 78,
        'skills': [
            {'name': 'JavaScript', 'level': 90, 'inBidding': True},
            {'name': 'Python', 'level': 80, 'inBidding': True},
            {'name': 'React', 'level': 85, 'inBidding': True},
            {'name': 'SQL', 'level': 75, 'inBidding': False},
            {'name': 'DSA', 'level': 70, 'inBidding': False},
        ],
        'skillGaps': [
            {'skill': 'AWS/Cloud Computing', 'demand': 95, 'yourLevel': 20},
            {'skill': 'Machine Learning', 'demand': 85, 'yourLevel': 30},
            {'skill': 'System Design', 'demand': 80, 'yourLevel': 40},
            {'skill': 'DevOps', 'demand': 75, 'yourLevel': 10},
        ],
        'suggestions': [
            'Good resume structure and formatting.',
            'Add more quantifiable metrics (e.g., 40% performance improvement).',
            'Include relevant certifications prominently.',
            'Add cloud computing skills (AWS, Azure).',
            'Highlight system design experience when applicable.',
        ],
    }
    payload = resume_insights_store.get('student', default_payload)
    return {'status': 'success', **payload}


@app.post('/api/student/resume-upload')
async def resume_upload(resume: UploadFile = File(...)):
    """Upload resume and generate ATS insights"""
    content = await resume.read()
    insights = _build_resume_insights(resume.filename or 'resume.pdf', content)
    resume_insights_store['student'] = insights
    return {'status': 'success', **insights}

# ============================================================
# TPO ENDPOINTS
# ============================================================

@app.get('/api/tpo/dashboard')
def tpo_dashboard():
    """Get TPO dashboard"""
    return {
        'status': 'success',
        'data': {
            'totalStudents': 485,
            'totalApplications': 1250,
            'placedStudents': 312,
            'placementRate': 64.3,
        }
    }

@app.get('/api/tpo/students')
def get_tpo_students(branch: str = '', minCGPA: float = 5.0):
    """Get all students for TPO"""
    return {
        'status': 'success',
        'students': [
            {'id': 1, 'name': 'Raj Kumar', 'cgpa': 8.5, 'branch': 'CSE'},
            {'id': 2, 'name': 'Priya Singh', 'cgpa': 8.2, 'branch': 'CSE'},
        ]
    }

@app.get('/api/tpo/jobs')
def get_tpo_jobs():
    """Get job monitoring data"""
    return {
        'status': 'success',
        'jobs': [
            {'id': 1, 'company': 'Google', 'applicants': 145, 'shortlisted': 32},
        ]
    }

@app.post('/api/tpo/eligibility-rules')
def set_eligibility_rules(rules: dict):
    """Set eligibility rules"""
    return {'status': 'success', 'message': 'Rules updated'}

@app.get('/api/tpo/analytics')
def tpo_analytics():
    """Get TPO analytics"""
    return {
        'status': 'success',
        'placementRate': 64.3,
        'topSkills': [
            {'name': 'Python', 'demand': 95},
            {'name': 'JavaScript', 'demand': 88},
        ]
    }

# ============================================================
# RECRUITER ENDPOINTS
# ============================================================

@app.get('/api/recruiter/dashboard')
def recruiter_dashboard():
    """Get recruiter dashboard"""
    return {
        'status': 'success',
        'data': {
            'activeJobs': 5,
            'totalApplicants': 324,
            'shortlisted': 45,
            'offersMade': 12,
        }
    }

@app.post('/api/recruiter/jobs')
def post_job(job_data: dict):
    """Post a new job"""
    return {'status': 'success', 'message': 'Job posted successfully'}

@app.get('/api/recruiter/jobs')
def get_recruiter_jobs():
    """Get recruiter's jobs"""
    return {
        'status': 'success',
        'jobs': [
            {'id': 1, 'title': 'Software Engineer', 'applicants': 145},
        ]
    }

@app.get('/api/recruiter/applicants')
def get_applicants(skills: str = '', minCGPA: float = 5.0):
    """Get applicants"""
    return {
        'status': 'success',
        'applicants': [
            {'id': 1, 'name': 'Raj Kumar', 'cgpa': 8.5},
        ]
    }

@app.put('/api/recruiter/applications/{app_id}')
def update_application_status(app_id: int, status: str):
    """Update application status"""
    return {'status': 'success', 'message': f'Application {app_id} updated to {status}'}

@app.post('/api/recruiter/offers/{app_id}')
def release_offer(app_id: int, offer_data: dict):
    """Release an offer"""
    return {'status': 'success', 'message': f'Offer created for application {app_id}'}

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get('/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)

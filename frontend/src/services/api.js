import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Student APIs
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getApplications: () => api.get('/student/applications'),
  getJobListings: (filters) => api.get('/student/jobs', { params: filters }),
  applyForJob: (jobId) => api.post(`/student/apply/${jobId}`),
  getApplicationStatus: (id) => api.get(`/student/applications/${id}`),
  getResumeInsights: () => api.get('/student/resume-insights'),
  uploadResume: (formData) => api.post('/student/resume-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// TPO APIs
export const tpoAPI = {
  getDashboard: () => api.get('/tpo/dashboard'),
  getStudents: (filters) => api.get('/tpo/students', { params: filters }),
  getStudentDetail: (id) => api.get(`/tpo/students/${id}`),
  getJobs: () => api.get('/tpo/jobs'),
  getApplications: () => api.get('/tpo/applications'),
  setEligibilityRules: (rules) => api.post('/tpo/eligibility-rules', rules),
  getAnalytics: () => api.get('/tpo/analytics'),
};

// Recruiter APIs
export const recruiterAPI = {
  getDashboard: () => api.get('/recruiter/dashboard'),
  postJob: (jobData) => api.post('/recruiter/jobs', jobData),
  getJobs: () => api.get('/recruiter/jobs'),
  getApplicants: (filters) => api.get('/recruiter/applicants', { params: filters }),
  getApplicantProfile: (id) => api.get(`/recruiter/applicants/${id}`),
  updateApplicationStatus: (appId, status) =>
    api.put(`/recruiter/applications/${appId}`, { status }),
  releaseOffer: (appId, offerData) =>
    api.post(`/recruiter/offers/${appId}`, offerData),
  getOffers: () => api.get('/recruiter/offers'),
};

export default api;

import axios from 'axios';

const resolveApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || '/api/v1';
};

const API_BASE_URL = resolveApiBaseUrl();

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
    try {
      const userData = JSON.parse(user);
      if (userData.token || userData.access_token) {
        config.headers.Authorization = `Bearer ${userData.token || userData.access_token}`;
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('campushire.student.profile.v1');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword }),
  logout: () => api.post('/auth/logout'),
};

// Student APIs - Profile & Dashboard
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  
  // Applications & Jobs
  getApplications: () => api.get('/student/applications'),
  getJobListings: (filters) => api.get('/student/jobs', { params: filters }),
  applyForJob: (jobId) => api.post(`/student/apply/${jobId}`),
  getApplicationStatus: (id) => api.get(`/student/applications/${id}`),
  
  // Resume Management
  getResumeInsights: () => api.get('/student/resume-insights'),
  uploadResume: (formData) => api.post('/student/resume-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  resumeChat: (payload) => api.post('/student/resume-chat', payload),
  uploadProfileDocument: (formData) => api.post('/student/profile/document-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  // Study Materials
  getMaterials: () => api.get('/student/materials'),
  viewMaterial: (materialId) =>
    api.get(`/student/materials/${materialId}/file`, {
      responseType: 'blob',
    }),
  
  // Projects CRUD
  createProject: (projectData) => api.post('/student/projects', projectData),
  listProjects: () => api.get('/student/projects'),
  getProject: (projectId) => api.get(`/student/projects/${projectId}`),
  updateProject: (projectId, projectData) => api.put(`/student/projects/${projectId}`, projectData),
  deleteProject: (projectId) => api.delete(`/student/projects/${projectId}`),
  
  // Certifications CRUD
  createCertification: (certData) => api.post('/student/certifications', certData),
  listCertifications: () => api.get('/student/certifications'),
  getCertification: (certId) => api.get(`/student/certifications/${certId}`),
  updateCertification: (certId, certData) => api.put(`/student/certifications/${certId}`, certData),
  deleteCertification: (certId) => api.delete(`/student/certifications/${certId}`),
  
  // Skills CRUD
  createSkill: (skillData) => api.post('/student/skills', skillData),
  listSkills: () => api.get('/student/skills'),
  getSkill: (skillId) => api.get(`/student/skills/${skillId}`),
  updateSkill: (skillId, skillData) => api.put(`/student/skills/${skillId}`, skillData),
  deleteSkill: (skillId) => api.delete(`/student/skills/${skillId}`),
};

// TPO APIs
export const tpoAPI = {
  getDashboard: () => api.get('/tpo/dashboard'),
  getStudents: (filters) => api.get('/tpo/students', { params: filters }),
  getStudentDetail: (id) => api.get(`/tpo/students/${id}`),
  createStudent: (studentData) => api.post('/tpo/students', studentData),
  updateStudent: (id, studentData) => api.put(`/tpo/students/${id}`, studentData),
  bulkUploadStudents: (formData) => api.post('/tpo/students/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  getJobs: () => api.get('/tpo/jobs'),
  updateJobApproval: (jobId, status) => api.put(`/tpo/jobs/${jobId}/approval`, { status }),
  getApplications: () => api.get('/tpo/applications'),

  // Study Materials
  listMaterials: () => api.get('/tpo/materials'),
  uploadMaterial: (formData) =>
    api.post('/tpo/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteMaterial: (materialId) => api.delete(`/tpo/materials/${materialId}`),
  
  // Eligibility Management
  getEligibilitySnapshot: (studentId) => api.get(`/tpo/students/${studentId}/eligibility-snapshot`),
  setEligibilityRules: (rules) => api.post('/tpo/eligibility-rules', rules),
  
  // Analytics & Reports
  getAnalytics: () => api.get('/tpo/analytics'),
  getStudentTimeline: (studentId) => api.get(`/tpo/students/${studentId}/application-timeline`),
  getReports: (reportType) => api.get(`/tpo/reports/${reportType}`),
};

// Recruiter APIs
export const recruiterAPI = {
  getDashboard: () => api.get('/recruiter/dashboard'),
  getDepartments: () => api.get('/recruiter/departments'),
  
  // Job Management
  postJob: (jobData) => api.post('/recruiter/jobs', jobData),
  getJobs: () => api.get('/recruiter/jobs'),
  getJobDetail: (jobId) => api.get(`/recruiter/jobs/${jobId}`),
  updateJob: (jobId, jobData) => api.put(`/recruiter/jobs/${jobId}`, jobData),
  
  // Applicant Management
  getApplicants: (filters) => api.get('/recruiter/applicants', { params: filters }),
  getApplicantProfile: (id) => api.get(`/recruiter/applicants/${id}`),
  viewApplicantDocument: (applicationId, url) =>
    api.get(`/recruiter/applications/${applicationId}/document`, {
      params: { url },
      responseType: 'blob',
    }),
  updateApplicationStatus: (appId, status) =>
    api.put(`/recruiter/applications/${appId}`, { status }),
  
  // Offer Management
  releaseOffer: (appId, offerData) =>
    api.post(`/recruiter/offers/${appId}`, offerData),
  getOffers: () => api.get('/recruiter/offers'),
  updateOfferStatus: (appId, status) =>
    api.put(`/recruiter/offers/${appId}`, { status }),
  
  // Direct API instance for custom requests (blob downloads, etc.)
  api: api,
};

// Super Admin APIs
export const adminAPI = {
  // TPO Coordinators
  createTPO: (tpoData) => api.post('/admin/tpos', tpoData),
  getTPOs: () => api.get('/admin/tpos'),
  updateTPO: (tpoId, tpoData) => api.put(`/admin/tpos/${tpoId}`, tpoData),

  // Companies
  createCompany: (companyData) => api.post('/admin/companies', companyData),
  getCompanies: () => api.get('/admin/companies'),
  updateCompany: (companyId, companyData) => api.put(`/admin/companies/${companyId}`, companyData),

  // Departments
  createDepartment: (deptData) => api.post('/admin/departments', deptData),
  getDepartments: () => api.get('/admin/departments'),
  updateDepartment: (deptId, deptData) => api.put(`/admin/departments/${deptId}`, deptData),
  deleteDepartment: (deptId) => api.delete(`/admin/departments/${deptId}`),

  // Placement Cycles
  createCycle: (cycleData) => api.post('/admin/cycles', cycleData),
  getCycles: () => api.get('/admin/cycles'),
  activateCycle: (cycleId) => api.post(`/admin/cycles/${cycleId}/activate`),
  closeCycle: (cycleId) => api.post(`/admin/cycles/${cycleId}/close`),
  enrollDepartment: (cycleId, enrollData) => api.post(`/admin/cycles/${cycleId}/enroll-department`, enrollData),
  getEnrollments: (cycleId) => api.get(`/admin/cycles/${cycleId}/enrollments`),

  // User Management
  deactivateUser: (userId) => api.post(`/admin/users/${userId}/deactivate`),
  resetPassword: (passwordData) => api.post('/admin/users/reset-password', passwordData),

  // Offers Management
  overrideOffer: (offerId, overrideData) => api.post(`/admin/offers/${offerId}/override`, overrideData),

  // System Configuration
  getSystemConfig: () => api.get('/admin/system-config'),
  updateSystemConfig: (configData) => api.put('/admin/system-config', configData),

  // Audit Logs
  getAuditLogs: (limit = 100, offset = 0) => 
    api.get('/admin/audit-logs', { params: { limit, offset } }),

  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),

  // Cache Management
  getCacheStats: () => api.get('/admin/cache/stats'),
  clearCache: () => api.post('/admin/cache/clear'),
  resetCacheStats: () => api.post('/admin/cache/reset-stats'),
};

export default api;
export { api };

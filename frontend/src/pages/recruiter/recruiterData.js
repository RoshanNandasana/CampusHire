const REQUESTS_STORAGE_KEY = 'campusHireCompanyRequests';
const RECRUITER_APPLICATIONS_KEY = 'campusHireRecruiterApplications';

const COMPANY_BY_ID = {
  TECHNOVA: 'TechNova Systems',
  DATASPRING: 'DataSpring Labs',
  DEFAULT: 'Recruiter Company',
};

const toCompanyId = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_') || 'DEFAULT';

const inferCompanyIdFromEmail = (email) => {
  const local = String(email || '').toLowerCase();
  if (local.includes('technova') || local.includes('recruiter')) return 'TECHNOVA';
  if (local.includes('dataspring') || local.includes('ds')) return 'DATASPRING';
  return 'DEFAULT';
};

export const getRecruiterScope = (user) => {
  const recruiterId =
    String(user?.recruiterId || user?.email || user?.id || 'recruiter').toLowerCase();
  const companyId = toCompanyId(user?.companyId || inferCompanyIdFromEmail(user?.email));
  const companyName = user?.companyName || COMPANY_BY_ID[companyId] || COMPANY_BY_ID.DEFAULT;

  return {
    recruiterId,
    companyId,
    companyName,
  };
};

const normalizeRound = (round, index) => ({
  id: round.id || `round-${index + 1}`,
  name: round.name || `Round ${index + 1}`,
  date: round.date || '',
  time: round.time || '',
  mode: round.mode || 'Online',
  status: round.status || 'scheduled',
  feedback: round.feedback || '',
});

const normalizeRequest = (request) => ({
  id: request.id,
  company: request.company || 'Company',
  position: request.position || request.title || 'Role',
  openings: Number(request.openings) || 1,
  location: request.location || 'Not specified',
  ctc: request.ctc || request.salary || 'Not specified',
  minCGPA: Number(request.minCGPA) || 0,
  skills: Array.isArray(request.skills)
    ? request.skills
    : String(request.skills || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
  bondDurationMonths: Number(request.bondDurationMonths) || 0,
  bondDetails: request.bondDetails || 'No bond details shared.',
  driveDate: request.driveDate || '',
  deadline: request.deadline || '',
  contactName: request.contactName || '',
  contactRole: request.contactRole || '',
  contactEmail: request.contactEmail || '',
  contactPhone: request.contactPhone || '',
  description: request.description || '',
  selectionProcess: Array.isArray(request.selectionProcess)
    ? request.selectionProcess
    : String(request.selectionProcess || '')
        .split(',')
        .map((step) => step.trim())
        .filter(Boolean),
  roundSchedule: Array.isArray(request.roundSchedule)
    ? request.roundSchedule.map(normalizeRound)
    : [],
  requiredDocuments: Array.isArray(request.requiredDocuments)
    ? request.requiredDocuments
    : [],
  jobDescriptionFileName: request.jobDescriptionFileName || '',
  bondAgreementFileName: request.bondAgreementFileName || '',
  approvalStatus: request.approvalStatus || 'pending',
  companyId: request.companyId || toCompanyId(request.company),
  recruiterId: String(request.recruiterId || request.createdByRecruiterId || request.contactEmail || 'recruiter').toLowerCase(),
  createdBy: request.createdBy || 'recruiter',
  createdAt: request.createdAt || new Date().toISOString(),
});

const DEFAULT_REQUESTS = [
  {
    id: 101,
    company: 'TechNova Systems',
    companyId: 'TECHNOVA',
    recruiterId: 'recruiter@example.com',
    position: 'Software Engineer',
    openings: 18,
    location: 'Bangalore',
    ctc: '12 LPA',
    minCGPA: 7.0,
    skills: ['React', 'Node.js', 'SQL'],
    bondDurationMonths: 12,
    bondDetails: '12 month service commitment with training recovery clause.',
    driveDate: '2026-04-26',
    deadline: '2026-04-20',
    contactName: 'Karan Bhatia',
    contactRole: 'Campus Hiring Lead',
    contactEmail: 'campus@technova.com',
    contactPhone: '+91 98110 22011',
    description: 'Hiring full stack engineers for platform and internal tooling teams.',
    selectionProcess: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'HR Round'],
    roundSchedule: [
      { id: 'r1', name: 'Online Assessment', date: '2026-04-26', time: '10:00', mode: 'Online', status: 'scheduled' },
      { id: 'r2', name: 'Technical Round 1', date: '2026-04-29', time: '11:00', mode: 'Online', status: 'scheduled' },
      { id: 'r3', name: 'HR Round', date: '2026-05-03', time: '14:00', mode: 'Online', status: 'scheduled' },
    ],
    requiredDocuments: ['Resume PDF', '10th Marksheet PDF', '12th Marksheet PDF', 'Graduation Marksheet PDF', 'Bond Agreement PDF'],
    jobDescriptionFileName: 'technova_swe_jd.pdf',
    bondAgreementFileName: 'technova_12m_bond.pdf',
    approvalStatus: 'approved',
    createdBy: 'recruiter',
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 102,
    company: 'DataSpring Labs',
    companyId: 'DATASPRING',
    recruiterId: 'dataspring.hr@example.com',
    position: 'Data Analyst',
    openings: 12,
    location: 'Hyderabad',
    ctc: '10 LPA',
    minCGPA: 6.8,
    skills: ['Python', 'SQL', 'Power BI'],
    bondDurationMonths: 0,
    bondDetails: 'No bond required.',
    driveDate: '2026-05-05',
    deadline: '2026-04-28',
    contactName: 'Sonal Iyer',
    contactRole: 'Talent Partner',
    contactEmail: 'careers@dataspring.ai',
    contactPhone: '+91 98800 45677',
    description: 'Entry-level analyst roles across product analytics and growth teams.',
    selectionProcess: ['Aptitude Test', 'Case Round', 'HR Round'],
    roundSchedule: [
      { id: 'r1', name: 'Aptitude Test', date: '2026-05-05', time: '09:30', mode: 'Online', status: 'scheduled' },
      { id: 'r2', name: 'Case Round', date: '2026-05-07', time: '13:00', mode: 'Online', status: 'scheduled' },
    ],
    requiredDocuments: ['Resume PDF', 'Graduation Marksheet PDF', 'Job Description PDF'],
    jobDescriptionFileName: 'dataspring_da_jd.pdf',
    bondAgreementFileName: '',
    approvalStatus: 'pending',
    createdBy: 'recruiter',
    createdAt: '2026-03-04T10:15:00.000Z',
  },
];

const DEFAULT_APPLICATIONS = [
  {
    id: 'APP-TN-001',
    jobRequestId: 101,
    company: 'TechNova Systems',
    companyId: 'TECHNOVA',
    recruiterId: 'recruiter@example.com',
    position: 'Software Engineer',
    appliedAt: '2026-03-10',
    status: 'shortlisted',
    result: 'Shortlisted for technical round',
    student: {
      fullName: 'Aarav Patel',
      enrollmentNo: 'CH-2022-017',
      branch: 'Computer Science',
      year: 'Final Year',
      cgpa: 8.6,
      email: 'aarav.patel@college.edu',
      phone: '+91 99911 22334',
      city: 'Ahmedabad',
      skills: ['React', 'Node.js', 'MongoDB', 'DSA'],
      links: {
        linkedin: 'https://linkedin.com/in/aarav-patel',
        github: 'https://github.com/aarav-patel',
      },
    },
    academics: {
      tenth: '93%',
      twelfth: '89%',
      graduation: 'CGPA 8.6',
      activeBacklogs: 0,
    },
    documents: [
      { name: 'Resume', fileName: 'aarav_resume.pdf', status: 'verified' },
      { name: '10th Marksheet', fileName: 'aarav_10th.pdf', status: 'verified' },
      { name: '12th Marksheet', fileName: 'aarav_12th.pdf', status: 'verified' },
      { name: 'Graduation Marksheet', fileName: 'aarav_sem7.pdf', status: 'verified' },
    ],
    rounds: [
      { name: 'Online Assessment', date: '2026-03-14', time: '10:00', mode: 'Online', status: 'completed', feedback: 'Strong problem solving.' },
      { name: 'Technical Round 1', date: '2026-03-19', time: '11:30', mode: 'Online', status: 'scheduled', feedback: '' },
    ],
    notes: 'Strong backend profile with internship experience.',
    contactedAt: '2026-03-12T12:00:00.000Z',
  },
  {
    id: 'APP-TN-002',
    jobRequestId: 101,
    company: 'TechNova Systems',
    companyId: 'TECHNOVA',
    recruiterId: 'recruiter@example.com',
    position: 'Software Engineer',
    appliedAt: '2026-03-11',
    status: 'interview',
    result: 'Interview in progress',
    student: {
      fullName: 'Diya Nair',
      enrollmentNo: 'CH-2022-044',
      branch: 'Information Technology',
      year: 'Final Year',
      cgpa: 8.2,
      email: 'diya.nair@college.edu',
      phone: '+91 99888 55667',
      city: 'Pune',
      skills: ['Java', 'Spring Boot', 'SQL', 'Docker'],
      links: {
        linkedin: 'https://linkedin.com/in/diya-nair',
        github: 'https://github.com/diya-nair',
      },
    },
    academics: {
      tenth: '91%',
      twelfth: '87%',
      graduation: 'CGPA 8.2',
      activeBacklogs: 0,
    },
    documents: [
      { name: 'Resume', fileName: 'diya_resume.pdf', status: 'verified' },
      { name: '10th Marksheet', fileName: 'diya_10th.pdf', status: 'verified' },
      { name: '12th Marksheet', fileName: 'diya_12th.pdf', status: 'verified' },
      { name: 'Graduation Marksheet', fileName: 'diya_sem7.pdf', status: 'pending' },
    ],
    rounds: [
      { name: 'Online Assessment', date: '2026-03-14', time: '10:00', mode: 'Online', status: 'completed', feedback: 'Qualified.' },
      { name: 'Technical Round 1', date: '2026-03-19', time: '12:30', mode: 'Online', status: 'completed', feedback: 'Good coding speed.' },
      { name: 'Technical Round 2', date: '2026-03-22', time: '15:00', mode: 'Online', status: 'scheduled', feedback: '' },
    ],
    notes: 'Needs clarification on final semester marksheet.',
    contactedAt: '2026-03-13T09:20:00.000Z',
  },
  {
    id: 'APP-DS-001',
    jobRequestId: 102,
    company: 'DataSpring Labs',
    companyId: 'DATASPRING',
    recruiterId: 'dataspring.hr@example.com',
    position: 'Data Analyst',
    appliedAt: '2026-03-15',
    status: 'applied',
    result: 'Application received',
    student: {
      fullName: 'Kunal Shah',
      enrollmentNo: 'CH-2022-063',
      branch: 'Computer Science',
      year: 'Final Year',
      cgpa: 7.9,
      email: 'kunal.shah@college.edu',
      phone: '+91 99777 33441',
      city: 'Surat',
      skills: ['Python', 'SQL', 'Tableau'],
      links: {
        linkedin: 'https://linkedin.com/in/kunal-shah',
        github: 'https://github.com/kunal-shah',
      },
    },
    academics: {
      tenth: '88%',
      twelfth: '86%',
      graduation: 'CGPA 7.9',
      activeBacklogs: 0,
    },
    documents: [
      { name: 'Resume', fileName: 'kunal_resume.pdf', status: 'verified' },
      { name: 'Graduation Marksheet', fileName: 'kunal_sem7.pdf', status: 'verified' },
    ],
    rounds: [
      { name: 'Aptitude Test', date: '2026-05-05', time: '09:30', mode: 'Online', status: 'scheduled', feedback: '' },
    ],
    notes: 'Awaiting first round.',
    contactedAt: '',
  },
  {
    id: 'APP-TN-003',
    jobRequestId: 101,
    company: 'TechNova Systems',
    companyId: 'TECHNOVA',
    recruiterId: 'recruiter@example.com',
    position: 'Software Engineer',
    appliedAt: '2026-03-09',
    status: 'offer',
    result: 'Offer released',
    student: {
      fullName: 'Nisha Verma',
      enrollmentNo: 'CH-2022-005',
      branch: 'Computer Science',
      year: 'Final Year',
      cgpa: 9.1,
      email: 'nisha.verma@college.edu',
      phone: '+91 99666 77889',
      city: 'Vadodara',
      skills: ['Go', 'System Design', 'Kubernetes'],
      links: {
        linkedin: 'https://linkedin.com/in/nisha-verma',
        github: 'https://github.com/nisha-verma',
      },
    },
    academics: {
      tenth: '95%',
      twelfth: '93%',
      graduation: 'CGPA 9.1',
      activeBacklogs: 0,
    },
    documents: [
      { name: 'Resume', fileName: 'nisha_resume.pdf', status: 'verified' },
      { name: '10th Marksheet', fileName: 'nisha_10th.pdf', status: 'verified' },
      { name: '12th Marksheet', fileName: 'nisha_12th.pdf', status: 'verified' },
      { name: 'Graduation Marksheet', fileName: 'nisha_sem7.pdf', status: 'verified' },
    ],
    rounds: [
      { name: 'Online Assessment', date: '2026-03-14', time: '10:00', mode: 'Online', status: 'completed', feedback: 'Top 5 percentile.' },
      { name: 'Technical Round 1', date: '2026-03-18', time: '11:00', mode: 'Online', status: 'completed', feedback: 'Excellent architecture discussion.' },
      { name: 'HR Round', date: '2026-03-21', time: '15:00', mode: 'Online', status: 'completed', feedback: 'Offer recommended.' },
    ],
    notes: 'High-priority candidate for immediate onboarding.',
    contactedAt: '2026-03-22T08:45:00.000Z',
  },
];

const parseSafe = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    return fallback;
  }
};

export const getRecruiterRequests = () => {
  const stored = parseSafe(localStorage.getItem(REQUESTS_STORAGE_KEY), []);
  const source = Array.isArray(stored) && stored.length ? stored : DEFAULT_REQUESTS;
  const normalized = source.map(normalizeRequest);
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const saveRecruiterRequests = (requests) => {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests.map(normalizeRequest)));
};

export const getRecruiterApplications = () => {
  const stored = parseSafe(localStorage.getItem(RECRUITER_APPLICATIONS_KEY), []);
  const source = Array.isArray(stored) && stored.length ? stored : DEFAULT_APPLICATIONS;
  localStorage.setItem(RECRUITER_APPLICATIONS_KEY, JSON.stringify(source));
  return source;
};

export const saveRecruiterApplications = (applications) => {
  localStorage.setItem(RECRUITER_APPLICATIONS_KEY, JSON.stringify(applications));
};

export const getScopedRequestsForRecruiter = (requests, scope) => {
  return requests.filter(
    (request) =>
      request.companyId === scope.companyId ||
      request.recruiterId === scope.recruiterId
  );
};

export const getScopedApplicationsForRecruiter = (applications, scopedRequests, scope) => {
  const requestIdSet = new Set(scopedRequests.map((request) => request.id));
  return applications.filter(
    (app) =>
      requestIdSet.has(app.jobRequestId) ||
      app.companyId === scope.companyId ||
      app.recruiterId === scope.recruiterId
  );
};

export const getStatusLabel = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'shortlisted') return 'Shortlisted';
  if (value === 'interview') return 'Interview';
  if (value === 'offer') return 'Offer';
  if (value === 'rejected') return 'Rejected';
  return 'Applied';
};

export const getStatusClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'shortlisted') return 'badge-shortlisted';
  if (value === 'interview') return 'badge-interview';
  if (value === 'offer') return 'badge-offer';
  if (value === 'rejected') return 'badge-rejected';
  return 'badge-applied';
};

export const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export {
  REQUESTS_STORAGE_KEY,
  RECRUITER_APPLICATIONS_KEY,
};

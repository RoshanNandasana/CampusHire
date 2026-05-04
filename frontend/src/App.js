import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobListings from './pages/student/StudentJobListings';
import StudentApplications from './pages/student/StudentApplications';
import StudentResumeInsights from './pages/student/StudentResumeInsights';
import StudentPreparation from './pages/student/StudentPreparation';

// TPO Pages
import TPODashboard from './pages/tpo/TPODashboard';
import TPOStudents from './pages/tpo/TPOStudents';
import TPOJobs from './pages/tpo/TPOJobs';
import TPOApplications from './pages/tpo/TPOApplications';
import TPOAnalytics from './pages/tpo/TPOAnalytics';
import TPOMaterials from './pages/tpo/TPOMaterials';
import TPOStudentRegistration from './pages/tpo/TPOStudentRegistration';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterPostJob from './pages/recruiter/RecruiterPostJob';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterApplicants from './pages/recruiter/RecruiterApplicants';
import RecruiterOffers from './pages/recruiter/RecruiterOffers';

// Super Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTPOs from './pages/admin/ManageTPOs';
import ManageCompanies from './pages/admin/ManageCompanies';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageCycles from './pages/admin/ManageCycles';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminConfig from './pages/admin/AdminConfig';

// Styles
import './App.css';
import './styles/global.css';

function AppShell() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const hasSidebar = isAuthenticated && !isAuthPage;

  return (
    <div className={`app ${isAuthPage ? 'auth-layout' : ''} ${hasSidebar ? 'has-sidebar' : ''}`}>
      {!isAuthPage && <Navbar />}
      <div className={`app-container ${isAuthPage ? 'auth-app-container' : ''}`}>
        {hasSidebar && <Sidebar />}
        <main className={`main-content ${isAuthPage ? 'auth-main-content' : ''}`}>
          <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />
              <Route path="/student/jobs" element={<ProtectedRoute requiredRole="student"><StudentJobListings /></ProtectedRoute>} />
              <Route path="/student/applications" element={<ProtectedRoute requiredRole="student"><StudentApplications /></ProtectedRoute>} />
              <Route path="/student/resume-insights" element={<ProtectedRoute requiredRole="student"><StudentResumeInsights /></ProtectedRoute>} />
              <Route path="/student/preparation" element={<ProtectedRoute requiredRole="student"><StudentPreparation /></ProtectedRoute>} />

              {/* TPO Routes */}
              <Route path="/tpo/dashboard" element={<ProtectedRoute requiredRole="tpo"><TPODashboard /></ProtectedRoute>} />
              <Route path="/tpo/students" element={<ProtectedRoute requiredRole="tpo"><TPOStudents /></ProtectedRoute>} />
              <Route path="/tpo/jobs" element={<ProtectedRoute requiredRole="tpo"><TPOJobs /></ProtectedRoute>} />
              <Route path="/tpo/materials" element={<ProtectedRoute requiredRole="tpo"><TPOMaterials /></ProtectedRoute>} />
              <Route path="/tpo/student-registration" element={<ProtectedRoute requiredRole="tpo"><TPOStudentRegistration /></ProtectedRoute>} />
              <Route path="/tpo/applications" element={<ProtectedRoute requiredRole="tpo"><TPOApplications /></ProtectedRoute>} />
              <Route path="/tpo/analytics" element={<ProtectedRoute requiredRole="tpo"><TPOAnalytics /></ProtectedRoute>} />

              {/* Recruiter Routes */}
              <Route path="/recruiter/dashboard" element={<ProtectedRoute requiredRole="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="/recruiter/post-job" element={<ProtectedRoute requiredRole="recruiter"><RecruiterPostJob /></ProtectedRoute>} />
              <Route path="/recruiter/jobs" element={<ProtectedRoute requiredRole="recruiter"><RecruiterJobs /></ProtectedRoute>} />
              <Route path="/recruiter/applicants" element={<ProtectedRoute requiredRole="recruiter"><RecruiterApplicants /></ProtectedRoute>} />
              <Route path="/recruiter/offers" element={<ProtectedRoute requiredRole="recruiter"><RecruiterOffers /></ProtectedRoute>} />

              {/* Super Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="super_admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/tpos" element={<ProtectedRoute requiredRole="super_admin"><ManageTPOs /></ProtectedRoute>} />
              <Route path="/admin/companies" element={<ProtectedRoute requiredRole="super_admin"><ManageCompanies /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute requiredRole="super_admin"><ManageDepartments /></ProtectedRoute>} />
              <Route path="/admin/cycles" element={<ProtectedRoute requiredRole="super_admin"><ManageCycles /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="super_admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/config" element={<ProtectedRoute requiredRole="super_admin"><AdminConfig /></ProtectedRoute>} />

              {/* Redirect to login by default */}
              <Route path="/" element={isAuthenticated ? <Navigate to={`/${user?.role}/dashboard`} replace /> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to={isAuthenticated ? `/${user?.role}/dashboard` : '/login'} replace />} />
          </Routes>
        </main>
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;

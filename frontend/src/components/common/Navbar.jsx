import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdLogout, MdSchool, MdDashboard, MdPerson, MdPersonAdd } from 'react-icons/md';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || '';

  const getRoleDashboardPath = () => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'tpo') return '/tpo/dashboard';
    if (role === 'recruiter') return '/recruiter/dashboard';
    return '/';
  };

  const getRoleProfilePath = () => {
    if (role === 'student') return '/student/profile';
    if (role === 'tpo') return '/tpo/students';
    return '/recruiter/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to={getRoleDashboardPath()} className="navbar-logo">
            <MdSchool className="logo-icon" />
            <span className="logo-text">CampusHire</span>
          </Link>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-right">
            <div className="navbar-items">
              <span className="navbar-role">{role.toUpperCase()}</span>
              <Link to={getRoleDashboardPath()} className="navbar-link-pill">
                <MdDashboard />
                Dashboard
              </Link>
              <Link to={getRoleProfilePath()} className="navbar-link-pill">
                <MdPerson />
                {role === 'student' ? 'Profile' : 'Workspace'}
              </Link>
              {role === 'tpo' ? (
                <Link to="/tpo/student-registration" className="navbar-link-pill">
                  <MdPersonAdd />
                  Register Students
                </Link>
              ) : null}
            </div>

            <div className="navbar-user">
              {user ? (
                <>
                  <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-logout">
                    <MdLogout style={{ marginRight: '0.5rem' }} />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

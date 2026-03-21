import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MdDashboard, MdPerson, MdWork, MdAssignment, MdInsights,
  MdSchool, MdPeople, MdAnalytics, MdAdd, MdMenuBook,
  MdCardGiftcard
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const role = user?.role || '';

    if (role === 'student') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: MdDashboard },
        { label: 'Profile', path: '/student/profile', icon: MdPerson },
        { label: 'Job Listings', path: '/student/jobs', icon: MdWork },
        { label: 'My Applications', path: '/student/applications', icon: MdAssignment },
        { label: 'Resume Insights', path: '/student/resume-insights', icon: MdInsights },
        { label: 'Preparation', path: '/student/preparation', icon: MdSchool },
      ];
    }

    if (role === 'tpo') {
      return [
        { label: 'Dashboard', path: '/tpo/dashboard', icon: MdDashboard },
        { label: 'Students', path: '/tpo/students', icon: MdPeople },
        { label: 'Register Students', path: '/tpo/student-registration', icon: MdAdd },
        { label: 'Jobs', path: '/tpo/jobs', icon: MdWork },
        { label: 'Materials', path: '/tpo/materials', icon: MdMenuBook },
        { label: 'Applications', path: '/tpo/applications', icon: MdAssignment },
        { label: 'Analytics', path: '/tpo/analytics', icon: MdAnalytics },
      ];
    }

    if (role === 'recruiter') {
      return [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: MdDashboard },
        { label: 'Post Job', path: '/recruiter/post-job', icon: MdAdd },
        { label: 'My Jobs', path: '/recruiter/jobs', icon: MdWork },
        { label: 'Applicants', path: '/recruiter/applicants', icon: MdPeople },
        { label: 'Offers', path: '/recruiter/offers', icon: MdCardGiftcard },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <IconComponent className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

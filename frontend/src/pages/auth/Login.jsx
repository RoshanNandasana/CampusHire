import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = {
    student: { email: 'student@example.com', password: 'student123' },
    tpo: { email: 'tpo@example.com', password: 'tpo123' },
    recruiter: { email: 'recruiter@example.com', password: 'recruiter123' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Demo authentication
      const user = {
        id: Math.random().toString(36),
        email,
        name: email.split('@')[0],
        role,
        token: 'demo-token-' + Math.random().toString(36).substr(2, 9),
      };

      login(user);

      // Navigate based on role
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'tpo') navigate('/tpo/dashboard');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (selectedRole) => {
    const demo = demoAccounts[selectedRole];
    setEmail(demo.email);
    setPassword(demo.password);
    setRole(selectedRole);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎓 CampusHire</h1>
          <p>Campus Placement Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Login as</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              <option value="student">Student</option>
              <option value="tpo">TPO (Training & Placement Officer)</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-section">
          <h4>Demo Accounts</h4>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoLogin('student')}
            >
              <span className="demo-icon">👨‍🎓</span>
              <span>Student</span>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoLogin('tpo')}
            >
              <span className="demo-icon">👨‍💼</span>
              <span>TPO</span>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoLogin('recruiter')}
            >
              <span className="demo-icon">🏢</span>
              <span>Recruiter</span>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

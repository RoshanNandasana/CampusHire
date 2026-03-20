import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const sampleCredentials = [
    { role: 'Student', email: 'student@example.com', password: 'student123' },
    { role: 'TPO', email: 'tpo@example.com', password: 'tpo123' },
    { role: 'Recruiter', email: 'recruiter@example.com', password: 'recruiter123' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const authData = response?.data;
      if (!authData?.access_token || !authData?.role) {
        throw new Error('Invalid login response');
      }

      const user = {
        id: authData.user_id,
        email: authData.email,
        name: authData.email?.split('@')?.[0] || 'user',
        role: authData.role,
        token: authData.access_token,
        refreshToken: authData.refresh_token,
        studentId: authData.student_id,
        departmentId: authData.department_id,
      };

      login(user);

      // Navigate based on role
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'tpo') navigate('/tpo/dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const applySampleCredential = (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setShowPassword(false);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-shell">
        <div className="login-brand-panel">
          <div className="brand-mark">
            <span className="brand-icon" aria-hidden="true">CH</span>
            <span className="brand-name">campushire</span>
          </div>

          <div className="left-copy">
            <h2>Placement Office, Students and Recruiters in one flow.</h2>
            <p>
              Secure login for your hiring workflow with a clean and uniform panel design.
            </p>
          </div>

          <div className="campus-illustration" aria-hidden="true">
            <div className="desk"></div>
            <div className="desk-highlight"></div>
            <div className="person-left">
              <span className="head"></span>
              <span className="body"></span>
            </div>
            <div className="person-right">
              <span className="head"></span>
              <span className="body"></span>
            </div>
            <div className="plant"></div>
            <div className="floor-line"></div>
          </div>
        </div>

        <div className="login-box">
          <div className="auth-card">
            <div className="auth-content">
              <div className="login-header">
                <h1>Welcome Back :)</h1>
                <p>To stay connected, login with your email address and password.</p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Login ID / Email</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-meta-row">
                  <label className="remember-check">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button type="button" className="forgot-btn">Forgot password?</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary btn-full login-btn"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Login Now'}
                </button>

                <div className="demo-credentials" aria-label="Demo credentials">
                  <p>Demo Credentials</p>
                  <div className="demo-list">
                    {sampleCredentials.map((credential) => (
                      <button
                        key={credential.role}
                        type="button"
                        className="demo-item"
                        onClick={() => applySampleCredential(credential)}
                      >
                        <span className="demo-role">{credential.role}</span>
                        <span className="demo-email">{credential.email}</span>
                        <span className="demo-pass">{credential.password}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

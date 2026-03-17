import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
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

  const resolveRoleFromId = (loginId) => {
    const id = loginId.toLowerCase();
    if (id.includes('tpo')) return 'tpo';
    if (id.includes('recruiter') || id.includes('hr')) return 'recruiter';
    return 'student';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const role = resolveRoleFromId(email);

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
          <div className="brand-badge">CampusHire</div>
          <h2>Professional Placement Portal</h2>
          <p>
            Access your official account using assigned login ID and password.
            Built for students, TPO teams, and recruiters.
          </p>
          <ul>
            <li>Single secure login panel</li>
            <li>Real-time placement workflow visibility</li>
            <li>Role-specific dashboard access</li>
          </ul>
        </div>

        <div className="login-box">
          <div className="auth-card">
            <div className="login-header">
              <div className="login-logo">CH</div>
              <h1>Welcome Back</h1>
              <p>Sign in with your assigned credentials</p>
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
                  placeholder="Enter your login ID"
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
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="sample-credentials">
              <h4>Sample Credentials</h4>
              <div className="credentials-grid">
                {sampleCredentials.map((credential) => (
                  <button
                    key={credential.role}
                    type="button"
                    className="credential-card"
                    onClick={() => applySampleCredential(credential)}
                  >
                    <span className="cred-role">{credential.role}</span>
                    <span className="cred-id">{credential.email}</span>
                    <span className="cred-pass">{credential.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      login(data.token, {
        id: data.userId, email: data.email,
        fullName: data.fullName, role: data.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'user') setForm({ email: 'user@fintech.com', password: 'user1234' });
    else setForm({ email: 'admin@fintech.com', password: 'admin123' });
  };

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-card animate-fadeInUp">
        <div className="auth-logo">
          <div className="logo-icon">💳</div>
          <div>
            <h1 className="auth-brand">FintechIQ</h1>
            <p className="auth-tagline">Transaction Intelligence Platform</p>
          </div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your financial dashboard</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Signing in...</> : '→ Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <p className="demo-label">Quick Demo Access</p>
          <div className="demo-buttons">
            <button className="btn btn-ghost" onClick={() => fillDemo('user')}>👤 User Demo</button>
            <button className="btn btn-ghost" onClick={() => fillDemo('admin')}>🛡️ Admin Demo</button>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link><br/>
          Employee? <Link to="/request-access">Request Access</Link>
        </p>
      </div>
    </div>
  );
}

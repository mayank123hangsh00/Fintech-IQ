import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      login(data.token, {
        id: data.userId, email: data.email,
        fullName: data.fullName, role: data.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
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
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start your financial intelligence journey</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="John Doe"
              value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
          </div>
          <button id="reg-submit" type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Creating...</> : '→ Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

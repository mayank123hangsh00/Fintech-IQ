import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './Auth.css';

export default function RequestAccess() {
  const [form, setForm] = useState({ fullName: '', email: '', department: '', reason: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const res = await authApi.requestAccess(form);
      setStatus({ type: 'success', message: res.data });
      setForm({ fullName: '', email: '', department: '', reason: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to submit request.' });
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
            <p className="auth-tagline">Access Request portal</p>
          </div>
        </div>

        <h2 className="auth-title">Request Access</h2>
        <p className="auth-subtitle">Submit your details to receive a magic link</p>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Company Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="jane@fintech.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="Engineering / Finance / Ops"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason for Access</label>
            <textarea
              className="form-input"
              placeholder="Why do you need access?"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              rows="2"
              style={{ padding: '12px', resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Submitting...</> : '📤 Submit Request'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login">Sign In instead</Link>
        </p>
      </div>
    </div>
  );
}

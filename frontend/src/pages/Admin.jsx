import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { format } from 'date-fns';

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getUsers(), adminApi.getStats()])
      .then(([u, s]) => { setUsers(u.data); setStats(s.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>🛡️ Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Platform management and oversight</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers || 0}</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-label">Reports Generated</div>
          <div className="stat-value">{stats.totalReports || 0}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">System Status</div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald-light)', fontSize: 22 }}>✅ Healthy</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👥 Registered Users</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{users.length} users</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>#{u.id}</td>
                  <td><strong>{u.fullName}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-high' : 'badge-credit'}`}>
                      {u.role === 'ROLE_ADMIN' ? '🛡️ ADMIN' : '👤 USER'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

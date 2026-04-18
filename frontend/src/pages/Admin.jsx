import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { format } from 'date-fns';

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([adminApi.getUsers(), adminApi.getStats(), adminApi.getAccessRequests()])
      .then(([u, s, r]) => { setUsers(u.data); setStats(s.data); setRequests(r.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await adminApi.approveRequest(id);
      alert(`User approved! Give them this temporary password securely: ${res.data.tempPassword}`);
      loadData();
    } catch (e) {
      alert("Failed to approve: " + e.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectRequest(id);
      loadData();
    } catch (e) {
      alert("Failed to reject: " + e.response?.data?.message);
    }
  };

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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📥 Access Requests</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{requests.length} total</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Dept / Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No requests pending</td></tr>
              )}
              {requests.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.fullName}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.email}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    <div>{r.department}</div>
                    <div><i>{r.reason}</i></div>
                  </td>
                  <td>
                    <span className={`badge ${r.status === 'PENDING' ? 'badge-other' : r.status === 'INVITED' ? 'badge-credit' : 'badge-debit'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleApprove(r.id)} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>Approve</button>
                        <button onClick={() => handleReject(r.id)} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>Reject</button>
                      </div>
                    )}
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

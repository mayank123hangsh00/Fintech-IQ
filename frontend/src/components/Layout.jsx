import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/transactions', icon: '💳', label: 'Transactions' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/reports', icon: '📊', label: 'Reports' },
];

const ADMIN_NAV = [
  { to: '/admin', icon: '🛡️', label: 'Admin Panel' },
];

export default function Layout({ children, notifications, connected, dismissNotification }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💳</div>
          <div>
            <div className="sidebar-brand">FintechIQ</div>
            <div className="sidebar-sub">Intelligence Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="nav-divider" />
              {ADMIN_NAV.map(n => (
                <NavLink key={n.to} to={n.to}
                  className={({ isActive }) => `nav-item admin ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">{n.icon}</span>
                  <span>{n.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{isAdmin ? '🛡️ Admin' : '👤 User'}</div>
            </div>
          </div>
          <div className="connection-status">
            <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
            <span>{connected ? 'Live' : 'Offline'}</span>
          </div>
          <button className="btn btn-ghost logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Notification Banner */}
      {notifications.length > 0 && (
        <div className="notification-banner">
          {notifications.slice(0, 3).map(n => (
            <div key={n.id}
              className={`notification-item ${n.type === 'ANOMALY_ALERT' ? 'anomaly' : 'report'}`}
              onClick={() => dismissNotification(n.id)}>
              <span style={{ fontSize: 20 }}>{n.type === 'ANOMALY_ALERT' ? '🚨' : '📊'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.message}</div>
                {n.amount && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount: ₹{n.amount}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Click to dismiss</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSSE } from './hooks/useSSE';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import './index.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { notifications, connected, dismissNotification, connect } = useSSE();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout notifications={notifications} connected={connected} dismissNotification={dismissNotification}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Layout notifications={notifications} connected={connected} dismissNotification={dismissNotification}>
              <Transactions />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout notifications={notifications} connected={connected} dismissNotification={dismissNotification}>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout notifications={notifications} connected={connected} dismissNotification={dismissNotification}>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <Layout notifications={notifications} connected={connected} dismissNotification={dismissNotification}>
              <Admin />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

import { useEffect, useState } from 'react';
import { transactionApi, reportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { format } from 'date-fns';
import './Dashboard.css';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4','#ec4899','#84cc16'];

function formatCurrency(val) {
  if (!val) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, txRes, anomRes] = await Promise.all([
          transactionApi.getSummary(),
          transactionApi.getAll({ page: 0, size: 8 }),
          transactionApi.getAnomalies(),
        ]);
        setSummary(sumRes.data);
        setTransactions(txRes.data.content || []);
        setAnomalies(anomRes.data);
        try {
          const prevMonth = new Date();
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          const monthStr = format(prevMonth, 'yyyy-MM');
          const repRes = await reportApi.getMonthly(monthStr);
          setReport(repRes.data);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = summary?.categoryBreakdown
    ? Object.entries(summary.categoryBreakdown).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  if (loading) return (
    <div className="loader"><div className="spinner" /></div>
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header animate-fadeInUp">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},
            <span className="text-gradient"> {user?.fullName?.split(' ')[0]} 👋</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Here's your financial snapshot for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="header-badges">
          {anomalies.length > 0 && (
            <div className="anomaly-alert-badge">
              ⚠️ {anomalies.length} Alert{anomalies.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid animate-fadeInUp">
        <div className="stat-card emerald">
          <div className="stat-icon" style={{ fontSize: 48 }}>💰</div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald-light)' }}>
            {formatCurrency(summary?.totalIncome)}
          </div>
          <div className="stat-change">This month's credits</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon" style={{ fontSize: 48 }}>💸</div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ color: 'var(--accent-rose-light)' }}>
            {formatCurrency(summary?.totalExpenses)}
          </div>
          <div className="stat-change">This month's debits</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon" style={{ fontSize: 48 }}>📊</div>
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{
            color: summary?.netBalance >= 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)'
          }}>
            {formatCurrency(summary?.netBalance)}
          </div>
          <div className="stat-change">Income minus expenses</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon" style={{ fontSize: 48 }}>🔍</div>
          <div className="stat-label">Fraud Alerts</div>
          <div className="stat-value" style={{ color: anomalies.length > 0 ? 'var(--accent-rose-light)' : 'var(--accent-emerald-light)' }}>
            {anomalies.length}
          </div>
          <div className="stat-change">{summary?.totalTransactions || 0} total transactions</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row animate-fadeInUp">
        <div className="chart-container">
          <div className="chart-title">🗂️ Spending by Category</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-title">No expense data this month</div></div>
          )}
        </div>

        {/* Anomaly Alerts Panel */}
        <div className="chart-container anomaly-panel">
          <div className="chart-title">🚨 Anomaly Alerts</div>
          {anomalies.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div className="empty-title">All Clear!</div>
              <div className="empty-desc">No suspicious transactions detected</div>
            </div>
          ) : (
            <div className="anomaly-list">
              {anomalies.slice(0, 4).map(a => (
                <div key={a.id} className="anomaly-item">
                  <div className="anomaly-icon">⚠️</div>
                  <div className="anomaly-details">
                    <div className="anomaly-merchant">{a.merchant}</div>
                    <div className="anomaly-reason">{a.anomalyReason}</div>
                    <div className="anomaly-meta">
                      <span>{formatCurrency(a.amount)}</span>
                      <span className={`badge badge-${a.anomalySeverity?.toLowerCase()}`}>
                        {a.anomalySeverity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {anomalies.length > 4 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
                  +{anomalies.length - 4} more alerts
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card animate-fadeInUp">
        <div className="card-header">
          <h3 className="card-title">⏱️ Recent Transactions</h3>
          <a href="/transactions" className="view-all-link">View all →</a>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state"><div className="empty-title">No transactions yet</div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.merchant}</strong></td>
                    <td><span className={`badge badge-${t.category?.toLowerCase()}`}>{t.category}</span></td>
                    <td><span className={`badge badge-${t.type?.toLowerCase()}`}>{t.type}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {format(new Date(t.timestamp), 'dd MMM, hh:mm a')}
                    </td>
                    <td style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                      color: t.type === 'CREDIT' ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)'
                    }}>
                      {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td>
                      {t.anomalous
                        ? <span className="badge badge-anomaly">⚠️ Suspicious</span>
                        : <span style={{ color: 'var(--accent-emerald-light)', fontSize: 13 }}>✓ Normal</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Report Preview */}
      {report && (
        <div className="card ai-report-card animate-fadeInUp">
          <div className="card-header">
            <h3 className="card-title">🤖 AI Financial Insights — {report.reportMonth}</h3>
            <a href="/reports" className="view-all-link">Full Report →</a>
          </div>
          <div className="ai-insights-preview">
            {report.aiInsights?.substring(0, 400)}...
          </div>
          <div className="report-stats">
            <div className="report-stat">
              <span className="report-stat-label">Income</span>
              <span style={{ color: 'var(--accent-emerald-light)' }}>{formatCurrency(report.totalIncome)}</span>
            </div>
            <div className="report-stat">
              <span className="report-stat-label">Expenses</span>
              <span style={{ color: 'var(--accent-rose-light)' }}>{formatCurrency(report.totalSpend)}</span>
            </div>
            <div className="report-stat">
              <span className="report-stat-label">Savings</span>
              <span style={{ color: report.netSavings >= 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)' }}>
                {formatCurrency(report.netSavings)}
              </span>
            </div>
            <div className="report-stat">
              <span className="report-stat-label">Anomalies</span>
              <span style={{ color: report.anomalyCount > 0 ? 'var(--accent-rose-light)' : 'var(--accent-emerald-light)' }}>
                {report.anomalyCount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

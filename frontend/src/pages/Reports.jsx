import { useState, useEffect } from 'react';
import { reportApi } from '../services/api';
import { format } from 'date-fns';
import './Reports.css';

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMonth, setGenMonth] = useState('');
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    reportApi.getAll().then(({ data }) => {
      setReports(data);
      if (data.length > 0) {
        setSelected(data[0]);
        try { setCategoryData(JSON.parse(data[0].categoryBreakdown || '{}')); } catch {}
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectReport = (r) => {
    setSelected(r);
    try { setCategoryData(JSON.parse(r.categoryBreakdown || '{}')); } catch { setCategoryData({}); }
  };

  const generateReport = async () => {
    if (!genMonth) return;
    setGenerating(true);
    try {
      const { data } = await reportApi.generate(genMonth);
      setReports(prev => [data, ...prev.filter(r => r.reportMonth !== data.reportMonth)]);
      selectReport(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const savingsRate = selected?.totalIncome > 0
    ? ((selected.netSavings / selected.totalIncome) * 100).toFixed(1) : 0;

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Monthly Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI-generated financial health analysis</p>
        </div>
        <div className="gen-row">
          <input type="month" className="form-input" value={genMonth}
            onChange={e => setGenMonth(e.target.value)} style={{ width: 180 }} />
          <button className="btn btn-primary" onClick={generateReport} disabled={!genMonth || generating}>
            {generating ? '⏳ Generating...' : '🤖 Generate Report'}
          </button>
        </div>
      </div>

      <div className="reports-layout">
        {/* Report List */}
        <div className="reports-list card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>📅 Report History</h3>
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No reports yet</div>
              <div className="empty-desc">Generate your first monthly report above</div>
            </div>
          ) : reports.map(r => (
            <div key={r.id} className={`report-item ${selected?.id === r.id ? 'active' : ''}`}
              onClick={() => selectReport(r)}>
              <div className="report-month">{r.reportMonth}</div>
              <div className="report-preview">
                <span style={{ color: 'var(--accent-emerald-light)', fontSize: 13 }}>{formatCurrency(r.totalIncome)} in</span>
                <span style={{ color: 'var(--accent-rose-light)', fontSize: 13 }}> · {formatCurrency(r.totalSpend)} out</span>
              </div>
              {r.anomalyCount > 0 && (
                <span className="badge badge-anomaly" style={{ marginTop: 4 }}>⚠️ {r.anomalyCount} alerts</span>
              )}
            </div>
          ))}
        </div>

        {/* Report Detail */}
        {selected ? (
          <div className="report-detail">
            {/* Summary Stat Row */}
            <div className="report-stats-grid">
              <div className="stat-card emerald">
                <div className="stat-label">Total Income</div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald-light)' }}>
                  {formatCurrency(selected.totalIncome)}
                </div>
              </div>
              <div className="stat-card rose">
                <div className="stat-label">Total Expenses</div>
                <div className="stat-value" style={{ color: 'var(--accent-rose-light)' }}>
                  {formatCurrency(selected.totalSpend)}
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-label">Net Savings</div>
                <div className="stat-value" style={{ color: selected.netSavings >= 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)' }}>
                  {formatCurrency(selected.netSavings)}
                </div>
              </div>
              <div className="stat-card amber">
                <div className="stat-label">Savings Rate</div>
                <div className="stat-value" style={{ color: savingsRate > 20 ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)' }}>
                  {savingsRate}%
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryData).length > 0 && (
              <div className="card">
                <h3 className="chart-title">📊 Category Breakdown</h3>
                <div className="category-bars">
                  {Object.entries(categoryData).sort(([,a],[,b]) => b-a).map(([cat, amt]) => {
                    const max = Math.max(...Object.values(categoryData));
                    const pct = (amt / max * 100).toFixed(0);
                    return (
                      <div key={cat} className="category-bar-row">
                        <div className="cat-name">{cat}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="cat-amount">{formatCurrency(amt)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="card ai-insights-card">
              <h3 className="chart-title">🤖 AI Financial Insights</h3>
              <div className="ai-insight-meta">
                <span>Generated: {selected.generatedAt ? format(new Date(selected.generatedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}</span>
                <span>{selected.totalTransactions} transactions analyzed</span>
                {selected.anomalyCount > 0 && <span className="badge badge-anomaly">⚠️ {selected.anomalyCount} anomalies</span>}
              </div>
              <div className="ai-insight-text">{selected.aiInsights}</div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">Select a report</div>
              <div className="empty-desc">Choose from the list or generate a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

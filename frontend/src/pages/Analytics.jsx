import { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import { format, subMonths } from 'date-fns';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: 13 }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: 14, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          months.push(format(date, 'yyyy-MM'));
        }

        // Fetch all transactions
        const { data } = await transactionApi.getAll({ page: 0, size: 500 });
        const txns = data.content || [];

        // Build monthly chart data
        const monthly = months.map(month => {
          const monthTxns = txns.filter(t => t.timestamp?.startsWith(month));
          const income = monthTxns.filter(t => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
          const expenses = monthTxns.filter(t => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
          return {
            month: format(new Date(month + '-01'), 'MMM yy'),
            income: Math.round(income),
            expenses: Math.round(expenses),
            savings: Math.round(income - expenses),
            transactions: monthTxns.length,
          };
        });

        setMonthlyData(monthly);

        // Category aggregation
        const catMap = {};
        txns.filter(t => t.type === 'DEBIT').forEach(t => {
          catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
        });
        const catArr = Object.entries(catMap)
          .map(([name, value]) => ({ name, value: Math.round(value) }))
          .sort((a, b) => b.value - a.value);
        setCategoryData(catArr);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div>
        <h1 className="page-title" style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>📈 Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>6-month financial trends and spending patterns</p>
      </div>

      {/* Income vs Expenses Area Chart */}
      <div className="chart-container animate-fadeInUp">
        <div className="chart-title">💰 Income vs Expenses — 6 Month Trend</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2}
              fill="url(#incomeGrad)" name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2}
              fill="url(#expGrad)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Savings Line Chart */}
        <div className="chart-container animate-fadeInUp">
          <div className="chart-title">💎 Net Savings Trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar Chart */}
        <div className="chart-container animate-fadeInUp">
          <div className="chart-title">🗂️ Spending by Category (All Time)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]}
                fill="url(#barGrad)">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Transaction Count */}
      <div className="chart-container animate-fadeInUp">
        <div className="chart-title">📊 Monthly Transaction Volume</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="transactions" name="Transactions" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

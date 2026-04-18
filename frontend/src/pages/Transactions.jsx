import { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import { format } from 'date-fns';
import './Transactions.css';

function formatCurrency(val) {
  return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const CATEGORY_EMOJI = {
  FOOD: '🍔', TRANSPORT: '🚗', SHOPPING: '🛍️', UTILITIES: '⚡',
  ENTERTAINMENT: '🎬', HEALTH: '💊', SALARY: '💼', INVESTMENT: '📈', OTHER: '📦'
};

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filters, setFilters] = useState({ category: '', type: '' });
  const [addForm, setAddForm] = useState({
    amount: '', merchant: '', description: '', type: 'DEBIT'
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const totalPages = Math.ceil(total / 20);

  const load = async (p = page, f = filters) => {
    setLoading(true);
    try {
      const { data } = await transactionApi.getAll({ page: p, size: 20, ...f });
      setTxns(data.content || []);
      setTotal(data.totalElements || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0, filters); }, [filters]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setAddLoading(true);
    try {
      await transactionApi.create({ ...addForm, amount: parseFloat(addForm.amount) });
      setAddSuccess('✅ Transaction added! AI categorized it automatically.');
      setAddForm({ amount: '', merchant: '', description: '', type: 'DEBIT' });
      load(0, filters);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{total} total transactions</p>
        </div>
        <button id="add-txn-btn" className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Close' : '+ Add Transaction'}
        </button>
      </div>

      {/* Add Transaction */}
      {showAdd && (
        <div className="card add-form-card animate-fadeInUp">
          <h3 className="card-title" style={{ marginBottom: 20 }}>🤖 Add Transaction (AI will auto-categorize)</h3>
          {addError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{addError}</div>}
          {addSuccess && <div className="alert alert-success" style={{ marginBottom: 16 }}>{addSuccess}</div>}
          <form onSubmit={handleAdd} className="add-form">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input id="txn-amount" type="number" className="form-input" placeholder="1500"
                value={addForm.amount} onChange={e => setAddForm({...addForm, amount: e.target.value})} required min="0.01" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Merchant</label>
              <input id="txn-merchant" type="text" className="form-input" placeholder="Swiggy, Amazon..."
                value={addForm.merchant} onChange={e => setAddForm({...addForm, merchant: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input id="txn-desc" type="text" className="form-input" placeholder="Optional note"
                value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select id="txn-type" className="form-input" value={addForm.type}
                onChange={e => setAddForm({...addForm, type: e.target.value})}>
                <option value="DEBIT">💸 Debit (Expense)</option>
                <option value="CREDIT">💰 Credit (Income)</option>
              </select>
            </div>
            <button id="txn-submit" type="submit" className="btn btn-primary" disabled={addLoading}>
              {addLoading ? 'Processing...' : '🤖 Add & Analyze'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="form-group">
            <label className="form-label">Filter by Category</label>
            <select id="filter-category" className="form-input" value={filters.category}
              onChange={e => { setPage(0); setFilters({...filters, category: e.target.value, type: ''}); }}>
              <option value="">All Categories</option>
              {['FOOD','TRANSPORT','SHOPPING','UTILITIES','ENTERTAINMENT','HEALTH','SALARY','INVESTMENT','OTHER'].map(c => (
                <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Filter by Type</label>
            <select id="filter-type" className="form-input" value={filters.type}
              onChange={e => { setPage(0); setFilters({...filters, type: e.target.value, category: ''}); }}>
              <option value="">All Types</option>
              <option value="DEBIT">💸 Debit</option>
              <option value="CREDIT">💰 Credit</option>
            </select>
          </div>
          {(filters.category || filters.type) && (
            <button className="btn btn-ghost" onClick={() => setFilters({ category: '', type: '' })}>Clear Filters</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : txns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No transactions found</div>
            <div className="empty-desc">Try adjusting filters or add a new transaction</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>{page * 20 + i + 1}</td>
                    <td>
                      <div className="merchant-cell">
                        <span className="merchant-emoji">{CATEGORY_EMOJI[t.category] || '📦'}</span>
                        <div>
                          <div className="merchant-name">{t.merchant}</div>
                          {t.description && <div className="merchant-desc">{t.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${t.category?.toLowerCase()}`}>{t.category}</span></td>
                    <td><span className={`badge badge-${t.type?.toLowerCase()}`}>{t.type}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      <div>{format(new Date(t.timestamp), 'dd MMM yyyy')}</div>
                      <div style={{ fontSize: 11 }}>{format(new Date(t.timestamp), 'hh:mm a')}</div>
                    </td>
                    <td style={{
                      fontFamily: 'Space Grotesk', fontWeight: 600,
                      color: t.type === 'CREDIT' ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)',
                      fontSize: 15
                    }}>
                      {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td>
                      {t.anomalous ? (
                        <div>
                          <span className="badge badge-anomaly">⚠️ Flagged</span>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, maxWidth: 150 }}>
                            {t.anomalyReason}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--accent-emerald-light)', fontSize: 13 }}>✓ Clean</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => { setPage(Math.max(0, page-1)); load(Math.max(0,page-1), filters); }} disabled={page === 0}>←</button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => (
              <button key={i} className={`page-btn ${page === i ? 'active' : ''}`}
                onClick={() => { setPage(i); load(i, filters); }}>{i + 1}</button>
            ))}
            <button className="page-btn" onClick={() => { setPage(Math.min(totalPages-1, page+1)); load(Math.min(totalPages-1,page+1), filters); }} disabled={page === totalPages-1}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}

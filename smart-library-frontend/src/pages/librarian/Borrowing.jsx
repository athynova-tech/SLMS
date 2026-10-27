import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { borrowingApi } from '../../services/api';

const statusBadge = (status) => {
  const map = {
    BORROWED: 'bg-primary/10 text-primary',
    PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    DECLINED: 'bg-red-500/10 text-red-600 dark:text-red-400',
    OVERDUE: 'bg-red-500/10 text-red-600 dark:text-red-400',
    RETURNED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    LOST: 'bg-red-500/20 text-red-600 dark:text-red-400',
  };
  return map[status] || 'bg-muted text-muted-foreground';
};

const Toast = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {notifications.map((n, i) => (
        <div
          key={i}
          className="animate-in slide-in-from-right fade-in duration-300 bg-card border border-border rounded-xl shadow-xl p-4 flex items-start gap-3"
        >
          <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <span className="material-icons text-lg">notification_add</span>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">New Borrow Request</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n}</p>
          </div>
          <button onClick={() => onDismiss(i)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default function Borrowing() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [formData, setFormData] = useState({ userId: '', bookId: '', daysToBorrow: 14 });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toasts, setToasts] = useState([]);
  const sseRef = useRef(null);

  // Load records
  const fetchRecords = useCallback(async () => {
    try {
      const data = await borrowingApi.getAll();
      setRecords(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ─── SSE: real-time notifications ───
  useEffect(() => {
    if (!user || user.role !== 'LIBRARIAN') return;

    const connectSSE = () => {
      const eventSource = new EventSource('/api/notifications/subscribe');

      eventSource.addEventListener('connected', () => {
        console.log('SSE connected');
      });

      eventSource.addEventListener('new_request', (event) => {
        try {
          const data = JSON.parse(event.data);
          setToasts(prev => [...prev, data.message || 'New borrow request received']);
          // Auto-refresh the records list
          fetchRecords();
        } catch (e) {
          console.error('SSE parse error', e);
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
        // Reconnect after 5s
        setTimeout(connectSSE, 5000);
      };

      sseRef.current = eventSource;
    };

    connectSSE();
    return () => { if (sseRef.current) sseRef.current.close(); };
  }, [user, fetchRecords]);

  const filtered = (records || []).filter((r) =>
    (r.bookTitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.id?.toString() || '').includes(search)
  );

  const filteredByTab = activeTab === 'all' ? filtered
    : activeTab === 'pending' ? filtered.filter(r => r.status === 'PENDING')
    : activeTab === 'active' ? filtered.filter(r => r.status === 'BORROWED' || r.status === 'OVERDUE')
    : filtered.filter(r => r.status === 'RETURNED' || r.status === 'DECLINED');

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await borrowingApi.borrow(formData);
      await fetchRecords();
      setShowForm(false);
      setFormData({ userId: '', bookId: '', daysToBorrow: 14 });
      setSuccessMsg('Book checked out successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = async (id) => {
    setActionLoading(id);
    try {
      await borrowingApi.return(id);
      setRecords((prev) => prev.map((r) =>
        r.id === id ? { ...r, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0] } : r
      ));
      setSuccessMsg('Book returned successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await borrowingApi.approveBorrow(id);
      setRecords((prev) => prev.map((r) =>
        r.id === id ? { ...r, status: 'BORROWED', borrowDate: new Date().toISOString().split('T')[0] } : r
      ));
      setSuccessMsg('Borrow request approved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      await borrowingApi.declineBorrow(id);
      setRecords((prev) => prev.map((r) =>
        r.id === id ? { ...r, status: 'DECLINED' } : r
      ));
      setSuccessMsg('Borrow request declined');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = (records || []).filter(r => r.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Toast notifications */}
      <Toast notifications={toasts} onDismiss={(i) => setToasts(prev => prev.filter((_, idx) => idx !== i))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Borrowing Records</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage checkouts, returns, and member borrow requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-icons text-sm">add</span>
          New Checkout
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="material-icons text-sm">error</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500/60 hover:text-red-500">
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <span className="material-icons text-sm">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* New Checkout Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">New Checkout</h3>
          <form onSubmit={handleCheckout} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">User ID *</label>
              <input type="number" placeholder="Enter user ID" value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Book ID *</label>
              <input type="number" placeholder="Enter book ID" value={formData.bookId}
                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Days (1-30)</label>
              <input type="number" min={1} max={30} value={formData.daysToBorrow}
                onChange={(e) => setFormData({ ...formData, daysToBorrow: parseInt(e.target.value) || 14 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex items-end gap-2 lg:col-span-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-all">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-all">
                Create Checkout
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {[
          { key: 'pending', label: 'Pending Requests', badge: pendingCount, icon: 'pending_actions' },
          { key: 'active', label: 'Active', icon: 'auto_stories' },
          { key: 'all', label: 'All Records', icon: 'list' },
          { key: 'returned', label: 'History', icon: 'history' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="material-icons text-sm">{tab.icon}</span>
            {tab.label}
            {tab.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground material-icons text-sm">search</span>
        <input type="text" placeholder="Search by book title, member name, or transaction ID..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Book</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Member</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Borrow Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Due Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : filteredByTab.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <span className="material-icons text-3xl mb-2 block">inbox</span>
                  {activeTab === 'pending' ? 'No pending borrow requests — you\'re all caught up!' : 'No borrowing records found'}
                </td>
              </tr>
            ) : filteredByTab.map((r) => (
              <tr key={r.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{r.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.bookTitle || 'Unknown'}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.userName || 'Unknown'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.borrowDate || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.dueDate || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(r.status)}`}>
                    {r.status === 'OVERDUE' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(r.id)}
                          disabled={actionLoading === r.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1">
                          {actionLoading === r.id ? (
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <span className="material-icons text-xs">check</span>
                          )}
                          Approve
                        </button>
                        <button onClick={() => handleDecline(r.id)}
                          disabled={actionLoading === r.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-1">
                          <span className="material-icons text-xs">close</span>
                          Decline
                        </button>
                      </>
                    )}
                    {(r.status === 'BORROWED' || r.status === 'OVERDUE') && (
                      <button onClick={() => handleReturn(r.id)}
                        disabled={actionLoading === r.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center gap-1">
                        {actionLoading === r.id ? (
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <span className="material-icons text-xs">undo</span>
                        )}
                        Return
                      </button>
                    )}
                    {(r.status === 'RETURNED' || r.status === 'DECLINED') && (
                      <span className="text-xs text-muted-foreground px-3 py-1.5">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Real-time updates active — waiting for new requests
      </div>
    </div>
  );
}

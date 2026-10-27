import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { borrowingApi } from '../../services/api';

function Countdown({ dueDate }) {
  const [overdue, setOverdue] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!dueDate) return;
      const now = new Date();
      const due = new Date(dueDate);
      const diff = due - now;
      if (diff <= 0) {
        setOverdue(true);
        const overdueDays = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));
        setDays(overdueDays);
      } else {
        setOverdue(false);
        setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        setMins(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  if (overdue) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-bold animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {days > 0 ? `${days}d overdue` : 'Due today'}
      </div>
    );
  }

  const pct = dueDate ? Math.max(0, Math.min(100, (days / 14) * 100)) : 100;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{days}d {hours}h {mins}m left</span>
        <span className={`font-semibold ${days <= 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            days <= 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const coverColors = [
  ['from-blue-600/20 to-purple-600/20', '#6366f1', '#8b5cf6'],
  ['from-emerald-600/20 to-teal-600/20', '#10b981', '#14b8a6'],
  ['from-rose-600/20 to-orange-600/20', '#f43f5e', '#f97316'],
  ['from-cyan-600/20 to-blue-600/20', '#06b6d4', '#3b82f6'],
  ['from-violet-600/20 to-fuchsia-600/20', '#7c3aed', '#d946ef'],
  ['from-amber-600/20 to-red-600/20', '#d97706', '#ef4444'],
];

function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t, i) => (
        <div
          key={i}
          className={`animate-in slide-in-from-right fade-in duration-300 bg-card/95 backdrop-blur-md border rounded-2xl shadow-2xl p-4 flex items-start gap-3 ${
            t.type === 'success' ? 'border-emerald-500/30' : 'border-red-500/30'
          }`}
        >
          <span className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl ${
            t.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            <span className="material-icons text-lg">{t.type === 'success' ? 'check_circle' : 'cancel'}</span>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{t.type === 'success' ? 'Approved!' : 'Declined'}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.message}</p>
          </div>
          <button onClick={() => onDismiss(i)} className="shrink-0 text-muted-foreground hover:text-foreground transition-all">
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export default function MyBooks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);
  const [msg, setMsg] = useState(null);
  const [toasts, setToasts] = useState([]);
  const sseRef = useRef(null);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    try {
      const data = await borrowingApi.getActiveBorrows(user.id);
      setRecords(data || []);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load your books' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    (async () => { await fetchRecords(); })();
  }, [fetchRecords]);

  // SSE for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const connectSSE = () => {
      const eventSource = new EventSource(`/api/notifications/subscribe/user/${user.id}`);

      eventSource.addEventListener('connected', () => {});

      eventSource.addEventListener('request_approved', (event) => {
        try {
          const data = JSON.parse(event.data);
          setToasts(prev => [...prev, { type: 'success', message: data.message || 'Your request was approved!' }]);
          fetchRecords();
        } catch {
          // ignore malformed SSE payload
        }
      });

      eventSource.addEventListener('request_declined', (event) => {
        try {
          const data = JSON.parse(event.data);
          setToasts(prev => [...prev, { type: 'error', message: data.message || 'Your request was declined' }]);
          fetchRecords();
        } catch {
          // ignore malformed SSE payload
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
        setTimeout(connectSSE, 5000);
      };

      sseRef.current = eventSource;
    };

    connectSSE();
    return () => { if (sseRef.current) sseRef.current.close(); };
  }, [user?.id, fetchRecords]);

  const handleReturn = async (id) => {
    if (!user) return;
    setReturning(id);
    try {
      await borrowingApi.memberReturn(id, user.id);
      setRecords((prev) => prev.filter(r => r.id !== id));
      setMsg({ type: 'success', text: 'Book returned successfully!' });
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to return book' });
    } finally {
      setReturning(null);
    }
  };

  const active = records.filter(r => r.status === 'BORROWED' || r.status === 'OVERDUE');
  const pending = records.filter(r => r.status === 'PENDING');
  const hasHistory = records.filter(r => r.status === 'RETURNED' || r.status === 'DECLINED');

  const fine = (overdueDays) => {
    const rate = 1000;
    return (overdueDays * rate).toLocaleString();
  };

  const tabs = [
    { key: 'active', label: 'Active', icon: 'auto_stories', count: active.length },
    { key: 'pending', label: 'Requests', icon: 'pending_actions', count: pending.length },
    { key: 'history', label: 'History', icon: 'history', count: hasHistory.length },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <Toast toasts={toasts} onDismiss={(i) => setToasts(prev => prev.filter((_, idx) => idx !== i))} />

      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-bold text-foreground">My Books</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your borrowed books, requests, and reading history</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm border backdrop-blur-sm ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          <span className="material-icons text-sm">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100">
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/60">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 active:scale-95 ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <span className="material-icons text-sm">{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Borrows */}
      {activeTab === 'active' && (
        loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading your books...</p>
          </div>
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <span className="material-icons text-4xl">auto_stories</span>
            </div>
            <p className="text-base font-semibold text-foreground">No active borrows</p>
            <p className="text-sm mt-1">Go to Search Books to borrow something</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((r, idx) => {
              const overdueDays = r.dueDate && new Date(r.dueDate) < new Date()
                ? Math.abs(Math.floor((new Date() - new Date(r.dueDate)) / (1000 * 60 * 60 * 24)))
                : 0;
              return (
                <div
                  key={r.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Gradient cover strip — animated on hover */}
                  <div className={`h-12 bg-gradient-to-br ${coverColors[idx % coverColors.length][0]} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
                    {/* Animated shimmer overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" style={{
                      background: `linear-gradient(90deg, transparent 0%, ${coverColors[idx % coverColors.length][1]}40 25%, ${coverColors[idx % coverColors.length][2]}30 50%, ${coverColors[idx % coverColors.length][1]}40 75%, transparent 100%)`,
                    }} />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{r.bookTitle}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Borrowed {r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      {overdueDays > 0 && (
                        <div className="shrink-0 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-bold whitespace-nowrap ml-2 animate-pulse-glow">
                          {overdueDays > 1 ? `${overdueDays}d overdue` : '1 day overdue'}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <Countdown dueDate={r.dueDate} />
                    </div>

                    {overdueDays > 0 && (
                      <div className="mb-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-400">
                          <span className="font-bold">Fine accrued:</span> TZS {fine(overdueDays)} ({overdueDays}d × 1,000 TZS/day)
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/member/reader/${r.bookId}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-semibold hover:bg-amber-500/20 border border-amber-500/15 hover:border-amber-500/30 transition-all active:scale-[0.97]"
                      >
                        <span className="material-icons text-sm">menu_book</span>
                        Read Online
                      </button>
                      <button
                        onClick={() => handleReturn(r.id)}
                        disabled={returning === r.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-all active:scale-[0.97] disabled:opacity-40"
                      >
                        {returning === r.id ? (
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          <span className="material-icons text-sm">undo</span>
                        )}
                        Return Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <span className="material-icons text-4xl">pending_actions</span>
            </div>
            <p className="text-base font-semibold text-foreground">No pending requests</p>
            <p className="text-sm mt-1">Requests you submit will appear here until reviewed by a librarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((r, idx) => (
              <div key={r.id} className="group rounded-2xl border border-border bg-card p-5 flex items-center justify-between hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{r.bookTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Requested {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : 'today'}
                  </p>
                </div>
                <span className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 ml-3">
                  PENDING
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Book</th>
                <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Borrowed</th>
                <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Returned</th>
                <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {hasHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-muted-foreground">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <span className="material-icons text-3xl">history</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">No borrowing history yet</p>
                  </td>
                </tr>
              ) : hasHistory.map(r => (
                <tr key={r.id} className="hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">{r.bookTitle}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{r.borrowDate || '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{r.returnDate || r.actualReturnDate || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${
                      r.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
          <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Real-time updates active — you'll be notified when a librarian responds
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';

const typeIcons = {
  BORROW_REQUEST: 'swap_horiz',
  GENERAL: 'notifications',
  DUE_DATE_REMINDER: 'event',
  OVERDUE_REMINDER: 'warning',
  RESERVATION_AVAILABLE: 'bookmark',
  FINE: 'payments',
  SYSTEM: 'info',
};

const typeConfig = {
  BORROW_REQUEST: { color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', accent: 'border-l-blue-500', dot: 'bg-blue-500' },
  GENERAL: { color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50 dark:bg-gray-950/40', iconBg: 'bg-muted text-muted-foreground', accent: 'border-l-muted-foreground', dot: 'bg-muted-foreground' },
  DUE_DATE_REMINDER: { color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', accent: 'border-l-amber-500', dot: 'bg-amber-500' },
  OVERDUE_REMINDER: { color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-950/40', iconBg: 'bg-red-500/15 text-red-600 dark:text-red-400', accent: 'border-l-red-500', dot: 'bg-red-500' },
  RESERVATION_AVAILABLE: { color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', accent: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  FINE: { color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40', iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', accent: 'border-l-rose-500', dot: 'bg-rose-500' },
  SYSTEM: { color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40', iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400', accent: 'border-l-purple-500', dot: 'bg-purple-500' },
};

const typeLabels = {
  BORROW_REQUEST: 'Borrow Request',
  GENERAL: 'General',
  DUE_DATE_REMINDER: 'Due Soon',
  OVERDUE_REMINDER: 'Overdue',
  RESERVATION_AVAILABLE: 'Reservation',
  FINE: 'Fine',
  SYSTEM: 'System',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await notificationsApi.getAll(user.id, true);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await notificationsApi.getUnreadCount(user.id);
      const count = data?.count ?? 0;
      if (count > prevCount && prevCount > 0) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 600);
      }
      setPrevCount(count);
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, [user?.id, prevCount]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await notificationsApi.markAllRead(user.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all hover:text-on-surface hover:shadow-sm cursor-pointer group"
        title="Notifications"
      >
        <span className={`material-symbols-outlined text-xl transition-transform duration-200 ${animate ? 'animate-[swing_.6s_ease-in-out]' : ''}`}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-gradient-to-br from-error to-rose-500 text-[10px] font-extrabold text-white px-1 shadow-lg shadow-red-500/30 ${animate ? 'animate-[ping_.6s_ease-out_1]' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
        )}
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[99] md:hidden" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden z-[100] animate-in slide-in-from-right-2 fade-in duration-200">
            {/* Header gradient */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/30">
                    <span className="material-icons text-sm text-white">notifications</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="px-3 py-1.5 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all active:scale-95"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all active:scale-90"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto overscroll-contain divide-y divide-border/30 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-track]:bg-transparent">
              {loading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1 space-y-2.5 py-1">
                        <div className="h-3 bg-muted rounded w-3/5" />
                        <div className="h-2 bg-muted rounded w-full" />
                        <div className="h-2 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center mb-3 ring-1 ring-emerald-500/10">
                    <span className="material-icons text-3xl text-emerald-500/60">check_circle</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                </div>
              ) : (
                notifications.map((n, idx) => {
                  const cfg = typeConfig[n.type] || typeConfig.GENERAL;
                  return (
                    <div
                      key={n.id}
                      className={`relative flex items-start gap-3.5 px-5 py-4 transition-all cursor-pointer group/item
                        ${cfg.bg}
                        ${!n.isRead ? 'bg-opacity-60' : ''}
                        hover:bg-accent/50
                      `}
                      style={{ animation: `fadeInUp 0.3s ease-out ${idx * 40}ms both` }}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      {/* Left accent bar */}
                      {!n.isRead && (
                        <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${cfg.dot}`} />
                      )}

                      {/* Icon */}
                      <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-base shadow-sm transition-transform group-hover/item:scale-110 ${cfg.iconBg}`}>
                        <span className="material-icons text-base">
                          {typeIcons[n.type] || 'notifications'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-foreground' : 'text-foreground/70'}`}>
                            {n.title}
                          </p>
                          <span className="shrink-0 text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>

                        {/* Bottom row */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${cfg.bg} ${n.isRead ? 'opacity-50' : ''} ${cfg.iconBg.split(' ').slice(1).join(' ')}`}>
                            {typeLabels[n.type] || 'General'}
                          </span>
                          {!n.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                              className="text-[10px] font-medium text-muted-foreground/60 hover:text-primary px-1.5 py-0.5 rounded-md hover:bg-primary/10 transition-all opacity-0 group-hover/item:opacity-100 active:scale-90"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="shrink-0 mt-2">
                          <span className="block w-2 h-2 rounded-full ring-2 ring-background shadow-sm" style={{ backgroundColor: cfg.dot.replace('bg-', '#').replace('-500', '').replace('-400', '') }} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {(user?.role === 'admin' || user?.role === 'librarian') && (
              <a
                href={user?.role === 'admin' ? '/admin/notifications' : '/librarian/notifications'}
                className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-primary border-t border-border/30 bg-gradient-to-r from-primary/[0.02] to-transparent hover:from-primary/10 transition-all group"
              >
                <span>View all notifications</span>
                <span className="material-icons text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

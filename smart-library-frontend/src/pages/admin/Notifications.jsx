import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';
import NotificationCard from '../../components/notifications/NotificationCard';

const Notifications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function fetchNotifs() {
      try {
        const data = await notificationsApi.getAll(user.id);
        setNotifications(data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationsApi.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Map backend Notification to component props
  const mappedNotifications = notifications.map((n) => {
    const typeToIcon = {
      DUE_DATE_REMINDER: { icon: 'assignment_late', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
      OVERDUE_ALERT: { icon: 'assignment_late', iconColor: 'text-error', iconBg: 'bg-error-container/40' },
      RESERVATION_AVAILABLE: { icon: 'bookmark_add', iconColor: 'text-primary', iconBg: 'bg-primary-container/20' },
      NEW_ARRIVAL: { icon: 'bookmark_add', iconColor: 'text-secondary', iconBg: 'bg-secondary-container/20' },
      FINE_ALERT: { icon: 'payments', iconColor: 'text-error', iconBg: 'bg-error-container/30' },
      SYSTEM_ANNOUNCEMENT: { icon: 'campaign', iconColor: 'text-primary', iconBg: 'bg-primary-container/20' },
      BOOK_AVAILABLE: { icon: 'check_circle', iconColor: 'text-green-600', iconBg: 'bg-green-50' },
    };
    const viz = typeToIcon[n.type] || { icon: 'notifications', iconColor: 'text-on-surface-variant', iconBg: 'bg-surface-container' };
    return {
      id: n.id,
      icon: viz.icon,
      iconColor: viz.iconColor,
      iconBg: viz.iconBg,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
      time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
      read: n.isRead || n.read || false,
      important: ['OVERDUE_ALERT', 'SYSTEM_ANNOUNCEMENT', 'FINE_ALERT'].includes(n.type),
    };
  });

  const filteredNotifications = mappedNotifications.filter((n) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Important') return n.important;
    return true;
  });

  const unreadCount = mappedNotifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Notification Center</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Stay updated with the latest library activities</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-sm px-md py-sm rounded-lg border border-outline-variant text-body-sm text-on-surface font-medium
              hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">done_all</span>
            Mark All Read
          </button>
        )}
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading notifications...</p>}

      {/* Filter Tabs */}
      <div className="flex items-center gap-sm border-b border-outline-variant">
        {['All', 'Unread', 'Important'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-md py-sm text-body-sm font-medium transition-colors
              ${activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {tab}
            {tab === 'Unread' && unreadCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-xs font-bold">
                {unreadCount}
              </span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-md">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">notifications_off</span>
            <p className="text-body-sm text-on-surface-variant mt-md">No notifications to show.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification.id} onClick={() => !notification.read && markAsRead(notification.id)} className="cursor-pointer">
              <NotificationCard
                notification={notification}
                onDelete={() => deleteNotification(notification.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;

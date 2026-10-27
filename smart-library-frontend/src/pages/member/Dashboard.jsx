import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { borrowingApi, recommendationsApi } from '../../services/api';

const quickLinks = [
  { icon: 'menu_book', label: 'Browse Catalog', path: '/member/search' },
  { icon: 'psychology', label: 'AI Research Assistant', path: '/member/ai-assistant' },
  { icon: 'auto_stories', label: 'E-Book Reader', path: '/member/reader/1' },
  { icon: 'person', label: 'My Profile', path: '/member/profile' },
];

export default function MemberDashboard() {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    async function fetchData() {
      try {
        const [b, r] = await Promise.all([
          borrowingApi.getByUser(user.id).catch(() => []),
          recommendationsApi.getForUser(user.id).catch(() => []),
        ]);
        setBorrows(b || []);
        setRecommendations(r || []);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  const displayName = user?.name?.split(' ')[0] || 'Guest';
  const activeBorrows = borrows.filter((b) => b.status === 'BORROWED' || b.status === 'OVERDUE');
  const overdueCount = borrows.filter((b) => b.status === 'OVERDUE').length;
  const totalFines = borrows.reduce((sum, b) => sum + (b.fineAmount || 0), 0);

  const stats = [
    { icon: 'book_2', label: 'Books Borrowed', value: String(activeBorrows.length) },
    { icon: 'warning', label: 'Overdue', value: String(overdueCount) },
    { icon: 'payments', label: 'Fines Due', value: `$${totalFines.toFixed(2)}` },
    { icon: 'download', label: 'Digital Downloads', value: '0' },
  ];

  const recentActivity = borrows.slice(0, 4).map((b) => ({
    action: b.status === 'RETURNED' ? 'Returned' : 'Borrowed',
    item: b.bookTitle || 'Unknown',
    date: b.borrowDate || b.returnDate || '-',
  }));

  const calcProgress = (borrowDate, dueDate) => {
    if (!borrowDate || !dueDate) return 0;
    const start = new Date(borrowDate);
    const end = new Date(dueDate);
    const now = new Date();
    const total = (end - start) / (1000 * 60 * 60 * 24);
    const elapsed = (now - start) / (1000 * 60 * 60 * 24);
    return Math.min(100, Math.round((elapsed / total) * 100));
  };

  return (
    <div className="flex flex-col gap-lg p-lg max-w-7xl mx-auto">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Welcome back, {displayName}!</h1>
        <p className="text-body-sm text-on-surface-variant">Here's what's happening with your library account.</p>
      </div>

      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-xs rounded-xl border border-outline-variant bg-surface p-md text-center">
            <span className="material-symbols-outlined text-primary text-[28px]">{s.icon}</span>
            <span className="text-headline-lg font-bold text-on-surface">{s.value}</span>
            <span className="text-body-sm text-on-surface-variant">{s.label}</span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Currently Reading</h2>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
          {activeBorrows.length > 0 ? activeBorrows.slice(0, 3).map((b) => (
            <div key={b.id} className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface p-md">
              <div className="flex h-28 items-center justify-center rounded-lg bg-surface-container-high text-outline">
                <span className="material-symbols-outlined text-3xl">auto_stories</span>
              </div>
              <h3 className="text-title-md font-semibold text-on-surface truncate">{b.bookTitle || 'Unknown'}</h3>
              <p className="text-body-sm text-on-surface-variant truncate">Due: {b.dueDate || '-'}</p>
              <div className="flex items-center gap-sm">
                <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${b.status === 'OVERDUE' ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${b.borrowDate && b.dueDate ? calcProgress(b.borrowDate, b.dueDate) : 0}%` }} />
                </div>
                <span className={`text-label-lg font-medium ${b.status === 'OVERDUE' ? 'text-red-500' : 'text-primary'}`}>
                  {b.status === 'OVERDUE' ? 'Overdue' : `${calcProgress(b.borrowDate, b.dueDate)}%`}
                </span>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-lg text-on-surface-variant text-body-sm">
              No books currently borrowed. Browse the catalog to find your next read!
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Recent Activity</h2>
        <div className="rounded-xl border border-outline-variant divide-y divide-outline-variant/50">
          {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((a, i) => (
            <div key={i} className="flex items-center gap-md p-md">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                a.action === 'Borrowed' ? 'bg-blue-50 text-blue-600' :
                a.action === 'Returned' ? 'bg-green-50 text-green-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {a.action === 'Borrowed' ? 'book_2' : a.action === 'Returned' ? 'assignment_return' : 'bookmark'}
                </span>
              </span>
              <div className="flex-1">
                <p className="text-body-sm text-on-surface">
                  <span className="font-medium">{a.action}</span> — {a.item}
                </p>
                <p className="text-label-lg text-on-surface-variant">{a.date}</p>
              </div>
            </div>
          )) : (
            <div className="p-md text-center text-body-sm text-on-surface-variant">No recent activity</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Quick Links</h2>
        <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.path}
              className="flex flex-col items-center gap-sm rounded-xl border border-outline-variant bg-surface p-lg text-center hover:bg-surface-container-high transition">
              <span className="material-symbols-outlined text-[32px] text-primary">{link.icon}</span>
              <span className="text-body-sm font-medium text-on-surface">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

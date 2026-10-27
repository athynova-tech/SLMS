import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, borrowingApi } from '../../services/api';
import KPICard from '../../components/dashboard/KPICard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import { Link } from 'react-router-dom';

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBorrows, setRecentBorrows] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, recent] = await Promise.all([
          dashboardApi.getStats(),
          borrowingApi.getAll().then((d) => (d || []).slice(0, 6)),
        ]);
        setStats(s);
        setRecentBorrows(recent);
      } catch (err) {
        console.error('Failed to load librarian dashboard:', err);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const statCards = stats ? [
    { icon: 'book_2', label: 'Active Borrows', value: String(stats.activeBorrows || 0), trend: { direction: 'up', value: `${stats.borrowsThisMonth || 0} this month` }, color: 'primary' },
    { icon: 'warning', label: 'Overdue Items', value: String(stats.overdueBorrows || 0), trend: { direction: 'down', value: 'Needs attention' }, color: 'tertiary' },
    { icon: 'inventory_2', label: 'Available Books', value: String(stats.availableBooks || 0), trend: { direction: 'up', value: `${stats.totalBooks || 0} total` }, color: 'secondary' },
    { icon: 'assignment_return', label: "Today's Returns", value: String(stats.returnedBorrows || 0), trend: { direction: 'up', value: `${stats.returnsThisMonth || 0} this month` }, color: 'primary' },
  ] : [];

  const transactions = recentBorrows.map((b) => ({
    book: b.bookTitle || 'Unknown',
    member: b.userName || 'Unknown',
    date: b.borrowDate || '',
    dueDate: b.dueDate || '',
    status: b.status || 'BORROWED',
  }));

  return (
    <div className="flex flex-col gap-lg p-lg max-w-7xl mx-auto">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Good morning, {user?.name || 'Librarian'}</h1>
        <p className="text-body-sm text-on-surface-variant">{today}</p>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
        {statCards.length > 0 ? statCards.map((s, i) => (
          <KPICard key={i} icon={s.icon} label={s.label} value={s.value} trend={s.trend} color={s.color} />
        )) : Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface p-lg animate-pulse h-24" />
        ))}
      </div>

      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Recent Transactions</h2>
        <RecentActivity activities={transactions} />
      </div>

      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
          <Link to="/librarian/borrowing" className="flex flex-col items-center gap-sm rounded-xl border border-outline-variant bg-surface p-lg text-center hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined text-[32px] text-primary">add_shopping_cart</span>
            <span className="text-body-sm font-medium text-on-surface">Check Out Book</span>
          </Link>
          <Link to="/librarian/returns" className="flex flex-col items-center gap-sm rounded-xl border border-outline-variant bg-surface p-lg text-center hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined text-[32px] text-secondary">assignment_return</span>
            <span className="text-body-sm font-medium text-on-surface">Return Book</span>
          </Link>
          <Link to="/librarian/reservations" className="flex flex-col items-center gap-sm rounded-xl border border-outline-variant bg-surface p-lg text-center hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined text-[32px] text-tertiary">bookmark</span>
            <span className="text-body-sm font-medium text-on-surface">Reservations</span>
          </Link>
          <Link to="/librarian/inventory" className="flex flex-col items-center gap-sm rounded-xl border border-outline-variant bg-surface p-lg text-center hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined text-[32px] text-primary">inventory</span>
            <span className="text-body-sm font-medium text-on-surface">View Inventory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

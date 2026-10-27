import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../services/api';
import KPICard from '../../components/dashboard/KPICard';
import QuickActions from '../../components/dashboard/QuickActions';
import BorrowChart from '../../components/dashboard/BorrowChart';
import PieChart from '../../components/dashboard/PieChart';

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, popularData, recentData, monthlyChartData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getPopularBooks(4),
          dashboardApi.getRecentBorrows(8),
          dashboardApi.getMonthlyBorrows(7),
        ]);
        setStats(statsData);
        setPopularBooks(popularData);
        setRecentBorrows(recentData);
        setMonthlyData(monthlyChartData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // KPI data from live stats
  const kpiCards = stats
    ? [
        { icon: 'menu_book', label: 'Total Books', value: stats.totalBooks?.toLocaleString() || '0', trend: '+5.2%', up: true },
        { icon: 'people', label: 'Active Members', value: (stats.totalUsers ?? stats.activeUsers)?.toLocaleString() || '0', trend: '+2.1%', up: true },
        { icon: 'import_contacts', label: 'Borrowed This Month', value: (stats.borrowRecords ?? stats.borrowsThisMonth)?.toLocaleString() || '0', trend: '+12.3%', up: true },
        { icon: 'assignment_return', label: 'Overdue', value: (stats.activeBorrows ?? stats.overdueBorrows)?.toLocaleString() || '0', trend: stats.activeBorrows > 0 ? 'Needs attention' : 'None', up: false },
      ]
    : [];

  // Weekly data for chart (fall back to monthly if weekly unavailable)
  const weeklyData = monthlyData?.labels?.map((label, i) => ({
    day: label.substring(0, 3),
    count: monthlyData.values?.[i] ?? monthlyData.data?.[i],
  })) || [
    { day: 'Mon', count: 42 },
    { day: 'Tue', count: 56 },
    { day: 'Wed', count: 38 },
    { day: 'Thu', count: 61 },
    { day: 'Fri', count: 73 },
    { day: 'Sat', count: 89 },
    { day: 'Sun', count: 54 },
  ];

  // Recent activities from live data
  const activities = recentBorrows.length > 0
    ? recentBorrows.map((b) => ({
        book: b.bookTitle || 'Unknown',
        member: b.userName || 'Unknown',
        borrowed: b.borrowDate || '',
        due: b.dueDate || '',
        status: b.status || 'BORROWED',
      }))
    : [];

  const statusColors = {
    BORROWED: 'text-primary bg-primary-container/20',
    OVERDUE: 'text-error bg-error-container/30',
    RETURNED: 'text-tertiary bg-tertiary-container/20',
    LOST: 'text-on-error bg-error/80',
  };

  const quickActions = [
    { icon: 'library_add', label: 'Add Book', path: '/admin/books', color: 'from-primary to-primary-container' },
    { icon: 'person_add', label: 'Add Member', path: '/admin/members', color: 'from-secondary to-secondary-container' },
    { icon: 'summarize', label: 'Generate Report', path: '/admin/reports', color: 'from-tertiary to-tertiary-container' },
    { icon: 'view_list', label: 'View All Books', path: '/admin/books', color: 'from-primary-container to-primary' },
  ];

  // Popular books for pie chart (classifications)
  const totalB = stats?.totalBooks || 1;
  const borrowedB = stats?.activeBorrows ?? stats?.borrowedBooks ?? 0;
  const availableB = Math.max(0, totalB - borrowedB);
  const bookDistribution = [
    { label: 'Available', percentage: stats ? Math.round((availableB / totalB) * 100) : 75, color: 'primary' },
    { label: 'Borrowed', percentage: stats ? Math.round((borrowedB / totalB) * 100) : 15, color: 'secondary' },
    { label: 'Unavailable', percentage: 5, color: 'tertiary' },
  ];

  return (
    <div className="space-y-xl">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            {greeting}, {user?.name || 'Admin'}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">{today}</p>
        </div>
        {loading && <p className="text-body-sm text-on-surface-variant italic">Loading latest data...</p>}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} icon={kpi.icon} label={kpi.label} value={kpi.value} trend={kpi.trend} up={kpi.up} />
        ))}
      </div>

      {/* ── Monthly Borrows Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <div className="bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="text-title-md text-on-surface font-semibold mb-md">Monthly Borrows</h2>
          {weeklyData.length > 0 ? (
            <BorrowChart data={weeklyData.map(d => ({ label: d.day, value: d.count }))} height={200} />
          ) : (
            <p className="text-body-sm text-on-surface-variant">No data available yet.</p>
          )}
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="text-title-md text-on-surface font-semibold mb-md">Books Availability</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            {bookDistribution.map((item, i) => (
              <PieChart
                key={i}
                percentage={item.percentage}
                label={item.label}
                color={item.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity + Popular Books Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="text-title-md text-on-surface font-semibold mb-md">Recent Borrows</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-body-sm text-on-surface-variant border-b border-outline-variant">
                  <th className="py-sm pr-md font-medium">Book Title</th>
                  <th className="py-sm pr-md font-medium">Member</th>
                  <th className="py-sm pr-md font-medium">Borrowed</th>
                  <th className="py-sm pr-md font-medium">Due Date</th>
                  <th className="py-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.length > 0 ? (
                  activities.map((act, i) => (
                    <tr key={i} className="border-b border-outline-variant/50 last:border-0">
                      <td className="py-sm pr-md text-body-sm text-on-surface font-medium">{act.book}</td>
                      <td className="py-sm pr-md text-body-sm text-on-surface-variant">{act.member}</td>
                      <td className="py-sm pr-md text-body-sm text-on-surface-variant">{act.borrowed}</td>
                      <td className="py-sm pr-md text-body-sm text-on-surface-variant">{act.due}</td>
                      <td className="py-sm">
                        <span
                          className={`inline-flex items-center px-sm py-0.5 rounded-full text-xs font-medium
                            ${statusColors[act.status] || 'text-on-surface-variant bg-surface-container-high'}`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-lg text-center text-body-sm text-on-surface-variant">
                      {loading ? 'Loading...' : 'No recent borrows'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular books */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="text-title-md text-on-surface font-semibold mb-md">Popular Books</h2>
          <div className="space-y-sm">
            {popularBooks.length > 0 ? (
              popularBooks.map((book, i) => (
                <div key={i} className="flex items-center gap-sm p-sm bg-surface-container-low rounded-lg">
                  <span className="text-body-xs text-on-surface-variant font-mono w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-on-surface truncate">{book.title || book.name || 'Unknown'}</p>
                    {book.count && (
                      <p className="text-body-xs text-on-surface-variant">{book.count} borrows</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-on-surface-variant">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-title-md text-on-surface font-semibold mb-md">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {quickActions.map((action, i) => (
            <QuickActions key={i} icon={action.icon} label={action.label} path={action.path} color={action.color} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

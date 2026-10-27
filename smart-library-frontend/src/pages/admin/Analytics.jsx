import { useState, useEffect } from 'react';
import { analyticsApi, dashboardApi } from '../../services/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [topBorrowers, setTopBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s] = await Promise.allSettled([
          analyticsApi.getAdvancedStats().catch(() => null),
        ]);
        if (s.status === 'fulfilled') setStats(s.value);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return (
    <div className="p-lg space-y-lg">
      <div className="animate-pulse space-y-md">
        <div className="h-8 bg-surface-container-high rounded-lg w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-container-high rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-lg">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">
            Usage patterns, trends, and data-driven insights
          </p>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        {[
          { label: 'Total Books', value: stats?.totalBooks || '—', icon: 'menu_book', color: 'text-primary' },
          { label: 'Active Borrows', value: stats?.activeBorrows || '—', icon: 'import_contacts', color: 'text-secondary' },
          { label: 'Overdue Books', value: stats?.overdueBorrows || '—', icon: 'warning', color: stats?.overdueBorrows > 0 ? 'text-error' : 'text-on-surface-variant' },
          { label: 'Overdue Rate', value: stats?.overdueRate || '—', icon: 'trending_up', color: 'text-primary' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface border border-outline-variant rounded-xl p-md hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container/30 flex items-center justify-center">
                <span className={`material-symbols-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-label-lg text-on-surface-variant truncate">{kpi.label}</p>
                <p className="text-title-lg text-on-surface font-bold">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fetch more data note ── */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-xl text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-3xl text-primary">query_stats</span>
        </div>
        <h2 className="text-title-md text-on-surface font-bold mb-sm">Deep Analytics Dashboard</h2>
        <p className="text-body-sm text-on-surface-variant max-w-xl mx-auto mb-lg">
          Connect to the analytics backend to unlock peak hours tracking, borrowing projections, 
          weekday heatmaps, top borrower rankings, and reading pattern analysis.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-md max-w-2xl mx-auto">
          {[
            { icon: 'schedule', label: 'Peak Hours', desc: 'Track busy times' },
            { icon: 'calendar_month', label: 'Day Trends', desc: 'Borrows by weekday' },
            { icon: 'trending_up', label: 'Projections', desc: 'Forecast demand' },
            { icon: 'group', label: 'Top Borrowers', desc: 'Member rankings' },
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-outline-variant rounded-lg p-md text-center hover:shadow-sm transition-all">
              <span className="material-symbols-outlined text-primary text-2xl mb-xs">{item.icon}</span>
              <p className="text-label-sm font-medium text-on-surface">{item.label}</p>
              <p className="text-label-xs text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Borrowers ── */}
      <div className="bg-surface border border-outline-variant rounded-xl p-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-title-md text-on-surface font-semibold">Top Borrowers</h2>
          <span className="text-label-lg text-on-surface-variant">{topBorrowers.length} members</span>
        </div>
        {topBorrowers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-body-sm text-on-surface-variant border-b border-outline-variant">
                  <th className="py-sm pr-md font-medium w-12">#</th>
                  <th className="py-sm pr-md font-medium">Name</th>
                  <th className="py-sm pr-md font-medium">Email</th>
                  <th className="py-sm font-medium text-right">Borrows</th>
                </tr>
              </thead>
              <tbody>
                {topBorrowers.map((b, i) => (
                  <tr key={i} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-sm pr-md">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                        ${i === 0 ? 'bg-amber-100 text-amber-700' :
                          i < 3 ? 'bg-slate-100 text-slate-600' :
                          'bg-surface-container text-on-surface-variant'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-sm pr-md text-body-sm text-on-surface font-medium">{b.name || b.fullName || '—'}</td>
                    <td className="py-sm pr-md text-body-sm text-on-surface-variant">{b.email || '—'}</td>
                    <td className="py-sm text-body-sm text-on-surface font-semibold text-right">{b.count || b.borrows || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-sm">person_off</span>
            <p className="text-body-sm">No borrowing activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

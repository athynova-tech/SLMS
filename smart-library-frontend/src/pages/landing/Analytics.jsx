import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/api';
import Footer from '../../components/common/Footer';

const API = 'http://localhost:8081/api';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-md hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-md">
        <div className={`w-12 h-12 ${color || 'bg-primary'}/10 rounded-xl flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${color || 'text-primary'}`}>{icon}</span>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">{label}</p>
          <p className="text-headline-sm font-bold text-on-surface">{value ?? '—'}</p>
          {sub && <p className="text-label-xs text-on-surface-variant">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, height = 200 }) {
  if (!data || data.length === 0) return <p className="text-on-surface-variant text-body-sm py-lg text-center">No data available</p>;
  const max = Math.max(...data.map((d) => d[valueKey] || 0));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <span className="text-label-xs text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">{d[valueKey]}</span>
          <div
            className="w-full bg-gradient-to-t from-primary to-primary-container rounded-t-md transition-all duration-300 hover:from-secondary hover:to-secondary-container cursor-pointer"
            style={{ height: `${max > 0 ? (d[valueKey] / max) * 100 : 0}%`, minHeight: d[valueKey] > 0 ? '8px' : '0' }}
          />
          <span className="text-label-xs text-on-surface-variant truncate w-full text-center">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [popular, setPopular] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/dashboard/stats`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${API}/dashboard/popular-books?limit=8`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${API}/dashboard/monthly-borrows?months=6`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ]).then(([statsRes, popRes, monthRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (popRes.status === 'fulfilled') setPopular(popRes.value);
      if (monthRes.status === 'fulfilled') {
        const data = monthRes.value;
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const now = new Date();
        const chartData = (data || []).map((d, i) => ({
          label: months[(now.getMonth() - (data.length - 1 - i) + 12) % 12],
          value: typeof d === 'object' ? (d.count ?? d.total ?? d) : d,
        }));
        setMonthly(chartData.length > 0 ? chartData : null);
      }
      setError(null);
    }).catch(() => setError('Could not load analytics data.'));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-desktop h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-md">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
            <span className="text-primary font-bold text-title-md">Smart Library System</span>
          </Link>
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-medium">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-surface via-surface to-surface-container-low py-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
            <span className="text-primary font-semibold text-label-lg">LIBRARY ANALYTICS</span>
          </div>
          <h1 className="text-display-lg font-bold text-on-surface mb-md">
            Library <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl mb-lg">
            Transparent performance metrics for our institution. Explore usage trends, popular titles, and operational insights.
          </p>

          {error && (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-4xl text-outline mb-md">error_outline</span>
              <p className="text-on-surface-variant">{error}</p>
            </div>
          )}

          {!error && (
            <>
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
                  <StatCard icon="menu_book" label="Total Books" value={stats.totalBooks || 0} sub={`${stats.totalCopies || 0} total copies`} color="bg-primary" />
                  <StatCard icon="people" label="Total Users" value={stats.totalUsers || 0} sub={`${stats.totalCategories || 0} categories`} color="bg-secondary" />
                  <StatCard icon="import_contacts" label="Available Books" value={stats.availableBooks || 0} sub="Ready to borrow" color="bg-tertiary" />
                  <StatCard icon="assignment_return" label="Overdue" value={stats.overdueBorrows || 0} sub="Needs attention" color="bg-error" />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-lg">
                {/* Monthly Borrows Chart */}
                <div className="bg-surface border border-outline-variant rounded-xl p-lg">
                  <h3 className="text-title-md font-bold text-on-surface mb-md">Monthly Borrows</h3>
                  {monthly ? (
                    <BarChart data={monthly} labelKey="label" valueKey="value" height={180} />
                  ) : (
                    <p className="text-on-surface-variant text-body-sm py-lg text-center">No borrowing data yet</p>
                  )}
                </div>

                {/* Popular Books */}
                <div className="bg-surface border border-outline-variant rounded-xl p-lg">
                  <h3 className="text-title-md font-bold text-on-surface mb-md">Popular Books</h3>
                  {popular.length > 0 ? (
                    <ul className="space-y-2">
                      {popular.slice(0, 6).map((book, i) => (
                        <li key={i} className="flex items-center gap-md p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-label-sm font-bold text-primary flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-medium text-on-surface truncate">
                              {book.title || book.bookTitle || 'Unknown'}
                            </p>
                            <p className="text-label-xs text-on-surface-variant">{book.author || ''}</p>
                          </div>
                          <span className="text-label-sm font-semibold text-primary">{book.borrowCount || book.count || 0}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-on-surface-variant text-body-sm py-lg text-center">No popularity data yet</p>
                  )}
                </div>
              </div>

              {/* Institution Stats */}
              <div className="mt-xl bg-surface-container-low rounded-xl p-lg border border-outline-variant">
                <div className="grid md:grid-cols-3 gap-lg text-center">
                  <div>
                    <p className="text-headline-lg font-bold text-primary">50+</p>
                    <p className="text-body-sm text-on-surface-variant">Partner Institutions</p>
                  </div>
                  <div>
                    <p className="text-headline-lg font-bold text-secondary">10K+</p>
                    <p className="text-body-sm text-on-surface-variant">Daily Active Users</p>
                  </div>
                  <div>
                    <p className="text-headline-lg font-bold text-tertiary">1.2M</p>
                    <p className="text-body-sm text-on-surface-variant">Digital Volumes</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

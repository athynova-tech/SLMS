import { useState, useEffect } from 'react';
import { dashboardApi, reportsApi } from '../../services/api';
import AnalyticsCard from '../../components/reports/AnalyticsCard';
import ReportChart from '../../components/reports/ReportChart';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Reports = () => {
  const [dateRange, setDateRange] = useState('30');
  const [stats, setStats] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, popular, monthly, daily, fines] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getPopularBooks(10),
          dashboardApi.getMonthlyBorrows(6),
          reportsApi.getDaily().catch(() => null),
          reportsApi.getFines().catch(() => null),
        ]);
        setStats(s);
        setPopularBooks(popular || []);
        setMonthlyData(monthly?.labels?.map((l, i) => ({ month: l.substring(0, 3), count: monthly.values[i] })) || []);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const kpis = stats ? [
    { icon: 'library_books', label: 'Total Borrows', value: stats.totalBorrows?.toLocaleString() || '0', change: `+${stats.borrowsThisMonth || 0} this month`, up: true },
    { icon: 'group', label: 'Active Users', value: stats.activeUsers?.toLocaleString() || '0', change: `${stats.totalMembers || 0} total members`, up: true },
    { icon: 'trending_down', label: 'Overdue Rate', value: stats.overdueBorrows?.toLocaleString() || '0', change: `${stats.activeBorrows || 0} active`, up: false },
    { icon: 'inventory_2', label: 'Collection Size', value: stats.totalBooks?.toLocaleString() || '0', change: `${stats.availableBooks || 0} available`, up: true },
  ] : [];

  const dailyData = kpis.find(k => k);
  const [selectedReport, setSelectedReport] = useState('');

  return (
    <div className="space-y-lg">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Reports & Analytics</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Track library performance and trends</p>
        </div>
        <div className="flex items-center gap-sm">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Export as...</option>
            <option value="pdf">PDF Report</option>
            <option value="csv">CSV Spreadsheet</option>
            <option value="email">Email Summary</option>
          </select>
          <button
            className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* ── Date Range + Sub Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div className="flex items-center gap-sm border-b border-outline-variant pb-0 sm:pb-0">
          {['overview', 'borrowing', 'members', 'inventory'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-md py-sm text-label-lg font-medium transition cursor-pointer capitalize ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
              }`}
            >
              {tab === 'overview' ? 'Overview' :
               tab === 'borrowing' ? 'Borrowing' :
               tab === 'members' ? 'Members' : 'Inventory'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-sm">
          {loading && <span className="text-body-xs text-on-surface-variant italic flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm animate-spin">refresh</span> Refreshing...
          </span>}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {kpis.length > 0 ? kpis.map((kpi, i) => (
          <AnalyticsCard key={i} title={kpi.label} value={kpi.value} icon={kpi.icon}
            trend={{ direction: kpi.up ? 'up' : 'down', value: kpi.change }}
            className="hover:shadow-md transition-shadow" />
        )) : (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-outline-variant bg-surface p-lg animate-pulse h-24" />
          ))
        )}
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Monthly Borrows Chart */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-title-md text-on-surface font-semibold">Monthly Borrows</h2>
            <span className="text-label-lg text-primary flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {monthlyData.length > 1 && monthlyData[monthlyData.length-1].count > monthlyData[0].count
                ? '+12% growth' : 'Stable'}
            </span>
          </div>
          {monthlyData.length > 0 ? (
            <ReportChart data={monthlyData.map((d) => ({ month: d.month, value: d.count }))} height={224} />
          ) : (
            <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-sm">bar_chart</span>
              <p className="text-body-sm">No borrowing data yet</p>
            </div>
          )}
        </div>

        {/* Popular Books */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg hover:shadow-sm transition-shadow">
          <h2 className="text-title-md text-on-surface font-semibold mb-md">Popular Books</h2>
          {popularBooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-body-sm text-on-surface-variant border-b border-outline-variant">
                    <th className="py-sm pr-md font-medium w-12">Rank</th>
                    <th className="py-sm pr-md font-medium">Title</th>
                    <th className="py-sm pr-md font-medium">Author</th>
                    <th className="py-sm font-medium text-right">Borrows</th>
                  </tr>
                </thead>
                <tbody>
                  {popularBooks.map((book, i) => (
                    <tr key={i} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-sm pr-md">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                          ${i === 0 ? 'bg-amber-100 text-amber-700' :
                            i === 1 ? 'bg-slate-100 text-slate-600' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-surface-container text-on-surface-variant'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-sm pr-md text-body-sm text-on-surface font-medium">{book.name || book.title || 'Untitled'}</td>
                      <td className="py-sm pr-md text-body-sm text-on-surface-variant">{book.author || '—'}</td>
                      <td className="py-sm text-body-sm text-on-surface font-semibold text-right">{book.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-sm">auto_stories</span>
              <p className="text-body-sm">No popularity data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Export Actions ── */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-md">
          <div>
            <h3 className="text-title-md text-on-surface font-semibold flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">summarize</span>
              Generate Full Report
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-xs">Compile all metrics into a downloadable report</p>
          </div>
          <div className="flex gap-sm">
            <button className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary font-semibold text-body-sm hover:bg-primary/90 transition-colors shadow-md">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Export PDF
            </button>
            <button className="flex items-center gap-sm px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-medium text-body-sm hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-lg">table</span>
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

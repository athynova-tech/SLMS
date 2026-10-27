import { useState, useEffect } from 'react';
import { seatApi, attendanceApi } from '../../services/api';

export default function SeatManagement() {
  const [tab, setTab] = useState('seats');
  const [reservations, setReservations] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [selectedDate, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'seats') {
        const data = await seatApi.getAllReservations(selectedDate);
        setReservations(data || []);
      } else {
        const [data, stats] = await Promise.all([
          attendanceApi.getDaily(selectedDate),
          attendanceApi.getStats(),
        ]);
        setAttendanceData(data || []);
        setAttendanceStats(stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: 'event_seat', label: 'Total Reservations', value: reservations.length, color: 'text-primary',
      bg: 'bg-primary-container/20', desc: tab === 'seats' ? 'For selected date' : '' },
    { icon: 'check_circle', label: tab === 'seats' ? 'Confirmed Seats' : "Today's Visitors",
      value: tab === 'seats' ? reservations.filter(r => r.status === 'confirmed').length : (attendanceStats.todayVisits || 0),
      color: 'text-green-600', bg: 'bg-green-50' },
    { icon: 'people', label: tab === 'seats' ? 'Unique Users' : 'Weekly Visitors',
      value: tab === 'seats' ? new Set(reservations.map(r => r.userEmail)).size : (attendanceStats.weeklyVisits || 0),
      color: 'text-secondary', bg: 'bg-secondary-container/20' },
    { icon: 'percent', label: 'Occupancy Rate',
      value: reservations.length > 0 ? Math.round((reservations.filter(r => r.status === 'confirmed').length / reservations.length) * 100) + '%' : '0%',
      color: 'text-on-surface-variant', bg: 'bg-surface-container-high' },
  ];

  return (
    <div className="space-y-lg">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Seats & Attendance</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Manage study room bookings and visitor tracking</p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm bg-surface border border-outline-variant rounded-lg px-md py-sm">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">calendar_today</span>
            <input type="date" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-body-sm text-on-surface focus:outline-none" />
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-sm border-b border-outline-variant pb-0">
        {[
          { id: 'seats', icon: 'event_seat', label: 'Seat Reservations' },
          { id: 'attendance', icon: 'badge', label: 'Attendance Tracking' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-sm px-md py-sm text-label-lg font-medium transition cursor-pointer ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface border border-outline-variant rounded-xl p-md hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-md">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-title-lg text-on-surface font-bold">{s.value}</p>
                <p className="text-label-lg text-on-surface-variant truncate">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Seats Tab ── */}
      {tab === 'seats' && (
        <>
          {loading ? (
            <div className="space-y-sm">{Array(4).fill(0).map((_, i) =>
              <div key={i} className="h-12 rounded-xl bg-surface-container-high animate-pulse" />)}
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-surface border border-outline-variant rounded-xl p-xl text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-3xl text-primary">event_seat</span>
              </div>
              <h3 className="text-title-md text-on-surface font-semibold mb-sm">No Seat Reservations</h3>
              <p className="text-body-sm text-on-surface-variant mb-md">No reservations found for {selectedDate}</p>
              <button onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }} className="px-lg py-sm rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                Try Tomorrow
              </button>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-md py-sm bg-surface-container-low border-b border-outline-variant">
                <p className="text-body-sm text-on-surface font-medium">{reservations.length} reservation(s)</p>
                <button onClick={loadData} className="flex items-center gap-xs text-label-sm text-primary hover:text-primary/80 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm">
                  <thead className="text-on-surface-variant">
                    <tr>
                      <th className="px-md py-sm font-medium">User</th>
                      <th className="px-md py-sm font-medium">Email</th>
                      <th className="px-md py-sm font-medium">Seat</th>
                      <th className="px-md py-sm font-medium">Room</th>
                      <th className="px-md py-sm font-medium">Time</th>
                      <th className="px-md py-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-md py-sm font-medium text-on-surface">{res.userName || res.user?.fullName || 'Unknown'}</td>
                        <td className="px-md py-sm text-on-surface-variant">{res.userEmail || res.user?.email || '—'}</td>
                        <td className="px-md py-sm">{res.seatNumber || res.seat?.number || '—'}</td>
                        <td className="px-md py-sm">{res.room || res.seat?.room || '—'}</td>
                        <td className="px-md py-sm text-on-surface-variant">
                          {res.startTime || res.timeFrom || '—'} – {res.endTime || res.timeTo || '—'}
                        </td>
                        <td className="px-md py-sm">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-label-xs font-medium ${
                            (res.status || '').toLowerCase() === 'confirmed' ? 'bg-green-50 text-green-700' :
                            (res.status || '').toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {res.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Attendance Tab ── */}
      {tab === 'attendance' && (
        <>
          {loading ? (
            <div className="space-y-sm">{Array(3).fill(0).map((_, i) =>
              <div key={i} className="h-12 rounded-xl bg-surface-container-high animate-pulse" />)}
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="bg-surface border border-outline-variant rounded-xl p-xl text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-3xl text-primary">badge</span>
              </div>
              <h3 className="text-title-md text-on-surface font-semibold mb-sm">No Attendance Records</h3>
              <p className="text-body-sm text-on-surface-variant">No check-ins recorded for {selectedDate}</p>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-md py-sm bg-surface-container-low border-b border-outline-variant">
                <p className="text-body-sm text-on-surface font-medium">{attendanceData.length} visitor(s)</p>
                <button onClick={loadData} className="flex items-center gap-xs text-label-sm text-primary hover:text-primary/80 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm">
                  <thead className="text-on-surface-variant">
                    <tr>
                      <th className="px-md py-sm font-medium">User</th>
                      <th className="px-md py-sm font-medium">Check In</th>
                      <th className="px-md py-sm font-medium">Check Out</th>
                      <th className="px-md py-sm font-medium">Duration</th>
                      <th className="px-md py-sm font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {attendanceData.map((rec) => (
                      <tr key={rec.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-md py-sm font-medium text-on-surface">{rec.user?.fullName || 'Unknown'}</td>
                        <td className="px-md py-sm text-on-surface-variant">{rec.checkInTime || '-'}</td>
                        <td className="px-md py-sm text-on-surface-variant">
                          {rec.checkOutTime ? (
                            <span className="text-on-surface-variant">{rec.checkOutTime}</span>
                          ) : (
                            <span className="flex items-center gap-xs text-green-600">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-md py-sm text-on-surface-variant">
                          {rec.checkInTime && rec.checkOutTime
                            ? calcDuration(rec.checkInTime, rec.checkOutTime)
                            : rec.checkInTime ? 'In progress' : '-'}
                        </td>
                        <td className="px-md py-sm">
                          <span className="rounded-full bg-surface-variant px-2 py-0.5 text-label-xs">
                            {(rec.method || 'QR_SCAN').replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function calcDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

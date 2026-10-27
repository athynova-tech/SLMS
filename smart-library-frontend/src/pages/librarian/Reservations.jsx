import { useState, useEffect } from 'react';
import { reservationsApi } from '../../services/api';

const statusFilters = ['All', 'Pending', 'Ready', 'Fulfilled', 'Cancelled'];

const statusBadge = (status) => {
  const map = {
    Pending: 'bg-amber-50 text-amber-700',
    Ready: 'bg-green-50 text-green-700',
    Fulfilled: 'bg-blue-50 text-blue-700',
    Cancelled: 'bg-red-50 text-red-600',
  };
  return map[status] || 'bg-surface-variant text-on-surface-variant';
};

export default function Reservations() {
  const [filter, setFilter] = useState('All');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    reservationsApi.getAll()
      .then((data) => setReservations(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? reservations
    : reservations.filter((r) => (r.status || '').toUpperCase() === filter.toUpperCase());

  const handleCancel = async (id) => {
    try {
      await reservationsApi.cancel(id, 1); // Will need actual user context
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Cancelled' } : r));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-lg p-lg max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface">Reservations</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-md text-body-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap gap-sm">
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-body-sm font-medium transition cursor-pointer ${
              filter === s
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="p-md font-medium">Reservation ID</th>
              <th className="p-md font-medium">Book Title</th>
              <th className="p-md font-medium">Member</th>
              <th className="p-md font-medium">Request Date</th>
              <th className="p-md font-medium">Status</th>
              <th className="p-md font-medium">Pickup By</th>
              <th className="p-md font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {loading ? (
              <tr><td colSpan={7} className="p-md text-center text-on-surface-variant">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-md text-center text-on-surface-variant">No reservations found</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-low">
                <td className="p-md font-mono text-label-lg text-on-surface-variant">{r.id}</td>
                <td className="p-md font-medium text-on-surface">{r.bookTitle || r.book?.title || '-'}</td>
                <td className="p-md text-on-surface-variant">{r.userName || r.user?.name || '-'}</td>
                <td className="p-md text-on-surface-variant">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : r.requestDate || '-'}</td>
                <td className="p-md">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-label-lg font-medium ${statusBadge(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-md text-on-surface-variant">{r.pickupBy || '-'}</td>
                <td className="p-md">
                  {r.status === 'Pending' && (
                    <button onClick={() => handleCancel(r.id)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-label-lg font-medium text-red-600 hover:bg-red-100 transition cursor-pointer">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

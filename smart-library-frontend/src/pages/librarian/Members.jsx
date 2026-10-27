import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';

const statusBadge = (status) => {
  const map = { 'ACTIVE': 'bg-green-50 text-green-700', 'SUSPENDED': 'bg-red-50 text-red-700', 'INACTIVE': 'bg-gray-50 text-gray-700' };
  return map[status] || 'bg-surface-variant text-on-surface-variant';
};

export default function Members() {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const data = await usersApi.getAll();
        setMembers(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (m.fullName || m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phoneNumber || m.phone || '').includes(q) ||
      (m.id?.toString() || '').includes(q);
  });

  if (loading) return <p className="text-body-sm text-on-surface-variant p-lg">Loading members...</p>;

  return (
    <div className="space-y-lg p-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Library Members</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">{members.length} registered members</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">error</span> {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input type="text" placeholder="Search by name, email, phone, or ID..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
            placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="p-md font-medium">#</th>
              <th className="p-md font-medium">Name</th>
              <th className="p-md font-medium">Email</th>
              <th className="p-md font-medium">Phone</th>
              <th className="p-md font-medium">Role</th>
              <th className="p-md font-medium">Status</th>
              <th className="p-md font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {filtered.map((m, i) => (
              <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                <td className="p-md text-on-surface-variant">{i + 1}</td>
                <td className="p-md font-medium text-on-surface">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-primary">person</span>
                    </div>
                    <span>{m.fullName || m.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="p-md text-on-surface-variant">{m.email || '—'}</td>
                <td className="p-md text-on-surface-variant">{m.phoneNumber || m.phone || '—'}</td>
                <td className="p-md">
                  <span className="rounded-full bg-surface-variant px-2 py-0.5 text-label-lg text-on-surface-variant">
                    {m.role || 'MEMBER'}
                  </span>
                </td>
                <td className="p-md">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-label-lg font-medium ${statusBadge(m.status || (m.suspended ? 'SUSPENDED' : 'ACTIVE'))}`}>
                    {m.status || (m.suspended ? 'Suspended' : 'Active')}
                  </span>
                </td>
                <td className="p-md text-on-surface-variant">
                  {m.joinedDate || m.createdAt ? new Date(m.joinedDate || m.createdAt).toLocaleDateString() : 'Recent'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-md text-center text-on-surface-variant">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

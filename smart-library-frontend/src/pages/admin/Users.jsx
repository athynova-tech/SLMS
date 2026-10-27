import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await usersApi.getAll();
        setUsers(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = roleFilter
    ? users.filter((u) => (u.role || '').toUpperCase() === roleFilter.toUpperCase())
    : users;

  const handleSuspend = async (id) => {
    try {
      await usersApi.suspend(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'SUSPENDED' } : u));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await usersApi.activate(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'ACTIVE' } : u));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-body-sm text-on-surface-variant">Loading users...</p>;

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <h1 className="text-headline-lg text-on-surface font-bold">User Management</h1>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="LIBRARIAN">Librarian</option>
          <option value="MEMBER">Member</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="p-md font-medium">ID</th>
              <th className="p-md font-medium">Name</th>
              <th className="p-md font-medium">Email</th>
              <th className="p-md font-medium">Role</th>
              <th className="p-md font-medium">Status</th>
              <th className="p-md font-medium">Joined</th>
              <th className="p-md font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-low">
                <td className="p-md font-mono text-label-lg text-on-surface-variant">{u.id}</td>
                <td className="p-md font-medium text-on-surface">{u.fullName || u.name}</td>
                <td className="p-md text-on-surface-variant">{u.email}</td>
                <td className="p-md">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-label-lg font-medium ${
                    u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                    u.role === 'LIBRARIAN' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-md">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-label-lg font-medium ${
                    (u.status === 'ACTIVE' || !u.status) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {u.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="p-md text-on-surface-variant">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="p-md">
                  <div className="flex gap-sm">
                    {(u.status === 'ACTIVE' || !u.status) ? (
                      <button onClick={() => handleSuspend(u.id)}
                        className="text-body-xs text-error font-medium hover:underline">Suspend</button>
                    ) : (
                      <button onClick={() => handleActivate(u.id)}
                        className="text-body-xs text-green-600 font-medium hover:underline">Activate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

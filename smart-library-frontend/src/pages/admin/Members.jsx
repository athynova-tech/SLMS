import { useState, useEffect } from 'react';
import { usersApi, authApi } from '../../services/api';
import MemberTable from '../../components/members/MemberTable';

const Members = () => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMember, setNewMember] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'MEMBER',
  });

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

  const filteredMembers = members.filter((m) =>
    (m.fullName || m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.id?.toString() || '').includes(search)
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await authApi.register(newMember);
      // Refresh list
      const data = await usersApi.getAll();
      setMembers(data);
      setShowAddForm(false);
      setNewMember({ fullName: '', email: '', phoneNumber: '', password: '', role: 'MEMBER' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSuspendMember = async (id) => {
    try {
      await usersApi.suspend(id);
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: 'SUSPENDED' } : m));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivateMember = async (id) => {
    try {
      await usersApi.activate(id);
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: 'ACTIVE' } : m));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await usersApi.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setNewMember((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Map backend UserResponse to what MemberTable expects
  const membersForTable = filteredMembers.map((m) => ({
    id: m.id,
    memberId: m.memberId || `MEM-${String(m.id).padStart(3, '0')}`,
    name: m.fullName || m.name,
    email: m.email,
    phone: m.phoneNumber || m.phone,
    type: m.membershipType || (m.role === 'ADMIN' ? 'Staff' : m.role === 'LIBRARIAN' ? 'Staff' : 'Standard'),
    status: m.status || (m.suspended ? 'Inactive' : 'Active'),
    joined: m.joinedDate || m.createdAt ? new Date(m.joinedDate || m.createdAt).toISOString().split('T')[0] : 'Recent',
    joinDate: m.joinedDate || m.createdAt ? new Date(m.joinedDate || m.createdAt).toISOString().split('T')[0] : 'Recent',
  }));

  const membershipTypes = ['MEMBER', 'LIBRARIAN', 'ADMIN'];

  if (loading) return <p className="text-body-sm text-on-surface-variant">Loading members...</p>;

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <h1 className="text-headline-lg text-on-surface font-bold">Members Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm
            hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">{showAddForm ? 'close' : 'person_add'}</span>
          {showAddForm ? 'Cancel' : 'Add New Member'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">error</span> {error}
        </div>
      )}

      {/* Add Member Form */}
      {showAddForm && (
        <div className="bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="text-title-md text-on-surface font-semibold mb-md">Add New Member</h2>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            <div>
              <label className="block text-body-sm text-on-surface font-medium mb-xs">Full Name *</label>
              <input type="text" name="fullName" value={newMember.fullName} onChange={handleChange} required
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-body-sm text-on-surface font-medium mb-xs">Email *</label>
              <input type="email" name="email" value={newMember.email} onChange={handleChange} required
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-body-sm text-on-surface font-medium mb-xs">Phone</label>
              <input type="text" name="phoneNumber" value={newMember.phoneNumber} onChange={handleChange}
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-body-sm text-on-surface font-medium mb-xs">Password *</label>
              <input type="password" name="password" value={newMember.password} onChange={handleChange} required
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-body-sm text-on-surface font-medium mb-xs">Role</label>
              <select name="role" value={newMember.role} onChange={handleChange}
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                {membershipTypes.map((t) => (
                  <option key={t} value={t}>{t === 'MEMBER' ? 'Member' : t === 'LIBRARIAN' ? 'Librarian' : 'Admin'}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-sm pt-sm">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-medium text-body-sm
                  hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm
                  hover:bg-primary/90 transition-colors">
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
            placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Members Table */}
      <MemberTable
        members={membersForTable}
        onEdit={(member) => {}} // TODO: implement edit modal
        onSuspend={(member) => handleSuspendMember(member.id)}
        onActivate={(member) => handleActivateMember(member.id)}
        onDelete={(member) => handleDeleteMember(member.id)}
      />
    </div>
  );
};

export default Members;

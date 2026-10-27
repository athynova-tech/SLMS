export default function MemberTable({ members = [], onEdit, onSuspend, onActivate, onDelete }) {
  if (!members.length) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface p-lg text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">group</span>
        <p className="text-body-sm text-on-surface-variant mt-sm">No members found</p>
      </div>
    );
  }

  const active = (s) => String(s || '').toUpperCase() !== 'INACTIVE' && String(s || '').toUpperCase() !== 'SUSPENDED';

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-outline-variant text-body-sm text-on-surface-variant">
            <th className="px-sm py-sm pr-md font-medium">Member ID</th>
            <th className="px-sm py-sm pr-md font-medium">Name</th>
            <th className="px-sm py-sm pr-md font-medium">Email</th>
            <th className="px-sm py-sm pr-md font-medium">Phone</th>
            <th className="px-sm py-sm pr-md font-medium">Type</th>
            <th className="px-sm py-sm pr-md font-medium">Joined</th>
            <th className="px-sm py-sm pr-md font-medium">Status</th>
            <th className="px-sm py-sm font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
              <td className="px-sm py-sm pr-md font-mono text-body-sm text-on-surface-variant">{m.memberId}</td>
              <td className="px-sm py-sm pr-md text-body-sm font-medium text-on-surface">{m.name || '—'}</td>
              <td className="px-sm py-sm pr-md text-body-sm text-on-surface-variant">{m.email || '—'}</td>
              <td className="px-sm py-sm pr-md text-body-sm text-on-surface-variant">{m.phone || '—'}</td>
              <td className="px-sm py-sm pr-md">
                <span className="rounded-full bg-surface-variant px-2 py-0.5 text-label-lg text-on-surface-variant">{m.type || 'Standard'}</span>
              </td>
              <td className="px-sm py-sm pr-md text-body-sm text-on-surface-variant">{m.joinDate || m.joined || 'Recent'}</td>
              <td className="px-sm py-sm pr-md">
                <span className={`rounded-full px-2 py-0.5 text-label-lg font-medium ${active(m.status) ? 'bg-green-50 text-green-700' : 'bg-error/10 text-error'}`}>
                  {m.status || 'Active'}
                </span>
              </td>
              <td className="px-sm py-sm">
                <div className="flex items-center justify-end gap-xs">
                  {onEdit && (
                    <button onClick={() => onEdit(m)} title="Edit"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  )}
                  {active(m.status) && onSuspend && (
                    <button onClick={() => onSuspend(m)} title="Suspend"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">block</span>
                    </button>
                  )}
                  {!active(m.status) && onActivate && (
                    <button onClick={() => onActivate(m)} title="Activate"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(m)} title="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
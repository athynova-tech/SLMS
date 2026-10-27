const statusStyles = {
  BORROWED: 'text-primary bg-primary-container/20',
  OVERDUE: 'text-error bg-error-container/30',
  RETURNED: 'text-tertiary bg-tertiary-container/20',
  LOST: 'text-on-error bg-error/80',
  RESERVED: 'text-secondary bg-secondary-container/20',
};

export default function RecentActivity({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface p-lg text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">history</span>
        <p className="text-body-sm text-on-surface-variant mt-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface">
      <table className="w-full text-left">
        <thead>
          <tr className="text-body-sm text-on-surface-variant border-b border-outline-variant">
            <th className="py-sm px-md font-medium">Book</th>
            <th className="py-sm px-md font-medium">Member</th>
            <th className="py-sm px-md font-medium">Date</th>
            <th className="py-sm px-md font-medium">Due</th>
            <th className="py-sm px-md font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a, i) => (
            <tr key={i} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
              <td className="py-sm px-md text-body-sm text-on-surface font-medium">{a.book || '—'}</td>
              <td className="py-sm px-md text-body-sm text-on-surface-variant">{a.member || '—'}</td>
              <td className="py-sm px-md text-body-sm text-on-surface-variant">{a.date || a.borrowed || ''}</td>
              <td className="py-sm px-md text-body-sm text-on-surface-variant">{a.dueDate || a.due || ''}</td>
              <td className="py-sm px-md">
                <span className={`inline-flex items-center rounded-full px-sm py-0.5 text-label-lg font-medium ${statusStyles[a.status] || 'bg-surface-container text-on-surface-variant'}`}>
                  {a.status || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
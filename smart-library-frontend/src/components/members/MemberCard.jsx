const typeColors = {
  Student: 'bg-blue-50 text-blue-700',
  Faculty: 'bg-purple-50 text-purple-700',
  Staff: 'bg-orange-50 text-orange-700',
  External: 'bg-pink-50 text-pink-700',
};

export default function MemberCard({ member = {}, onManage }) {
  const initials = (member?.name || member?.fullName || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const type = member?.type || member?.memberType || 'Student';

  return (
    <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface p-md">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-body-sm font-semibold text-white">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-semibold text-on-surface">
          {member?.name || member?.fullName || 'Member'}
        </p>
        <p className="truncate text-body-xs text-on-surface-variant">{member?.email}</p>
      </div>
      <span className={`shrink-0 rounded-full px-sm py-0.5 text-xs font-medium ${typeColors[type] || 'bg-surface-container-high text-on-surface-variant'}`}>
        {type}
      </span>
      {onManage && (
        <button onClick={() => onManage(member)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">more_horiz</span>
        </button>
      )}
    </div>
  );
}
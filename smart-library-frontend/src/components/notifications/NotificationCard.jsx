export default function NotificationCard({ notification = {}, onDelete }) {
  const { icon = 'notifications', iconColor = 'text-primary', iconBg = 'bg-primary-container/20', title = '', message = '', time = '', read = false, important = false } = notification;

  return (
    <div className={`flex items-start gap-md rounded-xl border p-md transition-colors ${read ? 'border-outline-variant bg-surface' : 'border-primary/30 bg-surface-container-low'}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full material-symbols-outlined ${iconColor} ${iconBg}`}>
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-sm">
          <p className={`truncate text-body-sm font-semibold ${important && !read ? 'text-error' : 'text-on-surface'}`}>{title}</p>
          {!read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          {important && <span className="shrink-0 rounded-full bg-error-container/30 px-2 py-0.5 text-label-lg text-error">Important</span>}
        </div>
        {message && <p className="mt-xs text-body-sm text-on-surface-variant">{message}</p>}
        {time && <p className="mt-xs text-label-lg text-on-surface-variant/70">{time}</p>}
      </div>

      {onDelete && (
        <button onClick={onDelete} title="Delete notification"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  );
}
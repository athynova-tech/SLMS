export default function StatisticsCard({ icon = 'bar_chart', title = '', value = '', subtitle = '', trend, className = '' }) {
  return (
    <div className={`flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface p-md ${className}`}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container/30 text-primary material-symbols-outlined">{icon}</span>
        {trend !== undefined && (
          <span className={`flex items-center gap-xs text-body-xs font-medium material-symbols-outlined text-sm ${
            trend === 'up' || trend > 0 ? 'text-tertiary' : 'text-error'
          }`}>
            {trend === 'up' || trend > 0 ? 'trending_up' : 'trending_down'}
          </span>
        )}
      </div>
      <div>
        <p className="text-headline-lg font-bold text-on-surface leading-tight">{value}</p>
        <p className="text-body-sm text-on-surface-variant">{title}</p>
      </div>
      {subtitle && <p className="text-body-xs text-on-surface-variant/70">{subtitle}</p>}
    </div>
  );
}
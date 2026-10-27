export default function AnalyticsCard({ title = '', value = '0', icon = 'analytics', delta = 0, change = '', trend = null, className = '' }) {
  // trend may be { direction: 'up'|'down', value }
  const isObj = trend && typeof trend === 'object';
  const up = isObj ? trend.direction !== 'down' : Number(delta) >= 0;
  const trendText = isObj ? trend.value : change;

  return (
    <div className={`relative rounded-xl border border-outline-variant bg-surface p-lg overflow-hidden transition ${className}`}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-container/20 text-primary material-symbols-outlined">
          {icon}
        </span>
        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-label-lg font-medium ${up ? 'text-green-700 bg-green-50' : 'text-error bg-error-container/30'}`}>
          <span className="material-symbols-outlined text-sm">{up ? 'trending_up' : 'trending_down'}</span>
          {trendText}
        </span>
      </div>
      <p className="mt-4 text-headline-md font-bold text-on-surface">{value}</p>
      <p className="text-body-sm text-on-surface-variant">{title}</p>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-secondary" />
    </div>
  );
}
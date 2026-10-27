const toneVariants = {
  primary:   { chip: 'text-primary bg-primary-container/30', grad: 'from-indigo-500 to-sky-400' },
  secondary: { chip: 'text-secondary bg-secondary-container/20', grad: 'from-sky-500 to-cyan-400' },
  tertiary:  { chip: 'text-tertiary bg-tertiary-container/20', grad: 'from-teal-500 to-emerald-400' },
};

export default function KPICard({ icon = 'insights', label = '', value = '0', trend = '', up = true, color = 'primary' }) {
  // trend may be a string ('+5.2%') or an object { direction, value } (librarian style)
  const isObj = trend && typeof trend === 'object';
  const trendUp = isObj ? (trend.direction !== 'down') : up;
  const trendLabel = isObj ? trend.value : trend;
  const tone = toneVariants[color] || toneVariants.primary;

  return (
    <div className={`relative rounded-xl border border-outline-variant bg-surface overflow-hidden ring-1 ring-primary/10 transition hover:shadow-md`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary" />
      <div className="p-lg">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br text-white material-symbols-outlined ${tone.grad}`}>
            {icon}
          </span>
          <span className={`inline-flex items-center gap-0.5 rounded-full px-sm py-0.5 text-label-lg font-medium ${trendUp ? 'text-green-700 bg-green-50' : 'text-error bg-error-container/30'}`}>
            <span className="material-symbols-outlined text-sm">{trendUp ? 'trending_up' : 'trending_down'}</span>
            {trendLabel}
          </span>
        </div>
        <p className="mt-md text-headline-lg font-bold text-on-surface">{value}</p>
        <p className="text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}
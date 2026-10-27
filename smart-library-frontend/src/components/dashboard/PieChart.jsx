const strokeMap = {
  primary: '#4f46e5',
  secondary: '#0ea5e9',
  tertiary: '#14b8a6',
};

export default function PieChart({ percentage = 0, label = '', color = 'primary' }) {
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const R = 15.915; // radius for 2π circumference at cx=21 cy=21
  const colorValue = strokeMap[color] || strokeMap.primary;

  return (
    <div className="flex flex-col items-center gap-sm text-center">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 42 42" className="w-20 h-20 -rotate-90">
          <circle cx="21" cy="21" r={R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
          <circle
            cx="21" cy="21" r={R} fill="none"
            stroke={colorValue}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${pct} ${100 - pct}`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-body-md font-bold text-on-surface">{pct}%</span>
      </div>
      <p className="text-body-sm text-on-surface-variant">{label}</p>
    </div>
  );
}
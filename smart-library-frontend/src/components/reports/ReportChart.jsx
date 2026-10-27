export default function ReportChart({ data = [], height = 64 }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  return (
    <div className="flex items-end gap-sm w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-xs min-w-0">
          <div className="w-full flex items-end justify-center rounded-md bg-gradient-to-t from-primary to-secondary transition-all hover:from-primary-container"
            style={{ height: `${Math.max(4, Math.round(((Number(d.value) || 0) / max) * height))}px` }}
            title={`${d.value || 0}`} />
          <span className="text-body-xs text-on-surface-variant truncate w-full text-center">{d.month || d.label}</span>
        </div>
      ))}
    </div>
  );
}
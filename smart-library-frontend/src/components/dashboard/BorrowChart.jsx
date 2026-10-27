export default function BorrowChart({ data = [], height = 64 }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  return (
    <div className="flex items-end gap-sm w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-xs min-w-0">
          <div className="w-full flex items-end justify-center rounded-md bg-primary/90 transition-all hover:bg-primary"
            style={{ height: `${Math.max(4, Math.round(((Number(d.value) || 0) / max) * height))}px` }}
            title={`${d.value || 0}`} />
          <span className="text-body-xs text-on-surface-variant truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
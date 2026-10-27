export default function BookCard({ book = {} }) {
  const { title = 'Untitled', author = 'Unknown', isbn = '', category, cover = '', status = 'Available' } = book;
  const categoryLabel = typeof category === 'string' ? category : category?.name || '';

  const showImage = cover && cover.startsWith('http');
  const colorCover = cover && !cover.startsWith('http');
  const inStock = status === 'Available' || status === 'In Stock' || status === '0';

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      {/* Cover */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden"
        style={colorCover ? { backgroundColor: cover } : undefined}>
        {showImage ? (
          <img src={cover} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center gap-1 px-sm">
            <span className="material-symbols-outlined text-5xl text-white/90">menu_book</span>
            <span className="max-w-full truncate text-label-lg font-semibold text-white/90">{title}</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-label-lg font-semibold ${inStock ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
          {status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-lg">
        <h3 className="truncate text-title-md font-semibold text-on-surface">{title}</h3>
        <p className="truncate text-body-sm text-on-surface-variant">{author}</p>
        <div className="mt-auto flex items-center justify-between gap-sm pt-sm">
          {categoryLabel ? (
            <span className="truncate rounded-full bg-surface-variant px-2 py-0.5 text-label-lg text-on-surface-variant">{categoryLabel}</span>
          ) : <span />}
          {isbn && <span className="font-mono text-label-lg text-on-surface-variant">{isbn}</span>}
        </div>
      </div>
    </div>
  );
}
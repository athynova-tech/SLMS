export default function BookTable({ books = [], onEdit, onDelete }) {
  if (!books.length) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface p-lg text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">menu_book</span>
        <p className="text-body-sm text-on-surface-variant mt-sm">No books to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-outline-variant text-body-sm text-on-surface-variant">
            <th className="py-sm px-md font-medium">#</th>
            <th className="py-sm px-md font-medium">Title</th>
            <th className="py-sm px-md font-medium">Author</th>
            <th className="py-sm px-md font-medium">Category</th>
            <th className="py-sm px-md font-medium">Copies</th>
            <th className="py-sm px-md font-medium">Status</th>
            <th className="py-sm px-md font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b, i) => (
            <tr key={b.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
              <td className="py-sm px-md text-body-sm text-on-surface-variant">{i + 1}</td>
              <td className="py-sm px-md text-body-sm font-medium text-on-surface">{b.title}</td>
              <td className="py-sm px-md text-body-sm text-on-surface-variant">{b.author || '—'}</td>
              <td className="py-sm px-md">
                <span className="rounded-full bg-surface-variant px-2 py-0.5 text-label-lg text-on-surface-variant">
                  {b.categoryName || b.category?.name || b.category || 'General'}
                </span>
              </td>
              <td className="py-sm px-md text-body-sm text-on-surface-variant">
                {b.availableCopies ?? b.available ?? 0}/{b.quantity ?? b.totalCopies ?? 0}
              </td>
              <td className="py-sm px-md">
                <span className={`rounded-full px-2 py-0.5 text-label-lg font-medium ${(b.availableCopies ?? b.available ?? 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {(b.availableCopies ?? b.available ?? 0) > 0 ? 'Available' : 'Borrowed'}
                </span>
              </td>
              <td className="py-sm px-md">
                <div className="flex items-center justify-end gap-xs">
                  {onEdit && (
                    <button onClick={() => onEdit(b)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-label-lg font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">edit</span> Edit
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(b)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-label-lg font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">delete</span> Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
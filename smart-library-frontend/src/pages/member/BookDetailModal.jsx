export default function BookDetailModal({ book, onClose, onBorrow, loading }) {
  if (!book) return null;

  const metaItems = [
    { label: 'ISBN', value: book.isbn || '—', icon: 'qr_code' },
    { label: 'Published', value: book.publicationYear || book.publishYear || '—', icon: 'calendar_today' },
    { label: 'Publisher', value: book.publisher || '—', icon: 'business' },
    { label: 'Pages', value: book.pages || book.pageCount || '—', icon: 'description' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-primary/30 via-secondary/20 to-transparent pointer-events-none" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />

        {/* Decorative glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

        {/* Cover strip */}
        <div className="relative h-40 bg-gradient-to-br from-blue-600/25 via-primary/15 to-purple-600/25 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <span className="text-7xl text-white/15 material-icons animate-float" style={{ animationDuration: '4s' }}>auto_stories</span>

          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-black/30 text-white/90 backdrop-blur-md border border-white/10">
              {book.genre || book.category || 'General'}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm shadow-sm ${
              book.availableCopies > 0
                ? 'bg-emerald-500/80 text-white'
                : 'bg-red-500/70 text-white'
            }`}>
              {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 relative">
          <div>
            <h2 className="text-xl font-bold text-foreground">{book.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className="material-icons text-[12px]">person</span>
              by {book.author}
            </p>
          </div>

          {/* Metadata grid with glass cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {metaItems.map((item, i) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-muted/30 border border-border/30 flex items-center gap-2.5 hover:bg-muted/50 transition-colors duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="material-icons text-sm text-muted-foreground/50">{item.icon}</span>
                <div>
                  <span className="block text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs font-medium text-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {book.description && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <span className="material-icons text-[12px]">description</span>
                Description
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={onBorrow}
              disabled={loading || book.availableCopies <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-bold hover:from-primary/90 hover:to-primary/80 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <span className="material-icons text-sm">add</span>
              )}
              {book.availableCopies > 0 ? 'Request Borrow' : 'Unavailable'}
            </button>
            {book.hasEbook && (
              <button
                onClick={() => window.location.href = `/member/reader/${book.id}`}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400 text-sm font-medium hover:from-amber-500/20 hover:to-amber-600/20 transition-all active:scale-[0.97] border border-amber-500/15"
              >
                <span className="material-icons text-sm">menu_book</span>
                Read
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center px-5 py-3 rounded-2xl border border-border/50 text-foreground text-sm font-medium hover:bg-accent hover:border-accent transition-all active:scale-[0.97]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

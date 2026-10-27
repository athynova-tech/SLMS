import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { booksApi, borrowingApi } from '../../services/api';
import BookDetailModal from './BookDetailModal';

const categories = [
  'All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Fantasy',
  'Technology', 'Philosophy', 'Self-Help', 'Biography', 'Art & Design',
];

const cardGradients = [
  ['#1e3a5f', '#2d5a87', '#1e3a5f'],
  ['#1b4332', '#2d6a4f', '#1b4332'],
  ['#5c1a1a', '#8b2d2d', '#5c1a1a'],
  ['#1a3a5c', '#2d5f8b', '#1a3a5c'],
  ['#5c3a1a', '#8b5f2d', '#5c3a1a'],
  ['#2d1a5c', '#4a2d8b', '#2d1a5c'],
  ['#1a4a3a', '#2d6b5f', '#1a4a3a'],
  ['#3a1a4a', '#5c2d6b', '#3a1a4a'],
];

const patterns = [
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M50 50l-5-5H35l-5 5v10h20V50z'/%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M15 0l7.5 15L15 30 7.5 15z'/%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Crect x='10' y='10' width='80' height='80' rx='10'/%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M25 5l5 10 10 1-8 7 3 11-10-6-10 6 3-11-8-7 10-1z'/%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 6l6 12 14 2-11 9 3 14-12-7-12 7 3-14-11-9 14-2z'/%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='90' height='90' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='45' cy='45' r='20'/%3E%3C/g%3E%3C/svg%3E\")",
];

export default function SearchBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowing, setBorrowing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const catParam = category !== 'All' ? `&category=${category}` : '';
      const data = await booksApi.getAll(page, 12, catParam);
      setBooks(data.content || data);
      if (data.totalPages) setTotalPages(data.totalPages);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    (async () => { await loadBooks(); })();
  }, [loadBooks]);

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setPage(0);
    try {
      if (search.trim()) {
        const data = await booksApi.search(search);
        setBooks(data.content || data || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      } else {
        await loadBooks();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (!user) {
      setMsg({ type: 'error', text: 'Please login to borrow books' });
      return;
    }
    setBorrowing(bookId);
    try {
      await borrowingApi.requestBorrow(user.id, bookId);
      setMsg({ type: 'success', text: 'Borrow request sent! The librarian will review it shortly.' });
      setTimeout(() => setMsg(null), 5000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to send request' });
    } finally {
      setBorrowing(null);
    }
  };

  const filtered = category === 'All'
    ? books
    : books.filter(b => b.category === category || b.genre === category);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header with glow */}
      <div className="relative">
        <div className="absolute -inset-20 bg-gradient-radial from-primary/8 via-secondary/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl font-bold text-foreground">Search Books</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, borrow, and read from our library collection
          </p>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm border backdrop-blur-sm animate-fade-in-up ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          <span className="material-icons text-sm">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="flex-1">{msg.text}</span>
          <button onClick={() => setMsg(null)} className="opacity-60 hover:opacity-100 transition-all">
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Glass Search bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative flex items-center bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 group-focus-within:border-primary/40 group-focus-within:shadow-xl group-focus-within:shadow-primary/10">
          <span className="material-icons pl-4 text-muted-foreground text-sm">search</span>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); handleSearch(); }} className="px-2 text-muted-foreground hover:text-foreground transition-all">
              <span className="material-icons text-sm">close</span>
            </button>
          )}
          <button
            type="submit"
            className="mr-1.5 px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(0); }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
              category === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="h-40 bg-muted/60" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-9 bg-muted rounded w-full mt-3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center py-20 animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <span className="material-icons text-4xl text-muted-foreground/60">auto_stories</span>
            </div>
            <p className="text-base font-semibold text-foreground">No books found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
          </div>
        ) : filtered.map((book, idx) => {
          const g = cardGradients[idx % cardGradients.length];
          return (
            <div
              key={book.id}
              className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              {/* Animated gradient cover */}
              <div
                className="relative h-44 flex items-center justify-center overflow-hidden animate-gradient"
                style={{
                  background: `linear-gradient(135deg, ${g[0]}, ${g[1]}, ${g[2]})`,
                }}
              >
                {/* Pattern overlay */}
                <div className="absolute inset-0" style={{ backgroundImage: patterns[idx % patterns.length] }} />
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                {/* Hover glow */}
                <div className="absolute -inset-10 bg-gradient-radial from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="relative text-6xl text-white/20 select-none material-icons group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">auto_stories</span>

                {/* Category badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/30 text-white/90 backdrop-blur-md border border-white/10">
                    {book.genre || book.category || 'General'}
                  </span>
                </div>

                {/* Availability badge */}
                {book.availableCopies > 0 ? (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm">
                      {book.availableCopies} left
                    </span>
                  </div>
                ) : (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-red-500/70 text-white backdrop-blur-sm">
                      Unavailable
                    </span>
                  </div>
                )}

                {/* Book spine effect on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col gap-2 bg-gradient-to-b from-card to-card/95">
                <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">{book.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="material-icons text-[10px]">person</span>
                  {book.author}
                </p>
                <p className="text-[11px] text-muted-foreground/60 line-clamp-2 flex-1 leading-relaxed">{book.description}</p>

                {/* Divider with gradient */}
                <div className="h-px bg-gradient-to-r from-border/80 via-border/30 to-transparent mt-1" />

                {/* Actions */}
                <div className="flex gap-1.5 pt-2">
                  <button
                    onClick={() => handleBorrow(book.id)}
                    disabled={borrowing === book.id || !user || book.availableCopies <= 0}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white text-xs font-bold hover:from-primary/90 hover:to-primary/80 transition-all duration-200 active:scale-95 disabled:opacity-40 shadow-md shadow-primary/20"
                  >
                    {borrowing === book.id ? (
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <span className="material-icons text-sm">add</span>
                    )}
                    Borrow
                  </button>
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-border/60 text-foreground text-xs font-medium hover:bg-accent hover:border-accent transition-all active:scale-95"
                    title="View details"
                  >
                    <span className="material-icons text-sm">visibility</span>
                  </button>
                  {book.hasEbook && (
                    <button
                      onClick={() => window.location.href = `/member/reader/${book.id}`}
                      className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 border border-amber-500/10 hover:border-amber-500/20 transition-all active:scale-95"
                      title="Read online"
                    >
                      <span className="material-icons text-sm">menu_book</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 animate-fade-in-up">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
          >
            <span className="material-icons text-sm">chevron_left</span>
            Prev
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 3, totalPages - 7));
              const pNum = start + i;
              if (pNum >= totalPages) return null;
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    pNum === page
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border'
                  }`}
                >
                  {pNum + 1}
                </button>
              );
            })}
          </div>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
          >
            Next
            <span className="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrow={() => { handleBorrow(selectedBook.id); setSelectedBook(null); }}
          loading={borrowing === selectedBook?.id}
        />
      )}
    </div>
  );
}

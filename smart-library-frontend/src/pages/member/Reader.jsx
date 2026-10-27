import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { booksApi, readingApi } from '../../services/api';

const placeholderContent = `In the beginning, there was silence. Not the silence of an empty room, but the silence of potential — of a story waiting to be told.

The library stood at the corner of the street, its stone walls weathered by decades of rain and sun. Those who passed by rarely noticed it, but those who entered never left unchanged.

Each book on its shelves held a universe. Some were filled with adventure, others with quiet contemplation. But all of them, every single one, contained a piece of someone's soul.

The old librarian, Mr. Abernathy, had been tending these shelves for forty-seven years. He knew every book by its smell, could tell you the exact shelf where a forgotten classic lay, and could recommend the perfect read for any visitor.

On this particular morning, the door creaked open and a young girl stepped in. She couldn't have been more than twelve, with pigtails and eyes full of wonder.

"I'm looking for a story," she said.

Mr. Abernathy smiled. "Then you've come to the right place, my dear."

He led her through the aisles, past towering shelves that seemed to reach the ceiling. His hand brushed against the spines as if greeting old friends.

"Every person who walks through that door is looking for something," he said. "Sometimes they know what it is. Sometimes they don't. But the library always provides."

The girl looked around, overwhelmed by the sheer number of books. "How do I choose?"

"You don't choose the book, my dear. The book chooses you."

He stopped at a small shelf in the corner, almost hidden from view. A single book sat there, its cover worn but inviting. The girl reached out and touched it.

As her fingers made contact, she felt a warmth spread through her hand. The title read: "The Beginning of Everything."

"That one," Mr. Abernathy said softly, "has been waiting for you."

The girl opened the first page, and in that moment, she understood what Mr. Abernathy meant. The library wasn't just a building full of books. It was a living, breathing thing — a bridge between worlds, a keeper of dreams, a place where anything was possible.

And in the silence of the old library, a new story began.`;

function trackReading(userId, bookId, pageNum, totalPages) {
  if (!userId || !bookId) return;
  if (pageNum % 5 === 0 || pageNum === 1 || pageNum === totalPages) {
    readingApi.track(userId, bookId, pageNum, totalPages).catch(() => {});
  }
}

const themes = [
  { key: 'light', label: 'Light', bg: 'bg-white', text: 'text-gray-900', accent: 'from-blue-100/40 via-purple-100/20 to-transparent' },
  { key: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-950', accent: 'from-amber-200/30 via-yellow-100/20 to-transparent' },
  { key: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-gray-100', accent: 'from-indigo-500/10 via-purple-500/5 to-transparent' },
];

export default function Reader() {
  const { user } = useAuth();
  const { bookId: pathBookId } = useParams();
  const [searchParams] = useSearchParams();
  const bookId = pathBookId || searchParams.get('bookId');

  const [book, setBook] = useState(null);
  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(40);
  const [loading, setLoading] = useState(() => Boolean(bookId));
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    const load = async () => {
      try {
        const data = await booksApi.getById(bookId);
        setBook(data);
        const pageEstimate = data.pages || 40;
        setTotalPages(pageEstimate);
        const lines = (data.description
          ? data.description.split('. ').map(s => s.trim() + '.')
          : placeholderContent.split('\n\n')
        );
        const pages = [];
        for (let i = 0; i < pageEstimate; i++) {
          pages.push(lines[i % lines.length] || placeholderContent.split('\n\n')[i % placeholderContent.split('\n\n').length]);
        }
        setContent(pages);
      } catch {
        const lines = placeholderContent.split('\n\n');
        const pages = Array.from({ length: 40 }, (_, i) => lines[i % lines.length]);
        setContent(pages);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  useEffect(() => {
    if (!user || !bookId || content.length === 0) return;
    trackReading(user.id, parseInt(bookId), page, totalPages);
  }, [page, user, bookId, content, totalPages]);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) {
      setTransitioning(true);
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setTransitioning(false), 250);
    }
  };

  const currentTheme = themes.find(t => t.key === theme) || themes[0];

  return (
    <div className="max-w-4xl mx-auto">
      {!bookId ? (
        <div className="text-center py-20 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5 animate-float">
            <span className="material-icons text-5xl text-muted-foreground/40">menu_book</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Book Selected</h2>
          <p className="text-sm text-muted-foreground mb-6">Choose a book from Search or My Books to start reading</p>
          <Link
            to="/member/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl text-sm font-bold hover:from-primary/90 hover:to-primary/80 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <span className="material-icons text-sm">search</span>
            Browse Books
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading your book...</p>
        </div>
      ) : (
        <div className="relative">
          {/* Ambient glow */}
          <div className={`fixed inset-0 pointer-events-none bg-gradient-radial ${currentTheme.accent} opacity-70 transition-opacity duration-500`} />

          {/* Header */}
          <div className="mb-5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/member/search" className="w-9 h-9 flex items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                <span className="material-icons text-sm">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-foreground">{book?.title || 'Reading'}</h1>
                {book?.author && <p className="text-xs text-muted-foreground">by {book.author}</p>}
              </div>
            </div>

            {/* Glass controls bar */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-card/70 backdrop-blur-lg border border-border/40 shadow-sm">
              <div className="flex items-center gap-0.5">
                <button onClick={() => goToPage(1)} disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-30 transition-all active:scale-90">
                  <span className="material-icons text-sm">first_page</span>
                </button>
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-30 transition-all active:scale-90">
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                <span className="text-xs font-semibold text-foreground min-w-[90px] text-center select-none tabular-nums">
                  {page} / {totalPages}
                </span>
                <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-30 transition-all active:scale-90">
                  <span className="material-icons text-sm">chevron_right</span>
                </button>
                <button onClick={() => goToPage(totalPages)} disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-30 transition-all active:scale-90">
                  <span className="material-icons text-sm">last_page</span>
                </button>
              </div>

              {/* Progress */}
              <div className="hidden sm:flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums">{Math.round((page / totalPages) * 100)}%</span>
                <div className="w-20 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-secondary transition-all duration-500"
                    style={{ width: `${(page / totalPages) * 100}%` }}
                  />
                </div>
              </div>

              {/* Theme & font */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/30">
                  {themes.map(t => (
                    <button key={t.key} onClick={() => setTheme(t.key)}
                      className={`w-6 h-6 rounded-md transition-all ${t.bg} ${theme === t.key ? 'ring-2 ring-primary ring-offset-1 ring-offset-transparent scale-110 shadow-sm' : 'opacity-40 hover:opacity-70'}`}
                      title={t.label}
                    />
                  ))}
                </div>
                <div className="w-px h-4 bg-border/40 mx-1" />
                <button onClick={() => setFontSize(s => Math.max(12, s - 1))}
                  className="px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all active:scale-90 font-medium">A-</button>
                <span className="text-[10px] text-muted-foreground w-6 text-center font-mono tabular-nums">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(28, s + 1))}
                  className="px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all active:scale-90 font-medium">A+</button>
              </div>
            </div>
          </div>

          {/* Reading area with book-open entrance */}
          <div
            className={`rounded-3xl border border-white/10 ${currentTheme.bg} p-8 sm:p-12 shadow-lg min-h-[50vh] transition-all duration-300 animate-book-open ${
              transitioning ? 'opacity-60 scale-[0.98] blur-[1px]' : 'opacity-100 scale-100 blur-0'
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <p className={`leading-[2] ${currentTheme.text} transition-colors`}>
              {content[page - 1] || placeholderContent}
            </p>
            <div className={`mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs ${currentTheme.text} opacity-40`}>
              <span className="tabular-nums">— {page} —</span>
              <span className="tabular-nums">{Math.round((page / totalPages) * 100)}%</span>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between mt-6 pb-8 gap-4 relative z-10">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-card/70 backdrop-blur-md border border-border/40 text-sm font-medium text-foreground hover:bg-accent/60 disabled:opacity-30 transition-all active:scale-95 shadow-sm flex-1 sm:flex-none justify-center">
              <span className="material-icons text-sm">chevron_left</span>
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-20 text-center rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm px-2 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <span className="text-xs text-muted-foreground">/ {totalPages}</span>
            </div>
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-card/70 backdrop-blur-md border border-border/40 text-sm font-medium text-foreground hover:bg-accent/60 disabled:opacity-30 transition-all active:scale-95 shadow-sm flex-1 sm:flex-none justify-center">
              <span className="hidden sm:inline">Next</span>
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>

          {/* Progress tracker */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-6 relative z-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Saving automatically
          </div>
        </div>
      )}
    </div>
  );
}

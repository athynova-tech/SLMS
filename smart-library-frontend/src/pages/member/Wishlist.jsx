import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reservationsApi, booksApi } from '../../services/api';

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const reservations = (await reservationsApi.getByUser(user.id)) ?? [];
        const enriched = await Promise.all(
          reservations.map(async (r) => {
            try {
              const book = await booksApi.getById(r.bookId);
              return { ...r, bookTitle: book?.title || 'Book', bookAuthor: book?.author || '' };
            } catch {
              return { ...r, bookTitle: r.bookTitle || 'Book', bookAuthor: '' };
            }
          }),
        );
        if (!cancelled) setItems(enriched);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load your wishlist.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleRemove = async (item) => {
    if (!user?.id) return;
    setRemoving(item.id);
    setError(null);
    try {
      await reservationsApi.cancel?.(item.id, user.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message || 'Failed to remove reservation.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">My Wishlist</h1>
        <p className="text-body-sm text-on-surface-variant mt-xs">Books you have reserved at the library.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container/20 p-md text-body-sm text-error">{error}</div>
      )}

      {!user?.id ? (
        <div className="rounded-xl border border-outline-variant bg-surface p-xl text-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">favorite_border</span>
          <p className="mt-sm text-body-sm text-on-surface-variant">Please sign in to view your wishlist.</p>
        </div>
      ) : loading ? (
        <p className="text-body-sm text-on-surface-variant">Loading wishlist...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface p-xl text-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">favorite_border</span>
          <p className="mt-sm text-body-sm text-on-surface-variant">Your wishlist is empty. Reserve a book to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-outline-variant bg-surface p-md">
              <div className="flex items-start gap-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-container/30 text-primary material-symbols-outlined">auto_stories</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-semibold text-on-surface">{item.bookTitle}</p>
                  <p className="truncate text-body-xs text-on-surface-variant">{item.bookAuthor || '—'}</p>
                </div>
              </div>
              <div className="mt-md flex items-center justify-between">
                <span className="text-body-xs text-on-surface-variant">Status: <span className="font-medium text-on-surface">{item.status || 'RESERVED'}</span></span>
                <button
                  onClick={() => handleRemove(item)}
                  disabled={removing === item.id}
                  className="flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-1.5 text-body-sm text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50">
                  <span className="material-symbols-outlined text-base">delete</span>
                  {removing === item.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
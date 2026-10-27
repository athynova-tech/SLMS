import { useState } from 'react';
import { booksApi } from '../../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.search(query.trim());
      setResults(data || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">Search Books</h1>
        <p className="text-body-sm text-on-surface-variant mt-xs">Search the library catalog by title, author, or ISBN</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          type="text"
          placeholder="Search by title, author, ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-24 py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md
            placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 px-md py-0.5 rounded-md bg-primary text-on-primary text-body-sm font-medium"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          {error}
        </div>
      )}

      {loading && <p className="text-body-sm text-on-surface-variant">Searching...</p>}

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-xl">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">search_off</span>
          <p className="text-body-sm text-on-surface-variant mt-md">No books found for "{query}"</p>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="p-md font-medium">Title</th>
                <th className="p-md font-medium">Author</th>
                <th className="p-md font-medium">ISBN</th>
                <th className="p-md font-medium">Category</th>
                <th className="p-md font-medium">Available / Total</th>
                <th className="p-md font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {results.map((book) => (
                <tr key={book.id} className="hover:bg-surface-container-low">
                  <td className="p-md font-medium text-on-surface">{book.title}</td>
                  <td className="p-md text-on-surface-variant">{book.author}</td>
                  <td className="p-md text-on-surface-variant font-mono">{book.isbn}</td>
                  <td className="p-md text-on-surface-variant">{book.categoryName || book.category}</td>
                  <td className="p-md text-on-surface-variant">{book.availableCopies} / {book.quantity}</td>
                  <td className="p-md">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-label-lg font-medium ${
                      book.available ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {book.available ? 'Available' : 'Borrowed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Search;

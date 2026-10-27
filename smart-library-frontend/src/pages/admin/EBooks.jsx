import { useState, useEffect } from 'react';
import { ebooksApi, booksApi } from '../../services/api';

const EBooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ebookData, bookData] = await Promise.all([
          ebooksApi.getAll(),
          booksApi.getAll(),
        ]);
        setEbooks(ebookData || []);
        setBooks(bookData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredEbooks = ebooks.filter((eb) =>
    !search || (eb.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedFile) return;
    try {
      await ebooksApi.upload(selectedBook, selectedFile, localStorage.getItem('userId') || 1, '');
      const data = await ebooksApi.getAll();
      setEbooks(data);
      setShowUpload(false);
      setSelectedBook('');
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ebook?')) return;
    try {
      await ebooksApi.delete(id);
      setEbooks((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-body-sm text-on-surface-variant">Loading e-books...</p>;

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <h1 className="text-headline-lg text-on-surface font-bold">E-Books Management</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">{showUpload ? 'close' : 'upload_file'}</span>
          {showUpload ? 'Cancel' : 'Upload E-Book'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">error</span> {error}
        </div>
      )}

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-surface border border-outline-variant rounded-xl p-lg space-y-md">
          <h3 className="text-title-md font-semibold text-on-surface">Upload New E-Book</h3>
          <div>
            <label className="block text-label-sm text-on-surface-variant mb-xs">Book</label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(Number(e.target.value))}
              className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a book...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label-sm text-on-surface-variant mb-xs">File (PDF/EPUB)</label>
            <input
              type="file"
              accept=".pdf,.epub,.mobi"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-body-sm text-on-surface file:mr-md file:px-md file:py-sm file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-body-sm file:font-medium hover:file:bg-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={!selectedBook || !selectedFile}
            className="px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40"
          >
            Upload
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          type="text"
          placeholder="Search e-books by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* E-Book List */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-dim/30">
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">Title</th>
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">File Type</th>
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">File Size</th>
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">Views</th>
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">Downloads</th>
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">Audiobook</th>
              <th className="px-lg py-md text-label-sm text-on-surface-variant font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEbooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-lg py-xl text-center text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl block mb-sm text-on-surface-variant/40">menu_book</span>
                  No e-books found.
                </td>
              </tr>
            ) : (
              filteredEbooks.map((eb) => (
                <tr key={eb.id} className="border-b border-outline-variant/50 hover:bg-surface-dim/20 transition-colors">
                  <td className="px-lg py-md text-body-sm text-on-surface font-medium">{eb.title || 'Untitled'}</td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant uppercase">{(eb.fileType || 'PDF').split('/').pop()}</td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">{eb.fileSize ? `${(eb.fileSize / 1024).toFixed(0)} KB` : '—'}</td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">{eb.viewCount ?? 0}</td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">{eb.downloadCount ?? 0}</td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">
                    {eb.audioUrl ? (
                      <span className="text-success flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Yes
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/50">—</span>
                    )}
                  </td>
                  <td className="px-lg py-md">
                    <button
                      onClick={() => handleDelete(eb.id)}
                      className="flex items-center gap-xs px-sm py-xs rounded-md text-error text-label-sm hover:bg-error/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EBooks;

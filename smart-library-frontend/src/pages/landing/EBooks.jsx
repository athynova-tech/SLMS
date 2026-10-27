import { useState, useEffect } from 'react';
import { ebooksApi, categoriesApi } from '../../services/api';
import Footer from '../../components/common/Footer';
import PublicHeader from '../../components/common/PublicHeader';

export default function EBooks() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ebooksApi.getAll().catch(() => []),
      categoriesApi.getAll().catch(() => []),
    ]).then(([ebooksData, cats]) => {
      setEbooks(ebooksData);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filtered = ebooks.filter((e) => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || (e.category?.id || 0) === Number(categoryFilter);
    return matchSearch && matchCat;
  });

  const getBookCategoryName = (ebook) => {
    if (ebook.category?.name) return ebook.category.name;
    if (ebook.categoryName) return ebook.categoryName;
    return '';
  };

  const getReadUrl = (id) => {
    const token = localStorage.getItem('token');
    if (!token) return `/login?redirect=/ebooks`;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return `http://localhost:8081/api/ebooks/${id}/read?userId=${user.id || 0}`;
  };

  const handleDownload = async (id, title) => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.assign('/login?redirect=/ebooks');
        return;
      }
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const url = `http://localhost:8081/api/ebooks/${id}/download?userId=${user.id || 0}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Download failed');
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch {
        alert('Please login to download ebooks.');
      }
    };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="bg-gradient-to-br from-surface via-surface to-surface-container-low py-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
            <span className="text-primary font-semibold text-label-lg">DIGITAL LIBRARY</span>
          </div>
          <h1 className="text-display-lg font-bold text-on-surface mb-md">
            E-Books <span className="text-primary">Collection</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl mb-lg">
            Browse our digital collection of academic e-books. Download PDFs, read online, 
            or listen to audiobooks on the go.
          </p>

          {/* Search & Filter */}
          <div className="flex flex-wrap gap-md mb-lg">
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Search e-books by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-xl">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-md"></div>
              <p className="text-on-surface-variant">Loading e-books...</p>
            </div>
          )}

          {/* E-Books Grid */}
          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
              {filtered.map((ebook) => (
                <div
                  key={ebook.id}
                  className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                >
                  {/* Cover placeholder */}
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                    <span className="material-symbols-outlined text-5xl text-primary/40">auto_stories</span>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {ebook.fileType === 'PDF' && (
                        <span className="px-2 py-0.5 bg-primary/80 text-white text-label-xs font-medium rounded-full">PDF</span>
                      )}
                      {ebook.fileType === 'EPUB' && (
                        <span className="px-2 py-0.5 bg-secondary/80 text-white text-label-xs font-medium rounded-full">EPUB</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-md">
                    <h3 className="text-title-sm font-bold text-on-surface truncate mb-1" title={ebook.title}>
                      {ebook.title}
                    </h3>
                    {getBookCategoryName(ebook) && (
                      <span className="text-label-xs text-primary font-medium mb-2 block">{getBookCategoryName(ebook)}</span>
                    )}

                    <div className="flex items-center gap-md text-label-xs text-on-surface-variant mb-3">
                      {ebook.fileSize && <span>{formatSize(ebook.fileSize)}</span>}
                      {ebook.viewCount > 0 && <span>{ebook.viewCount} views</span>}
                      {ebook.downloadCount > 0 && <span>{ebook.downloadCount} downloads</span>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {ebook.canDownload && (
                        <button
                          onClick={() => handleDownload(ebook.id, ebook.title)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary text-label-sm font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          PDF
                        </button>
                      )}
                      <button
                        onClick={() => window.open(getReadUrl(ebook.id), '_blank')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-outline-variant text-on-surface-variant text-label-sm font-medium rounded-lg hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Read
                      </button>
                    </div>

                    {/* Audiobook section */}
                    <div className="mt-2">
                      {ebook.audioUrl || ebook.audioFilePath ? (
                        <button
                          onClick={() => window.open(ebook.audioUrl || ebook.audioFilePath, '_blank')}
                          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 text-label-sm font-semibold rounded-lg hover:bg-green-100 transition-all border border-green-200"
                        >
                          <span className="material-symbols-outlined text-[16px]">headphones</span>
                          Listen to Audiobook
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-label-xs text-outline border border-dashed border-outline-variant rounded-lg">
                          <span className="material-symbols-outlined text-[14px]">headphones</span>
                          Audiobook coming soon
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-md">auto_stories</span>
              <p className="text-on-surface-variant">No e-books found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

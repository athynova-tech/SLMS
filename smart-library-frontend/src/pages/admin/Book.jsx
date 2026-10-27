import { useState, useEffect } from 'react';
import { booksApi, categoriesApi } from '../../services/api';
import BookTable from '../../components/books/BookTable';
import BookForm from '../../components/books/BookForm';
import BookCard from '../../components/books/BookCard';

const Book = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [booksData, catsData] = await Promise.all([
          booksApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setBooks(booksData);
        setCategories(catsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      (book.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(search.toLowerCase()) ||
      (book.isbn || '').includes(search);
    const matchesCategory = !categoryFilter || book.category?.name === categoryFilter || book.categoryName === categoryFilter || book.category === categoryFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'Available'
        ? (book.availableCopies ?? book.available ?? 0) > 0
        : (book.availableCopies ?? book.available ?? 0) === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddBook = async (formData) => {
    try {
      if (formData instanceof FormData) {
        // Multipart image upload - handle separately
        const data = Object.fromEntries(formData.entries());
        await booksApi.create(data);
      } else {
        await booksApi.create(formData);
      }
      // Refresh list
      const booksData = await booksApi.getAll();
      setBooks(booksData);
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditBook = async (id, data) => {
    try {
      await booksApi.update(id, data);
      const booksData = await booksApi.getAll();
      setBooks(booksData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await booksApi.delete(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-body-sm text-on-surface-variant">Loading books...</p>;

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <h1 className="text-headline-lg text-on-surface font-bold">Books Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm
            hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">{showAddForm ? 'close' : 'add'}</span>
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">error</span> {error}
        </div>
      )}

      {/* Add Book Form */}
      {showAddForm && (
        <BookForm onSubmit={handleAddBook} onCancel={() => setShowAddForm(false)} categories={categories} />
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-md">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
              placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Categories</option>
          {(categories || []).map((cat) => (
            <option key={cat.id} value={cat.name || cat.title}>{cat.name || cat.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Borrowed">Borrowed</option>
        </select>
      </div>

      {/* Book Cards Preview */}
      {filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {filteredBooks.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={{
              ...book,
              cover: book.imageUrl || book.coverImage || '#1a73e8',
              status: (book.availableCopies ?? book.available ?? 0) > 0 ? 'Available' : 'Borrowed',
            }} />
          ))}
        </div>
      )}

      {/* Books Table */}
      <BookTable
        books={filteredBooks}
        onEdit={(book) => handleEditBook(book.id, book)}
        onDelete={(book) => handleDeleteBook(book.id)}
      />
    </div>
  );
};

export default Book;

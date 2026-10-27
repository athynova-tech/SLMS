import { useState, useEffect } from 'react';
import { booksApi, categoriesApi } from '../../services/api';
import BookForm from '../../components/books/BookForm';
import BookTable from '../../components/books/BookTable';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Books');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [books, cats] = await Promise.all([
          booksApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setItems(books || []);
        setCategories(cats || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categoryNames = ['All Books', ...new Set(categories.map((c) => c.name || c.title))];

  const filteredItems = items.filter((item) => {
    if (activeFilter !== 'All Books' && item.categoryName !== activeFilter && item.category !== activeFilter)
      return false;
    if (search && !(item.title || '').toLowerCase().includes(search.toLowerCase()) &&
        !(item.author || '').toLowerCase().includes(search.toLowerCase()) &&
        !(item.isbn || '').includes(search))
      return false;
    return true;
  });

  const handleAddBook = async (formData) => {
    try {
      await booksApi.create(formData);
      const booksData = await booksApi.getAll();
      setItems(booksData);
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditBook = async (book) => {
    setEditingBook(book);
    setShowAddForm(true);
  };

  const handleUpdateBook = async (formData) => {
    try {
      await booksApi.update(editingBook.id, formData);
      const booksData = await booksApi.getAll();
      setItems(booksData);
      setShowAddForm(false);
      setEditingBook(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await booksApi.delete(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-lg max-w-7xl mx-auto">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="rounded-xl border border-outline-variant bg-surface p-md animate-pulse h-48" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-lg p-lg max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-md">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Library Inventory</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">{items.length} books in the collection</p>
        </div>
        <div className="flex items-center gap-sm">
          <button onClick={() => { setShowAddForm(!showAddForm); setEditingBook(null); }}
            className="flex items-center gap-sm rounded-lg bg-primary px-4 py-2 text-body-sm font-medium text-on-primary hover:bg-primary/90 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">{showAddForm ? 'close' : 'add'}</span>
            {showAddForm ? 'Cancel' : 'Add New Book'}
          </button>
          <button onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-sm rounded-lg border px-4 py-2 text-body-sm font-medium transition cursor-pointer ${
              showTable ? 'bg-primary-container text-primary border-primary-container' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{showTable ? 'grid_view' : 'table_rows'}</span>
            {showTable ? 'Cards View' : 'Table View'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">error</span> {error}
        </div>
      )}

      {/* Add/Edit Book Form */}
      {showAddForm && (
        <BookForm
          onSubmit={editingBook ? handleUpdateBook : handleAddBook}
          onCancel={() => { setShowAddForm(false); setEditingBook(null); }}
          initialData={editingBook}
          categories={categories}
        />
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-sm flex-wrap">
        <span className="material-symbols-outlined text-lg text-on-surface-variant">category</span>
        {categoryNames.map((cat) => (
          <button key={cat} onClick={() => setActiveFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-body-sm font-medium transition cursor-pointer ${
              activeFilter === cat
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input type="text" placeholder="Search by title, author, or ISBN..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
            placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Table View */}
      {showTable ? (
        <BookTable books={filteredItems}
          onEdit={handleEditBook}
          onDelete={handleDeleteBook}
        />
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface p-md transition hover:shadow-sm">
              <div className="flex h-32 items-center justify-center rounded-lg bg-surface-container-high text-outline relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="material-symbols-outlined text-4xl">menu_book</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-title-md font-semibold text-on-surface leading-tight truncate">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant truncate">{item.author}</p>
              </div>
              <div className="flex items-center gap-sm flex-wrap">
                <span className="rounded-full bg-surface-variant px-2 py-0.5 text-label-lg text-on-surface-variant">
                  {item.categoryName || item.category || 'General'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-label-lg font-medium ${
                  item.available ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {item.available ? 'In Stock' : 'Checked Out'}
                </span>
                <span className="text-label-lg text-on-surface-variant">{item.availableCopies || 0}/{item.quantity || 0} copies</span>
              </div>
              <div className="flex items-center gap-sm pt-xs border-t border-outline-variant/50">
                <button onClick={() => handleEditBook(item)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-label-lg font-medium text-primary hover:bg-primary/10 transition cursor-pointer">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                <button onClick={() => handleDeleteBook(item.id)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-label-lg font-medium text-red-500 hover:bg-red-50 transition cursor-pointer">
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-sm py-xl text-center col-span-full">
              <span className="material-symbols-outlined text-5xl text-outline">inventory_2</span>
              <p className="text-body-sm text-on-surface-variant">No items found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

export default function BookForm({ onSubmit, onCancel, categories = [], initialData = null }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    isbn: initialData?.isbn || '',
    categoryId: initialData?.categoryId ?? initialData?.category?.id ?? '',
    quantity: initialData?.quantity || initialData?.totalCopies || 1,
    publisher: initialData?.publisher || '',
    year: initialData?.year || '',
    description: initialData?.description || '',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const isEdit = Boolean(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      categoryId: form.categoryId || undefined,
      quantity: Number(form.quantity) || 1,
      publisher: form.publisher,
      year: form.year ? Number(form.year) : undefined,
      description: form.description,
    });
  };

  const inputCls = "w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
  const labelCls = "block text-body-sm text-on-surface font-medium mb-xs";

  return (
    <div className="rounded-xl border border-outline-variant bg-surface p-lg">
      <h2 className="mb-md text-title-md font-semibold text-on-surface">
        {isEdit ? 'Edit Book' : 'Add New Book'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <label className={labelCls}>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Author *</label>
          <input name="author" value={form.author} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ISBN</label>
          <input name="isbn" value={form.isbn} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputCls}>
            <option value="">Select category...</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Quantity / Copies</label>
          <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Publication Year</label>
          <input name="year" type="number" value={form.year} onChange={handleChange} className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Publisher</label>
          <input name="publisher" value={form.publisher} onChange={handleChange} className={inputCls} />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className={labelCls}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2}
            className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
        <div className="col-span-full flex justify-end gap-sm pt-sm">
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-outline-variant px-lg py-sm text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="flex items-center gap-sm rounded-lg bg-primary px-lg py-sm text-body-sm font-medium text-on-primary hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">{isEdit ? 'save' : 'add'}</span>
            {isEdit ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </form>
    </div>
  );
}
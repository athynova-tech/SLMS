import { useState, useEffect } from 'react';
import { branchApi, booksApi } from '../../services/api';

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [tab, setTab] = useState('branches');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', description: '', openingHours: '', active: true });
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [inventory, setInventory] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [showAddBook, setShowAddBook] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ bookId: '', fromBranchId: '', toBranchId: '', quantity: 1, reason: '' });
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'branches') {
        const data = await branchApi.getAll();
        setBranches(data || []);
        setBackendAvailable(true);
      } else {
        const data = await branchApi.getTransfers(null);
        setTransfers(data || []);
        setBackendAvailable(true);
      }
    } catch (err) {
      if (err.message?.includes('403') || err.message?.includes('Forbidden') || err.message?.includes('Failed to fetch') || err.message?.includes('404')) {
        setBackendAvailable(false);
        setError(null); // Don't show error banner, show setup screen instead
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookOptions = async () => {
    try {
      const data = await booksApi.getAll();
      setAllBooks(data || []);
    } catch (err) {}
  };

  const handleSaveBranch = async () => {
    try {
      if (editingBranch) {
        await branchApi.update(editingBranch.id, form);
        setSuccess('Branch updated successfully');
      } else {
        await branchApi.create(form);
        setSuccess('Branch created successfully');
      }
      setShowForm(false);
      setEditingBranch(null);
      setForm({ name: '', address: '', phone: '', email: '', description: '', openingHours: '', active: true });
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleAddBook = async () => {
    if (!showAddBook?.bookId || !showAddBook?.quantity) return;
    try {
      await branchApi.addBookToBranch(showAddBook.branchId, showAddBook.bookId, showAddBook.quantity);
      setSuccess('Book added to branch');
      setShowAddBook(null);
      if (selectedBranchId) loadInventory(selectedBranchId);
    } catch (err) { setError(err.message); }
  };

  const handleTransfer = async () => {
    try {
      await branchApi.requestTransfer(transferForm);
      setSuccess('Transfer request submitted');
      setShowTransfer(false);
      setTransferForm({ bookId: '', fromBranchId: '', toBranchId: '', quantity: 1, reason: '' });
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleApprove = async (id) => {
    try {
      await branchApi.approveTransfer(id, 'Approved');
      setSuccess('Transfer approved');
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleReject = async (id) => {
    try {
      await branchApi.rejectTransfer(id, 'Rejected');
      setSuccess('Transfer rejected');
      loadData();
    } catch (err) { setError(err.message); }
  };

  const loadInventory = async (branchId) => {
    try {
      const data = await branchApi.getInventory(branchId);
      setInventory(prev => ({ ...prev, [branchId]: data || [] }));
    } catch (err) {}
  };

  if (!backendAvailable) {
    return (
      <div className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto text-center">
        <div className="w-24 h-24 rounded-2xl bg-primary-container/20 flex items-center justify-center mb-lg">
          <span className="material-symbols-outlined text-5xl text-primary">account_balance</span>
        </div>
        <h1 className="text-headline-lg text-on-surface font-bold mb-sm">Branch Management</h1>
        <p className="text-body-md text-on-surface-variant mb-lg leading-relaxed">
          Multi-branch library support is coming soon! You'll be able to manage multiple library locations, transfer books between branches, and track inventory across your entire network.
        </p>
        <div className="grid grid-cols-3 gap-md w-full mb-lg">
          {[
            { icon: 'store', label: 'Multiple Branches' },
            { icon: 'swap_horiz', label: 'Book Transfers' },
            { icon: 'inventory', label: 'Cross-Branch Inventory' },
          ].map((f, i) => (
            <div key={i} className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined text-2xl text-primary">{f.icon}</span>
              <span className="text-label-sm text-on-surface-variant">{f.label}</span>
            </div>
          ))}
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-lg w-full text-left">
          <h3 className="text-title-sm text-on-surface font-semibold flex items-center gap-sm mb-sm">
            <span className="material-symbols-outlined text-primary">construction</span>
            Backend Service Required
          </h3>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            The branch management API endpoint isn't available yet. To enable this feature, add a Branch entity and controller to the backend. Contact your development team to set up the <code className="bg-surface-container-high rounded px-1 text-primary text-label-sm">/api/branches</code> endpoint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Branch Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Manage library branches, inventory, and transfers</p>
        </div>
      </div>

      {/* ── Messages ── */}
      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error flex items-center justify-between">
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">error</span> {error}
          </span>
          <button onClick={() => setError(null)} className="cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-md text-body-sm text-green-700 flex items-center justify-between">
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">check_circle</span> {success}
          </span>
          <button onClick={() => setSuccess(null)} className="cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-sm border-b border-outline-variant pb-0">
        {[
          { id: 'branches', icon: 'account_balance', label: `Branches (${branches.length})` },
          { id: 'transfers', icon: 'swap_horiz', label: `Transfers (${transfers.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-sm px-md py-sm text-label-lg font-medium transition cursor-pointer ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BRANCHES TAB ── */}
      {tab === 'branches' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => {
              setEditingBranch(null);
              setForm({ name: '', address: '', phone: '', email: '', description: '', openingHours: '', active: true });
              setShowForm(true);
            }}
              className="flex items-center gap-xs rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span> Add Branch
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl bg-surface-container-high animate-pulse" />)}
            </div>
          ) : branches.length === 0 ? (
            <div className="bg-surface border border-outline-variant rounded-xl p-xl text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-3xl text-primary">account_balance</span>
              </div>
              <h3 className="text-title-md text-on-surface font-semibold mb-sm">No Branches Configured</h3>
              <p className="text-body-sm text-on-surface-variant mb-md">Add your first library branch to get started</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-xs px-lg py-sm rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">add</span> Add Branch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {branches.map(b => (
                <div key={b.id} className="bg-surface border border-outline-variant rounded-xl p-md hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-sm">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-title-md font-semibold text-on-surface truncate">{b.name}</h3>
                      {b.description && <p className="text-body-xs text-on-surface-variant mt-xs line-clamp-2">{b.description}</p>}
                    </div>
                    <span className={'rounded-full px-2 py-0.5 text-label-xs font-medium flex-shrink-0 ml-sm ' +
                      (b.active ? 'bg-green-50 text-green-700' : 'bg-surface-variant text-on-surface-variant')}>
                      {b.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-lg gap-y-xs text-label-sm text-on-surface-variant">
                    {b.address && <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-xs">location_on</span>{b.address}</span>}
                    {b.phone && <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-xs">phone</span>{b.phone}</span>}
                    {b.email && <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-xs">email</span>{b.email}</span>}
                    {b.openingHours && <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-xs">schedule</span>{b.openingHours}</span>}
                  </div>
                  <div className="flex gap-md mt-md pt-sm border-t border-outline-variant/50">
                    <button onClick={() => { setSelectedBranchId(b.id); loadInventory(b.id); }}
                      className="flex items-center gap-xs text-label-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">inventory</span> Inventory
                    </button>
                    <button onClick={() => {
                      setEditingBranch(b);
                      setForm({ name: b.name, address: b.address || '', phone: b.phone || '', email: b.email || '', description: b.description || '', openingHours: b.openingHours || '', active: b.active });
                      setShowForm(true);
                    }}
                      className="flex items-center gap-xs text-label-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">edit</span> Edit
                    </button>
                    <button onClick={async () => {
                      if (window.confirm(`Delete "${b.name}"?`)) {
                        try {
                          await branchApi.delete(b.id);
                          setSuccess('Branch deleted');
                          loadData();
                        } catch (err) { setError(err.message); }
                      }
                    }}
                      className="flex items-center gap-xs text-label-sm font-medium text-error hover:text-error/80 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">delete</span> Delete
                    </button>
                  </div>

                  {/* Expanded Inventory */}
                  {selectedBranchId === b.id && inventory[b.id] && (
                    <div className="mt-md pt-md border-t border-outline-variant/50">
                      <div className="flex items-center justify-between mb-sm">
                        <p className="text-label-sm font-medium text-on-surface">Inventory ({inventory[b.id].length} books)</p>
                        <button onClick={() => { loadBookOptions(); setShowAddBook({ branchId: b.id, bookId: '', quantity: 1 }); }}
                          className="flex items-center gap-xs text-label-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-sm">add</span> Add Book
                        </button>
                      </div>
                      {inventory[b.id].length === 0 ? (
                        <p className="text-label-sm text-on-surface-variant">No books in this branch</p>
                      ) : (
                        <div className="space-y-xs max-h-48 overflow-y-auto">
                          {inventory[b.id].map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-xs rounded-lg bg-surface-container-low">
                              <div className="min-w-0">
                                <p className="text-label-sm font-medium text-on-surface truncate">{item.book?.title || `Book #${item.book?.id}`}</p>
                                <p className="text-label-xs text-on-surface-variant">Qty: {item.quantity} | Available: {item.availableQuantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TRANSFERS TAB ── */}
      {tab === 'transfers' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => { loadBookOptions(); setShowTransfer(true); }}
              className="flex items-center gap-xs rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary/90 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">swap_horiz</span> New Transfer
            </button>
          </div>

          {loading ? (
            <div className="space-y-sm">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-surface-container-high animate-pulse" />)}</div>
          ) : transfers.length === 0 ? (
            <div className="bg-surface border border-outline-variant rounded-xl p-xl text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-3xl text-primary">swap_horiz</span>
              </div>
              <h3 className="text-title-md text-on-surface font-semibold mb-sm">No Transfers</h3>
              <p className="text-body-sm text-on-surface-variant mb-md">No book transfer requests have been made yet</p>
              <button onClick={() => { loadBookOptions(); setShowTransfer(true); }}
                className="inline-flex items-center gap-xs px-lg py-sm rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">add</span> New Transfer Request
              </button>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-md py-sm bg-surface-container-low border-b border-outline-variant">
                <p className="text-body-sm text-on-surface font-medium">{transfers.length} transfer request(s)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm">
                  <thead className="text-on-surface-variant">
                    <tr>
                      <th className="px-md py-sm font-medium">Book</th>
                      <th className="px-md py-sm font-medium">From</th>
                      <th className="px-md py-sm font-medium">To</th>
                      <th className="px-md py-sm font-medium">Qty</th>
                      <th className="px-md py-sm font-medium">Status</th>
                      <th className="px-md py-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {transfers.map(t => (
                      <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-md py-sm font-medium text-on-surface">{t.bookTitle || t.book?.title || '—'}</td>
                        <td className="px-md py-sm text-on-surface-variant">{t.fromBranch || t.from?.name || '—'}</td>
                        <td className="px-md py-sm text-on-surface-variant">{t.toBranch || t.to?.name || '—'}</td>
                        <td className="px-md py-sm">{t.quantity}</td>
                        <td className="px-md py-sm">
                          <span className={'inline-block rounded-full px-2 py-0.5 text-label-xs font-medium ' +
                            (t.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                             t.status === 'approved' ? 'bg-green-50 text-green-700' :
                             t.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-surface-variant text-on-surface-variant')}>
                            {t.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-md py-sm">
                          <div className="flex gap-sm">
                            {t.status === 'pending' && (
                              <>
                                <button onClick={() => handleApprove(t.id)}
                                  className="text-label-sm font-medium text-green-600 hover:text-green-800 transition-colors cursor-pointer">Approve</button>
                                <button onClick={() => handleReject(t.id)}
                                  className="text-label-sm font-medium text-error hover:text-error/80 transition-colors cursor-pointer">Reject</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Branch Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative flex flex-col gap-md rounded-2xl bg-surface p-xl shadow-xl max-w-lg w-full mx-md" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">account_balance</span>
              </div>
              <h2 className="text-title-lg font-bold text-on-surface">{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
            </div>
            <div className="space-y-md">
              <input placeholder="Branch Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <input placeholder="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <div className="flex gap-md">
                <input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="flex-1 rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
                <input placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="flex-1 rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <input placeholder="Opening Hours (e.g. Mon-Fri 8AM-8PM)" value={form.openingHours} onChange={e => setForm(p => ({ ...p, openingHours: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="rounded border-outline-variant text-primary focus:ring-primary" />
                <span className="text-body-sm text-on-surface">Active branch</span>
              </label>
              <button onClick={handleSaveBranch}
                className="w-full rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary/90 transition-colors cursor-pointer">
                {editingBranch ? 'Update Branch' : 'Create Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Book Modal ── */}
      {showAddBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddBook(null)}>
          <div className="relative flex flex-col gap-md rounded-2xl bg-surface p-xl shadow-xl max-w-sm w-full mx-md" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAddBook(null)} className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">inventory</span>
              </div>
              <h2 className="text-title-lg font-bold text-on-surface">Add Book to Branch</h2>
            </div>
            <div className="space-y-md">
              <select value={showAddBook.bookId} onChange={e => setShowAddBook(p => ({ ...p, bookId: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                <option value="">Select a book...</option>
                {allBooks.map(b => <option key={b.id} value={b.id}>{b.title} by {b.author}</option>)}
              </select>
              <input type="number" min={1} placeholder="Quantity" value={showAddBook.quantity} onChange={e => setShowAddBook(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <button onClick={handleAddBook}
                className="w-full rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary/90 transition-colors cursor-pointer">
                Add to Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Transfer Modal ── */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowTransfer(false)}>
          <div className="relative flex flex-col gap-md rounded-2xl bg-surface p-xl shadow-xl max-w-sm w-full mx-md" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowTransfer(false)} className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">swap_horiz</span>
              </div>
              <h2 className="text-title-lg font-bold text-on-surface">Request Transfer</h2>
            </div>
            <div className="space-y-md">
              <select value={transferForm.bookId} onChange={e => setTransferForm(p => ({ ...p, bookId: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                <option value="">Select a book...</option>
                {allBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              <select value={transferForm.fromBranchId} onChange={e => setTransferForm(p => ({ ...p, fromBranchId: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                <option value="">From branch...</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={transferForm.toBranchId} onChange={e => setTransferForm(p => ({ ...p, toBranchId: e.target.value }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                <option value="">To branch...</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="number" min={1} placeholder="Quantity" value={transferForm.quantity} onChange={e => setTransferForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <textarea placeholder="Reason for transfer" value={transferForm.reason} onChange={e => setTransferForm(p => ({ ...p, reason: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
              <button onClick={handleTransfer}
                className="w-full rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary/90 transition-colors cursor-pointer">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

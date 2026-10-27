import { useState, useEffect } from 'react';
import { borrowingApi } from '../../services/api';

export default function Returns() {
  const [barcode, setBarcode] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    borrowingApi.getAll()
      .then((data) => setRecords(data?.filter((r) => r.status === 'BORROWED' || r.status === 'OVERDUE') || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBarcodeReturn = async () => {
    if (!barcode.trim()) return;
    // Barcode could be a borrowRecord ID
    try {
      await borrowingApi.return(barcode.trim());
      setRecords((prev) => prev.filter((r) => r.id?.toString() !== barcode.trim()));
      setSuccessMsg(`Return processed for transaction #${barcode}`);
      setBarcode('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = async (id) => {
    try {
      await borrowingApi.return(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setSuccessMsg(`Book returned successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  const calcDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="flex flex-col gap-lg p-lg max-w-7xl mx-auto">
      <h1 className="text-headline-lg font-bold text-on-surface">Returns</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-md text-body-sm text-red-700 flex items-center gap-sm">
          <span className="material-symbols-outlined text-sm">error</span> {error}
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-md text-body-sm text-green-700 flex items-center gap-sm">
          <span className="material-symbols-outlined text-sm">check_circle</span> {successMsg}
          <button onClick={() => setSuccessMsg(null)} className="ml-auto cursor-pointer text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      {/* Barcode Scanner Input */}
      <div className="rounded-xl border border-outline-variant bg-surface p-lg">
        <div className="flex items-center gap-md">
          <div className="flex flex-1 items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2">
            <span className="material-symbols-outlined text-outline">qr_code_scanner</span>
            <input
              type="text"
              placeholder="Scan or enter barcode (transaction ID)..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBarcodeReturn()}
              className="flex-1 bg-transparent text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>
          <button
            onClick={handleBarcodeReturn}
            className="rounded-lg bg-primary px-6 py-2 text-body-sm font-medium text-on-primary hover:bg-primary/90 transition cursor-pointer"
          >
            Process Return
          </button>
        </div>
      </div>

      {/* Return Queue */}
      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Active Borrows</h2>
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="p-md font-medium">Book Title</th>
                <th className="p-md font-medium">Member</th>
                <th className="p-md font-medium">Borrowed Date</th>
                <th className="p-md font-medium">Due Date</th>
                <th className="p-md font-medium">Days Overdue</th>
                <th className="p-md font-medium">Fine Amount</th>
                <th className="p-md font-medium">Status</th>
                <th className="p-md font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {loading ? (
                <tr><td colSpan={8} className="p-md text-center text-on-surface-variant">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="p-md text-center text-on-surface-variant">No active borrows to return</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low">
                  <td className="p-md font-medium text-on-surface">{r.bookTitle || 'Unknown'}</td>
                  <td className="p-md text-on-surface-variant">{r.userName || 'Unknown'}</td>
                  <td className="p-md text-on-surface-variant">{r.borrowDate || '-'}</td>
                  <td className="p-md text-on-surface-variant">{r.dueDate || '-'}</td>
                  <td className="p-md">
                    <span className={r.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-on-surface-variant'}>
                      {r.status === 'OVERDUE' ? `${calcDaysOverdue(r.dueDate)} days` : '—'}
                    </span>
                  </td>
                  <td className="p-md">
                    <span className={r.fineAmount > 0 ? 'text-red-600 font-medium' : 'text-on-surface-variant'}>
                      {r.fineAmount > 0 ? `$${Number(r.fineAmount).toFixed(2)}` : '—'}
                    </span>
                  </td>
                  <td className="p-md">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-label-lg font-medium ${
                      r.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-md">
                    <button
                      onClick={() => handleReturn(r.id)}
                      className="rounded-lg bg-green-50 px-3 py-1 text-label-lg font-medium text-green-700 hover:bg-green-100 transition cursor-pointer"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

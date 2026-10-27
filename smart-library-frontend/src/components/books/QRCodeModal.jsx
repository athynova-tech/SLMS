import { useState, useEffect } from 'react';
import { booksApi } from '../../services/api';

export default function QRCodeModal({ book, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book?.id) return;
    fetch(booksApi.getQRCode(book.id))
      .then((res) => res.json())
      .then((data) => {
        setQrData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [book?.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex flex-col items-center rounded-2xl bg-gradient-to-b from-white to-gray-50 px-10 pt-10 pb-8 shadow-2xl w-[460px] max-w-[95vw] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl leading-none">close</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-2xl text-blue-600">qr_code_scanner</span>
          <h2 className="text-xl font-bold text-gray-800">Scan to Borrow</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-80 h-80 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
            <p className="text-sm text-gray-400">Generating QR code...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="material-symbols-outlined text-6xl text-red-400">error_outline</span>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : qrData ? (
          <>
            {/* QR Code display - large, clean, solid white background */}
            <div className="rounded-2xl bg-white p-4 shadow-lg border border-gray-100 mb-5">
              <img
                src={qrData.qrCode}
                alt={`QR for ${qrData.title}`}
                className="w-80 h-80 object-contain"
              />
            </div>

            {/* Book details */}
            <div className="text-center w-full mb-6">
              <p className="text-lg font-bold text-gray-800 truncate max-w-full px-2">{qrData.title}</p>
              {qrData.isbn && (
                <p className="text-xs text-gray-400 mt-1 font-mono">ISBN: {qrData.isbn}</p>
              )}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5">
                <span className="material-symbols-outlined text-sm text-blue-600">qr_code_scanner</span>
                <span className="text-xs font-semibold text-blue-600">
                  Present this code at the counter to borrow
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrData.qrCode;
                  a.download = `qr-${qrData.bookId || 'book'}.png`;
                  a.click();
                }}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.97] transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download QR
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

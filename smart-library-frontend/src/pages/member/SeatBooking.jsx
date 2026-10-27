import { useState, useEffect } from 'react';
import { seatApi, attendanceApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SeatBooking() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [seatsData, reservationsData] = await Promise.all([
        seatApi.getAvailable(selectedDate),
        seatApi.getMyReservations(),
      ]);
      setAvailableSeats(seatsData || []);
      setMyReservations(reservationsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    setError(null);
    setSuccess(null);
    try {
      await seatApi.reserve({
        seatId: selectedSeat.id,
        date: selectedDate,
        startTime,
        endTime,
      });
      setSuccess(`Seat ${selectedSeat.seatNumber} reserved successfully!`);
      setSelectedSeat(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (id) => {
    try {
      await seatApi.cancelReservation(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn('QR_SCAN', null);
      setCheckedIn(true);
      setSuccess('Checked in successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      setCheckedIn(false);
      setSuccess('Checked out successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-lg max-w-6xl mx-auto p-lg">
      <h1 className="text-headline-lg font-bold text-on-surface">Study Room & Seat Booking</h1>

      {error && (
        <div className="rounded-lg bg-error-container/20 border border-error/30 p-md text-body-sm text-error">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">error</span> {error}
          <button onClick={() => setError(null)} className="float-right cursor-pointer"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-md text-body-sm text-green-700">
          <span className="material-symbols-outlined text-sm align-middle mr-xs">check_circle</span> {success}
          <button onClick={() => setSuccess(null)} className="float-right cursor-pointer"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {/* Quick Attendance Check-in/out */}
      <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface p-md">
        <span className="material-symbols-outlined text-2xl text-primary">qr_code_scanner</span>
        <div className="flex-1">
          <p className="text-body-sm font-medium text-on-surface">Library Visit</p>
          <p className="text-body-xs text-on-surface-variant">Check in when you arrive at the library</p>
        </div>
        <button onClick={checkedIn ? handleCheckOut : handleCheckIn}
          className={'rounded-lg px-md py-sm text-label-lg font-medium transition cursor-pointer ' +
            (checkedIn ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-primary text-on-primary hover:bg-primary/90')}>
          {checkedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-md">
        <label className="text-body-sm font-medium text-on-surface">Select Date:</label>
        <input type="date" value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none" />
      </div>

      {/* Available Seats Grid */}
      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Available Seats ({availableSeats.length})</h2>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-sm">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : availableSeats.length === 0 ? (
          <div className="text-center py-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">event_seat</span>
            <p className="text-body-sm mt-sm">No seats available for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-sm">
            {availableSeats.map((seat) => (
              <button key={seat.id}
                onClick={() => { setSelectedSeat(seat); setShowForm(true); }}
                className={`flex flex-col items-center gap-1 rounded-xl border p-md transition cursor-pointer ${
                  selectedSeat?.id === seat.id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : 'border-outline-variant bg-surface hover:border-primary hover:bg-primary/5'
                }`}>
                <span className="material-symbols-outlined text-lg text-primary">event_seat</span>
                <span className="text-label-sm font-medium text-on-surface">{seat.seatNumber}</span>
                <span className="text-label-xs text-on-surface-variant">{seat.seatType?.replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showForm && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative flex flex-col gap-md rounded-2xl bg-surface p-xl shadow-xl max-w-sm w-full mx-md" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-title-lg font-bold text-on-surface">Reserve Seat {selectedSeat.seatNumber}</h2>
            <p className="text-body-sm text-on-surface-variant">{selectedSeat.room} — {selectedSeat.seatType?.replace(/_/g, ' ')}</p>

            <div className="space-y-md">
              <div>
                <label className="text-body-sm font-medium text-on-surface">Date</label>
                <p className="text-body-sm text-on-surface-variant">{selectedDate}</p>
              </div>
              <div className="flex gap-md">
                <div className="flex-1">
                  <label className="text-body-sm font-medium text-on-surface">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none mt-xs" />
                </div>
                <div className="flex-1">
                  <label className="text-body-sm font-medium text-on-surface">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none mt-xs" />
                </div>
              </div>
              <button onClick={handleReserve}
                className="w-full rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary/90 transition cursor-pointer">
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Reservations */}
      <div>
        <h2 className="text-title-md font-semibold text-on-surface mb-md">My Reservations</h2>
        {myReservations.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">No seat reservations yet</p>
        ) : (
          <div className="space-y-sm">
            {myReservations.map((res) => (
              <div key={res.id} className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface p-md">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-lg text-primary">event_seat</span>
                  <div>
                    <p className="text-body-sm font-medium text-on-surface">Seat {res.seatNumber} — {res.room}</p>
                    <p className="text-label-sm text-on-surface-variant">{res.date} | {res.startTime} - {res.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={'rounded-full px-2 py-0.5 text-label-xs font-medium ' +
                    (res.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-surface-variant text-on-surface-variant')}>
                    {res.status}
                  </span>
                  {res.status === 'confirmed' && (
                    <button onClick={() => handleCancel(res.id)}
                      className="text-label-sm font-medium text-red-500 hover:text-red-700 transition cursor-pointer">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

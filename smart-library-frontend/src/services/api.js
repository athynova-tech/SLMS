const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: options.body instanceof FormData
      ? { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
      : headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ───
export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  me: () => request('/auth/me'),
  changePassword: (oldPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
};

// ─── Books ───
export const booksApi = {
  getAll: (page = 0, size = 12, extra = '') => request(`/books?page=${page}&size=${size}${extra}`),
  getById: (id) => request(`/books/${id}`),
  search: (query) => request(`/books/search?query=${encodeURIComponent(query)}`),
  searchAdvanced: (params) => request(`/books/search/classification?${new URLSearchParams(params)}`),
  getAvailable: () => request('/books/available'),
  getByClassification: (classification) => request(`/books/classification/${classification}`),
  getByGenre: (genre) => request(`/books/genre/${genre}`),
  getByTag: (tag) => request(`/books/tag/${encodeURIComponent(tag)}`),
  create: (data) => request('/books', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/books/${id}`, { method: 'DELETE' }),
  uploadImage: (id, formData) => request(`/books/${id}/image`, { method: 'POST', body: formData }),
  updateImage: (id, formData) => request(`/books/${id}/image`, { method: 'PUT', body: formData }),
  deleteImage: (id) => request(`/books/${id}/image`, { method: 'DELETE' }),
  getQRCode: (id) => `${BASE_URL}/books/${id}/qrcode`,
  getBatchQR: (categoryId) => request(`/books/qrcodes/batch/${categoryId}`),
};

// ─── Categories ───
export const categoriesApi = {
  getAll: () => request('/categories'),
  getById: (id) => request(`/categories/${id}`),
  create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Users / Members ───
export const usersApi = {
  getAll: () => request('/users'),
  getById: (id) => request(`/users/${id}`),
  search: (fullName) => request(`/users/search?fullName=${encodeURIComponent(fullName)}`),
  getByRole: (role) => request(`/users/role/${role}`),
  suspend: (id) => request(`/users/${id}/suspend`, { method: 'PUT' }),
  activate: (id) => request(`/users/${id}/activate`, { method: 'PUT' }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

// ─── Borrowing ───
export const borrowingApi = {
  getAll: () => request('/borrow'),
  getById: (id) => request(`/borrow/${id}`),
  getByUser: (userId) => request(`/borrow/user/${userId}`),
  getByBook: (bookId) => request(`/borrow/book/${bookId}`),
  getByStatus: (status) => request(`/borrow/status/${status}`),
  borrow: (data) => request('/borrow', { method: 'POST', body: JSON.stringify(data) }),
  requestBorrow: (userId, bookId) => request('/borrow/request', { method: 'POST', body: JSON.stringify({ userId, bookId }) }),
  getActiveBorrows: (userId) => request(`/borrow/user/${userId}`),
  getBorrowHistory: (userId) => request(`/borrow/user/${userId}?status=RETURNED`),
  approveBorrow: (id) => request(`/borrow/approve/${id}`, { method: 'PUT' }),
  declineBorrow: (id) => request(`/borrow/decline/${id}`, { method: 'PUT' }),
  memberReturn: (id, userId) => request(`/borrow/return/member/${id}?userId=${userId}`, { method: 'PUT' }),
  return: (id) => request(`/borrow/return/${id}`, { method: 'PUT' }),
  delete: (id) => request(`/borrow/${id}`, { method: 'DELETE' }),
  scan: (userId, qrContent) => request(`/borrow/scan?userId=${userId}&qrContent=${encodeURIComponent(qrContent)}`, { method: 'POST' }),
  payFine: (id) => request(`/borrow/fine/pay/${id}`, { method: 'POST' }),
};

// ─── Reading History ───
export const readingApi = {
  track: (userId, bookId, currentPage, totalPages) =>
    request('/reading/track', { method: 'POST', body: JSON.stringify({ userId, bookId, currentPage, totalPages }) }),
  getHistory: (userId) => request(`/reading/history/${userId}`),
  getProgress: (userId, bookId) => request(`/reading/progress/${userId}/${bookId}`),
};

// ─── Reservations ───
export const reservationsApi = {
  getAll: () => request('/reservations'),
  getByUser: (userId) => request(`/reservations/user/${userId}`),
  getByBook: (bookId) => request(`/reservations/book/${bookId}`),
  create: (userId, bookId) => request(`/reservations?userId=${userId}&bookId=${bookId}`, { method: 'POST' }),
  cancel: (id, userId) => request(`/reservations/${id}/cancel?userId=${userId}`, { method: 'PUT' }),
  getPosition: (userId, bookId) => request(`/reservations/position?userId=${userId}&bookId=${bookId}`),
};

// ─── Dashboard ───
export const dashboardApi = {
  getStats: () => request('/dashboard/stats'),
  getOverview: () => request('/dashboard/overview'),
  getPopularBooks: (limit = 10) => request(`/dashboard/popular/books?limit=${limit}`),
  getPopularCategories: (limit = 5) => request(`/dashboard/popular/categories?limit=${limit}`),
  getRecentBorrows: (limit = 10) => request(`/dashboard/recent/borrows?limit=${limit}`),
  getMonthlyBorrows: (months = 6) => request(`/dashboard/charts/monthly-borrows?months=${months}`),
  getClassificationChart: () => request('/dashboard/charts/classification'),
};

// ─── Reports ───
export const reportsApi = {
  getDaily: () => request('/reports/daily'),
  getFines: () => request('/reports/fines'),
  getUserActivity: () => request('/reports/users/activity'),
  getInventory: () => request('/reports/inventory'),
};

// ─── Notifications ───
export const notificationsApi = {
  getAll: (userId, unreadOnly = false) => request(`/notifications?userId=${userId}&unreadOnly=${unreadOnly}`),
  getUnreadCount: (userId) => request(`/notifications/unread-count?userId=${userId}`),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: (userId) => request(`/notifications/read-all?userId=${userId}`, { method: 'POST' }),
  delete: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
};

// ─── Recommendations ───
export const recommendationsApi = {
  getForBook: (bookId) => request(`/recommendations/book/${bookId}`),
  getForUser: (userId) => request(`/recommendations/user/${userId}`),
};

// ─── Reviews ───
export const reviewsApi = {
  getForBook: (bookId) => request(`/reviews/book/${bookId}`),
  getRating: (bookId) => request(`/reviews/book/${bookId}/rating`),
  create: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  update: (reviewId, data) => request(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (reviewId) => request(`/reviews/${reviewId}`, { method: 'DELETE' }),
};

// ─── E-Books ───
export const ebooksApi = {
  getAll: () => request('/ebooks'),
  getById: (id) => request(`/ebooks/${id}`),
  upload: (bookId, file, userId, title) => {
    const formData = new FormData();
    formData.append('bookId', bookId);
    formData.append('file', file?.name || file); // backend expects a String path
    formData.append('userId', userId);
    if (title) formData.append('title', title);
    return request('/ebooks/upload', { method: 'POST', body: formData });
  },
  delete: (id) => request(`/ebooks/${id}`, { method: 'DELETE' }),
};

// ─── Public Analytics (landing page) ───
export const analyticsApi = {
  getStats: () => request('/dashboard/stats'),
  getPopularBooks: (limit = 8) => request(`/dashboard/popular/books?limit=${limit}`),
  getMonthlyBorrows: (months = 6) => request(`/dashboard/charts/monthly-borrows?months=${months}`),
};

// ─── Seat Management ───
export const seatApi = {
  getAllReservations: (date) => request(`/seats/reservations?date=${date}`),
};
export const attendanceApi = {
  getDaily: (date) => request(`/attendance/daily?date=${date}`),
  getStats: () => request('/attendance/stats'),
};

// ─── Branch Management ───
export const branchApi = {
  getAll: () => request('/branches'),
  getById: (id) => request(`/branches/${id}`),
  create: (data) => request('/branches', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/branches/${id}`, { method: 'DELETE' }),
  getTransfers: () => request('/branches/transfers'),
  requestTransfer: (data) => request('/branches/transfers', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── AI Chat ───
export const chatApi = {
  sendMessage: (message) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};

export default { booksApi, categoriesApi, usersApi, borrowingApi, readingApi, reservationsApi, dashboardApi, reportsApi, notificationsApi, recommendationsApi, reviewsApi, ebooksApi, analyticsApi, seatApi, attendanceApi, branchApi, chatApi };

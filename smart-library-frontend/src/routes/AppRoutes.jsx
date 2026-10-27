import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/landing/Home';
import Features from '../pages/landing/Features';
import AIResearch from '../pages/landing/AIResearch';
import EBooks from '../pages/landing/EBooks';
import PublicAnalytics from '../pages/landing/Analytics';
import Login from '../pages/(auth)/Login';
import Register from '../pages/(auth)/Register';

import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminBooks from '../pages/admin/Book';
import AdminMembers from '../pages/admin/Members';
import AdminNotifications from '../pages/admin/Notifications';
import AdminReports from '../pages/admin/Reports';
import AdminSearch from '../pages/admin/Search';
import AdminSettings from '../pages/admin/Settings';
import AdminUsers from '../pages/admin/Users';
import AdminHelp from '../pages/admin/Help';
import AdminSeatManagement from '../pages/admin/SeatManagement';
import AdminBranchManagement from '../pages/admin/BranchManagement';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminEBooks from '../pages/admin/EBooks';

import LibrarianLayout from '../layouts/LibrarianLayout';
import LibrarianDashboard from '../pages/librarian/Dashboard';
import LibrarianBorrowing from '../pages/librarian/Borrowing';
import LibrarianInventory from '../pages/librarian/Inventory';
import LibrarianMembers from '../pages/librarian/Members';
import LibrarianReservations from '../pages/librarian/Reservations';
import LibrarianReturns from '../pages/librarian/Returns';
import LibrarianSeats from '../pages/librarian/Seats';

import MemberLayout from '../layouts/MemberLayout';
import MemberDashboard from '../pages/member/Dashboard';
import MemberAIAssistant from '../pages/member/AIAssistant';
import MemberSeatBooking from '../pages/member/SeatBooking';
import MemberMyBooks from '../pages/member/MyBooks';
import MemberProfile from '../pages/member/Profile';
import MemberReader from '../pages/member/Reader';
import MemberSearchBooks from '../pages/member/SearchBooks';
import MemberWishlist from '../pages/member/Wishlist';

import ProtectedRoute from '../components/common/ProtectedRoute';

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Redirect authenticated users to their dashboard instead of public pages
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <Home />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — redirects authenticated users */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
        <Route path="/ai-research" element={<PublicRoute><AIResearch /></PublicRoute>} />
        <Route path="/ebooks" element={<PublicRoute><EBooks /></PublicRoute>} />
        <Route path="/analytics" element={<PublicRoute><PublicAnalytics /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="search" element={<AdminSearch />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="help" element={<AdminHelp />} />
          <Route path="seats" element={<AdminSeatManagement />} />
          <Route path="branches" element={<AdminBranchManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="ebooks" element={<AdminEBooks />} />
        </Route>

        {/* Librarian */}
        <Route path="/librarian" element={<ProtectedRoute allowedRoles={['librarian']}><LibrarianLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LibrarianDashboard />} />
          <Route path="borrowing" element={<LibrarianBorrowing />} />
          <Route path="inventory" element={<LibrarianInventory />} />
          <Route path="members" element={<LibrarianMembers />} />
          <Route path="reservations" element={<LibrarianReservations />} />
          <Route path="returns" element={<LibrarianReturns />} />
          <Route path="seats" element={<LibrarianSeats />} />
        </Route>

        {/* Member */}
        <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="ai-assistant" element={<MemberAIAssistant />} />
          <Route path="my-books" element={<MemberMyBooks />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="reader/:bookId" element={<MemberReader />} />
          <Route path="search" element={<MemberSearchBooks />} />
          <Route path="wishlist" element={<MemberWishlist />} />
          <Route path="seats" element={<MemberSeatBooking />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

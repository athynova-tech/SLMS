import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const memberSidebarItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/member/dashboard' },
  { icon: 'menu_book', label: 'My Books', path: '/member/my-books' },
  { icon: 'search', label: 'Search Books', path: '/member/search' },
  { icon: 'favorite', label: 'Wishlist', path: '/member/wishlist' },
  { icon: 'smart_toy', label: 'AI Assistant', path: '/member/ai-assistant' },
  { icon: 'event_seat', label: 'Book a Seat', path: '/member/seats' },
  { icon: 'person', label: 'Profile', path: '/member/profile' },
];

const MemberLayout = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Member Portal"
        searchPlaceholder="Search books, authors, or genres..."
      />
      <div className="flex relative">
        {/* Sidebar — relative, not fixed, hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar
            items={memberSidebarItems}
            brandIcon="badge"
            brandTitle="Member Portal"
            brandSubtitle="Your Library Account"
            fixed={false}
            footerItem={{ icon: 'logout', label: 'Logout', onClick: handleLogout }}
          />
        </div>
        {/* Main content */}
        <main className="flex-1 pt-16 p-lg min-h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;

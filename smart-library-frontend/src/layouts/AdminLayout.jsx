import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const adminSidebarItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: 'people', label: 'Members', path: '/admin/members' },
  { icon: 'menu_book', label: 'Books', path: '/admin/books' },
  { icon: 'book', label: 'E-Books', path: '/admin/ebooks' },
  { icon: 'manage_accounts', label: 'Users', path: '/admin/users' },
  { icon: 'assessment', label: 'Reports', path: '/admin/reports' },
  { icon: 'notifications', label: 'Notifications', path: '/admin/notifications' },
  { icon: 'search', label: 'Smart Search', path: '/admin/search' },
  { icon: 'settings', label: 'Settings', path: '/admin/settings' },
  { icon: 'help', label: 'Help / FAQ', path: '/admin/help' },
  { icon: 'event_seat', label: 'Seats & Attendance', path: '/admin/seats' },
  { icon: 'account_balance', label: 'Branches', path: '/admin/branches' },
  { icon: 'insights', label: 'Analytics', path: '/admin/analytics' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Admin Portal"
        searchPlaceholder="Search resources, members, or reports..."
      />
      <Sidebar
        items={adminSidebarItems}
        brandIcon="account_balance"
        brandTitle="Admin Portal"
        brandSubtitle="Central Library Main"
        footerItem={{ icon: 'logout', label: 'Logout', onClick: handleLogout }}
      />
      <main className="ml-sidebar-expanded pt-16 p-lg flex-1 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const librarianSidebarItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/librarian/dashboard' },
  { icon: 'menu_book', label: 'Inventory', path: '/librarian/inventory' },
  { icon: 'people', label: 'Members', path: '/librarian/members' },
  { icon: 'import_contacts', label: 'Borrowing', path: '/librarian/borrowing' },
  { icon: 'event_available', label: 'Reservations', path: '/librarian/reservations' },
  { icon: 'assignment_return', label: 'Returns', path: '/librarian/returns' },
  { icon: 'event_seat', label: 'Seats & Attendance', path: '/librarian/seats' },
];

const LibrarianLayout = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Librarian Portal"
        searchPlaceholder="Search inventory, patrons, or reservations..."
      />
      <Sidebar
        items={librarianSidebarItems}
        brandIcon="badge"
        brandTitle="Librarian Portal"
        brandSubtitle="Circulation Desk"
        footerItem={{ icon: 'logout', label: 'Logout', onClick: handleLogout }}
      />
      <main className="ml-sidebar-expanded pt-16 p-lg flex-1 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default LibrarianLayout;

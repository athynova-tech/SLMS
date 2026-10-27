import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ title = 'Smart Library System', searchPlaceholder = 'Search books, members, or resources...' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAIClick = () => {
    if (user?.role === 'member') navigate('/member/ai-assistant');
    else if (user?.role === 'admin') navigate('/admin/dashboard');
    else navigate('/librarian/dashboard');
  };

  const handleMailClick = () => {
    // Navigate to profile/contact page
    if (user?.role === 'member') navigate('/member/profile');
    else if (user?.role === 'admin') navigate('/admin/settings');
    else navigate('/librarian/dashboard');
  };

  const handleThemeClick = () => {
    // Toggle dark/light mode by toggling a class on <html>
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Provide visual feedback
    const btn = document.activeElement;
    if (btn) btn.classList.add('animate-pulse');
    setTimeout(() => { if (btn) btn.classList.remove('animate-pulse'); }, 300);
  };

  // Apply saved theme on mount
  useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
  });

  return (
    <nav className="sticky top-0 z-50 h-16 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-margin-desktop">
      {/* Brand */}
      <div className="flex items-center gap-md">
        <span className="text-primary font-bold text-title-md">{title}</span>
      </div>

      {/* Search Bar — hidden on mobile */}
      <div className="hidden md:flex items-center w-full max-w-xl relative">
        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-body-md pointer-events-none">search</span>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-sm">
        {/* Notifications */}
        <NotificationBell />

        {/* AI Assistant */}
        <button
          onClick={handleAIClick}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-all hover:text-on-surface cursor-pointer"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined">smart_toy</span>
        </button>

        {/* Mail */}
        <button
          onClick={handleMailClick}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-all hover:text-on-surface cursor-pointer"
          title="Messages"
        >
          <span className="material-symbols-outlined">mail</span>
        </button>

        {/* Theme Toggle / Contrast */}
        <button
          onClick={handleThemeClick}
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-all hover:text-on-surface cursor-pointer"
          title="Toggle theme"
        >
          <span className="material-symbols-outlined">contrast</span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container text-label-lg font-semibold ml-sm">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

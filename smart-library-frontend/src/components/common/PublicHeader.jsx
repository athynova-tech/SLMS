import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/ai-research', label: 'AI Research' },
  { to: '/ebooks', label: 'E-Books' },
  { to: '/analytics', label: 'Analytics' },
];

const PublicHeader = () => {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-margin-desktop h-16 flex items-center justify-between gap-md">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-md flex-shrink-0">
          <span className="material-symbols-outlined text-primary">auto_stories</span>
          <span className="text-primary font-bold text-title-md hidden sm:inline">Smart Library System</span>
        </Link>

        {/* Section links — jump between screens without going back home */}
        <div className="hidden md:flex items-center gap-lg">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-body-md font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-sm flex-shrink-0">
          <Link
            to="/login"
            className="px-md py-sm text-body-md font-medium text-primary border border-outline-variant rounded-lg hover:bg-primary-container/10 transition-all active:scale-95"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-md py-sm text-body-md font-medium text-white bg-primary rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-sm shadow-primary/20"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;

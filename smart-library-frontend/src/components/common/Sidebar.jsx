import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({
  items = [],
  brandIcon = 'account_balance',
  brandTitle = 'Portal',
  brandSubtitle = '',
  fixed = true,
  footerItem = null,
}) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const sidebarClasses = fixed
    ? 'fixed left-0 top-16 h-[calc(100vh-64px)] w-sidebar-expanded'
    : 'w-sidebar-expanded';

  return (
    <aside className={`${sidebarClasses} bg-surface-container-low border-r border-outline-variant overflow-y-auto flex flex-col`}>
      {/* Brand Section */}
      <div className="flex items-center gap-md px-md py-lg border-b border-outline-variant">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container">{brandIcon}</span>
        </div>
        <div>
          <h2 className="text-title-md font-bold text-on-surface leading-tight">{brandTitle}</h2>
          {brandSubtitle && (
            <p className="text-label-lg text-on-surface-variant leading-tight mt-xs">{brandSubtitle}</p>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-sm px-sm">
        <ul className="flex flex-col gap-xs">
          {items.map((item, index) => {
            const active = isActive(item.path);
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-md px-md py-sm text-body-md rounded-full transition-all ${
                    active
                      ? 'bg-secondary-fixed text-on-secondary-fixed scale-95 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-md py-md border-t border-outline-variant space-y-xs">
        {footerItem && (
          <button
            onClick={footerItem.onClick}
            className="w-full flex items-center gap-md px-md py-sm text-body-md rounded-full transition-all text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">{footerItem.icon}</span>
            <span>{footerItem.label}</span>
          </button>
        )}
        <p className="text-label-lg text-on-surface-variant text-center">Smart Library System</p>
      </div>
    </aside>
  );
};

export default Sidebar;

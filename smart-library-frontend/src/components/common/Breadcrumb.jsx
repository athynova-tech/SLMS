import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-body-sm mb-md">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-xs">
            {index > 0 && (
              <span className="text-on-surface-variant mx-xs">/</span>
            )}
            {isLast ? (
              <span className="text-on-surface font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.path || '#'}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

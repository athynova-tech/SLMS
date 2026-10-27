import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant px-margin-desktop py-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-md">
        {/* Brand & Copyright */}
        <div className="text-center md:text-left">
          <h3 className="text-title-md font-bold text-on-surface">Smart Library System</h3>
          <p className="text-body-sm text-on-surface-variant mt-xs">
            &copy; {currentYear} Smart Library. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-md">
          <Link to="/privacy" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="/tos" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link to="/contact" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Contact
          </Link>
          <Link to="/accessibility" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Accessibility
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useEffect } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  type: 'route' | 'hash';
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  currentPath: string;
}

const MobileMenu = ({ open, onClose, navLinks, currentPath }: MobileMenuProps) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        open
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-sm bg-[#050505] border-l border-white/5 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img
              src="/images/space-city-logo.png"
              alt="Space City Luxury Rentals"
              className="h-10 w-10 object-contain"
              style={{ background: 'transparent' }}
            />
            <span className="museo-label text-white/70">SPACE CITY</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col px-6 py-8 gap-2">
          {navLinks.map((link) =>
            link.type === 'route' ? (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
                className={`museo-label text-lg py-3 border-b border-white/5 transition-colors ${
                  isActive(link.href)
                    ? 'text-[var(--space-gold)]'
                    : 'text-white/70 hover:text-[var(--space-gold)]'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="museo-label text-lg py-3 border-b border-white/5 text-white/70 hover:text-[var(--space-gold)] transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Bottom CTA */}
        <div className="absolute bottom-0 left-0 w-full px-6 py-8 border-t border-white/5">
          <Link
            to="/fleet"
            onClick={onClose}
            className="block w-full py-3 text-center bg-[var(--space-gold)] text-[#050505] museo-label text-sm hover:bg-[var(--space-gold)]/90 transition-colors"
          >
            View Fleet
          </Link>
          <Link
            to="/admin"
            onClick={onClose}
            className="mt-3 w-full py-3 flex items-center justify-center gap-2 border border-white/10 text-white/60 museo-label text-sm hover:text-white hover:border-white/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Admin
          </Link>
          <p className="museo-body text-white/30 text-xs text-center mt-4">
            Houston's Premier Luxury Rentals
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

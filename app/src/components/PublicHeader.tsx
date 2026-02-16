import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import MobileMenu from './MobileMenu';

const navLinks = [
  { label: 'Home', href: '/', type: 'route' as const },
  { label: 'Fleet', href: '/fleet', type: 'route' as const },
  { label: 'Inventory', href: '/inventory', type: 'route' as const },
  { label: 'Experiences', href: '/#experiences', type: 'hash' as const },
  { label: 'Contact', href: '/#contact', type: 'hash' as const },
];

const PublicHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="px-6 lg:px-16 py-4 flex items-center justify-between max-w-[1920px] mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/space-city-logo.png"
              alt="Space City Luxury Rentals"
              className="h-10 w-10 object-contain"
              style={{ background: 'transparent' }}
            />
            <span className="museo-label text-white/70 group-hover:text-white transition-colors">
              SPACE CITY
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.type === 'route' ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`museo-label transition-colors ${
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
                  className="museo-label text-white/70 hover:text-[var(--space-gold)] transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
            <Link
              to="/admin"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Admin"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </nav>

          {/* Admin icon for mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              to="/admin"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Admin"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center w-10 h-10 gap-1.5"
              aria-label="Open navigation menu"
            >
              <span className="block w-6 h-px bg-white/80" />
              <span className="block w-4 h-px bg-white/80" />
              <span className="block w-6 h-px bg-white/80" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
        currentPath={location.pathname}
      />
    </>
  );
};

export default PublicHeader;

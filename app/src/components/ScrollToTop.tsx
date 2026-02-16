import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scrolls to the top of the page on every route change.
 * Uses smooth scrolling for a clean transition, with an
 * instant fallback for the initial page load.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // If Lenis smooth scroll is active (landing page), use it
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: false, duration: 0.8 });
      return;
    }

    // Standard smooth scroll for all other pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

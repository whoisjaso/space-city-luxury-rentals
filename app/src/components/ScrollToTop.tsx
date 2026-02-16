import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Handles scroll position on every route change:
 * - Hash fragment (#section) → scroll to that element
 * - No hash → scroll to top
 * Works with Lenis (landing page) and native scroll (other pages).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Give the DOM a frame to render before scrolling
    const raf = requestAnimationFrame(() => {
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          if (window.lenis) {
            window.lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1 });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
      }

      // No hash or element not found — scroll to top
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: false, duration: 0.8 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

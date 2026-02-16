import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    // Intercept anchor link clicks for buttery smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: 0 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      delete window.lenis;
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  return lenisRef;
};

export default useLenis;

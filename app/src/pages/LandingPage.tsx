import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { siteConfig } from '../config';

// Hooks
import useLenis from '../hooks/useLenis';
import useCustomCursor from '../hooks/useCustomCursor';

// Sections
import Hero from '../sections/Hero';
import About from '../sections/About';
import Exhibitions from '../sections/Exhibitions';
import Collections from '../sections/Collections';
import Testimonials from '../sections/Testimonials';
import Visit from '../sections/Visit';
import Footer from '../sections/Footer';

function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  // Lenis ONLY for landing page -- destroys on unmount, native scroll resumes
  useLenis();

  // Custom cursor ONLY for landing page
  useCustomCursor();

  // Set document metadata
  useEffect(() => {
    if (siteConfig.language) {
      document.documentElement.lang = siteConfig.language;
    }
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }
  }, []);

  // Background color transitions -- using useGSAP for automatic cleanup
  useGSAP(() => {
    const sections = [
      { selector: '#hero-section', color: '#8c8c91' },
      { selector: '#about', color: '#050505' },
      { selector: '#fleet', color: '#050505' },
      { selector: '#experiences', color: '#f0f0f0' },
      { selector: '#testimonials-section', color: '#8c8c91' },
      { selector: '#contact', color: '#050505' },
      { selector: '#footer-section', color: '#8c8c91' },
    ];

    sections.forEach(({ selector, color }) => {
      const el = document.querySelector(selector);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to('body', { backgroundColor: color, duration: 0.6, ease: 'power2.out' });
        },
        onEnterBack: () => {
          gsap.to('body', { backgroundColor: color, duration: 0.6, ease: 'power2.out' });
        },
      });
    });
  }, { scope: mainRef });

  // Nuclear cleanup on unmount: catch ANY orphaned triggers from all child sections
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearMatchMedia();
      // Reset body background to default dark color
      document.body.style.backgroundColor = '#050505';
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">
      {/* Hero Section */}
      <div id="hero-section">
        <Hero />
      </div>

      {/* About Section */}
      <About />

      {/* Exhibitions Section */}
      <Exhibitions />

      {/* Collections Section */}
      <Collections />

      {/* Testimonials Section */}
      <div id="testimonials-section">
        <Testimonials />
      </div>

      {/* Visit Section */}
      <Visit />

      {/* Footer */}
      <div id="footer-section">
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { heroConfig } from '../config';
import MobileMenu from '../components/MobileMenu';

const heroNavLinks = heroConfig.navLinks.map((link) => ({
  label: link.label,
  href: link.href,
  type: 'hash' as const,
}));

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statueRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useGSAP(() => {
    const section = sectionRef.current;
    const statue = statueRef.current;
    const leftText = leftTextRef.current;
    const rightText = rightTextRef.current;
    const nav = navRef.current;
    const badge = badgeRef.current;
    const bottom = bottomRef.current;

    if (!section || !statue || !leftText || !rightText || !nav || !badge || !bottom) return;

    // Set initial states
    gsap.set([leftText, rightText], { opacity: 0, y: 60 });
    gsap.set(statue, { opacity: 0, scale: 1.08, y: 40 });
    gsap.set(nav, { opacity: 0, y: -20 });
    gsap.set(badge, { opacity: 0, y: 20 });
    gsap.set(bottom, { opacity: 0 });

    // Entrance timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.3,
    });

    tl.to(statue, { opacity: 1, scale: 1, y: 0, duration: 1.4 })
      .to(leftText, { opacity: 1, y: 0, duration: 1 }, '-=1')
      .to(rightText, { opacity: 1, y: 0, duration: 1 }, '-=0.85')
      .to(nav, { opacity: 1, y: 0, duration: 0.7 }, '-=0.7')
      .to(badge, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')
      .to(bottom, { opacity: 1, duration: 0.5 }, '-=0.3')
      .then(() => {
        // Clear inline styles from statue to kill the GPU compositing layer
        // that creates a visible "box" behind the transparent logo
        if (statue) gsap.set(statue, { clearProps: 'all' });
      });

    // Scroll parallax — only on desktop
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(statue, { y: p * 120 });
          gsap.set(leftText, { y: p * 200, x: p * -60 });
          gsap.set(rightText, { y: p * 180, x: p * 60 });
          gsap.set(badge, { y: p * 80 });
        },
      });
    });
  }, { scope: sectionRef });

  if (!heroConfig.brandLeft && !heroConfig.brandRight) return null;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden bg-[#0a0a12]"
      >
        {/* Navigation */}
        <nav
          ref={navRef}
          className="absolute top-0 left-0 w-full z-50 px-6 lg:px-16 py-4 lg:py-6 flex items-center justify-between will-change-transform"
        >
          <a href="#hero-section" className="flex items-center gap-3">
            <img src="/images/space-city-logo.png" alt="Space City Luxury Rentals" className="h-10 w-10 object-contain" />
            <span className="museo-label text-white/70">SPACE CITY</span>
          </a>
          <div className="flex items-center gap-4">
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {heroConfig.navLinks.map((link, i) => (
                <a key={i} href={link.href} className="museo-label text-white/70 hover:text-white transition-colors">{link.label}</a>
              ))}
            </div>
            {/* Admin icon */}
            <a
              href="/admin"
              data-cursor="hover"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Admin"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5"
              aria-label="Open navigation menu"
            >
              <span className="block w-6 h-px bg-white/80" />
              <span className="block w-4 h-px bg-white/80" />
              <span className="block w-6 h-px bg-white/80" />
            </button>
          </div>
        </nav>

        {/* Main hero content
             Mobile: flex-col centered (logo → brand → tagline)
             Desktop: flex-row 3-column (text | logo | text)
        */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-6 lg:px-12">
          {/* Left text block — hidden on mobile, shown on desktop */}
          <div
            ref={leftTextRef}
            className="hidden md:flex flex-col items-end text-right flex-1 pr-6 lg:pr-12 will-change-transform"
          >
            <h1 className="museo-headline text-white text-[9vw] lg:text-[7vw] leading-[0.85]">
              {heroConfig.brandLeft}
            </h1>
            <p className="museo-body text-white/60 text-sm md:text-base max-w-[240px] mt-6">
              {heroConfig.tagline}
            </p>
            <div className="flex items-center gap-4 mt-6">
              {heroConfig.socialLinks.map((link, i) => (
                <a key={i} href={link.href} className="museo-label text-white/40 hover:text-white transition-colors text-[10px]" data-cursor="hover">{link.label}</a>
              ))}
            </div>
          </div>

          {/* Center logo */}
          <div
            ref={statueRef}
            className="relative flex-shrink-0 w-[55vw] md:w-[36vw] lg:w-[30vw] max-w-[300px] md:max-w-[560px]"
          >
            <div
              ref={badgeRef}
              className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 museo-label text-white/50 text-[10px] whitespace-nowrap will-change-transform"
            >
              {heroConfig.badge}
            </div>
            <img
              src={heroConfig.heroImage}
              alt={heroConfig.heroImageAlt}
              className="w-full h-auto object-contain"
              style={{ background: 'transparent', isolation: 'isolate' }}
            />
          </div>

          {/* Right text block — hidden on mobile, shown on desktop */}
          <div
            ref={rightTextRef}
            className="hidden md:flex flex-col items-start text-left flex-1 pl-6 lg:pl-12 will-change-transform"
          >
            <h1 className="museo-headline text-white text-[9vw] lg:text-[7vw] leading-[0.85]">
              {heroConfig.brandRight}
            </h1>
            <p className="museo-label text-white/40 mt-6 text-[10px]">{heroConfig.since}</p>
            {heroConfig.email && (
              <a
                href={`mailto:${heroConfig.email}`}
                className="museo-label text-white/40 hover:text-white transition-colors text-[10px] mt-4"
                data-cursor="hover"
              >
                {heroConfig.email}
              </a>
            )}
          </div>

          {/* Mobile-only: brand name + tagline below logo */}
          <div className="md:hidden text-center mt-6">
            <h1 className="museo-headline text-white text-[14vw] leading-[0.85]">
              {heroConfig.brandLeft}
            </h1>
            <h1 className="museo-headline text-white text-[14vw] leading-[0.85] mt-1">
              {heroConfig.brandRight}
            </h1>
            <p className="museo-body text-white/60 text-sm max-w-[280px] mx-auto mt-5">
              {heroConfig.tagline}
            </p>
            <p className="museo-label text-white/40 mt-4 text-[10px]">{heroConfig.since}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              {heroConfig.socialLinks.map((link, i) => (
                <a key={i} href={link.href} className="museo-label text-white/40 hover:text-white transition-colors text-[10px]">{link.label}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          ref={bottomRef}
          className="absolute bottom-0 left-0 w-full z-20 px-6 lg:px-16 py-4 lg:py-5 flex items-center justify-between border-t border-white/10"
        >
          <p className="museo-label text-white/30 text-[10px]">{heroConfig.scrollText}</p>
          <p className="museo-label text-white/30 text-[10px]">{heroConfig.copyrightText}</p>
        </div>
      </section>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={heroNavLinks}
        currentPath="/"
      />
    </>
  );
};

export default Hero;

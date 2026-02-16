import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { heroConfig } from '../config';

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statueRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  if (!heroConfig.brandLeft && !heroConfig.brandRight) return null;

  useEffect(() => {
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
      .to(bottom, { opacity: 1, duration: 0.5 }, '-=0.3');

    // Scroll parallax — statue moves slower, text drifts outward
    const scrollTrigger = ScrollTrigger.create({
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
    triggersRef.current.push(scrollTrigger);

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#8c8c91]"
    >
      {/* Navigation */}
      <nav
        ref={navRef}
        className="absolute top-0 left-0 w-full z-50 px-8 lg:px-16 py-6 flex items-center justify-between will-change-transform"
      >
        <div className="museo-label text-white/70">{heroConfig.brandLeft} {heroConfig.brandRight}</div>
        <div className="flex items-center gap-8">
          {heroConfig.navLinks.map((link, i) => (
            <a key={i} href={link.href} className="museo-label text-white/70 hover:text-white transition-colors">{link.label}</a>
          ))}
        </div>
      </nav>

      {/* Main hero content — 3-column: text | statue | text */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 lg:px-12">
        {/* Left text block */}
        <div
          ref={leftTextRef}
          className="flex flex-col items-end text-right flex-1 pr-6 lg:pr-12 will-change-transform"
        >
          <h1 className="museo-headline text-white text-[11vw] md:text-[9vw] lg:text-[7vw] leading-[0.85]">
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

        {/* Center statue */}
        <div
          ref={statueRef}
          className="relative flex-shrink-0 w-[36vw] md:w-[30vw] lg:w-[26vw] max-w-[480px] will-change-transform"
        >
          {/* Badge above statue */}
          <div
            ref={badgeRef}
            className="absolute -top-10 left-1/2 -translate-x-1/2 museo-label text-white/50 text-[10px] whitespace-nowrap will-change-transform"
          >
            {heroConfig.badge}
          </div>
          <img
            src={heroConfig.heroImage}
            alt={heroConfig.heroImageAlt}
            className="w-full h-auto object-contain"
            style={{
              maskImage: 'radial-gradient(ellipse 72% 78% at 50% 45%, black 45%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at 50% 45%, black 45%, transparent 100%)',
            }}
          />
        </div>

        {/* Right text block */}
        <div
          ref={rightTextRef}
          className="flex flex-col items-start text-left flex-1 pl-6 lg:pl-12 will-change-transform"
        >
          <h1 className="museo-headline text-white text-[11vw] md:text-[9vw] lg:text-[7vw] leading-[0.85]">
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
      </div>

      {/* Bottom bar */}
      <div
        ref={bottomRef}
        className="absolute bottom-0 left-0 w-full z-20 px-8 lg:px-16 py-5 flex items-center justify-between border-t border-white/10"
      >
        <p className="museo-label text-white/30 text-[10px]">{heroConfig.scrollText}</p>
        <p className="museo-label text-white/30 text-[10px]">{heroConfig.copyrightText}</p>
      </div>
    </section>
  );
};

export default Hero;

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { exhibitionsConfig } from '../config';

const Exhibitions = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;
    const cta = ctaRef.current;

    if (!section || !header || !grid || !cta) return;

    // Header reveal
    const headerEls = header.querySelectorAll('.reveal-header');
    headerEls.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
        },
      });
    });

    // Card staggered reveal — translate from below + opacity 0.4 -> 1
    const cards = grid.querySelectorAll<HTMLElement>('.exhibit-card');
    cards.forEach((card, i) => {
      const yOffset = [0, 100, 200, 300][i] || 0;
      gsap.set(card, { opacity: 0.4, y: yOffset });

      ScrollTrigger.create({
        trigger: card,
        start: 'top 95%',
        end: 'top 30%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(card, {
            opacity: 0.4 + p * 0.6,
            y: yOffset * (1 - p),
          });
        },
      });
    });

    // CTA reveal
    gsap.set(cta, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: cta,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(cta, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      },
    });
  }, { scope: sectionRef });

  if (!exhibitionsConfig.headline && exhibitionsConfig.exhibitions.length === 0) return null;

  return (
    <section
      id="fleet"
      ref={sectionRef}
      className="relative w-full bg-[#050505] py-32 px-8 lg:px-16"
    >
      {/* Section Header */}
      <div ref={headerRef} className="max-w-7xl mx-auto mb-16">
        <p className="reveal-header museo-label text-[#D4AF37] mb-4">
          {exhibitionsConfig.label}
        </p>
        <h2 className="reveal-header museo-headline text-white text-4xl md:text-5xl lg:text-7xl">
          {exhibitionsConfig.headline}
        </h2>
      </div>

      {/* 2x2 Exhibition Grid */}
      <div ref={gridRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {exhibitionsConfig.exhibitions.map((exhibit) => (
          <div
            key={exhibit.id}
            className="exhibit-card group relative overflow-hidden will-change-transform"
            data-cursor="hover"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={exhibit.image}
                alt={exhibit.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8">
              <p className="museo-label text-white/50 mb-2 text-[10px]">{exhibit.date}</p>
              <h3 className="museo-headline text-white text-xl md:text-2xl lg:text-3xl">
                {exhibit.title}
              </h3>
            </div>

            {/* Hover border */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-[#D4AF37]/30 transition-colors duration-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Get Tickets CTA */}
      {exhibitionsConfig.ctaText && (
        <div ref={ctaRef} className="max-w-7xl mx-auto mt-12 flex justify-center">
          <button
            data-cursor="hover"
            className="museo-label text-[#D4AF37] border border-[#D4AF37]/30 px-10 py-4 hover:bg-[#D4AF37] hover:text-[#050505] transition-all duration-300"
          >
            {exhibitionsConfig.ctaText}
          </button>
        </div>
      )}
    </section>
  );
};

export default Exhibitions;

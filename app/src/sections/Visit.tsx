import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { MapPin, Clock, Calendar, Ticket } from 'lucide-react';
import { visitConfig } from '../config';

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  MapPin,
  Clock,
  Calendar,
  Ticket,
};

const Visit = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  if (!visitConfig.headline && visitConfig.infoCards.length === 0) return null;

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;

    if (!section || !cards) return;

    const cardElements = cards.querySelectorAll('.info-card');
    cardElements.forEach((card, i) => {
      gsap.set(card, { opacity: 0, y: 40 });
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'power3.out',
          });
        },
      });
      triggersRef.current.push(trigger);
    });

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full bg-[#050505] py-32 px-8 lg:px-16"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <p className="museo-label text-white/50 mb-4">{visitConfig.label}</p>
        <h2
          className="museo-headline text-white text-4xl md:text-5xl lg:text-6xl mb-8"
          dangerouslySetInnerHTML={{ __html: visitConfig.headline }}
        />
        <p className="museo-body text-white/60 text-lg max-w-2xl">
          {visitConfig.description}
        </p>
      </div>

      {/* Info Cards Grid */}
      <div
        ref={cardsRef}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {visitConfig.infoCards.map((card, i) => {
          const IconComponent = iconMap[card.icon];
          return (
            <div key={i} className="info-card p-8 border border-white/10 hover:border-white/20 transition-colors">
              {IconComponent && <IconComponent className="w-8 h-8 text-white/50 mb-6" strokeWidth={1.5} />}
              <h3 className="museo-headline text-white text-xl mb-3">{card.title}</h3>
              <div
                className="museo-body text-white/60 text-sm"
                dangerouslySetInnerHTML={{ __html: card.content }}
              />
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {visitConfig.ctaText && (
        <div className="max-w-7xl mx-auto mt-16 text-center">
          <button
            data-cursor="hover"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#050505] museo-label hover:bg-white/90 transition-colors"
          >
            {visitConfig.ctaText}
          </button>
        </div>
      )}
    </section>
  );
};

export default Visit;

import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleAvailability } from '../hooks/useVehicleAvailability';
import { Phone, Mail, Instagram } from 'lucide-react';

const EXPERIENCE_TAGS = [
  'All',
  'Date Night',
  'Content Ready',
  'Boss Move',
  'Wedding Day',
  'Weekend Takeover',
  'Statement',
];

function InventoryPage() {
  const [activeTag, setActiveTag] = useState('All');
  const { data: vehicles = [], isLoading } = useVehicles();
  const { data: unavailableIds = new Set<string>() } = useVehicleAvailability();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const filteredVehicles =
    activeTag === 'All'
      ? vehicles
      : vehicles.filter((v) => v.experience_tags.includes(activeTag));

  useGSAP(
    () => {
      if (!headerRef.current) return;

      // Header cinematic reveal
      const headerEls = headerRef.current.querySelectorAll('.reveal-el');
      headerEls.forEach((el, i) => {
        gsap.set(el, { opacity: 0, y: 50 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2 + i * 0.15,
          ease: 'power3.out',
        });
      });

      // Cards stagger reveal on scroll
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('[data-inventory-card]');
        cards.forEach((card, i) => {
          gsap.set(card, { opacity: 0, y: 60 });
          ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            onEnter: () => {
              gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: i * 0.08,
                ease: 'power3.out',
              });
            },
          });
        });
      }

      // CTA section reveal
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 0, y: 40 });
        ScrollTrigger.create({
          trigger: ctaRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(ctaRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
            });
          },
        });
      }

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: sectionRef, dependencies: [filteredVehicles.length, isLoading] },
  );

  const formatPrice = (cents: number) =>
    `$${(cents / 100).toLocaleString()}`;

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#050505]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Ambient gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0818] via-[#050505] to-[#050505]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2E1065]/10 blur-[120px] rounded-full" />

        <div
          ref={headerRef}
          className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-12 sm:pt-20 pb-12 sm:pb-16"
        >
          <p className="reveal-el museo-label text-[#D4AF37] mb-4">THE COLLECTION</p>
          <h1 className="reveal-el museo-headline text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            Current Inventory
          </h1>
          <p className="reveal-el museo-body text-white/50 text-lg sm:text-xl max-w-2xl mb-10">
            Every vehicle in our collection is hand-selected, immaculately maintained,
            and ready to transform your weekend. This is what&apos;s available right now.
          </p>

          {/* Experience filter pills */}
          <div className="reveal-el flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {EXPERIENCE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                data-cursor="hover"
                className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTag === tag
                    ? 'bg-[#D4AF37] text-[#050505] shadow-lg shadow-[#D4AF37]/20'
                    : 'border border-white/20 text-white/50 hover:border-[#D4AF37]/50 hover:text-white/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        </div>
      </div>

      {/* Vehicle count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <p className="museo-label text-white/30">
            {filteredVehicles.length} VEHICLE{filteredVehicles.length !== 1 ? 'S' : ''} AVAILABLE
          </p>
          <Link
            to="/fleet"
            className="museo-label text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors text-xs"
          >
            VIEW CINEMATIC FLEET &rarr;
          </Link>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-white/5 rounded-none" />
              </div>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-24">
            <p className="museo-headline text-white/20 text-3xl mb-4">No Matches</p>
            <p className="museo-body text-white/30 mb-6">
              No vehicles match the &ldquo;{activeTag}&rdquo; experience.
            </p>
            <button
              onClick={() => setActiveTag('All')}
              data-cursor="hover"
              className="museo-label text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-3 hover:bg-[#D4AF37] hover:text-[#050505] transition-all duration-300"
            >
              View All Vehicles
            </button>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {filteredVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/fleet/${vehicle.slug}`}
                data-inventory-card
                data-cursor="hover"
                className="group relative overflow-hidden"
              >
                {/* Image with cinematic overlay */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={vehicle.images[0] || '/images/placeholder-vehicle.jpg'}
                    alt={vehicle.name}
                    className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105${
                      unavailableIds.has(vehicle.id) ? ' grayscale brightness-50' : ''
                    }`}
                    loading="lazy"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top-left: availability */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-6">
                    {unavailableIds.has(vehicle.id) ? (
                      <span className="museo-label text-white/40 text-[10px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        CURRENTLY RENTED
                      </span>
                    ) : (
                      <span className="museo-label text-emerald-400 text-[10px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        AVAILABLE NOW
                      </span>
                    )}
                  </div>

                  {/* Top-right: price badge */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-6 bg-[#050505]/60 backdrop-blur-sm border border-[#D4AF37]/30 px-4 py-1.5">
                    <span className="text-[#D4AF37] text-sm font-bold tracking-wide">
                      {formatPrice(vehicle.daily_price_cents)}
                    </span>
                    <span className="text-white/40 text-xs">/day</span>
                  </div>

                  {/* Bottom text overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6">
                    {/* Identity headline */}
                    <p className="museo-label text-white/50 text-[10px] mb-2">
                      {vehicle.experience_tags.join(' · ')}
                    </p>
                    <h3 className="museo-headline text-white text-xl sm:text-2xl lg:text-3xl mb-1 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {vehicle.name}
                    </h3>
                    <p className="museo-body text-white/50 text-sm line-clamp-1">
                      {vehicle.headline}
                    </p>
                  </div>

                  {/* Hover border */}
                  <div className="absolute inset-0 border border-white/0 group-hover:border-[#D4AF37]/30 transition-colors duration-500 pointer-events-none" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Book CTA — matches landing page style */}
      <div ref={ctaRef} className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0d0818] to-[#050505]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#2E1065]/8 blur-[100px] rounded-full" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center">
          <p className="museo-label text-[#D4AF37] mb-4">RESERVE NOW</p>
          <h2 className="museo-headline text-white text-3xl sm:text-4xl md:text-5xl mb-6">
            Your Weekend.<br />Your Statement.
          </h2>
          <p className="museo-body text-white/50 text-lg max-w-xl mx-auto mb-10">
            Book in under 60 seconds. Pick your ride, choose your dates, and
            show up like the version of yourself you always knew was there.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/book"
              data-cursor="hover"
              className="museo-label bg-[#D4AF37] text-[#050505] px-10 py-4 hover:bg-[#D4AF37]/90 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Book a Vehicle
            </Link>
            <a
              href="tel:6673917797"
              data-cursor="hover"
              className="museo-label text-white border border-white/20 px-10 py-4 hover:bg-white/10 hover:border-white/40 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Call (667) 391-7797
            </a>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center gap-6">
            <a
              href="tel:6673917797"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href="mailto:Primetaxsolutions25@gmail.com"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/gtprofit100"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;

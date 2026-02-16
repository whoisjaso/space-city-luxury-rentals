import { useState, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useVehicles } from '../hooks/useVehicles';
import VehicleCard from '../components/VehicleCard';
import ExperienceFilter from '../components/ExperienceFilter';

// ---------------------------------------------------------------
// FleetPage — the primary vehicle discovery experience.
// Vehicles presented with cinematic imagery and identity headlines.
// Experience tag filtering lets users find the right vibe.
// ---------------------------------------------------------------

const EXPERIENCE_TAGS = [
  'All',
  'Date Night',
  'Content Ready',
  'Boss Move',
  'Wedding Day',
  'Weekend Takeover',
  'Statement',
];

function FleetPage() {
  const [activeTag, setActiveTag] = useState('All');
  const { data: vehicles = [], isLoading, error } = useVehicles();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter vehicles by experience tag
  const filteredVehicles =
    activeTag === 'All'
      ? vehicles
      : vehicles.filter((v) => v.experience_tags.includes(activeTag));

  // GSAP scroll animations for header and cards
  useGSAP(
    () => {
      if (!headerRef.current || !gridRef.current) return;

      // Header fade-in
      gsap.from(headerRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Cards stagger-reveal on scroll
      const cards = gridRef.current.querySelectorAll('[data-vehicle-card]');
      if (cards.length > 0) {
        gsap.from(cards, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Cleanup ScrollTrigger instances on unmount
      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: sectionRef, dependencies: [filteredVehicles.length, isLoading] },
  );

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-8 pb-20">
        {/* Page header */}
        <div ref={headerRef} className="mb-12 space-y-4">
          <span className="museo-label text-[#D4AF37] block">THE FLEET</span>
          <h1 className="museo-headline text-white text-4xl md:text-5xl lg:text-6xl">
            Who Do You Want to Be
            <br />
            This Weekend?
          </h1>
          <p className="museo-body text-white/40 text-lg max-w-2xl">
            Every vehicle is a statement. Pick your identity, book in seconds, and
            show up like the version of yourself you always knew was there.
          </p>
        </div>

        {/* Experience filter */}
        <div className="mb-10">
          <ExperienceFilter
            tags={EXPERIENCE_TAGS}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        </div>

        {/* Vehicle grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-white/5 rounded-xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-5 bg-white/5 rounded-full w-20" />
                    <div className="h-5 bg-white/5 rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400/80 text-lg mb-2">
              Unable to load vehicles
            </p>
            <p className="text-white/30 text-sm">
              Please try again later.
            </p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg mb-2">
              No vehicles match this experience
            </p>
            <button
              onClick={() => setActiveTag('All')}
              className="text-[#D4AF37] text-sm hover:underline"
            >
              View all vehicles
            </button>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} data-vehicle-card>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FleetPage;

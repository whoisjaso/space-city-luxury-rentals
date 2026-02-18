import { useRef } from 'react';
import { useParams, Link } from 'react-router';
import { gsap, useGSAP } from '../lib/gsap';
import { useVehicle } from '../hooks/useVehicle';
import { useVehicleAvailability } from '../hooks/useVehicleAvailability';
import ImageGallery from '../components/ImageGallery';

// ---------------------------------------------------------------
// VehicleDetailPage — cinematic single-vehicle page.
// Hero gallery, identity headline, social proof, and booking CTA
// combine to sell the experience of arriving in this vehicle.
// ---------------------------------------------------------------

function VehicleDetailPage() {
  const { slug } = useParams();
  const { data: vehicle, isLoading, error } = useVehicle(slug ?? '');
  const { data: unavailableIds } = useVehicleAvailability();

  const pageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animations
  useGSAP(
    () => {
      if (!vehicle || !galleryRef.current || !contentRef.current || !pricingRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Gallery fades in
      tl.from(galleryRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
      });

      // Text content staggers in from left
      tl.from(
        contentRef.current.children,
        {
          opacity: 0,
          x: -30,
          duration: 0.6,
          stagger: 0.12,
        },
        '-=0.3',
      );

      // Pricing card slides in from right
      tl.from(
        pricingRef.current,
        {
          opacity: 0,
          x: 30,
          duration: 0.6,
        },
        '-=0.4',
      );
    },
    { scope: pageRef, dependencies: [vehicle] },
  );

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 pt-6 sm:pt-8 pb-20 animate-pulse">
          {/* Back link skeleton */}
          <div className="h-4 w-32 bg-white/5 rounded mb-8" />
          {/* Gallery skeleton */}
          <div className="aspect-[16/9] bg-white/5 rounded-xl mb-10" />
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-10 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-20 bg-white/5 rounded w-full" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 bg-white/5 rounded-full w-24" />
                <div className="h-6 bg-white/5 rounded-full w-20" />
                <div className="h-6 bg-white/5 rounded-full w-28" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="h-64 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Error / Not Found state ----
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="museo-headline text-white text-3xl md:text-4xl">
            Vehicle Not Found
          </h1>
          <p className="museo-body text-white/40 text-lg">
            {error
              ? 'Something went wrong loading this vehicle.'
              : "We couldn't find a vehicle with that name."}
          </p>
          <Link
            to="/fleet"
            className="inline-block mt-4 text-[#D4AF37] museo-label hover:underline"
          >
            &larr; Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  // ---- Price formatting ----
  const formattedPrice = `$${(vehicle.daily_price_cents / 100).toLocaleString()}`;
  const isPopular = vehicle.rental_count > 10;
  const isUnavailable = unavailableIds?.has(vehicle.id) ?? false;

  return (
    <div ref={pageRef} className="min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 pt-6 sm:pt-8 pb-20">
        {/* Back link */}
        <Link
          to="/fleet"
          className="inline-flex items-center gap-2 museo-label text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors mb-8"
        >
          &larr; Back to Fleet
        </Link>

        {/* Image gallery */}
        <div ref={galleryRef} className="mb-10">
          <ImageGallery images={vehicle.images} alt={vehicle.name} />
        </div>

        {/* Two-column layout: content + pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left column — identity & description */}
          <div ref={contentRef} className="lg:col-span-7 space-y-5">
            {/* Identity headline */}
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {vehicle.headline}
            </h1>

            {/* Vehicle name */}
            <p className="museo-label text-white/50">
              {vehicle.name}
            </p>

            {/* Full description */}
            <p className="museo-body text-white/60 text-lg leading-relaxed">
              {vehicle.description}
            </p>

            {/* Experience tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {vehicle.experience_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wider font-medium text-white/40 border border-white/10 rounded-full px-3 py-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right column — pricing card */}
          <div className="lg:col-span-5">
            <div
              ref={pricingRef}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-8 space-y-6 sticky top-24"
            >
              {/* Price */}
              <div>
                <span className="museo-label text-white/40 block mb-1">Starting at</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[#D4AF37] text-4xl font-bold tracking-tight">
                    {formattedPrice}
                  </span>
                  <span className="text-white/40 text-lg">/ day</span>
                </div>
              </div>

              {/* Social proof */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                {vehicle.rental_count > 0 && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#D4AF37]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <span className="text-white/60 text-sm">
                      Rented {vehicle.rental_count}+ times
                    </span>
                  </div>
                )}

                {isPopular && (
                  <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-3 py-1">
                    <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}
              </div>

              {/* Booking CTA */}
              {isUnavailable ? (
                <div>
                  <div className="w-full text-center bg-white/10 text-white/40 font-bold py-4 rounded-lg text-lg tracking-wide cursor-not-allowed">
                    Currently Rented
                  </div>
                  <p className="text-white/30 text-xs text-center mt-2">
                    This vehicle is currently out on rental. Check back soon or browse other vehicles.
                  </p>
                </div>
              ) : (
                <Link
                  to={`/book?vehicle=${vehicle.slug}`}
                  className="block w-full text-center bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#050505] font-bold py-4 rounded-lg transition-colors duration-300 text-lg tracking-wide"
                >
                  Book This Vehicle
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetailPage;

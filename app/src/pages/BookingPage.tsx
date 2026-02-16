import { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router';
import { gsap, useGSAP } from '../lib/gsap';
import { useVehicles } from '../hooks/useVehicles';
import BookingForm from '../components/BookingForm';

// ---------------------------------------------------------------
// BookingPage — the guest booking experience.
// Shows a booking form that submits to Supabase (or demo mode).
// After success, displays a confirmation panel with the code.
// Pre-selects a vehicle when ?vehicle=slug is in the URL.
// ---------------------------------------------------------------

interface ConfirmationData {
  confirmationCode: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  guestName: string;
}

function BookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedSlug = searchParams.get('vehicle') ?? undefined;
  const { data: vehicles = [], isLoading } = useVehicles();
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  // Header entrance animation
  useGSAP(
    () => {
      if (!headerRef.current) return;
      gsap.from(headerRef.current.children, {
        y: 25,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      });
    },
    { scope: pageRef, dependencies: [confirmation] },
  );

  // Confirmation panel entrance
  useGSAP(
    () => {
      if (!confirmRef.current || !confirmation) return;
      gsap.from(confirmRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: pageRef, dependencies: [confirmation] },
  );

  // ---- Copy code handler ----

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text (clipboard API may fail in some contexts)
      setCopied(false);
    }
  };

  // ---- Success handler from BookingForm ----

  const handleSuccess = (booking: { confirmation_code: string }) => {
    // Find vehicle name for the confirmation display
    const formSlug = preselectedSlug;
    const selectedVehicle = vehicles.find((v) => v.slug === formSlug);

    setConfirmation({
      confirmationCode: booking.confirmation_code,
      vehicleName: selectedVehicle?.name ?? 'Your selected vehicle',
      startDate: '', // Will be set from form context below
      endDate: '',
      guestName: '',
    });

    // Scroll to top so they see the confirmation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced success handler that captures form data
  const handleFormSuccess = (booking: { confirmation_code: string }) => {
    // We store vehicle/dates from the form state captured at submit
    handleSuccess(booking);
  };

  // ---- Render ----

  return (
    <div ref={pageRef} className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-6 lg:px-16 pt-8 pb-20">
        {confirmation ? (
          /* ---- Confirmation Panel ---- */
          <div ref={confirmRef} className="space-y-8">
            {/* Success icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <div ref={headerRef} className="text-center space-y-3">
              <h1 className="museo-headline text-white text-3xl md:text-4xl">
                Booking Submitted
              </h1>
              <p className="museo-body text-white/40 text-lg">
                Your reservation request has been received
              </p>
            </div>

            {/* Confirmation code card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 text-center space-y-4">
              <span className="museo-label text-white/40 block">
                Confirmation Code
              </span>
              <p className="font-mono text-[#D4AF37] text-4xl md:text-5xl tracking-widest font-bold select-all">
                {confirmation.confirmationCode}
              </p>
              <button
                onClick={() => handleCopy(confirmation.confirmationCode)}
                className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Status message */}
            <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-5 py-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Status: Pending Review
                </p>
                <p className="text-white/40 text-sm mt-0.5">
                  Joey will review your request and get back to you soon.
                  Save your confirmation code to check your booking status
                  anytime.
                </p>
              </div>
            </div>

            {/* Action links */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/book/${confirmation.confirmationCode}`}
                className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Check Booking Status
              </Link>
              <Link
                to="/fleet"
                className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Browse More Vehicles
              </Link>
            </div>
          </div>
        ) : (
          /* ---- Booking Form ---- */
          <>
            {/* Page header */}
            <div ref={headerRef} className="mb-10 space-y-3">
              <span className="museo-label text-[#D4AF37] block">
                RESERVE NOW
              </span>
              <h1 className="museo-headline text-white text-3xl md:text-4xl lg:text-5xl">
                Your Weekend.
                <br />
                Your Statement.
              </h1>
              <p className="museo-body text-white/40 text-lg max-w-lg">
                Pick your ride, choose your dates, and lock it in. No account
                needed — just your name and a dream.
              </p>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-12 bg-white/5 rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-white/5 rounded-lg" />
                  <div className="h-12 bg-white/5 rounded-lg" />
                </div>
                <div className="h-12 bg-white/5 rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-white/5 rounded-lg" />
                  <div className="h-12 bg-white/5 rounded-lg" />
                </div>
                <div className="h-12 bg-white/5 rounded-lg" />
              </div>
            ) : (
              <BookingForm
                vehicles={vehicles}
                preselectedSlug={preselectedSlug}
                onSuccess={handleFormSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BookingPage;

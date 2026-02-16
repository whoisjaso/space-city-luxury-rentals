import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { gsap, useGSAP } from '../lib/gsap';
import {
  useBookingStatus,
  useBookingsByEmail,
} from '../hooks/useBooking';
import type { BookingStatus } from '../types/database';

// ---------------------------------------------------------------
// BookingStatusPage — guests look up bookings by confirmation code
// or email. If the URL has a :code param, it auto-looks up that
// booking. Otherwise shows a search form.
// ---------------------------------------------------------------

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: 'Pending Review',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  declined: {
    label: 'Declined',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
};

function BookingStatusPage() {
  const { code: urlCode } = useParams();
  const [searchInput, setSearchInput] = useState(urlCode ?? '');
  const [searchMode, setSearchMode] = useState<'code' | 'email'>(
    urlCode ? 'code' : 'code',
  );
  const [activeCode, setActiveCode] = useState(urlCode ?? '');
  const [activeEmail, setActiveEmail] = useState('');

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Queries
  const {
    data: bookingByCode,
    isLoading: isLoadingCode,
    isFetched: isFetchedCode,
  } = useBookingStatus(searchMode === 'code' ? activeCode : '');

  const {
    data: bookingsByEmail = [],
    isLoading: isLoadingEmail,
    isFetched: isFetchedEmail,
  } = useBookingsByEmail(searchMode === 'email' ? activeEmail : '');

  const isLoading = searchMode === 'code' ? isLoadingCode : isLoadingEmail;

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
    { scope: pageRef },
  );

  // ---- Handlers ----

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const input = searchInput.trim();
    if (!input) return;

    // Detect email vs code
    if (input.includes('@')) {
      setSearchMode('email');
      setActiveEmail(input.toLowerCase());
      setActiveCode('');
    } else {
      setSearchMode('code');
      setActiveCode(input.toUpperCase());
      setActiveEmail('');
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setActiveCode('');
    setActiveEmail('');
  };

  // ---- Determine what to show ----

  const hasCodeResult =
    searchMode === 'code' && isFetchedCode && activeCode.length >= 8;
  const hasEmailResult =
    searchMode === 'email' && isFetchedEmail && activeEmail.includes('@');
  const showResults = hasCodeResult || hasEmailResult;
  const notFound =
    (hasCodeResult && !bookingByCode) ||
    (hasEmailResult && bookingsByEmail.length === 0);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-6 lg:px-16 pt-8 pb-20">
        {/* Page header */}
        <div ref={headerRef} className="mb-10 space-y-3">
          <span className="museo-label text-[#D4AF37] block">
            BOOKING STATUS
          </span>
          <h1 className="museo-headline text-white text-3xl md:text-4xl lg:text-5xl">
            Check Your
            <br />
            Reservation
          </h1>
          <p className="museo-body text-white/40 text-lg max-w-lg">
            Enter your confirmation code or email to view your booking status.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Confirmation code or email"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white museo-body placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-[#D4AF37]/40 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={!searchInput.trim()}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-[#D4AF37]/30 disabled:cursor-not-allowed text-[#050505] font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-white/5 rounded-xl" />
          </div>
        )}

        {/* Not found */}
        {showResults && notFound && !isLoading && (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-10 text-center space-y-4">
            <svg
              className="w-12 h-12 text-white/20 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <h2 className="museo-headline text-white text-xl">
              No Booking Found
            </h2>
            <p className="museo-body text-white/40 text-sm">
              We couldn't find a booking matching that{' '}
              {searchMode === 'code' ? 'confirmation code' : 'email address'}.
              Double-check and try again.
            </p>
            <button
              onClick={handleReset}
              className="text-[#D4AF37] text-sm hover:underline"
            >
              Try a different search
            </button>
          </div>
        )}

        {/* Single booking by code */}
        {hasCodeResult && bookingByCode && !isLoading && (
          <BookingCard
            vehicleName={bookingByCode.vehicle_name ?? 'Vehicle'}
            confirmationCode={bookingByCode.confirmation_code}
            status={bookingByCode.status}
            startDate={formatDate(bookingByCode.start_date)}
            endDate={formatDate(bookingByCode.end_date)}
            guestName={bookingByCode.guest_name}
            adminNotes={bookingByCode.admin_notes}
            createdAt={bookingByCode.created_at}
          />
        )}

        {/* Multiple bookings by email */}
        {hasEmailResult && bookingsByEmail.length > 0 && !isLoading && (
          <div className="space-y-4">
            <p className="museo-label text-white/40">
              {bookingsByEmail.length} booking
              {bookingsByEmail.length !== 1 ? 's' : ''} found
            </p>
            {bookingsByEmail.map((b) => (
              <BookingCard
                key={b.id}
                vehicleName={b.vehicle_name ?? 'Vehicle'}
                confirmationCode={b.confirmation_code}
                status={b.status}
                startDate={formatDate(b.start_date)}
                endDate={formatDate(b.end_date)}
                guestName={b.guest_name}
                adminNotes={b.admin_notes}
                createdAt={b.created_at}
              />
            ))}
          </div>
        )}

        {/* Back to booking link */}
        <div className="mt-10 text-center">
          <Link
            to="/book"
            className="text-[#D4AF37] museo-label hover:underline"
          >
            &larr; Make a New Reservation
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// BookingCard — displays a single booking's details.
// ---------------------------------------------------------------

interface BookingCardProps {
  vehicleName: string;
  confirmationCode: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  guestName: string;
  adminNotes: string | null;
  createdAt: string;
}

function BookingCard({
  vehicleName,
  confirmationCode,
  status,
  startDate,
  endDate,
  guestName,
  adminNotes,
  createdAt,
}: BookingCardProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 md:p-8 space-y-5">
      {/* Header row: vehicle + status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-white text-xl font-semibold">{vehicleName}</h2>
          <p className="museo-label text-white/30 text-xs mt-0.5">
            Booked by {guestName}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.border} border rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${cfg.color} self-start sm:self-auto`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'pending'
                ? 'bg-yellow-400'
                : status === 'approved'
                  ? 'bg-green-400'
                  : 'bg-red-400'
            }`}
          />
          {cfg.label}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="museo-label text-white/30 text-xs block mb-0.5">
            Confirmation Code
          </span>
          <span className="font-mono text-[#D4AF37] text-sm font-bold tracking-wider">
            {confirmationCode}
          </span>
        </div>
        <div>
          <span className="museo-label text-white/30 text-xs block mb-0.5">
            Submitted
          </span>
          <span className="text-white/60 text-sm">
            {new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div>
          <span className="museo-label text-white/30 text-xs block mb-0.5">
            Pickup
          </span>
          <span className="text-white/60 text-sm">{startDate}</span>
        </div>
        <div>
          <span className="museo-label text-white/30 text-xs block mb-0.5">
            Return
          </span>
          <span className="text-white/60 text-sm">{endDate}</span>
        </div>
      </div>

      {/* Admin notes */}
      {adminNotes && (
        <div className="border-t border-white/5 pt-4">
          <span className="museo-label text-white/30 text-xs block mb-1">
            Notes from Joey
          </span>
          <p className="text-white/60 text-sm leading-relaxed">
            {adminNotes}
          </p>
        </div>
      )}
    </div>
  );
}

export default BookingStatusPage;

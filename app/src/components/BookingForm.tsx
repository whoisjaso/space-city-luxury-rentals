import { useState, useCallback, useMemo } from 'react';
import type { Vehicle } from '../types/database';
import { useCreateBooking } from '../hooks/useBooking';
import type { CreateBookingInput } from '../hooks/useBooking';
import { useCreatePaymentIntent } from '../hooks/usePayment';
import type { PaymentIntentResult } from '../hooks/usePayment';
import { isPaymentDemoMode } from '../lib/stripe';
import PaymentStep from './PaymentStep';
import TermsModal from './TermsModal';

// ---------------------------------------------------------------
// BookingForm — two-step booking form with real-time validation.
// Step 1: guest details (vehicle, dates, contact info).
// Step 2: Stripe payment authorization (when Stripe configured).
// In demo mode, step 2 is skipped and booking is created directly.
// ---------------------------------------------------------------

interface BookingFormProps {
  vehicles: Vehicle[];
  preselectedSlug?: string;
  unavailableVehicleIds?: Set<string>;
  onSuccess: (booking: { confirmation_code: string }) => void;
}

interface FormData {
  vehicleSlug: string;
  startDate: string;
  endDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  termsAccepted: boolean;
}

interface FieldErrors {
  vehicleSlug?: string;
  startDate?: string;
  endDate?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  termsAccepted?: string;
}

type Step = 'details' | 'payment';

/** Get tomorrow's date as YYYY-MM-DD string. */
function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/** Get today's date as YYYY-MM-DD string. */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/** Count digits in a string. */
function countDigits(s: string): number {
  return (s.match(/\d/g) || []).length;
}

function BookingForm({ vehicles, preselectedSlug, unavailableVehicleIds, onSuccess }: BookingFormProps) {
  const createBooking = useCreateBooking();
  const createPaymentIntent = useCreatePaymentIntent();

  const [step, setStep] = useState<Step>('details');
  const [paymentData, setPaymentData] = useState<PaymentIntentResult | null>(null);

  const [form, setForm] = useState<FormData>({
    vehicleSlug: preselectedSlug ?? '',
    startDate: getTomorrow(),
    endDate: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ---- Validation ----

  const validateField = useCallback(
    (name: keyof FormData, value: string | boolean): string | undefined => {
      switch (name) {
        case 'vehicleSlug':
          if (!value) return 'Please select a vehicle';
          break;
        case 'guestName':
          if (!(value as string).trim()) return 'Name is required';
          break;
        case 'guestEmail': {
          const email = value as string;
          if (!email.trim()) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return 'Please enter a valid email address';
          break;
        }
        case 'guestPhone': {
          const phone = value as string;
          if (!phone.trim()) return 'Phone number is required';
          if (countDigits(phone) < 10)
            return 'Phone number must have at least 10 digits';
          break;
        }
        case 'startDate': {
          const start = value as string;
          if (!start) return 'Start date is required';
          if (start < getToday()) return 'Start date must be today or later';
          break;
        }
        case 'endDate': {
          const end = value as string;
          if (!end) return 'End date is required';
          if (form.startDate && end <= form.startDate)
            return 'End date must be after start date';
          break;
        }
        case 'termsAccepted':
          if (!value) return 'You must accept the rental terms';
          break;
      }
      return undefined;
    },
    [form.startDate],
  );

  const validateAll = useCallback((): FieldErrors => {
    const newErrors: FieldErrors = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    return newErrors;
  }, [form, validateField]);

  const isValid = useMemo(() => {
    const allErrors = validateAll();
    return Object.keys(allErrors).length === 0;
  }, [validateAll]);

  // ---- Handlers ----

  const handleChange = (
    name: keyof FormData,
    value: string | boolean,
  ) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-clear end date if start date moves past it
      if (name === 'startDate' && prev.endDate && value >= prev.endDate) {
        next.endDate = '';
      }
      return next;
    });

    // Validate on change if field has been touched
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, form[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Touch all fields to show any remaining errors
    const allTouched: Record<string, boolean> = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const allErrors = validateAll();
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) return;

    // Find the vehicle by slug to get its id
    const selectedVehicle = vehicles.find((v) => v.slug === form.vehicleSlug);
    if (!selectedVehicle) {
      setErrors((prev) => ({ ...prev, vehicleSlug: 'Vehicle not found' }));
      return;
    }

    if (isPaymentDemoMode()) {
      // Demo / no-Stripe mode: create booking directly (existing flow)
      const input: CreateBookingInput = {
        vehicle_id: selectedVehicle.id,
        guest_name: form.guestName.trim(),
        guest_email: form.guestEmail.trim().toLowerCase(),
        guest_phone: form.guestPhone.trim(),
        start_date: form.startDate,
        end_date: form.endDate,
        terms_accepted: form.termsAccepted,
      };

      try {
        const booking = await createBooking.mutateAsync(input);
        onSuccess({ confirmation_code: booking.confirmation_code });
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        );
      }
    } else {
      // Stripe mode: create PaymentIntent, then show payment step
      try {
        const result = await createPaymentIntent.mutateAsync({
          vehicle_id: selectedVehicle.id,
          start_date: form.startDate,
          end_date: form.endDate,
          guest_name: form.guestName.trim(),
          guest_email: form.guestEmail.trim().toLowerCase(),
          guest_phone: form.guestPhone.trim(),
        });
        setPaymentData(result);
        setStep('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Failed to initialize payment. Please try again.',
        );
      }
    }
  };

  // ---- Computed ----

  const selectedVehicle = vehicles.find((v) => v.slug === form.vehicleSlug);

  const totalDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  }, [form.startDate, form.endDate]);

  const estimatedTotal =
    selectedVehicle && totalDays > 0
      ? `$${((selectedVehicle.daily_price_cents / 100) * totalDays).toLocaleString()}`
      : null;

  const isSubmitting = createBooking.isPending || createPaymentIntent.isPending;

  // ---- Shared input styles ----

  const inputBase =
    'w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white museo-body placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-[#D4AF37]/40 transition-all';
  const errorInput = 'border-red-500/50 focus:ring-red-500/60 focus:border-red-500/40';
  const labelClass = 'museo-label text-white/50 block mb-1.5';
  const errorText = 'text-red-400 text-xs mt-1';

  // ---- Payment step (step 2) ----

  if (step === 'payment' && paymentData && selectedVehicle) {
    return (
      <PaymentStep
        paymentData={paymentData}
        bookingDetails={{
          vehicle_id: selectedVehicle.id,
          vehicleName: selectedVehicle.name,
          start_date: form.startDate,
          end_date: form.endDate,
          totalDays,
          dailyPriceCents: selectedVehicle.daily_price_cents,
          guest_name: form.guestName.trim(),
          guest_email: form.guestEmail.trim().toLowerCase(),
          guest_phone: form.guestPhone.trim(),
          terms_accepted: form.termsAccepted,
        }}
        onSuccess={onSuccess}
        onBack={() => {
          setStep('details');
          setPaymentData(null);
        }}
      />
    );
  }

  // ---- Details form (step 1) ----

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Vehicle selector */}
        <div>
          <label className={labelClass}>Vehicle</label>
          <select
            value={form.vehicleSlug}
            onChange={(e) => handleChange('vehicleSlug', e.target.value)}
            onBlur={() => handleBlur('vehicleSlug')}
            className={`${inputBase} ${touched.vehicleSlug && errors.vehicleSlug ? errorInput : ''} appearance-none cursor-pointer`}
          >
            <option value="" className="bg-[#0a0a0a]">
              Select a vehicle
            </option>
            {vehicles.map((v) => {
              const rented = unavailableVehicleIds?.has(v.id) ?? false;
              return (
                <option key={v.id} value={v.slug} className="bg-[#0a0a0a]">
                  {v.name} — ${(v.daily_price_cents / 100).toLocaleString()}/day
                  {rented ? ' (Currently Rented)' : ''}
                </option>
              );
            })}
          </select>
          {touched.vehicleSlug && errors.vehicleSlug && (
            <p className={errorText}>{errors.vehicleSlug}</p>
          )}
        </div>

        {/* Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pickup Date</label>
            <input
              type="date"
              value={form.startDate}
              min={getToday()}
              onChange={(e) => handleChange('startDate', e.target.value)}
              onBlur={() => handleBlur('startDate')}
              className={`${inputBase} ${touched.startDate && errors.startDate ? errorInput : ''}`}
            />
            {touched.startDate && errors.startDate && (
              <p className={errorText}>{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Return Date</label>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || getToday()}
              onChange={(e) => handleChange('endDate', e.target.value)}
              onBlur={() => handleBlur('endDate')}
              className={`${inputBase} ${touched.endDate && errors.endDate ? errorInput : ''}`}
            />
            {touched.endDate && errors.endDate && (
              <p className={errorText}>{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Price estimate */}
        {estimatedTotal && (
          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="museo-label text-white/50">
              Estimated total ({totalDays} {totalDays === 1 ? 'day' : 'days'})
            </span>
            <span className="text-[#D4AF37] font-bold text-lg">
              {estimatedTotal}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Guest name */}
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            value={form.guestName}
            placeholder="Your full name"
            onChange={(e) => handleChange('guestName', e.target.value)}
            onBlur={() => handleBlur('guestName')}
            className={`${inputBase} ${touched.guestName && errors.guestName ? errorInput : ''}`}
          />
          {touched.guestName && errors.guestName && (
            <p className={errorText}>{errors.guestName}</p>
          )}
        </div>

        {/* Email & Phone row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.guestEmail}
              placeholder="you@email.com"
              onChange={(e) => handleChange('guestEmail', e.target.value)}
              onBlur={() => handleBlur('guestEmail')}
              className={`${inputBase} ${touched.guestEmail && errors.guestEmail ? errorInput : ''}`}
            />
            {touched.guestEmail && errors.guestEmail && (
              <p className={errorText}>{errors.guestEmail}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={form.guestPhone}
              placeholder="(xxx) xxx-xxxx"
              onChange={(e) => handleChange('guestPhone', e.target.value)}
              onBlur={() => handleBlur('guestPhone')}
              className={`${inputBase} ${touched.guestPhone && errors.guestPhone ? errorInput : ''}`}
            />
            {touched.guestPhone && errors.guestPhone && (
              <p className={errorText}>{errors.guestPhone}</p>
            )}
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => handleChange('termsAccepted', e.target.checked)}
              onBlur={() => handleBlur('termsAccepted')}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#D4AF37] cursor-pointer"
            />
            <span className="museo-body text-white/50 text-sm group-hover:text-white/70 transition-colors">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[#D4AF37] hover:underline"
              >
                rental terms and conditions
              </button>
            </span>
          </label>
          {touched.termsAccepted && errors.termsAccepted && (
            <p className={`${errorText} ml-7`}>{errors.termsAccepted}</p>
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
            {submitError}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-[#D4AF37]/30 disabled:cursor-not-allowed text-[#050505] font-bold py-4 rounded-lg transition-colors duration-300 text-lg tracking-wide flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {createPaymentIntent.isPending ? 'Initializing Payment...' : 'Submitting...'}
            </>
          ) : isPaymentDemoMode() ? (
            'Reserve Now'
          ) : (
            'Continue to Payment'
          )}
        </button>
      </form>

      {/* Terms modal */}
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}

export default BookingForm;

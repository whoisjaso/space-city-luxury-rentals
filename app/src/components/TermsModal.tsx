// ---------------------------------------------------------------
// TermsModal — rental terms and conditions overlay.
// Presented when guest clicks "rental terms" link in the booking
// form. Dark overlay with centered panel, close button at top.
// ---------------------------------------------------------------

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

function TermsModal({ open, onClose }: TermsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Close terms"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="museo-headline text-white text-2xl mb-6">
          Rental Terms & Conditions
        </h2>

        <div className="space-y-5 museo-body text-white/60 text-sm leading-relaxed">
          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Rental Period
            </h3>
            <p>
              All rentals are calculated on a 24-hour basis. Late returns will
              incur an additional daily charge. The minimum rental period is one
              (1) day. Vehicle pickup and return times will be coordinated
              directly with Space City Luxury Rentals.
            </p>
          </section>

          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Deposit & Payment
            </h3>
            <p>
              A security deposit is required at the time of vehicle pickup.
              Deposit amounts vary by vehicle and will be communicated upon
              booking approval. Payment is due in full prior to vehicle release.
              We accept major credit cards and verified payment methods.
            </p>
          </section>

          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Insurance & Liability
            </h3>
            <p>
              Renters must provide proof of valid auto insurance covering rental
              vehicles. Renters are responsible for any damage, loss, or theft
              that occurs during the rental period not covered by their
              insurance. Space City Luxury Rentals carries commercial liability
              insurance for the fleet.
            </p>
          </section>

          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Damage Policy
            </h3>
            <p>
              Vehicles are inspected before and after each rental. The renter
              is responsible for any damage beyond normal wear and tear. Damage
              costs will be assessed at market repair rates. Interior smoking,
              pet damage, and excessive soiling will incur additional cleaning
              fees.
            </p>
          </section>

          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Mileage
            </h3>
            <p>
              Each rental includes a daily mileage allowance. Excess mileage
              will be charged per mile at a rate communicated at booking
              approval. Mileage limits vary by vehicle class.
            </p>
          </section>

          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Cancellation Policy
            </h3>
            <p>
              Cancellations made more than 48 hours before the scheduled pickup
              are fully refundable. Cancellations within 48 hours of pickup may
              be subject to a cancellation fee. No-shows forfeit the full
              rental amount and deposit.
            </p>
          </section>

          <section>
            <h3 className="text-white/80 font-semibold text-base mb-2">
              Driver Requirements
            </h3>
            <p>
              Drivers must be at least 25 years of age with a valid U.S.
              driver's license. A clean driving record is required. Additional
              drivers must be approved in advance and meet the same
              requirements.
            </p>
          </section>
        </div>

        {/* Close action */}
        <button
          onClick={onClose}
          className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default TermsModal;

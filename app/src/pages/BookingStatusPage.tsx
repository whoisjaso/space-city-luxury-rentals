import { useParams } from 'react-router';

function BookingStatusPage() {
  const { code } = useParams();

  return (
    <div className="min-h-screen px-6 lg:px-16 py-16">
      <h1 className="museo-headline text-white text-4xl md:text-5xl mb-4">
        Booking Status
      </h1>
      <p className="museo-body text-white/50 text-lg">
        Coming soon -- status for confirmation code{' '}
        <span className="text-white font-mono">{code}</span>.
      </p>
    </div>
  );
}

export default BookingStatusPage;

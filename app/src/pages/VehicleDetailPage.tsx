import { useParams } from 'react-router';

function VehicleDetailPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen px-6 lg:px-16 py-16">
      <h1 className="museo-headline text-white text-4xl md:text-5xl mb-4">
        Vehicle Details
      </h1>
      <p className="museo-body text-white/50 text-lg">
        Coming soon -- details for <span className="text-white">{slug}</span>.
      </p>
    </div>
  );
}

export default VehicleDetailPage;

import { Link } from 'react-router';

// ---------------------------------------------------------------
// NotFoundPage — shown when the user navigates to an unknown route.
// Branded with Space City identity, provides a clear path back.
// ---------------------------------------------------------------

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <img
          src="/images/space-city-logo.png"
          alt="Space City Luxury Rentals"
          className="w-20 h-20 mx-auto mb-8 object-contain"
        />

        {/* 404 heading */}
        <h1
          className="text-7xl font-bold mb-4"
          style={{ color: '#D4AF37' }}
        >
          404
        </h1>

        <h2 className="text-xl text-white font-semibold mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Navigation links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-black transition-colors"
            style={{ backgroundColor: '#D4AF37' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#c9a132';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#D4AF37';
            }}
          >
            Back to Home
          </Link>
          <Link
            to="/fleet"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white border border-gray-600 hover:border-gray-400 transition-colors"
          >
            Browse Fleet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;

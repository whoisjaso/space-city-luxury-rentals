import { Routes, Route, Navigate } from 'react-router';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import LandingPage from './pages/LandingPage';
import PublicLayout from './layouts/PublicLayout';
import FleetPage from './pages/FleetPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingPage from './pages/BookingPage';
import BookingStatusPage from './pages/BookingStatusPage';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Routes>
          {/* Landing page — own cinematic nav, no PublicLayout */}
          <Route path="/" element={<LandingPage />} />

          {/* Public pages — shared header/footer via PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/fleet/:slug" element={<VehicleDetailPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/book/:code" element={<BookingStatusPage />} />
          </Route>

          {/* Admin — placeholder, no layout yet (Phase 7) */}
          <Route path="/admin" element={<div className="min-h-screen bg-[#050505] px-6 py-16"><h1 className="museo-headline text-white text-4xl">Admin — Coming Soon</h1></div>} />

          {/* Catch-all: redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;

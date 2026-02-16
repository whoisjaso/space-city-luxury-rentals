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

// Admin
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import VehiclesPage from './pages/admin/VehiclesPage';
import VehicleFormPage from './pages/admin/VehicleFormPage';

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

          {/* Admin login — no layout wrapper */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin — protected routes with sidebar layout */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                index
                element={
                  <div className="space-y-4">
                    <h1 className="museo-headline text-white text-2xl lg:text-3xl">Dashboard</h1>
                    <p className="museo-body text-white/40">Coming in Phase 8 — booking management, revenue metrics, and fleet overview.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                        <span className="museo-label text-white/30 block">Vehicles</span>
                        <span className="text-white text-3xl font-bold mt-2 block">--</span>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                        <span className="museo-label text-white/30 block">Active Bookings</span>
                        <span className="text-white text-3xl font-bold mt-2 block">--</span>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                        <span className="museo-label text-white/30 block">Revenue (MTD)</span>
                        <span className="text-white text-3xl font-bold mt-2 block">--</span>
                      </div>
                    </div>
                  </div>
                }
              />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/new" element={<VehicleFormPage />} />
              <Route path="vehicles/edit/:id" element={<VehicleFormPage />} />
              <Route
                path="bookings"
                element={
                  <div className="space-y-4">
                    <h1 className="museo-headline text-white text-2xl lg:text-3xl">Bookings</h1>
                    <p className="museo-body text-white/40">Coming in Phase 8 — view, approve, and manage booking requests.</p>
                  </div>
                }
              />
            </Route>
          </Route>

          {/* Catch-all: redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import PublicLayout from './layouts/PublicLayout';
import FleetPage from './pages/FleetPage';
import InventoryPage from './pages/InventoryPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingPage from './pages/BookingPage';
import BookingStatusPage from './pages/BookingStatusPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import VehiclesPage from './pages/admin/VehiclesPage';
import VehicleFormPage from './pages/admin/VehicleFormPage';
import DashboardPage from './pages/admin/DashboardPage';
import BookingsPage from './pages/admin/BookingsPage';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Landing page — own cinematic nav, no PublicLayout */}
          <Route path="/" element={<LandingPage />} />

          {/* Public pages — shared header/footer via PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/fleet/:slug" element={<VehicleDetailPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/book/:code" element={<BookingStatusPage />} />
          </Route>

          {/* Admin login — no layout wrapper */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin — protected routes with sidebar layout */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/new" element={<VehicleFormPage />} />
              <Route path="vehicles/edit/:id" element={<VehicleFormPage />} />
              <Route path="bookings" element={<BookingsPage />} />
            </Route>
          </Route>

          {/* Catch-all: show branded 404 page for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;

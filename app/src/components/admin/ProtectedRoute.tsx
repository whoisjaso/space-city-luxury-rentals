import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../providers/AuthProvider';
import { supabaseConfigured } from '../../lib/supabase';

// ---------------------------------------------------------------
// ProtectedRoute — wraps admin routes with authentication check.
// If Supabase is not configured, redirects to login which shows
// a demo-mode notice. If not authenticated, redirects to login.
// ---------------------------------------------------------------

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // While checking auth state, show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          <span className="museo-label text-white/40">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Not configured or not authenticated — redirect to login
  if (!supabaseConfigured || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

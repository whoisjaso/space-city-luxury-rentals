import { useState, type FormEvent } from 'react';
import { Navigate, Link } from 'react-router';
import { LogIn, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { supabaseConfigured } from '../../lib/supabase';

// ---------------------------------------------------------------
// LoginPage — admin login form.
// Shows a demo-mode notice when Supabase is not configured.
// Redirects to /admin if already authenticated.
// ---------------------------------------------------------------

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated — go to admin dashboard
  if (!loading && user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email, password);
      // Auth state change will trigger redirect above
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/">
            <img
              src="/images/space-city-logo.png"
              alt="Space City Luxury Rentals"
              className="h-16 mx-auto mb-6"
            />
          </Link>
          <h1 className="museo-headline text-white text-2xl">Admin Login</h1>
          <p className="museo-body text-white/40 mt-2 text-sm">
            Sign in to manage your fleet
          </p>
        </div>

        {/* Demo mode notice */}
        {!supabaseConfigured && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-5 py-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white/70 text-sm font-medium">
                Demo Mode Active
              </p>
              <p className="text-white/40 text-sm mt-1">
                Supabase is not configured. Admin authentication requires a
                connected Supabase project with email/password auth enabled.
                Set <code className="text-white/50">VITE_SUPABASE_URL</code> and{' '}
                <code className="text-white/50">VITE_SUPABASE_ANON_KEY</code> in
                your environment to enable login.
              </p>
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="museo-label text-white/50 block mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joey@spacecityrentals.com"
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors"
              disabled={submitting}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="museo-label text-white/50 block mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors"
              disabled={submitting}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !supabaseConfigured}
            className="w-full bg-[#D4AF37] hover:bg-[#C4A030] disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Back to site */}
        <div className="text-center">
          <Link
            to="/"
            className="text-white/30 hover:text-white/50 text-sm transition-colors"
          >
            Back to Space City Rentals
          </Link>
        </div>
      </div>
    </div>
  );
}

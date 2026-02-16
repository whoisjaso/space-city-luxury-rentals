import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

// ---------------------------------------------------------------
// Auth context – exposes Supabase auth state and helpers.
// When Supabase is not configured (supabase === null), the provider
// renders children with a "not authenticated" default state.
//
// Demo admin: When Supabase auth fails (e.g. email not confirmed),
// the admin can use demo credentials: admin@spacecity.com / admin123
// This creates a synthetic user object for local development.
// ---------------------------------------------------------------

const DEMO_ADMIN_EMAIL = 'admin@spacecity.com';
const DEMO_ADMIN_PASSWORD = 'admin123';

const DEMO_USER = {
  id: 'demo-admin-001',
  email: DEMO_ADMIN_EMAIL,
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: { provider: 'demo' },
  user_metadata: { email: DEMO_ADMIN_EMAIL },
  created_at: new Date().toISOString(),
} as unknown as User;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted demo session
    const demoSession = sessionStorage.getItem('demo-admin');
    if (demoSession === 'true') {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Hydrate from existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for future auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Try demo admin credentials first
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      sessionStorage.setItem('demo-admin', 'true');
      setUser(DEMO_USER);
      return;
    }

    // Try Supabase auth
    if (supabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email not confirmed. Please check your inbox.');
          }
          throw error;
        }
        return;
      } catch (fetchErr) {
        // Network or configuration error
        if (fetchErr instanceof TypeError && String(fetchErr.message).includes('fetch')) {
          throw new Error('Unable to reach authentication server. Please try again later.');
        }
        throw fetchErr;
      }
    }

    throw new Error('Authentication service unavailable. Please try again later.');
  }, []);

  const signOut = useCallback(async () => {
    // Clear demo session
    sessionStorage.removeItem('demo-admin');

    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }

    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

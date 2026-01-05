import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';

type Role =
  | 'super_admin'
  | 'country_admin'
  | 'event_manager'
  | 'staff'
  | 'finance';

type Region = 'UAE' | 'SAUDI';

interface AuthUser {
  id: string;
  email: string;
  role: Role;
  region: Region;
  access_token: string;
}

const AuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: true,
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Hydrate user from session
  const hydrateUser = async (session: Session) => {
    try {
      if (!session?.user?.id) {
        setUser(null);
        return;
      }

      // Attempt to fetch profile (DO NOT BLOCK UI IF THIS FAILS)
      let profile: { role?: Role; region?: Region } | null = null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, region')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          profile = data;
        }
      } catch {
        // ignore profile fetch failure
      }

      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        role: profile?.role ?? 'staff', // safe default
        region: profile?.region ?? 'UAE',
        access_token: session.access_token
      });
    } catch (err) {
      console.error('Hydration error:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !data.session) {
          setUser(null);
          return;
        }

        await hydrateUser(data.session);
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (!session) {
          setUser(null);
          return;
        }

        setLoading(true);
        await hydrateUser(session);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

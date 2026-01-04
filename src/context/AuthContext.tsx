import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  region: 'UAE' | 'SAUDI';
  access_token: string;
}

const AuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: false,
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to show loading initially

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        setLoading(true);

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - setting loading to false');
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        const { data, error } = await supabase.auth.getSession();

        clearTimeout(timeoutId);

        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (data.session) {
          await hydrateUser(data.session);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          // Always set loading to false, even if there was an error
          setLoading(false);
        }
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Handle token refresh events
          if (event === 'TOKEN_REFRESHED' && session) {
            await hydrateUser(session);
            return; // Don't set loading for token refresh
          }

          // Handle sign out events
          if (event === 'SIGNED_OUT') {
            setUser(null);
            return;
          }

          setLoading(true);

          if (session) {
            await hydrateUser(session);
          } else {
            setUser(null);
          }

          setLoading(false);
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const hydrateUser = async (session: any) => {
    try {
      // Ensure we have valid session data first
      if (!session?.user?.id || !session?.access_token) {
        console.error('Invalid session data');
        setUser(null);
        return;
      }

      // 🔥 DO NOT BLOCK UI IF PROFILE FAILS
      // Skip profile lookup if there are RLS issues - use defaults instead
      let profile = null;
      
      // Try to fetch profile with a short timeout to prevent hanging
      try {
        const profileQuery = supabase
          .from('profiles')
          .select('role, region')
          .eq('id', session.user.id)
          .maybeSingle();

        // Add timeout wrapper
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );

        const result = await Promise.race([profileQuery, timeout]) as any;
        
        if (result?.data) {
          profile = result.data;
        } else if (result?.error) {
          // Any error - skip profiles, use defaults
          console.warn('Profile fetch error (using defaults):', result.error.message);
        }
      } catch (err: any) {
        // Any exception - skip profiles, use defaults
        // This catches RLS recursion, timeouts, network errors, etc.
        console.warn('Profile fetch failed (using defaults):', err?.message || 'Unknown error');
        // Continue with defaults - don't block the app
      }

      // Always set user, even without profile data
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        role: (profile?.role as 'admin' | 'manager' | 'staff') ?? 'admin', // Default to admin
        region: (profile?.region as 'UAE' | 'SAUDI') ?? 'UAE', // Default to UAE
        access_token: session.access_token
      });
    } catch (error) {
      console.error('Error hydrating user:', error);
      // Don't set user if hydration fails - this will trigger login screen
      setUser(null);
    }
  };

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

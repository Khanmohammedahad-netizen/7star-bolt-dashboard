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
  const [loading, setLoading] = useState(false); // 🔴 IMPORTANT

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        await hydrateUser(data.session);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);

        if (session) {
          await hydrateUser(session);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const hydrateUser = async (session: any) => {
    // 🔥 DO NOT BLOCK UI IF PROFILE FAILS
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, region')
      .eq('id', session.user.id)
      .maybeSingle();

    setUser({
      id: session.user.id,
      email: session.user.email!,
      role: profile?.role ?? 'admin', // TEMP DEFAULT
      region: profile?.region ?? 'UAE',
      access_token: session.access_token
    });
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

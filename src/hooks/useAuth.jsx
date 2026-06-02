import React from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = React.useState(null);
  const [team,    setTeam]    = React.useState(null);
  const [role,    setRole]    = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Load team + role via API (uses supabaseAdmin, bypasses client RLS issues)
  const loadTeam = React.useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setTeam(null); setRole(null); return; }

      const res = await fetch('/api/teams', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { setTeam(null); setRole(null); return; }
      const data = await res.json();
      if (data && data.id) {
        setTeam({ id: data.id, name: data.name });
        setRole(data.myRole);
      } else {
        setTeam(null);
        setRole(null);
      }
    } catch {
      setTeam(null);
      setRole(null);
    }
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadTeam().finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadTeam();
      else { setTeam(null); setRole(null); }
    });

    return () => subscription.unsubscribe();
  }, [loadTeam]);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signInMagic = (email) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, team, role, loading, signIn, signInMagic, signUp, signOut, refreshTeam: loadTeam }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

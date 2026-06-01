import React from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = React.useState(null);
  const [team,    setTeam]    = React.useState(null);
  const [role,    setRole]    = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Load team + role for a given user id
  const loadTeam = React.useCallback(async (userId) => {
    const { data } = await supabase
      .from('team_members')
      .select('role, teams(id, name)')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (data) {
      setTeam(data.teams);
      setRole(data.role);
    } else {
      setTeam(null);
      setRole(null);
    }
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadTeam(u.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadTeam(u.id);
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
    <AuthContext.Provider value={{ user, team, role, loading, signIn, signInMagic, signUp, signOut, refreshTeam: () => user && loadTeam(user.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

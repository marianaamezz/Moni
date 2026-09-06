import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedUser = localStorage.getItem('moni_local_user');
      const fallbackUser = savedUser
        ? JSON.parse(savedUser)
        : { id: 'local-user-id', email: 'mama@moni.app', user_metadata: { name: 'Mamá' } };
      setUser(fallbackUser);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: 'local-user-id', email, user_metadata: { name: email.split('@')[0] } };
      localStorage.setItem('moni_local_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { data: { user: demoUser }, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: 'local-user-id', email, user_metadata: { name: email.split('@')[0] } };
      localStorage.setItem('moni_local_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { data: { user: demoUser }, error: null };
    }
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem('moni_local_user');
      return { error: null };
    }
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

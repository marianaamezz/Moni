import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Limpieza de cualquier residuo previo de prueba en localStorage
    localStorage.removeItem('moni_local_user');
    localStorage.removeItem('nanay_local_user');

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Escuchar cambios de sesión en tiempo real (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    // 2. Comprobar si ya existe una sesión guardada y válida en Supabase
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error al obtener sesión de Supabase:', error);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase no está configurado');
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data?.user) {
      setUser(res.data.user);
      setSession(res.data.session);
    }
    return res;
  };

  const signUp = async (email, password) => {
    if (!supabase) throw new Error('Supabase no está configurado');
    const res = await supabase.auth.signUp({ email, password });
    if (res.data?.session?.user) {
      setUser(res.data.session.user);
      setSession(res.data.session);
    }
    return res;
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    return { error: null };
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

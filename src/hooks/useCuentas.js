import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CUENTAS = [
  { id: 'cta-efectivo', nombre: 'Efectivo', tipo: 'efectivo', moneda: 'PEN', saldo_actual: 0 },
  { id: 'cta-banco', nombre: 'Tarjeta Principal', tipo: 'débito', moneda: 'PEN', saldo_actual: 0 },
];

export function useCuentas() {
  const { user } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCuentas = useCallback(async () => {
    if (!user) {
      setCuentas([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`moni_cuentas_${user.id}`);
      if (stored) {
        setCuentas(JSON.parse(stored));
      } else {
        localStorage.setItem(`moni_cuentas_${user.id}`, JSON.stringify(DEFAULT_CUENTAS));
        setCuentas(DEFAULT_CUENTAS);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCuentas(data || []);
    } catch (err) {
      console.error('Error fetching cuentas:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCuentas();
  }, [fetchCuentas]);

  const addCuenta = async ({ nombre, tipo = 'débito', moneda = 'PEN', saldo_actual = 0 }) => {
    if (!nombre.trim() || !user) return;
    const cleanName = nombre.trim();

    if (!isSupabaseConfigured) {
      const newItem = {
        id: 'cta-' + Date.now(),
        nombre: cleanName,
        tipo,
        moneda,
        saldo_actual: Number(saldo_actual) || 0,
      };
      const updated = [...cuentas, newItem];
      setCuentas(updated);
      localStorage.setItem(`moni_cuentas_${user.id}`, JSON.stringify(updated));
      return newItem;
    }

    const { data, error } = await supabase
      .from('cuentas')
      .insert([
        {
          user_id: user.id,
          nombre: cleanName,
          tipo,
          moneda,
          saldo_actual: Number(saldo_actual) || 0,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setCuentas((prev) => [...prev, data]);
      return data;
    }
  };

  const deleteCuenta = async (id) => {
    if (!user) return;
    if (!isSupabaseConfigured) {
      const updated = cuentas.filter((c) => c.id !== id);
      setCuentas(updated);
      localStorage.setItem(`moni_cuentas_${user.id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('cuentas').delete().eq('id', id);
    if (!error) {
      setCuentas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    cuentas,
    loading,
    addCuenta,
    deleteCuenta,
    refreshCuentas: fetchCuentas,
  };
}

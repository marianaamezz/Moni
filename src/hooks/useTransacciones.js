import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useTransacciones() {
  const { user } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransacciones = useCallback(async () => {
    if (!user) {
      setTransacciones([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`moni_transacciones_${user.id}`);
      if (stored) {
        setTransacciones(JSON.parse(stored));
      } else {
        setTransacciones([]);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacciones')
        .select(`
          *,
          categoria_n1:categorias_n1(id, nombre, color),
          categoria_n2:categorias_n2(id, nombre, color),
          cuenta:cuentas(id, nombre, tipo)
        `)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setTransacciones(data || []);
    } catch (err) {
      console.error('Error fetching transacciones:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransacciones();
  }, [fetchTransacciones]);

  // Balance general: ingresos - gastos
  const balance = useMemo(() => {
    let pen = 0;
    let usd = 0;

    transacciones.forEach((t) => {
      const amount = Number(t.monto) || 0;
      if (t.tipo === 'ingreso') {
        if (t.moneda === 'USD') usd += amount;
        else pen += amount;
      } else if (t.tipo === 'gasto') {
        if (t.moneda === 'USD') usd -= amount;
        else pen -= amount;
      }
    });

    return { pen, usd };
  }, [transacciones]);

  const addTransaccion = async ({
    monto,
    moneda = 'PEN',
    tipo = 'gasto',
    categoria_n1_id,
    categoria_n2_id = null,
    cuenta_id = null,
    nota = '',
    fecha = new Date().toISOString(),
  }) => {
    if (!user || !monto || Number(monto) <= 0 || !categoria_n1_id) {
      throw new Error('Monto y categoría nivel 1 son obligatorios');
    }

    const cleanMonto = Number(monto);

    if (!isSupabaseConfigured) {
      const newItem = {
        id: 'tx-' + Date.now(),
        user_id: user.id,
        monto: cleanMonto,
        moneda,
        tipo,
        categoria_n1_id,
        categoria_n2_id: categoria_n2_id || null,
        cuenta_id: cuenta_id || null,
        nota: nota ? nota.trim() : null,
        fecha,
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...transacciones];
      setTransacciones(updated);
      localStorage.setItem(`moni_transacciones_${user.id}`, JSON.stringify(updated));
      return newItem;
    }

    const payload = {
      user_id: user.id,
      monto: cleanMonto,
      moneda,
      tipo,
      categoria_n1_id,
      categoria_n2_id: categoria_n2_id || null,
      cuenta_id: cuenta_id || null,
      nota: nota ? nota.trim() : null,
      fecha,
    };

    const { data, error } = await supabase
      .from('transacciones')
      .insert([payload])
      .select(`
        *,
        categoria_n1:categorias_n1(id, nombre, color),
        categoria_n2:categorias_n2(id, nombre, color),
        cuenta:cuentas(id, nombre, tipo)
      `)
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    setTransacciones((prev) => [data, ...prev]);
    return data;
  };

  const deleteTransaccion = async (id) => {
    if (!user) return;
    if (!isSupabaseConfigured) {
      const updated = transacciones.filter((t) => t.id !== id);
      setTransacciones(updated);
      localStorage.setItem(`moni_transacciones_${user.id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('transacciones').delete().eq('id', id);
    if (!error) {
      setTransacciones((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return {
    transacciones,
    loading,
    balance,
    addTransaccion,
    deleteTransaccion,
    refreshTransacciones: fetchTransacciones,
  };
}

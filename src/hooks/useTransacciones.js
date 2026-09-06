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

  // Balance general: ingresos - (gastos + transferencias)
  const balance = useMemo(() => {
    let pen = 0;
    let usd = 0;

    transacciones.forEach((t) => {
      const amount = Number(t.monto) || 0;
      if (t.tipo === 'ingreso') {
        if (t.moneda === 'USD') usd += amount;
        else pen += amount;
      } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
        if (t.moneda === 'USD') usd -= amount;
        else pen -= amount;
      }
    });

    return { pen, usd };
  }, [transacciones]);

  // Registrar transacción normal (Gasto o Ingreso)
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

  // Registrar Transferencia entre 2 Categorías N1
  const addTransferencia = async ({
    monto,
    moneda = 'PEN',
    origenId,
    destinoId,
    origenNombre = '',
    destinoNombre = '',
    nota = '',
    fecha = new Date().toISOString(),
  }) => {
    if (!user || !monto || Number(monto) <= 0 || !origenId || !destinoId) {
      throw new Error('Monto, categoría origen y categoría destino son obligatorios');
    }

    if (origenId === destinoId) {
      throw new Error('La categoría de origen y destino deben ser distintas');
    }

    const cleanMonto = Number(monto);
    const notaLimpia = nota ? nota.trim() : '';

    const notaSalida = notaLimpia
      ? `Transferencia a ${destinoNombre} — ${notaLimpia}`
      : `Transferencia a ${destinoNombre}`;

    const notaEntrada = notaLimpia
      ? `Transferencia desde ${origenNombre} — ${notaLimpia}`
      : `Transferencia desde ${origenNombre}`;

    if (!isSupabaseConfigured) {
      const now = Date.now();
      const txSalida = {
        id: 'tx-out-' + now,
        user_id: user.id,
        monto: cleanMonto,
        moneda,
        tipo: 'transferencia',
        categoria_n1_id: origenId,
        categoria_n2_id: null,
        cuenta_id: null,
        nota: notaSalida,
        fecha,
        created_at: new Date().toISOString(),
      };

      const txEntrada = {
        id: 'tx-in-' + (now + 1),
        user_id: user.id,
        monto: cleanMonto,
        moneda,
        tipo: 'ingreso',
        categoria_n1_id: destinoId,
        categoria_n2_id: null,
        cuenta_id: null,
        nota: notaEntrada,
        fecha,
        created_at: new Date().toISOString(),
      };

      const updated = [txSalida, txEntrada, ...transacciones];
      setTransacciones(updated);
      localStorage.setItem(`moni_transacciones_${user.id}`, JSON.stringify(updated));
      return [txSalida, txEntrada];
    }

    // En Supabase insertamos ambas transacciones en lote
    const payload = [
      {
        user_id: user.id,
        monto: cleanMonto,
        moneda,
        tipo: 'transferencia',
        categoria_n1_id: origenId,
        categoria_n2_id: null,
        cuenta_id: null,
        nota: notaSalida,
        fecha,
      },
      {
        user_id: user.id,
        monto: cleanMonto,
        moneda,
        tipo: 'ingreso',
        categoria_n1_id: destinoId,
        categoria_n2_id: null,
        cuenta_id: null,
        nota: notaEntrada,
        fecha,
      },
    ];

    const { data, error } = await supabase
      .from('transacciones')
      .insert(payload)
      .select(`
        *,
        categoria_n1:categorias_n1(id, nombre, color),
        categoria_n2:categorias_n2(id, nombre, color),
        cuenta:cuentas(id, nombre, tipo)
      `);

    if (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }

    setTransacciones((prev) => [...(data || []), ...prev]);
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
    addTransferencia,
    deleteTransaccion,
    refreshTransacciones: fetchTransacciones,
  };
}

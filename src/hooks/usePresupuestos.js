import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePresupuestos(transacciones = []) {
  const { user } = useAuth();
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPresupuestos = useCallback(async () => {
    if (!user) {
      setPresupuestos([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`moni_presupuestos_${user.id}`);
      if (stored) {
        setPresupuestos(JSON.parse(stored));
      } else {
        setPresupuestos([]);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('presupuestos')
        .select(`
          *,
          categoria_n1:categorias_n1(id, nombre, color),
          categoria_n2:categorias_n2(id, nombre, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresupuestos(data || []);
    } catch (err) {
      console.error('Error fetching presupuestos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPresupuestos();
  }, [fetchPresupuestos]);

  // Calcular el progreso de cada presupuesto en el periodo mensual actual
  const presupuestosConProgreso = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return presupuestos.map((p) => {
      // Filtrar transacciones correspondientes al mes actual y tipo gasto
      const transaccionesMes = transacciones.filter((t) => {
        if (t.tipo !== 'gasto') return false;
        if (t.moneda !== (p.moneda || 'PEN')) return false;

        const d = new Date(t.fecha);
        const matchPeriodo = d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        if (!matchPeriodo) return false;

        // Validar filtros de categoría
        const matchN1 = p.categoria_n1_id ? t.categoria_n1_id === p.categoria_n1_id : true;
        const matchN2 = p.categoria_n2_id ? t.categoria_n2_id === p.categoria_n2_id : true;

        return matchN1 && matchN2;
      });

      const gastoActual = transaccionesMes.reduce((acc, t) => acc + (Number(t.monto) || 0), 0);
      const limite = Number(p.monto_limite) || 1;
      const porcentaje = Math.min(Math.round((gastoActual / limite) * 100), 999);

      let estado = 'normal';
      if (porcentaje >= 100) {
        estado = 'danger';
      } else if (porcentaje >= 80) {
        estado = 'warning';
      }

      return {
        ...p,
        gasto_actual: gastoActual,
        porcentaje,
        estado,
      };
    });
  }, [presupuestos, transacciones]);

  const addPresupuesto = async ({
    categoria_n1_id = null,
    categoria_n2_id = null,
    monto_limite,
    moneda = 'PEN',
    periodo = 'mensual',
    alerta_en = [80, 100],
  }) => {
    if (!user || !monto_limite || Number(monto_limite) <= 0) {
      throw new Error('El monto límite debe ser mayor a 0');
    }
    if (!categoria_n1_id && !categoria_n2_id) {
      throw new Error('Debes seleccionar al menos una categoría (N1 o N2)');
    }

    const cleanMonto = Number(monto_limite);

    if (!isSupabaseConfigured) {
      const newItem = {
        id: 'pres-' + Date.now(),
        user_id: user.id,
        categoria_n1_id: categoria_n1_id || null,
        categoria_n2_id: categoria_n2_id || null,
        monto_limite: cleanMonto,
        moneda,
        periodo,
        alerta_en,
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...presupuestos];
      setPresupuestos(updated);
      localStorage.setItem(`moni_presupuestos_${user.id}`, JSON.stringify(updated));
      return newItem;
    }

    const payload = {
      user_id: user.id,
      categoria_n1_id: categoria_n1_id || null,
      categoria_n2_id: categoria_n2_id || null,
      monto_limite: cleanMonto,
      moneda,
      periodo,
      alerta_en,
    };

    const { data, error } = await supabase
      .from('presupuestos')
      .insert([payload])
      .select(`
        *,
        categoria_n1:categorias_n1(id, nombre, color),
        categoria_n2:categorias_n2(id, nombre, color)
      `)
      .single();

    if (error) throw error;
    setPresupuestos((prev) => [data, ...prev]);
    return data;
  };

  const deletePresupuesto = async (id) => {
    if (!user) return;
    if (!isSupabaseConfigured) {
      const updated = presupuestos.filter((p) => p.id !== id);
      setPresupuestos(updated);
      localStorage.setItem(`moni_presupuestos_${user.id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('presupuestos').delete().eq('id', id);
    if (!error) {
      setPresupuestos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return {
    presupuestos: presupuestosConProgreso,
    loading,
    addPresupuesto,
    deletePresupuesto,
    refreshPresupuestos: fetchPresupuestos,
  };
}

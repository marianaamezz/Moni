import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEFAULT_N1 = [
  { id: 'n1-yo', nombre: 'Yo', color: '#5B3765' },
  { id: 'n1-casa', nombre: 'Casa', color: '#9E6899' },
  { id: 'n1-familia', nombre: 'Familia', color: '#BA88AE' },
];

const DEFAULT_N2 = [
  { id: 'n2-comida', nombre: 'Comida', color: '#5B3765' },
  { id: 'n2-transporte', nombre: 'Transporte', color: '#9E6899' },
  { id: 'n2-salud', nombre: 'Salud', color: '#D6A8C4' },
  { id: 'n2-entretenimiento', nombre: 'Entretenimiento', color: '#BA88AE' },
  { id: 'n2-arreglos', nombre: 'Arreglos/Mantenimiento', color: '#5B3765' },
  { id: 'n2-servicios', nombre: 'Servicios', color: '#9E6899' },
  { id: 'n2-otros', nombre: 'Otros', color: '#9E7C97' },
];

export function useCategorias() {
  const { user } = useAuth();
  const [categoriasN1, setCategoriasN1] = useState([]);
  const [categoriasN2, setCategoriasN2] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías
  const fetchCategorias = useCallback(async () => {
    if (!user) {
      setCategoriasN1([]);
      setCategoriasN2([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const storedN1 = localStorage.getItem(`moni_n1_${user.id}`);
      const storedN2 = localStorage.getItem(`moni_n2_${user.id}`);

      if (storedN1) {
        setCategoriasN1(JSON.parse(storedN1));
      } else {
        localStorage.setItem(`moni_n1_${user.id}`, JSON.stringify(DEFAULT_N1));
        setCategoriasN1(DEFAULT_N1);
      }

      if (storedN2) {
        setCategoriasN2(JSON.parse(storedN2));
      } else {
        localStorage.setItem(`moni_n2_${user.id}`, JSON.stringify(DEFAULT_N2));
        setCategoriasN2(DEFAULT_N2);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Cargar N1
      const { data: dataN1, error: errN1 } = await supabase
        .from('categorias_n1')
        .select('*')
        .order('created_at', { ascending: true });

      if (errN1) throw errN1;

      // Cargar N2
      const { data: dataN2, error: errN2 } = await supabase
        .from('categorias_n2')
        .select('*')
        .order('created_at', { ascending: true });

      if (errN2) throw errN2;

      // Si el usuario aún no tiene categorías en Supabase, sembramos las predeterminadas
      if (dataN1.length === 0) {
        const seedN1 = DEFAULT_N1.map((c) => ({
          user_id: user.id,
          nombre: c.nombre,
          color: c.color,
        }));
        const { data: insertedN1 } = await supabase.from('categorias_n1').insert(seedN1).select();
        setCategoriasN1(insertedN1 || seedN1);
      } else {
        setCategoriasN1(dataN1);
      }

      if (dataN2.length === 0) {
        const seedN2 = DEFAULT_N2.map((c) => ({
          user_id: user.id,
          nombre: c.nombre,
          color: c.color,
        }));
        const { data: insertedN2 } = await supabase.from('categorias_n2').insert(seedN2).select();
        setCategoriasN2(insertedN2 || seedN2);
      } else {
        setCategoriasN2(dataN2);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Agregar N1
  const addCategoriaN1 = async (nombre, color = '#5B3765') => {
    if (!nombre.trim() || !user) return;
    const cleanName = nombre.trim();

    if (!isSupabaseConfigured) {
      const newItem = { id: 'n1-' + Date.now(), nombre: cleanName, color };
      const updated = [...categoriasN1, newItem];
      setCategoriasN1(updated);
      localStorage.setItem(`moni_n1_${user.id}`, JSON.stringify(updated));
      return newItem;
    }

    const { data, error } = await supabase
      .from('categorias_n1')
      .insert([{ user_id: user.id, nombre: cleanName, color }])
      .select()
      .single();

    if (!error && data) {
      setCategoriasN1((prev) => [...prev, data]);
      return data;
    }
  };

  // Eliminar N1
  const deleteCategoriaN1 = async (id) => {
    if (!user) return;
    if (!isSupabaseConfigured) {
      const updated = categoriasN1.filter((c) => c.id !== id);
      setCategoriasN1(updated);
      localStorage.setItem(`moni_n1_${user.id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('categorias_n1').delete().eq('id', id);
    if (!error) {
      setCategoriasN1((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Agregar N2
  const addCategoriaN2 = async (nombre, color = '#9E6899') => {
    if (!nombre.trim() || !user) return;
    const cleanName = nombre.trim();

    if (!isSupabaseConfigured) {
      const newItem = { id: 'n2-' + Date.now(), nombre: cleanName, color };
      const updated = [...categoriasN2, newItem];
      setCategoriasN2(updated);
      localStorage.setItem(`moni_n2_${user.id}`, JSON.stringify(updated));
      return newItem;
    }

    const { data, error } = await supabase
      .from('categorias_n2')
      .insert([{ user_id: user.id, nombre: cleanName, color }])
      .select()
      .single();

    if (!error && data) {
      setCategoriasN2((prev) => [...prev, data]);
      return data;
    }
  };

  // Eliminar N2
  const deleteCategoriaN2 = async (id) => {
    if (!user) return;
    if (!isSupabaseConfigured) {
      const updated = categoriasN2.filter((c) => c.id !== id);
      setCategoriasN2(updated);
      localStorage.setItem(`moni_n2_${user.id}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('categorias_n2').delete().eq('id', id);
    if (!error) {
      setCategoriasN2((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    categoriasN1,
    categoriasN2,
    loading,
    addCategoriaN1,
    deleteCategoriaN1,
    addCategoriaN2,
    deleteCategoriaN2,
    refreshCategorias: fetchCategorias,
  };
}

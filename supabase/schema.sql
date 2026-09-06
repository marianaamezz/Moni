-- ==============================================================================
-- Esquema de Base de Datos para "Ñañay" — App de Finanzas Personales
-- Compatible con Supabase (PostgreSQL + Auth + RLS)
-- ==============================================================================

-- 1. Tabla: Categorías Nivel 1 ("¿de dónde / para quién?")
CREATE TABLE IF NOT EXISTS public.categorias_n1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  color text NOT NULL DEFAULT '#5B3765',
  created_at timestamptz DEFAULT now()
);

-- 2. Tabla: Categorías Nivel 2 ("¿en qué?")
CREATE TABLE IF NOT EXISTS public.categorias_n2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  color text NOT NULL DEFAULT '#9E6899',
  created_at timestamptz DEFAULT now()
);

-- 3. Tabla: Cuentas (opcional)
CREATE TABLE IF NOT EXISTS public.cuentas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  tipo text CHECK (tipo IN ('efectivo', 'débito', 'crédito')) NOT NULL DEFAULT 'débito',
  moneda text CHECK (moneda IN ('PEN', 'USD')) DEFAULT 'PEN',
  saldo_actual numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Tabla: Transacciones
CREATE TABLE IF NOT EXISTS public.transacciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  monto numeric NOT NULL CHECK (monto > 0),
  moneda text CHECK (moneda IN ('PEN', 'USD')) DEFAULT 'PEN',
  tipo text CHECK (tipo IN ('gasto', 'ingreso', 'transferencia')) NOT NULL,
  categoria_n1_id uuid REFERENCES public.categorias_n1(id) ON DELETE RESTRICT NOT NULL,
  categoria_n2_id uuid REFERENCES public.categorias_n2(id) ON DELETE SET NULL,
  cuenta_id uuid REFERENCES public.cuentas(id) ON DELETE SET NULL,
  nota text,
  fecha timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 5. Tabla: Presupuestos
CREATE TABLE IF NOT EXISTS public.presupuestos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  categoria_n1_id uuid REFERENCES public.categorias_n1(id) ON DELETE CASCADE,
  categoria_n2_id uuid REFERENCES public.categorias_n2(id) ON DELETE CASCADE,
  monto_limite numeric NOT NULL CHECK (monto_limite > 0),
  moneda text CHECK (moneda IN ('PEN', 'USD')) DEFAULT 'PEN',
  periodo text CHECK (periodo IN ('mensual', 'semanal', 'personalizado')) DEFAULT 'mensual',
  alerta_en int[] DEFAULT '{80,100}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_at_least_one_categoria CHECK (
    categoria_n1_id IS NOT NULL OR categoria_n2_id IS NOT NULL
  )
);

-- ------------------------------------------------------------------------------
-- Indices para acelerar consultas frecuentes por usuario y fecha
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transacciones_user_fecha ON public.transacciones (user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_transacciones_cat_n1 ON public.transacciones (categoria_n1_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_cat_n2 ON public.transacciones (categoria_n2_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_user ON public.presupuestos (user_id);

-- ------------------------------------------------------------------------------
-- Habilitar Row Level Security (RLS) en todas las tablas
-- ------------------------------------------------------------------------------
ALTER TABLE public.categorias_n1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_n2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: categorias_n1
CREATE POLICY "Permitir select para propietario en categorias_n1"
  ON public.categorias_n1 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir insert para propietario en categorias_n1"
  ON public.categorias_n1 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir update para propietario en categorias_n1"
  ON public.categorias_n1 FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir delete para propietario en categorias_n1"
  ON public.categorias_n1 FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de seguridad: categorias_n2
CREATE POLICY "Permitir select para propietario en categorias_n2"
  ON public.categorias_n2 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir insert para propietario en categorias_n2"
  ON public.categorias_n2 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir update para propietario en categorias_n2"
  ON public.categorias_n2 FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir delete para propietario en categorias_n2"
  ON public.categorias_n2 FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de seguridad: cuentas
CREATE POLICY "Permitir select para propietario en cuentas"
  ON public.cuentas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir insert para propietario en cuentas"
  ON public.cuentas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir update para propietario en cuentas"
  ON public.cuentas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir delete para propietario en cuentas"
  ON public.cuentas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de seguridad: transacciones
CREATE POLICY "Permitir select para propietario en transacciones"
  ON public.transacciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir insert para propietario en transacciones"
  ON public.transacciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir update para propietario en transacciones"
  ON public.transacciones FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir delete para propietario en transacciones"
  ON public.transacciones FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de seguridad: presupuestos
CREATE POLICY "Permitir select para propietario en presupuestos"
  ON public.presupuestos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir insert para propietario en presupuestos"
  ON public.presupuestos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir update para propietario en presupuestos"
  ON public.presupuestos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir delete para propietario en presupuestos"
  ON public.presupuestos FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Función y Trigger para Sembrar Categorías por Defecto al Registrarse
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_seed()
RETURNS trigger AS $$
BEGIN
  -- Categorías Nivel 1 predeterminadas: Yo, Casa, Familia
  INSERT INTO public.categorias_n1 (user_id, nombre, color)
  VALUES
    (NEW.id, 'Yo', '#5B3765'),
    (NEW.id, 'Casa', '#9E6899'),
    (NEW.id, 'Familia', '#BA88AE');

  -- Categorías Nivel 2 predeterminadas: Comida, Transporte, Salud, Entretenimiento, Arreglos/Mantenimiento, Servicios, Otros
  INSERT INTO public.categorias_n2 (user_id, nombre, color)
  VALUES
    (NEW.id, 'Comida', '#5B3765'),
    (NEW.id, 'Transporte', '#9E6899'),
    (NEW.id, 'Salud', '#D6A8C4'),
    (NEW.id, 'Entretenimiento', '#BA88AE'),
    (NEW.id, 'Arreglos/Mantenimiento', '#5B3765'),
    (NEW.id, 'Servicios', '#9E6899'),
    (NEW.id, 'Otros', '#9E7C97');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger automático al crear un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_seed();

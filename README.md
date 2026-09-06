# Moni — App de Finanzas Personales

> App de finanzas personales simple, intuitiva y rápida de usar, diseñada especialmente con **calma, minimalismo y cero fricción** para registrar gastos e ingresos.

---

## Características

- 🌿 **Diseño minimalista y calmado**: Paleta suave de tonos lavanda y ciruela, fuentes elegantes (`Fraunces` e `Inter`), sin saturación visual.
- ⚡ **Registro sin fricción**: Teclado numérico táctil en pantalla, visor de monto grande y chips de "¿Para quién?" siempre a mano.
- 👁️ **Divulgación progresiva**: Opciones secundarias ("¿En qué?", cuenta, nota, fecha) agrupadas discretamente detrás del botón *"Más opciones"*.
- 🎯 **Presupuestos visuales**: Barras de progreso de línea fina con avisos suaves al 80% y 100% del límite mensual.
- 🏷️ **Categorías y cuentas 100% editables**: Con asignación inteligente y automática de íconos según el nombre.
- 📊 **Resumen y analítica**: Gráfico de dona central con total gastado y desglose porcentual por destino o por concepto.
- 📂 **Apertura directa**: El archivo `index.html` es completamente autónomo y puedes abrirlo haciendo doble clic directamente en el Finder sin necesidad de comandos de terminal ni servidores previos.
- 🔒 **Privacidad total**: Compatible con Supabase (Postgres + Auth + RLS) y persistencia offline inmediata.
- 📱 **Mobile-First**: Optimizada para usarse como aplicación web progresiva en el teléfono celular.

---

## Cómo abrir la aplicación

### Opción 1: Doble clic en `index.html`
Haz doble clic sobre el archivo [`index.html`](./index.html) en esta carpeta y se abrirá al instante en tu navegador.

### Opción 2: Doble clic en `abrir_app.command`
Haz doble clic sobre [`abrir_app.command`](./abrir_app.command) para iniciar la app.

### Opción 3: Servidor de desarrollo Vite
Si deseas editar código en caliente con HMR:
```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run dev
```

---

## Conectar con Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com).
2. Ve a la sección **SQL Editor** en tu dashboard de Supabase.
3. Copia y pega el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql) y pulsa **Run**.
4. En Supabase, ve a **Project Settings -> API** y copia tu **Project URL** y tu **anon public key**.
5. Abre el archivo `.env` en la raíz de este proyecto y reemplaza los valores:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   ```
6. Vuelve a compilar con `npm run build`.

---

## Despliegue en Vercel

1. Sube este repositorio a tu cuenta de **GitHub**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/moni-finanzas.git
   git branch -M main
   git push -u origin main
   ```
2. Inicia sesión en [Vercel](https://vercel.com) e importa el proyecto.
3. Añade las variables de entorno si vas a usar Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Haz clic en **Deploy**.

# Ñañay — App de Finanzas Personales

> App de finanzas personales simple, intuitiva y rápida de usar, diseñada especialmente con **calma, minimalismo y cero fricción** para registrar gastos e ingresos.

---

## Características

- 🌿 **Diseño minimalista y calmado**: Paleta suave de tonos lavanda y ciruela, fuentes elegantes (`Fraunces` e `Inter`), sin saturación visual.
- ⚡ **Registro sin fricción**: Teclado numérico táctil en pantalla, visor de monto grande y chips de "¿Para quién?" siempre a mano.
- 👁️ **Divulgación progresiva**: Opciones secundarias ("¿En qué?", cuenta, nota, fecha) agrupadas discretamente detrás del botón *"Más opciones"*.
- 🎯 **Presupuestos visuales**: Barras de progreso de línea fina con avisos suaves al 80% y 100% del límite mensual.
- 🏷️ **Categorías y cuentas 100% editables**: Con asignación inteligente y automática de íconos según el nombre.
- 📊 **Resumen y analítica**: Gráfico de dona central con total gastado y desglose porcentual por destino o por concepto.
- 🔒 **Privacidad total**: Persistencia en Postgres con **Row Level Security (RLS)** mediante Supabase Auth.
- 📱 **Mobile-First**: Optimizada para usarse como aplicación web progresiva en el teléfono celular.

---

## Primeros Pasos (Local)

### 1. Iniciar el servidor de desarrollo
El proyecto ya incluye una versión local de Node.js lista para usar. Ejecuta:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

*Nota: La aplicación funciona de inmediato en modo local gracias a su persistencia automática, por lo que puedes comenzar a probarla antes de configurar Supabase.*

---

## Conectar con Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com).
2. Ve a la sección **SQL Editor** en tu dashboard de Supabase.
3. Copia y pega el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql) y pulsa **Run**.
   - Esto creará todas las tablas (`categorias_n1`, `categorias_n2`, `cuentas`, `transacciones`, `presupuestos`).
   - Habilitará **Row Level Security (RLS)** para que cada usuario solo vea y edite sus propios registros.
   - Activará un trigger que crea automáticamente las categorías por defecto al registrarse un usuario.
4. En Supabase, ve a **Project Settings -> API** y copia tu **Project URL** y tu **anon public key**.
5. Abre el archivo `.env` en la raíz de este proyecto y reemplaza los valores:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   ```
6. Reinicia `npm run dev` y la app sincronizará tus datos en la nube.

---

## Despliegue en Vercel

1. Sube este repositorio a tu cuenta de **GitHub**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/nanay-finanzas.git
   git branch -M main
   git push -u origin main
   ```
2. Inicia sesión en [Vercel](https://vercel.com) y selecciona **Add New... -> Project**.
3. Importa el repositorio `nanay-finanzas`.
4. En **Environment Variables**, añade:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Haz clic en **Deploy**. El archivo [`vercel.json`](./vercel.json) ya está configurado para manejar el enrutamiento SPA sin errores 404.

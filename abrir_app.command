#!/bin/bash
cd "$(dirname "$0")"
export PATH="$HOME/.local/node/bin:$PATH"

# Abrir el navegador en el puerto 3000
(sleep 1 && open http://localhost:3000) &

# Iniciar el servidor Vite
npm run dev

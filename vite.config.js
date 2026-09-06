import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/template.html')
      }
    }
  }
});

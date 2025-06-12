// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // <— this lets traffic escape the container
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/p':   'http://localhost:3000',
    },
  },
});
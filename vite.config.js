import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',      // ensures relative assets for static hosts
  test: {                 // <‑‑ Vitest config
    environment: 'jsdom',
    setupFiles: './vitest.setup.js'
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// Vite configuration with manual chunking + proxy for VM testing
export default defineConfig({
  plugins: [
    react(),
    // Run `ANALYZE=true npm run build` to open a treemap report
    process.env.ANALYZE &&
      visualizer({
        filename: './dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  build: {
    chunkSizeWarningLimit: 500,
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split the heaviest libs out of main.js
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.match(/react-mde/))                       return 'editor'; // admin editor
            if (id.match(/remark|rehype|marked|micromark/)) return 'md';     // markdown tool‑chain
            if (id.includes('lucide-react'))                return 'icons';  // icons
          }
        },
      },
    },
  },

  // Dev server / VM proxy settings
  server: {
    host: '0.0.0.0',          // allow external devices / Docker to hit Vite
    port: 5173,
    proxy: {
      // Forward API calls to the Express backend (running on :3000 in dev/VM)
      '/api': 'http://localhost:3000',
      '/p':   'http://localhost:3000',
    },
  },
});

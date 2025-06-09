import express from 'express';
import createPagesRouter from './src/server/api-pages.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use('/api', createPagesRouter());
app.use(express.static(path.join(__dirname, 'dist')));  // Vite build
/* NEW: serve dropped HTML files */
app.use(
  '/p',
  express.static(
    process.env.NODE_ENV === 'production'
      ? '/home/azureuser/static-pages'          // VM folder
      : path.join(__dirname, 'static-pages')    // local dev folder
  )
);
// ➊ paste just after all app.use(...) but **before** app.listen
function dumpRoutes() {
  console.log('── Express route stack ──');
  app._router.stack
    .filter(l => l.route || l.name === 'router')
    .forEach((l, i) => {
      const path = l.route ? l.route.path
               : (l.regexp && l.regexp.source);
      console.log(`${i}.`, path);
    });
  console.log('─────────────────────────');
}
dumpRoutes();        // ← add this line temporarily

app.listen(3000, () => console.log('Server on :3000'));

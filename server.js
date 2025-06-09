// server.js  (project root)
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import createPagesRouter from './src/server/api-pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1) JSON API for the menu
app.use('/api', createPagesRouter());

// 2) React build (vite build → dist/)
app.use(express.static(path.join(__dirname, 'dist')));

// 3) Dropped HTML files (always production path)
app.use('/p', express.static('/home/azureuser/static-pages'));

// 4) History‑fallback for React Router
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => console.log('Server on :3000'));

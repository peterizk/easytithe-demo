// server.js  – Node entry for pm2 or `npm run start`
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createPagesRouter from './src/server/api-pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1) JSON API for menu
app.use('/api', createPagesRouter());

// 2) Serve React build from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// 3) Serve dropped HTML files from the static-pages folder
app.use('/p', express.static('/home/azureuser/static-pages'));

// 4) SPA fallback: ANY other route → index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 5) Start the server on port 3000
app.listen(3000, () => console.log('Server on :3000'));

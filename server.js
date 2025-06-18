// server.js  – Node entry for pm2 or `npm run start`
import path                   from 'node:path';
import { fileURLToPath }      from 'node:url';
import express                from 'express';
import basicAuth              from 'express-basic-auth';
import helmet                 from 'helmet';
import compression            from 'compression';
import morgan                 from 'morgan';

import cfg                    from './config/index.js';
import {
  listDisplayableFiles,
  streamBlob,
} from './services/blobService.js';
import createPagesRouter      from './src/server/api-pages.js';

/* ── bootstrap ─────────────────────────────────────────────── */
const cliPort  = Number(process.argv[2]);
const port     = cliPort || cfg.port;
console.log(`Starting server on port ${port}`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app       = express();

/* ── global middleware ─────────────────────────────────────── */
app.use(helmet());
app.use(compression());
app.use(morgan(cfg.env === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: 'text/*', limit: '1mb' }));

/* ── basic auth guard on /admin ────────────────────────────── */
app.use('/admin', basicAuth({
  users    : { [cfg.admin.user]: cfg.admin.pass },
  challenge: true,
}));

app.get('/admin/logout', (_req, res) => {
  res.setHeader('WWW-Authenticate', 'Basic realm="admin"');
  res.status(401).end('Logged out');
});

/* ── API + static file routes ──────────────────────────────── */
app.use('/api', createPagesRouter());

app.get('/api/blob-list', async (_req, res, next) => {
  try {
    res.json(await listDisplayableFiles());
  } catch (err) {
    next(err);
  }
});

app.get('/api/stream/:blob', async (req, res, next) => {
  try {
    const { readableStreamBody } = await streamBlob(req.params.blob);
    readableStreamBody.pipe(res);
  } catch (err) {
    next(err);
  }
});

/* ── serve React build & static-pages fallback ─────────────── */
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/p', express.static('/home/azureuser/static-pages'));

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

/* ── centralized error handler ─────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* ── listen ────────────────────────────────────────────────── */
app.listen(port, () => console.log(`✔  ready on :${port}`));

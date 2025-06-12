// server.js
import 'dotenv/config';
import { BlobServiceClient } from '@azure/storage-blob';
import express from 'express';
import basicAuth from 'express-basic-auth';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createPagesRouter from './src/server/api-pages.js';

/* Azure Blob init --------------------------------------------- */
const blobSvc   = BlobServiceClient.fromConnectionString(
                    process.env.AZURE_STORAGE_CONNECTION_STRING);
const container = blobSvc.getContainerClient(
                    process.env.BLOB_CONTAINER_NAME);
await container.createIfNotExists();

/* Env guard --------------------------------------------------- */
['AZURE_STORAGE_CONNECTION_STRING', 'BLOB_CONTAINER_NAME'].forEach(k => {
  if (!process.env[k]) {
    console.error(`❌  Missing env var ${k}`);
    process.exit(1);
  }
});

/* Paths & App ------------------------------------------------- */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app       = express();


/* Global middleware ------------------------------------------- */
app.use(express.json());
app.use(express.text({ type: "text/*" }));

/* Auth & routers ---------------------------------------------- */
app.use('/admin', basicAuth({ users: { editor: process.env.ADMIN_PASS }, challenge: true }));
app.use('/api',  createPagesRouter());

/* React build (prod) ------------------------------------------ */
app.use(express.static(path.join(__dirname, 'dist')));

/* Pretty slug  /p/camp-lessons → /p/camp-lessons.html */
app.get('/p/:slug', (req, res, next) => {
  const raw = req.params.slug;
  if (!path.extname(raw)) req.url = `/p/${raw}.html`;
  next();
});

/* Stream files from Blob Storage */
app.get('/p/:name', async (req, res, next) => {
  try {
    const blob = container.getBlockBlobClient(req.params.name);
    if (!(await blob.exists())) return next();
    const dl = await blob.download();
    res.setHeader('Content-Type', dl.contentType || 'application/octet-stream');
    dl.readableStreamBody.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

/* Root-level slug  /camp-lessons → /p/camp-lessons.html */
app.get('/:slug', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/admin')) return next();
  const raw = req.params.slug;
  if (!path.extname(raw)) req.url = `/p/${raw}.html`;
  next();
});

/* SPA fallback ------------------------------------------------ */
app.use((_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

/* Start -------------------------------------------------------- */
app.listen(3000, () => console.log('Server listening on :3000'));

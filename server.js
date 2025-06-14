// server.js
import dotenv from 'dotenv';
dotenv.config({ override: true }); // ensure .env wins

import express from 'express';
import basicAuth from 'express-basic-auth';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlobServiceClient } from '@azure/storage-blob';
import createPagesRouter from './src/server/api-pages.js';

// Env guard
['AZURE_STORAGE_CONNECTION_STRING', 'BLOB_CONTAINER_NAME', 'ADMIN_PASS'].forEach(k => {
  if (!process.env[k]) {
    console.error(`❌ Missing env var ${k}`);
    process.exit(1);
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Async init
async function initServer() {
  // Azure Blob init
  const blobSvc = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const container = blobSvc.getContainerClient(
    process.env.BLOB_CONTAINER_NAME
  );
  await container.createIfNotExists();

  // Body parsers
  app.use(express.json());
  app.use(express.text({ type: 'text/*' }));

  // Logout endpoint (public)
  app.get('/admin/logout', (_req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Logged out');
  });

  // Protect admin UI
  app.use('/admin', basicAuth({ users: { editor: process.env.ADMIN_PASS }, challenge: true }));

  // API (file upload, delete, blob CRUD)
  app.use('/api', createPagesRouter());

  // Serve React build
  app.use(express.static(path.join(__dirname, 'dist')));

  // Utility: list all blob names
  async function listAllBlobs() {
    const names = [];
    for await (const b of container.listBlobsFlat()) {
      names.push(b.name);
    }
    return names;
  }

  // Stream blobs for any extension or slug
  // Stream blobs for any extension or slug (with debug)
app.get('/p/:name', async (req, res, next) => {
  try {
    const requested = req.params.name;
    console.log('DEBUG: requested subpage:', requested);
    const all = await listAllBlobs();
    console.log('DEBUG: available blobs:', all);

    // 1) exact match (case-sensitive)
    let actual = all.find(n => n === requested);
    // 2) case-insensitive match
    if (!actual) actual = all.find(n => n.toLowerCase() === requested.toLowerCase());
    // 3) slug match: match basename without extension
    if (!actual && !path.extname(requested)) {
      actual = all.find(n => path.parse(n).name.toLowerCase() === requested.toLowerCase());
    }
    console.log('DEBUG: matched blob:', actual);
    if (!actual) {
      console.log('DEBUG: no blob match, falling through to next');
      return next();
    }

    const blobClient = container.getBlockBlobClient(actual);
    const dl = await blobClient.download();
    console.log('DEBUG: streaming blob, contentType:', dl.contentType);
    res.setHeader('Content-Type', dl.contentType || 'application/octet-stream');
    dl.readableStreamBody.pipe(res);
  } catch (e) {
    console.error('Error streaming blob:', e);
    res.status(500).send(e.toString());
  }
});

  // SPA fallback
  app.use((_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

  app.listen(3000, () => console.log('Server listening on :3000'));
}

// Start the server
initServer().catch(err => {
  console.error('Server initialization failed:', err);
  process.exit(1);
});

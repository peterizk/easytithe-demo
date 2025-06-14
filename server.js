// server.js
import dotenv from 'dotenv';
dotenv.config({ override: true });  // load .env early

import express from 'express';
import basicAuth from 'express-basic-auth';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlobServiceClient } from '@azure/storage-blob';
import createPagesRouter from './src/server/api-pages.js';

// Determine port: CLI arg first, then PORT env var, else default 3000
let port = 3000;
const cliArg = process.argv[2];
if (cliArg && !isNaN(parseInt(cliArg, 10))) {
  port = parseInt(cliArg, 10);
} else if (process.env.PORT && !isNaN(parseInt(process.env.PORT, 10))) {
  port = parseInt(process.env.PORT, 10);
}
console.log(`Starting server on port ${port}`);

// Required environment variables
['AZURE_STORAGE_CONNECTION_STRING', 'BLOB_CONTAINER_NAME', 'ADMIN_PASS'].forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing env var ${key}`);
    process.exit(1);
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

async function initServer() {
  // Azure Blob initialization
  const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const container = blobService.getContainerClient(
    process.env.BLOB_CONTAINER_NAME
  );
  await container.createIfNotExists();

  // Body parsers
  app.use(express.json());
  app.use(express.text({ type: 'text/*' }));

  // Logout endpoint
  app.get('/admin/logout', (_req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Logged out');
  });

  // Protect /admin routes
  app.use('/admin', basicAuth({ users: { editor: process.env.ADMIN_PASS }, challenge: true }));

  // API router
  app.use('/api', createPagesRouter());

  // Serve static React build
  app.use(express.static(path.join(__dirname, 'dist')));

  // Helper to list all blobs
  async function listBlobs() {
    const names = [];
    for await (const blob of container.listBlobsFlat()) {
      names.push(blob.name);
    }
    return names;
  }

  // Stream blobs or slug-based files
  app.get('/p/:name', async (req, res, next) => {
    try {
      const requested = req.params.name;
      const all = await listBlobs();
      // exact match
      let match = all.find(n => n === requested);
      // case-insensitive
      if (!match) match = all.find(n => n.toLowerCase() === requested.toLowerCase());
      // slug (basename match)
      if (!match && !path.extname(requested)) {
        match = all.find(n => path.parse(n).name.toLowerCase() === requested.toLowerCase());
      }
      if (!match) return next();

      const client = container.getBlockBlobClient(match);
      const download = await client.download();
      res.setHeader('Content-Type', download.contentType || 'application/octet-stream');
      download.readableStreamBody.pipe(res);
    } catch (err) {
      console.error('Error streaming blob:', err);
      res.status(500).send(err.toString());
    }
  });

  // SPA fallback
  app.use((_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Start listening
  app.listen(port, () => console.log(`Server listening on :${port}`));
}

initServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

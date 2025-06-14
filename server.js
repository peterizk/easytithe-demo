// server.js
import dotenv from 'dotenv';
import express from 'express';
import basicAuth from 'express-basic-auth';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlobServiceClient } from '@azure/storage-blob';
import createPagesRouter from './src/server/api-pages.js';

dotenv.config({ override: true });  // load .env variables

// Determine port from CLI arg or PORT env var
const cliPort = Number(process.argv[2]);
const envPort = process.env.PORT ? Number(process.env.PORT) : undefined;
const port = cliPort || envPort || 3000;
console.log(`Starting server on port ${port}`);

['AZURE_STORAGE_CONNECTION_STRING', 'BLOB_CONTAINER_NAME', 'ADMIN_PASS'].forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing env var ${key}`);
    process.exit(1);
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

async function initServer() {
  const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const container = blobService.getContainerClient(
    process.env.BLOB_CONTAINER_NAME
  );
  await container.createIfNotExists();

  app.use(express.json());
  app.use(express.text({ type: 'text/*' }));

  app.get('/admin/logout', (_req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    res.status(401).send('Logged out');
  });

  app.use('/admin', basicAuth({ users: { editor: process.env.ADMIN_PASS }, challenge: true }));

  app.use('/api', createPagesRouter());
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('/p/:name', async (req, res, next) => {
    try {
      const requested = req.params.name;
      const all = [];
      for await (const b of container.listBlobsFlat()) all.push(b.name);
      let actual = all.find(n => n === requested) || all.find(n => n.toLowerCase() === requested.toLowerCase());
      if (!actual && !path.extname(requested)) {
        actual = all.find(n => path.parse(n).name.toLowerCase() === requested.toLowerCase());
      }
      if (!actual) return next();

      const client = container.getBlockBlobClient(actual);
      const download = await client.download();
      res.setHeader('Content-Type', download.contentType || 'application/octet-stream');
      download.readableStreamBody.pipe(res);
    } catch (err) {
      console.error('Error streaming blob:', err);
      res.status(500).send(err.toString());
    }
  });

  app.use((_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Bind to all interfaces so external access works
  app.listen(port, '0.0.0.0', () => console.log(`Server listening on 0.0.0.0:${port}`));
}

initServer().catch(err => {
  console.error('Server init failed:', err);
  process.exit(1);
});

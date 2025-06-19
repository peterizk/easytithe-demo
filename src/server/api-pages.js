// src/server/api-pages.js
import 'dotenv/config';                          // load .env first
import { Router } from 'express';
import multer from 'multer';
import basicAuth from 'express-basic-auth';
import { BlobServiceClient } from '@azure/storage-blob';
import mime from 'mime-types';

// Multer for file uploads
const upload = multer();

// Initialize Azure Blob Service & Container
const blobService = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const container = blobService.getContainerClient(
  process.env.BLOB_CONTAINER_NAME
);

// Ensure container exists and initialize content.md if absent
(async () => {
  try {
    await container.createIfNotExists();
    const contentClient = container.getBlockBlobClient('content.md');
    if (!(await contentClient.exists())) {
      await contentClient.upload('', 0, {
        blobHTTPHeaders: { blobContentType: 'text/plain' }
      });
    }
  } catch (err) {
    console.error('Error initializing blob container or content.md:', err);
  }
})();

export default function createPagesRouter() {
  const router = Router();

  // Helper: list displayable files
  async function listDisplayableFiles() {
    const skip = new Set(['content.md']);
    const keepExt = /\.(html?|md|pdf|png|jpe?g|gif)$/i;
    const files = [];
    for await (const blob of container.listBlobsFlat()) {
      if (skip.has(blob.name)) continue;
      if (keepExt.test(blob.name)) files.push(blob.name);
    }
    return files;
  }

  // Basic-auth middleware for admin routes
  function auth() {
    return basicAuth({ users: { editor: process.env.ADMIN_PASS }, challenge: true });
  }

  // -- Routes --

  // List pages: GET /api/pages-list
  router.get('/pages-list', async (_req, res) => {
    try {
      const pages = await listDisplayableFiles();
      res.json(pages);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // Upload a file: POST /api/upload
  router.post('/upload', auth(), upload.single('file'), async (req, res) => {
    try {
      const blobClient = container.getBlockBlobClient(req.file.originalname);
      await blobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype }
      });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // Delete a file: DELETE /api/delete/:name
  router.delete('/delete/:name', auth(), async (req, res) => {
    try {
      await container.getBlockBlobClient(req.params.name).deleteIfExists();
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // Get JSON/blob content or binary: GET /api/blob/:name
  router.get('/blob/:name', async (req, res) => {
    try {
      const blobClient = container.getBlockBlobClient(req.params.name);
      if (!(await blobClient.exists())) return res.status(404).send('Not found');
      const buffer = await blobClient.downloadToBuffer();
      const ext = req.params.name.split('.').pop().toLowerCase();
      const contentType = mime.lookup(ext) || 'application/octet-stream';
      res.type(contentType).send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // Put JSON/blob content (admin): PUT /api/blob/:name
  router.put('/blob/:name', auth(), async (req, res) => {
    try {
      const data = typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {});
      const blobClient = container.getBlockBlobClient(req.params.name);
      await blobClient.upload(Buffer.from(data), Buffer.byteLength(data), {
        blobHTTPHeaders: { blobContentType: 'application/json' }
      });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  return router;
}

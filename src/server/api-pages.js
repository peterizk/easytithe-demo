// src/server/api-pages.js
import 'dotenv/config';          // ensure .env is loaded before using process.env
import { Router } from 'express';
import multer from 'multer';
import basicAuth from 'express-basic-auth';
import { BlobServiceClient } from '@azure/storage-blob';

const upload = multer();

export default function createPagesRouter() {
  const router = Router();

  // Initialize Azure Blob container
  const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const container = blobService.getContainerClient(
    process.env.BLOB_CONTAINER_NAME
  );

  // Ensure container exists
  (async () => {
    try {
      await container.createIfNotExists();
    } catch (err) {
      console.error('Error creating blob container:', err);
    }
  })();

  // Helper: list displayable files
  async function listDisplayableFiles() {
    const skip = new Set(["content.md"]);
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
    return basicAuth({
      users: { editor: process.env.ADMIN_PASS },
      challenge: true,
    });
  }

  // --- Routes ---

  // List pages: GET /api/pages-list
  router.get('/pages-list', async (_req, res) => {
    try {
      const pages = await listDisplayableFiles();
      res.json(pages);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Upload a file: POST /api/upload (admin)
  router.post('/upload', auth(), upload.single('file'), async (req, res) => {
    try {
      const blob = container.getBlockBlobClient(req.file.originalname);
      await blob.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });
      res.sendStatus(204);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Delete a file: DELETE /api/delete/:name (admin)
  router.delete('/delete/:name', auth(), async (req, res) => {
    try {
      await container.getBlockBlobClient(req.params.name).deleteIfExists();
      res.sendStatus(204);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Get JSON/blob content: GET /api/blob/:name
  router.get('/blob/:name', async (req, res) => {
    try {
      const blob = container.getBlockBlobClient(req.params.name);
      if (!(await blob.exists())) return res.json(null);
      const buffer = await blob.downloadToBuffer();
      res.type('text/plain').send(buffer.toString('utf-8'));
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Put JSON/blob content (admin): PUT /api/blob/:name
  router.put('/blob/:name', auth(), async (req, res) => {
    try {
      const data = typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {});
      const blob = container.getBlockBlobClient(req.params.name);
      await blob.upload(
        Buffer.from(data),
        Buffer.byteLength(data),
        { blobHTTPHeaders: { blobContentType: 'application/json' } }
      );
      res.sendStatus(204);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  return router;
}

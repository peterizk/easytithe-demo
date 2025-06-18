// src/server/api-pages.js
//
// Express router for blob-backed “pages” API.
// Uses central config + cached listDisplayableFiles helper.
//

import { Router } from 'express';
import multer from 'multer';
import basicAuth from 'express-basic-auth';
import { BlobServiceClient } from '@azure/storage-blob';

import cfg from '../../config/index.js';              // central settings
import { listDisplayableFiles } from '../../services/blobService.js';

const upload = multer();

export default function createPagesRouter() {
  const router = Router();

  /* ── initialise Azure container ─────────────────────────── */
  const blobService = BlobServiceClient.fromConnectionString(
    cfg.azure.connStr,
  );
  const container = blobService.getContainerClient(cfg.azure.container);

  (async () => {
    try {
      await container.createIfNotExists();
    } catch (err) {
      console.error('Error ensuring blob container:', err);
    }
  })();

  /* ── helpers ────────────────────────────────────────────── */
  function auth() {
    return basicAuth({
      users: { [cfg.admin.user]: cfg.admin.pass },
      challenge: true,
    });
  }

  /* ── routes ─────────────────────────────────────────────── */

  // GET /api/pages-list  →  cached list from blobService + local file-type filter
  router.get('/pages-list', async (_req, res, next) => {
    try {
      const keepExt = /\.(html?|md|pdf|png|jpe?g|gif)$/i;
      const files = (await listDisplayableFiles()).filter((f) => keepExt.test(f));
      res.json(files);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/upload  (multipart file)  [admin]
  router.post('/upload', auth(), upload.single('file'), async (req, res, next) => {
    try {
      const blob = container.getBlockBlobClient(req.file.originalname);
      await blob.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/delete/:name  [admin]
  router.delete('/delete/:name', auth(), async (req, res, next) => {
    try {
      await container.getBlockBlobClient(req.params.name).deleteIfExists();
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/blob/:name  →  raw content (utf-8 string)
  router.get('/blob/:name', async (req, res, next) => {
    try {
      const blob = container.getBlockBlobClient(req.params.name);
      if (!(await blob.exists())) return res.json(null);
      const buffer = await blob.downloadToBuffer();
      res.type('text/plain').send(buffer.toString('utf-8'));
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/blob/:name  [admin]  →  create/replace JSON or text blob
  router.put('/blob/:name', auth(), async (req, res, next) => {
    try {
      const data =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
      const blob = container.getBlockBlobClient(req.params.name);
      await blob.upload(Buffer.from(data), Buffer.byteLength(data), {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

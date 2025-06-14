// src/server/api-pages.js
import { Router } from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';

const upload = multer();
const router = Router();

/* ------------------------------------------------------------------ */
/*  Azure Blob bootstrap                                              */
/* ------------------------------------------------------------------ */

const blobSvc = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const container = blobSvc.getContainerClient(
  process.env.BLOB_CONTAINER_NAME
);
await container.createIfNotExists(); // safe no-op if exists

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  HTML page upload / delete / list (no basic-auth)                  */
/* ------------------------------------------------------------------ */

/** GET /api/pages-list → ["about.html", …] */
router.get('/pages-list', async (_req, res) => {
  try {
    res.json(await listDisplayableFiles());
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

/** POST /api/upload  (multipart/form-data name=file) */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const blob = container.getBlockBlobClient(req.file.originalname);
    await blob.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });
    res.sendStatus(204);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

/** DELETE /api/delete/:name */
router.delete('/delete/:name', async (req, res) => {
  try {
    await container.getBlockBlobClient(req.params.name).deleteIfExists();
    res.sendStatus(204);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

/* ------------------------------------------------------------------ */
/*  Generic JSON blobs (schedule.json, site-settings.json, etc.)       */
/* ------------------------------------------------------------------ */

/** GET /api/blob/:name → raw text (null if not found) */
router.get('/blob/:name', async (req, res) => {
  try {
    const blob = container.getBlockBlobClient(req.params.name);
    if (!(await blob.exists())) return res.json(null);
    const buf = await blob.downloadToBuffer();
    res.type('text/plain').send(buf.toString('utf-8'));
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

/** PUT /api/blob/:name (body = text or JSON) */
router.put('/blob/:name', async (req, res) => {
  try {
    const data = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body || {});
    const blob = container.getBlockBlobClient(req.params.name);
    await blob.upload(
      Buffer.from(data),
      Buffer.byteLength(data),
      { blobHTTPHeaders: { blobContentType: 'application/json' } }
    );
    res.sendStatus(204);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

export default function createPagesRouter() {
  return router;
}

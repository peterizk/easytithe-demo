// src/server/api-pages.js
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

// Where to read pages from.
// • In production  ➜  /home/azureuser/static-pages
// • In local dev   ➜  ./static-pages  (folder at repo root)
const PAGES_DIR =
  process.env.NODE_ENV === 'production'
    ? '/home/azureuser/static-pages'
    : './static-pages';

export default function createPagesRouter() {
  const router = express.Router();

  // Builds a fresh list on *every* request,
  // so new / deleted files appear without restarting the server.
  router.get('/pages-list', (_, res) => {
    const files = fs
      .readdirSync(PAGES_DIR)
      .filter((f) => f.toLowerCase().endsWith('.html')) // case‑insensitive
      .map((f) => {
        const slug = path.parse(f).name;               // camp-lessons
        const label = slug
          .replace(/-/g, ' ')                          // camp lessons
          .replace(/\b\w/g, (c) => c.toUpperCase());   // Camp Lessons
        return { slug, url: `/p/${f}`, label };
      });

    res.json(files);
  });

  return router;
}

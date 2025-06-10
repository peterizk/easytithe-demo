// src/server/api-pages.js
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

// Always read from the prod folder (we’ll symlink it locally)
const PAGES_DIR = '/home/azureuser/static-pages';

export default function createPagesRouter() {
  const router = express.Router();

  // Build fresh list on every request
  router.get('/pages-list', (_req, res) => {
    const pages = fs
      .readdirSync(PAGES_DIR)
      .filter(f => f.toLowerCase().endsWith('.html'))
      .map(f => {
        const slug = path.parse(f).name;
        const label = slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return { slug, url: `/p/${f}`, label };
      });
    res.json(pages);
  });

  return router;
}
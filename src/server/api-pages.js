import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

const PAGES_DIR = process.env.NODE_ENV === 'production'
  ? '/home/azureuser/static-pages'
  : './static-pages';

export default function createPagesRouter() {
  const router = express.Router();

  router.get('/pages-list', (_, res) => {
    const files = fs.readdirSync(PAGES_DIR)
    .filter(f => f.toLowerCase().endsWith('.html'))
    .map(f => {
      console.log('[pages-list] discovered', f);   // ← temporary debug
      const slug  = path.parse(f).name;             // about
      const label = slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());    // About
        return { slug, url: `/p/${f}`, label };
      });
    res.json(files);
  });

  return router;
}

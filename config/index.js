import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath   = path.resolve(__dirname, '../.env');

dotenvExpand.expand(dotenv.config({ path: envPath }));

const number = (v, fallback) => Number.parseInt(v ?? fallback, 10);

/* ------------------------------------------------------------------ */
export default {
  env      : process.env.NODE_ENV || 'development',
  port     : number(process.env.PORT, 3000),
  admin    : {
    user : process.env.ADMIN_USER,
    pass : process.env.ADMIN_PASS,
  },
  azure    : {
    connStr   : process.env.AZURE_STORAGE_CONNECTION_STRING,
    container : process.env.AZURE_STORAGE_CONTAINER,
  },
  cacheTtl : number(process.env.CACHE_TTL_SECONDS, 300), // ⏱ 5 min default
};

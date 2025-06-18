import { BlobServiceClient } from '@azure/storage-blob';
import cfg   from '../config/index.js';
import cache from './cache.js';

const client    = BlobServiceClient.fromConnectionString(cfg.azure.connStr);
const container = client.getContainerClient(cfg.azure.container);

// ------------------------------------------------------------------
// List blobs (cached)
export async function listDisplayableFiles() {
  const key = 'blob-list';
  const hit = cache.get(key);
  if (hit) return hit;

  const files = [];
  for await (const blob of container.listBlobsFlat()) {
    if (!blob.deleted && !blob.name.startsWith('_')) files.push(blob.name);
  }
  cache.set(key, files);
  return files;
}

// ------------------------------------------------------------------
// Stream individual blob (not cached – Azure CDN handles it)
export function streamBlob(blobName) {
  return container.getBlobClient(blobName).download();
}

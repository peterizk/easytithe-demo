import NodeCache from 'node-cache';
import cfg from '../config/index.js';

const cache = new NodeCache({
  stdTTL    : cfg.cacheTtl,
  checkperiod: Math.ceil(cfg.cacheTtl / 2),
});

export default cache;

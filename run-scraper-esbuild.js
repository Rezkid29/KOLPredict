
import { register } from 'esbuild-register/dist/node.js';

register({
  target: 'node18',
  format: 'esm'
});

import('./server/test-scraper-v2.ts');

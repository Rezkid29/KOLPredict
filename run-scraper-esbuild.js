
require('esbuild-register/dist/node').register({
  target: 'node18',
  format: 'cjs'
});

require('./server/test-scraper-v2.ts');

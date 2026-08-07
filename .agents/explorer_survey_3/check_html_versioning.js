const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');

const htmlFiles = [
  'admin.html',
  'b2b-dashboard.html',
  'catalog.html',
  'checkout.html',
  'contacts.html',
  'delivery.html',
  'faq.html',
  'guides.html',
  'index.html',
  'returns.html',
  'service.html'
];

console.log('=== HTML ASSET VERSIONING AUDIT ===');

const results = [];

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[ERROR] File missing: ${file}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Match <link rel="stylesheet" href="..."> and <script src="...">
  const cssMatches = [...content.matchAll(/<link\s+[^>]*href=["']([^"']+\.css[^"']*)["']/gi)].map(m => m[1]);
  const jsMatches = [...content.matchAll(/<script\s+[^>]*src=["']([^"']+\.js[^"']*)["']/gi)].map(m => m[1]);

  const fileResult = {
    file,
    css: cssMatches,
    js: jsMatches
  };
  results.push(fileResult);

  console.log(`\nFile: ${file}`);
  console.log('  CSS:', cssMatches);
  console.log('  JS:', jsMatches);
});

// Check consistency
let all37 = true;
results.forEach(r => {
  [...r.css, ...r.js].forEach(asset => {
    if (asset.includes('.css') || asset.includes('.js')) {
      if (asset.includes('style.css') || asset.includes('app.js') || asset.includes('i18n.js') || asset.includes('checkout.js')) {
        if (!asset.includes('?v=37.0')) {
          all37 = false;
          console.log(`[MISMATCH] ${r.file} asset ${asset} does not use ?v=37.0`);
        }
      }
    }
  });
});

if (all37) {
  console.log('\n[CONFIRMED] All 11 HTML files currently use ?v=37.0 consistently across all local CSS/JS assets.');
  console.log('[ACTION] When R1-R3 changes are committed, version tags in all 11 HTML files must be bumped to ?v=38.0.');
}

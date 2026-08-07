const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/DenCrut/Documents/radcor.md';
const i18nContent = fs.readFileSync(path.join(rootDir, 'i18n.js'), 'utf8');

const window = {};
eval(i18nContent);

const I18N = window.I18N;
const ruKeys = new Set(Object.keys(I18N.ru || {}));
const roKeys = new Set(Object.keys(I18N.ro || {}));

console.log('RU keys count:', ruKeys.size);
console.log('RO keys count:', roKeys.size);

const htmlFiles = [
  'admin.html', 'b2b-dashboard.html', 'catalog.html', 'checkout.html',
  'contacts.html', 'delivery.html', 'faq.html', 'guides.html',
  'index.html', 'returns.html', 'service.html'
];

let missingRu = 0, missingRo = 0;
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const matches = [...content.matchAll(/data-i18n=["']([^"']+)["']/g)].map(m => m[1]);
  matches.forEach(key => {
    if (!ruKeys.has(key)) {
      console.log('Missing RU key in ' + file + ': ' + key);
      missingRu++;
    }
    if (!roKeys.has(key)) {
      console.log('Missing RO key in ' + file + ': ' + key);
      missingRo++;
    }
  });

  const placeholderMatches = [...content.matchAll(/data-i18n-placeholder=["']([^"']+)["']/g)].map(m => m[1]);
  placeholderMatches.forEach(key => {
    if (!ruKeys.has(key)) {
      console.log('Missing RU placeholder key in ' + file + ': ' + key);
      missingRu++;
    }
    if (!roKeys.has(key)) {
      console.log('Missing RO placeholder key in ' + file + ': ' + key);
      missingRo++;
    }
  });
});

console.log('Total missing RU keys:', missingRu);
console.log('Total missing RO keys:', missingRo);

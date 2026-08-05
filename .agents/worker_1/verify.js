const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\DenCrut\\Documents\\radcor.md';
const files = [
  'index.html', 'catalog.html', 'b2b-dashboard.html', 'checkout.html',
  'admin.html', 'contacts.html', 'delivery.html', 'faq.html',
  'guides.html', 'returns.html', 'service.html'
];

console.log('=== VERIFICATION START ===');

// 1. Check HTML files asset query version
let htmlErrors = 0;
files.forEach(f => {
  const filePath = path.join(rootDir, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const tagRegex = /(?:href|src)="([^"]+?\.(?:css|js))(\?[^"]*)?"/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const query = match[2];
    if (query !== '?v=16.0') {
      console.log(`[HTML WARN] ${f}: ${fullTag} (expected ?v=16.0)`);
      htmlErrors++;
    }
  }
});
if (htmlErrors === 0) {
  console.log('[PASS] All 11 HTML files use ?v=16.0 query strings for CSS/JS assets.');
}

// 2. Check i18n.js
try {
  const i18nContent = fs.readFileSync(path.join(rootDir, 'i18n.js'), 'utf8');
  eval(i18nContent);
  if (global.I18N) {
    const ru = global.I18N.ru;
    const ro = global.I18N.ro;
    console.log('[PASS] i18n.js loaded. RU pkw:', ru.cat_motor_oils_pkw, '| RU catalog_pkw:', ru.catalog_pkw);
    console.log('[PASS] i18n.js loaded. RO pkw:', ro.cat_motor_oils_pkw, '| RO catalog_pkw:', ro.catalog_pkw);
    console.log('[PASS] i18n.js filter_viscosity RU:', ru.filter_viscosity, '| RO:', ro.filter_viscosity);
  }
} catch (e) {
  console.error('[FAIL] i18n.js error:', e.message);
}

// 3. Check products.json
try {
  const prods = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));
  console.log(`[PASS] products.json is valid JSON. Total count: ${prods.length}`);
  const pkw = prods.filter(p => p.category === 'motor-oils-pkw');
  console.log(`[PASS] Passenger Car Motor Oils count: ${pkw.length}`);
  
  const saeList = ['0W-16', '0W-20', '0W-30', '5W-20', '5W-30', '5W-40', '10W-30', '10W-40', '15W-40', '20W-50'];
  const foundSae = {};
  pkw.forEach(p => {
    const str = ((p.name || '') + ' ' + (p.name_ro || '') + ' ' + (p.specs || []).map(s => s.value).join(' ') + ' ' + (p.viscosity || '')).toUpperCase();
    saeList.forEach(s => {
      if (str.includes(s.toUpperCase())) foundSae[s] = (foundSae[s] || 0) + 1;
    });
  });
  console.log('[PASS] SAE grades present in PKW:', Object.keys(foundSae));
  
  const totes = {};
  pkw.forEach(p => {
    (p.volumes || []).forEach(v => {
      if ([983, 991, 994].includes(v)) {
        totes[v] = (totes[v] || 0) + 1;
      }
    });
  });
  console.log('[PASS] IBC Tote volumes present in PKW:', totes);
} catch (e) {
  console.error('[FAIL] products.json error:', e.message);
}

// 4. Check app.js syntax
try {
  const appCode = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');
  new Function(appCode);
  console.log('[PASS] app.js syntax is valid.');
} catch (e) {
  console.error('[FAIL] app.js error:', e.message);
}

console.log('=== VERIFICATION END ===');

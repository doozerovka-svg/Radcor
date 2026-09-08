/**
 * RADCOR Full-Scale Comprehensive Audit Suite
 * End-to-end verification of catalog taxonomy, product schema, B2B UI compliance,
 * filtering engine, B2B authentication, cart & checkout, and localization.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT_DIR = 'c:/Users/DenCrut/Documents/radcor.md';
const EXPECTED_VERSION = '?v=50.0';
const HTML_PAGES = [
  'index.html', 'catalog.html', 'service.html', 'delivery.html',
  'returns.html', 'guides.html', 'faq.html', 'contacts.html',
  'b2b-dashboard.html', 'admin.html', 'checkout.html'
];

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`[PASS] ${message}`);
  } else {
    failCount++;
    console.error(`[FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('RADCOR FULL-SCALE SYSTEM-WIDE AUDIT & VERIFICATION SUITE');
console.log('================================================================\n');

// 1. Load i18n
const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
const i18nContext = { window: {}, console };
vm.createContext(i18nContext);
vm.runInContext(i18nCode, i18nContext);
const I18N = i18nContext.window.I18N || i18nContext.I18N;

// 3. Load products data
const productsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'products.json'), 'utf8'));

// 2. Load DOM & app.js
const domElements = {};
function createMockElement(id) {
  return {
    id, textContent: '', value: '', style: {}, children: [],
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
      contains(c) { return this._classes.has(c); }
    },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    appendChild(child) { this.children.push(child); },
    addEventListener() {},
    setAttribute() {},
    getAttribute() { return null; }
  };
}

const documentMock = {
  addEventListener() {},
  getElementById(id) {
    if (!domElements[id]) domElements[id] = createMockElement(id);
    return domElements[id];
  },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(), className: '', style: {}, children: [],
      appendChild(child) { this.children.push(child); },
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k] || null; },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  createDocumentFragment() { return { children: [], appendChild(c) { this.children.push(c); } }; },
  documentElement: { lang: 'ru' }
};

const localStorageMock = {
  _data: {},
  getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

let rawAppCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
let appCode = rawAppCode.replace(
  /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/,
  'function __initAppExports() {'
);
const lastIndex = appCode.lastIndexOf('});');
if (lastIndex !== -1) {
  appCode = appCode.substring(0, lastIndex) + `
    return {
      CATEGORY_LABELS,
      LUBRICANT_SUBCATEGORIES,
      AUTO_CHEMISTRY_SUBCATEGORIES,
      catalogState,
      allProducts,
      getProductViscosity,
      parseViscosityWeight,
      getVolumeLabel,
      getProductApprovals,
      ALL_ACEA_STANDARDS,
      getProductAceaSpecs,
      ALL_API_STANDARDS,
      getProductApiSpecs,
      applyCategoryFilterOnly,
      applyFilters,
      applyLanguage,
      getI18nText,
      updateCategoryCounts,
      renderSidebarFilters,
      renderCatalog,
      renderProductCard,
      cartItems,
      FREE_DELIVERY_THRESHOLD
    };
  }` + appCode.substring(lastIndex + 3);
}
appCode += '\nwindow.__app = __initAppExports();\n';

const appContext = {
  window: { I18N, location: { search: '', href: '' } },
  I18N,
  document: documentMock,
  localStorage: localStorageMock,
  console,
  URLSearchParams,
  fetch: async (url) => {
    if (String(url).includes('products.json')) {
      return { ok: true, json: async () => productsData };
    }
    return { ok: false };
  },
  renderCatalog: () => {},
  renderCart: () => {},
  Number, String, Array, Object, Set, Math, RegExp, parseInt, parseFloat, setTimeout, clearTimeout
};
vm.createContext(appContext);
vm.runInContext(appCode, appContext);
const App = appContext.window.__app;

// SECTION 1: CATALOG TAXONOMY & HIERARCHY
console.log('--- 1. CATALOG TAXONOMY & HIERARCHY ---');
assert(Array.isArray(App.LUBRICANT_SUBCATEGORIES) && App.LUBRICANT_SUBCATEGORIES.length === 7, 'LUBRICANT_SUBCATEGORIES contains exactly 7 subcategories');
assert(Array.isArray(App.AUTO_CHEMISTRY_SUBCATEGORIES) && App.AUTO_CHEMISTRY_SUBCATEGORIES.length === 4, 'AUTO_CHEMISTRY_SUBCATEGORIES contains exactly 4 subcategories');

const expectedCategories = [
  'all', 'lubricants',
  'motor-oils-pkw', 'motor-oils-lkw', 'moto-oils', 'transmission-oils', 'hydraulic-oils', 'greases', 'industrial-lubricants',
  'coolants', 'brake-fluids',
  'auto-chemistry',
  'air-fresheners', 'screenwash', 'adblue', 'car-care',
  'accessories', 'auto-lamps'
];
expectedCategories.forEach(cat => {
  assert(App.CATEGORY_LABELS[cat] !== undefined, `Category '${cat}' registered in CATEGORY_LABELS (RU: ${App.CATEGORY_LABELS[cat]})`);
});

// Category count sums
const catCounts = {};
productsData.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
const sumLubricants = App.LUBRICANT_SUBCATEGORIES.reduce((s, c) => s + (catCounts[c] || 0), 0);
const sumAutoChem = App.AUTO_CHEMISTRY_SUBCATEGORIES.reduce((s, c) => s + (catCounts[c] || 0), 0);

App.catalogState.activeCategory = 'lubricants';
const lubsFiltered = App.applyFilters(productsData);
assert(lubsFiltered.length === sumLubricants, `Parent 'lubricants' returns exactly sum of subcategories (${lubsFiltered.length} items)`);

App.catalogState.activeCategory = 'auto-chemistry';
const autoChemFiltered = App.applyFilters(productsData);
assert(autoChemFiltered.length === sumAutoChem, `Parent 'auto-chemistry' returns exactly sum of subcategories (${autoChemFiltered.length} items)`);

// Each subcategory filter returns non-empty subset matching category
App.LUBRICANT_SUBCATEGORIES.concat(App.AUTO_CHEMISTRY_SUBCATEGORIES).forEach(subcat => {
  App.catalogState.activeCategory = subcat;
  const filtered = App.applyFilters(productsData);
  const expected = productsData.filter(p => p.category === subcat);
  assert(filtered.length === expected.length && filtered.length > 0, `Subcategory '${subcat}' returns ${filtered.length} products correctly`);
});

// Standalone categories
['coolants', 'brake-fluids', 'accessories'].forEach(cat => {
  App.catalogState.activeCategory = cat;
  const filtered = App.applyFilters(productsData);
  const expected = productsData.filter(p => p.category === cat);
  assert(filtered.length === expected.length && filtered.length > 0, `Standalone category '${cat}' returns ${filtered.length} products correctly`);
});

// Placeholder category
App.catalogState.activeCategory = 'auto-lamps';
const autoLampsFiltered = App.applyFilters(productsData);
assert(autoLampsFiltered.length === 0, 'Placeholder category auto-lamps returns 0 products without throwing errors');

// SECTION 2: PRODUCTS DATA INTEGRITY & ASSETS
console.log('\n--- 2. PRODUCTS DATA INTEGRITY & ASSETS ---');
assert(productsData.length >= 740, `Catalog contains ${productsData.length} active products (robust dataset)`);

let invalidSkus = 0;
let invalidPrices = 0;
let missingLocalImages = [];
const seenSkus = new Set();
let duplicateSkus = 0;

productsData.forEach(p => {
  if (!p.sku || typeof p.sku !== 'string') invalidSkus++;
  if (seenSkus.has(p.sku)) duplicateSkus++;
  seenSkus.add(p.sku);

  if (p.packs && Array.isArray(p.packs)) {
    p.packs.forEach(pack => {
      const price = pack.price_mdl !== undefined ? pack.price_mdl : pack.price;
      if (typeof price !== 'number' || isNaN(price) || price < 0) {
        invalidPrices++;
      }
    });
  }

  if (p.photo_url && !p.photo_url.startsWith('http')) {
    if (!fs.existsSync(path.join(ROOT_DIR, p.photo_url))) {
      missingLocalImages.push({ sku: p.sku, path: p.photo_url });
    }
  }
});

assert(invalidSkus === 0, '0 invalid or missing SKUs');
assert(duplicateSkus === 0, '0 duplicate SKUs across entire catalog');
assert(invalidPrices === 0, '0 NaN or negative product pack prices');
assert(missingLocalImages.length === 0, `All local images exist on disk (${missingLocalImages.length} missing)`);

// Verify AdBlue products specifically
const molAdblue = productsData.find(p => p.sku === 'MOL-1015');
assert(molAdblue !== undefined && molAdblue.category === 'adblue', 'MOL AdBlue exists and is categorized as adblue');
assert(molAdblue.volumes.includes(5) && molAdblue.volumes.includes(10), 'MOL AdBlue has 5L and 10L volume options');

const noxyAdblue = productsData.find(p => p.sku === 'NOXY-ADBLUE');
assert(noxyAdblue !== undefined && noxyAdblue.category === 'adblue', 'NOXy AdBlue exists and is categorized as adblue');
assert(noxyAdblue.volumes.includes(5) && noxyAdblue.volumes.includes(10) && noxyAdblue.volumes.includes(18) && noxyAdblue.volumes.includes(1000), 'NOXy AdBlue has 5L, 10L, 18L, and 1000L options');
assert(fs.existsSync(path.join(ROOT_DIR, noxyAdblue.photo_url)), `NOXy AdBlue image '${noxyAdblue.photo_url}' exists on disk`);

// Verify StropGEL products specifically
const stropWinter = productsData.find(p => p.sku === 'RP-00007');
assert(stropWinter !== undefined && stropWinter.category === 'screenwash', 'StropGEL -20°C 5L exists and is in screenwash');
const stropSummer = productsData.find(p => p.sku === 'RP-00008');
assert(stropSummer !== undefined && stropSummer.category === 'screenwash', 'StropGEL Summer 5L exists and is in screenwash');
const stropAntiinsect = productsData.find(p => p.sku === 'RP-00009');
assert(stropAntiinsect !== undefined && stropAntiinsect.category === 'screenwash', 'StropGEL Antiinsect 5L exists and is in screenwash');

// SECTION 3: B2B UI COMPLIANCE & EMOJI BAN
console.log('\n--- 3. B2B UI COMPLIANCE & EMOJI AUDIT ---');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const auditedFiles = [...HTML_PAGES, 'app.js', 'i18n.js', 'products.json'];
let emojiViolations = 0;

auditedFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (emojiRegex.test(content)) {
    emojiViolations++;
    console.error(`[FAIL] Emoji found in ${file}`);
  }
});
assert(emojiViolations === 0, '0 emoji violations across all 14 project files (AGENTS.md Section 1 compliance)');

// SECTION 4: LOCALIZATION (RU/RO) PARITY
console.log('\n--- 4. LOCALIZATION (RU/RO) PARITY ---');
const ruKeys = Object.keys(I18N.ru);
const roKeys = Object.keys(I18N.ro);
assert(ruKeys.length === roKeys.length, `RU and RO translation keys are strictly equal (${ruKeys.length} keys)`);
const missingRo = ruKeys.filter(k => I18N.ro[k] === undefined);
assert(missingRo.length === 0, `0 missing translation keys in RO dictionary (Missing: ${missingRo.join(', ')})`);

// Check new subcategories in i18n
['cat_air_fresheners', 'cat_screenwash', 'cat_adblue', 'cat_car_care'].forEach(k => {
  assert(I18N.ru[k] && I18N.ro[k], `Subcategory key '${k}' exists in both RU ('${I18N.ru[k]}') and RO ('${I18N.ro[k]}')`);
});

// Check .lang-selector presence across all 11 HTML pages
HTML_PAGES.forEach(file => {
  const html = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  assert(html.includes('class="lang-selector"') || html.includes("class='lang-selector'"), `${file} includes .lang-selector component`);
});

// SECTION 5: B2B AUTHENTICATION & PERSONAL CABINET
console.log('\n--- 5. B2B AUTHENTICATION & SECURITY ---');
const b2bAuthCode = fs.readFileSync(path.join(ROOT_DIR, 'b2b-auth.js'), 'utf8');
const b2bContext = {
  window: { location: { href: '' } },
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    body: { insertAdjacentHTML: () => {} },
    getElementById: () => null
  },
  localStorage: localStorageMock,
  crypto: {
    subtle: {
      digest: async (algo, buffer) => {
        const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest();
        return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
      }
    }
  },
  TextEncoder: require('util').TextEncoder,
  console,
  fetch: () => Promise.reject(new Error('Network offline'))
};
vm.createContext(b2bContext);
vm.runInContext(b2bAuthCode, b2bContext);
const B2BAuth = b2bContext.window.B2BAuth;

assert(typeof B2BAuth.login === 'function', 'B2BAuth.login is a valid callable function');
assert(typeof B2BAuth.applyDiscount === 'function', 'B2BAuth.applyDiscount is a valid function');

(async () => {
  const loginRes = await B2BAuth.login('1003600012345', 'rc-2026-test');
  assert(loginRes.ok === true, 'Built-in test client credentials successfully authenticate (loginRes.ok === true)');
  assert(loginRes.profile.company_name === 'SRL "Trans-Auto-Grup"', 'Authenticated client company profile matches SRL "Trans-Auto-Grup"');
  assert(loginRes.profile.discount_pct === 15, 'Authenticated client has 15% partner discount');

  const discounted = B2BAuth.applyDiscount(2000);
  assert(discounted === 1700, `15% discount applied correctly: 2000 MDL -> ${discounted} MDL (Expected: 1700 MDL)`);

  B2BAuth.logout();
  assert(B2BAuth.getSession() === null, 'Session cleanly terminated and cleared on logout');

  // SECTION 6: ASSET VERSIONING & CACHE BUSTING
  console.log('\n--- 6. ASSET VERSIONING & CACHE BUSTING ---');
  let nonVersioned = 0;
  HTML_PAGES.forEach(file => {
    const html = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    const assetRegex = /(?:src|href)=["']([^"']+\.(?:css|js)(?:\?[^"']*)?)["']/g;
    let match;
    while ((match = assetRegex.exec(html)) !== null) {
      const url = match[1];
      if (!url.startsWith('http') && !url.startsWith('//') && !url.includes('manifest')) {
        if (!url.includes(EXPECTED_VERSION)) {
          nonVersioned++;
          console.error(`[FAIL] ${file}: asset ${url} does not have ${EXPECTED_VERSION}`);
        }
      }
    }
  });
  assert(nonVersioned === 0, `All local assets across 11 HTML files strictly reference ${EXPECTED_VERSION}`);

  console.log('\n================================================================');
  console.log(`FULL-SCALE AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================');

  if (failCount > 0) process.exit(1);
})();

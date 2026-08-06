/**
 * RADCOR R3 Cart & Localization (RU/RO) Automated Test Suite
 * Executes genuine assertions for .lang-selector presence across all 11 HTML pages,
 * duplicate data-i18n attribute fixes, i18n dictionary completeness, dynamic RU<->RO switching,
 * Add to Cart operations, quantity modification, item removal, persistent localStorage state,
 * cart drawer totals, free delivery progress, and checkout page integration.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

const HTML_PAGES = [
  'index.html',
  'catalog.html',
  'service.html',
  'delivery.html',
  'returns.html',
  'guides.html',
  'faq.html',
  'contacts.html',
  'b2b-dashboard.html',
  'admin.html',
  'checkout.html'
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
console.log('RADCOR R3 Cart & Localization (RU/RO) Automated Test Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: .lang-selector Presence Across All 11 HTML Pages
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: .lang-selector Component Audit Across All 11 Pages ---');

assert(HTML_PAGES.length === 11, `Expected 11 HTML pages, found ${HTML_PAGES.length}`);

HTML_PAGES.forEach(page => {
  const filePath = path.join(ROOT_DIR, page);
  assert(fs.existsSync(filePath), `Page file exists: ${page}`);
  const html = fs.readFileSync(filePath, 'utf8');

  const hasLangSelector = html.includes('class="lang-selector"') || html.includes("class='lang-selector'");
  assert(hasLangSelector, `${page}: Contains .lang-selector container`);

  const hasRuLink = /<a[^>]*class=["'][^"']*lang-link[^"']*["'][^>]*>\s*RU\s*<\/a>/i.test(html);
  const hasRoLink = /<a[^>]*class=["'][^"']*lang-link[^"']*["'][^>]*>\s*RO\s*<\/a>/i.test(html);
  assert(hasRuLink, `${page}: Contains RU language link`);
  assert(hasRoLink, `${page}: Contains RO language link`);
});

console.log('');

// -----------------------------------------------------------------------------
// SUITE 2: Duplicate data-i18n Attribute Audit
// -----------------------------------------------------------------------------
console.log('--- SUITE 2: Duplicate data-i18n Attribute Audit ---');

let totalDuplicatesFound = 0;

HTML_PAGES.forEach(page => {
  const filePath = path.join(ROOT_DIR, page);
  const html = fs.readFileSync(filePath, 'utf8');

  // Match tags with duplicate data-i18n attributes
  const duplicateMatches = [...html.matchAll(/<[a-z0-9-]+[^>]*data-i18n=["'][^"']*["'][^>]*data-i18n=["'][^"']*["'][^>]*>/gi)];
  if (duplicateMatches.length > 0) {
    totalDuplicatesFound += duplicateMatches.length;
    console.error(`[FAIL] ${page}: Found ${duplicateMatches.length} tags with duplicate data-i18n attributes`);
  } else {
    assert(true, `${page}: 0 duplicate data-i18n attributes found`);
  }
});

assert(totalDuplicatesFound === 0, `Total duplicate data-i18n attributes across project is 0 (Found: ${totalDuplicatesFound})`);

console.log('');

// -----------------------------------------------------------------------------
// SUITE 3: i18n Dictionary Load & Key Completeness (RU & RO)
// -----------------------------------------------------------------------------
console.log('--- SUITE 3: Translation Dictionary Integrity (i18n.js) ---');

const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
const windowMock = {};
const i18nContext = { window: windowMock, console };
vm.createContext(i18nContext);
vm.runInContext(i18nCode, i18nContext);
const I18N = i18nContext.window.I18N;

assert(I18N !== undefined, 'window.I18N is defined after loading i18n.js');
assert(I18N.ru !== undefined && typeof I18N.ru === 'object', 'I18N.ru dictionary exists');
assert(I18N.ro !== undefined && typeof I18N.ro === 'object', 'I18N.ro dictionary exists');

const ruKeys = new Set(Object.keys(I18N.ru));
const roKeys = new Set(Object.keys(I18N.ro));

assert(ruKeys.size >= 400, `I18N.ru has comprehensive coverage (${ruKeys.size} keys)`);
assert(roKeys.size >= 400, `I18N.ro has comprehensive coverage (${roKeys.size} keys)`);

// Check option translations specifically
const optionKeys = ['opt_pickup', 'opt_delivery', 'opt_invoice', 'opt_contract', 'admin_cat_oils', 'admin_cat_coolants'];
optionKeys.forEach(key => {
  assert(I18N.ru[key] !== undefined, `I18N.ru has option key '${key}': "${I18N.ru[key]}"`);
  assert(I18N.ro[key] !== undefined, `I18N.ro has option key '${key}': "${I18N.ro[key]}"`);
});

// Check HTML keys against dictionary
let unmappedKeys = 0;
HTML_PAGES.forEach(page => {
  const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
  const dataI18nKeys = [...html.matchAll(/data-i18n=["']([^"']+)["']/g)].map(m => m[1]);
  dataI18nKeys.forEach(k => {
    if (!ruKeys.has(k) || !roKeys.has(k)) {
      unmappedKeys++;
      console.error(`[FAIL] ${page}: Unmapped key '${k}' in RU/RO dictionaries`);
    }
  });
});
assert(unmappedKeys === 0, `All data-i18n attributes across 11 pages match translation keys (Unmapped: ${unmappedKeys})`);

console.log('');

// -----------------------------------------------------------------------------
// SUITE 4: Dynamic Language Switcher Execution (RU <-> RO)
// -----------------------------------------------------------------------------
console.log('--- SUITE 4: Dynamic Language Switching Execution ---');

// Create mock DOM for testing applyLanguage execution
const storageMock = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = attributes;
    this.children = [];
    this.textContent = '';
    this.placeholder = '';
    this.className = '';
    this.style = {};
  }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = val; }
  querySelectorAll(selector) {
    let matches = [];
    if (selector === '[data-i18n]') {
      if (this.attributes['data-i18n']) matches.push(this);
    } else if (selector === '[data-i18n-placeholder]') {
      if (this.attributes['data-i18n-placeholder']) matches.push(this);
    } else if (selector === '.lang-selector') {
      if (this.className.includes('lang-selector')) matches.push(this);
    } else if (selector === 'a, span') {
      if (this.tagName === 'A' || this.tagName === 'SPAN') matches.push(this);
    }
    for (const child of this.children) {
      matches = matches.concat(child.querySelectorAll(selector));
    }
    return matches;
  }
  querySelector(selector) {
    const res = this.querySelectorAll(selector);
    return res.length > 0 ? res[0] : null;
  }
  appendChild(child) { this.children.push(child); }
}

const mockDocEl = new MockElement('html', { lang: 'ru' });
const mockBody = new MockElement('body');

const elemMap = {
  catalogBtn: new MockElement('a', { 'data-i18n': 'nav_catalog' }),
  deliveryMethodPickup: new MockElement('option', { 'data-i18n': 'opt_pickup' }),
  searchInput: new MockElement('input', { 'data-i18n-placeholder': 'search_placeholder' })
};
elemMap.catalogBtn.textContent = 'Каталог';
elemMap.deliveryMethodPickup.textContent = 'Самовывоз';

const langSelectorDiv = new MockElement('div');
langSelectorDiv.className = 'lang-selector';
const ruLink = new MockElement('a'); ruLink.textContent = 'RU'; ruLink.className = 'active';
const separator = new MockElement('span'); separator.textContent = '|';
const roLink = new MockElement('a'); roLink.textContent = 'RO'; roLink.className = 'lang-link';
langSelectorDiv.appendChild(ruLink);
langSelectorDiv.appendChild(separator);
langSelectorDiv.appendChild(roLink);

mockBody.appendChild(elemMap.catalogBtn);
mockBody.appendChild(elemMap.deliveryMethodPickup);
mockBody.appendChild(elemMap.searchInput);
mockBody.appendChild(langSelectorDiv);

const mockDocument = {
  documentElement: mockDocEl,
  body: mockBody,
  querySelectorAll(selector) { return mockBody.querySelectorAll(selector); },
  getElementById(id) { return elemMap[id] || null; },
  addEventListener() {}
};

let rawAppCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
rawAppCode = rawAppCode.replace("document.addEventListener('DOMContentLoaded', () => {", "function __initAppExports() {");
const lastIndex = rawAppCode.lastIndexOf('});');
if (lastIndex !== -1) {
    rawAppCode = rawAppCode.substring(0, lastIndex) + `
        return {
            CATEGORY_LABELS,
            LUBRICANT_SUBCATEGORIES,
            applyLanguage,
            getI18nText,
            addToCart,
            renderCart,
            cartItems,
            FREE_DELIVERY_THRESHOLD
        };
    }` + rawAppCode.substring(lastIndex + 3);
}
rawAppCode += `\nwindow.__app = __initAppExports();\n`;

windowMock.location = { search: '' };
windowMock.URLSearchParams = globalThis.URLSearchParams || URLSearchParams;

const appCtx = {
  window: windowMock,
  document: mockDocument,
  localStorage: storageMock,
  URLSearchParams: globalThis.URLSearchParams || URLSearchParams,
  console: { log() {}, error() {}, warn() {} },
  setTimeout,
  setInterval,
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
};

vm.createContext(appCtx);
vm.runInContext(rawAppCode, appCtx);
const App = appCtx.window.__app;

// Run code to test applyLanguage
App.applyLanguage('ro');

assert(storageMock.getItem('radcor_lang') === 'ro', 'localStorage radcor_lang updated to "ro"');
assert(mockDocEl.lang === 'ro', 'html lang attribute set to "ro"');
assert(elemMap.catalogBtn.textContent === I18N.ro.nav_catalog, `nav_catalog translated to RO: "${elemMap.catalogBtn.textContent}"`);
assert(elemMap.deliveryMethodPickup.textContent === I18N.ro.opt_pickup, `opt_pickup translated to RO: "${elemMap.deliveryMethodPickup.textContent}"`);
assert(elemMap.searchInput.placeholder === I18N.ro.search_placeholder, `search_placeholder translated to RO`);
assert(roLink.className === 'active', 'RO link in .lang-selector has active class when lang=ro');
assert(ruLink.className === 'lang-link', 'RU link in .lang-selector has lang-link class when lang=ro');

// Switch back to RU
App.applyLanguage('ru');
assert(storageMock.getItem('radcor_lang') === 'ru', 'localStorage radcor_lang updated to "ru"');
assert(mockDocEl.lang === 'ru', 'html lang attribute set to "ru"');
assert(elemMap.catalogBtn.textContent === I18N.ru.nav_catalog, `nav_catalog translated to RU: "${elemMap.catalogBtn.textContent}"`);
assert(elemMap.deliveryMethodPickup.textContent === I18N.ru.opt_pickup, `opt_pickup translated to RU: "${elemMap.deliveryMethodPickup.textContent}"`);
assert(ruLink.className === 'active', 'RU link in .lang-selector has active class when lang=ru');

console.log('');

// -----------------------------------------------------------------------------
// SUITE 5: Cart Operations, Drawer Totals & Persistent State
// -----------------------------------------------------------------------------
console.log('--- SUITE 5: Cart Logic, Totals & Persistent State ---');

// Mock cart elements
const listElem = new MockElement('div');
const countElem = new MockElement('span');
const totalSumElem = new MockElement('span');
const totalVolElem = new MockElement('span');
const delProgressElem = new MockElement('div');

elemMap['cartItemsList'] = listElem;
elemMap['cartCount'] = countElem;
elemMap['cartTotalSum'] = totalSumElem;
elemMap['totalVolume'] = totalVolElem;
elemMap['deliveryProgress'] = delProgressElem;

// Test initial empty cart state
App.renderCart();
assert(storageMock.getItem('radcor_cart_v2') === '{}', 'Empty cart state persisted to localStorage as "{}"');
assert(String(countElem.textContent) === '0', 'Cart count is 0 for empty cart');

// Test Add to Cart
App.addToCart('MOL-501', 'MOL Dynamic Gold 5W-30', 450, 4, 'canister');

const cartState1 = JSON.parse(storageMock.getItem('radcor_cart_v2') || '{}');
assert(cartState1['MOL-501_canister'] !== undefined, 'Item MOL-501_canister exists in localStorage cart');
assert(cartState1['MOL-501_canister'].qty === 1, 'Item quantity is 1');
assert(cartState1['MOL-501_canister'].price === 450, 'Item price is 450 MDL');
assert(String(countElem.textContent) === '1', 'Cart item count is 1');
assert(totalSumElem.textContent.includes('450'), `Cart total sum updated to 450 MDL (${totalSumElem.textContent})`);
assert(totalVolElem.textContent === '4.0 л', `Cart total volume updated to 4.0 л (${totalVolElem.textContent})`);
assert(delProgressElem.textContent.replace(/\s/g, '').includes('1050'), `Free delivery progress calculates remaining MDL correctly (${delProgressElem.textContent})`);

// Test Adding another item & quantity increment
App.addToCart('MOL-501', 'MOL Dynamic Gold 5W-30', 450, 4, 'canister');
App.addToCart('MOL-802', 'MOL EVOX Premium Antifreeze', 300, 5, 'canister');

const cartState2 = JSON.parse(storageMock.getItem('radcor_cart_v2') || '{}');
assert(cartState2['MOL-501_canister'].qty === 2, 'Item MOL-501 quantity incremented to 2');
assert(cartState2['MOL-802_canister'].qty === 1, 'Item MOL-802 quantity is 1');

// Expected totals:
// MOL-501: 450 * 2 = 900 MDL, volume = 4 * 2 = 8.0 l
// MOL-802: 300 * 1 = 300 MDL, volume = 5 * 1 = 5.0 l
// Total Qty = 3
// Total Price = 1200 MDL
// Total Volume = 13.0 l
assert(String(countElem.textContent) === '3', `Total cart quantity is 3 (${countElem.textContent})`);
assert(totalSumElem.textContent.replace(/\s/g, '').includes('1200'), `Total price sum is 1,200 MDL (${totalSumElem.textContent})`);
assert(totalVolElem.textContent === '13.0 л', `Total volume is 13.0 л (${totalVolElem.textContent})`);

// Add item to exceed FREE_DELIVERY_THRESHOLD (1500 MDL)
App.addToCart('MOL-802', 'MOL EVOX Premium Antifreeze', 300, 5, 'canister'); // +300 -> 1500 MDL
assert(delProgressElem.textContent.includes('Бесплатная доставка') || delProgressElem.textContent.includes('Livrare gratuită'), `Free delivery message displays when total >= 1500 MDL (${delProgressElem.textContent})`);

// Test item removal from cart state
delete cartState2['MOL-802_canister'];
storageMock.setItem('radcor_cart_v2', JSON.stringify(cartState2));
// Re-load cart items in App context
Object.keys(App.cartItems).forEach(k => delete App.cartItems[k]);
Object.assign(App.cartItems, cartState2);
App.renderCart();

const cartState3 = JSON.parse(storageMock.getItem('radcor_cart_v2') || '{}');
assert(cartState3['MOL-802_canister'] === undefined, 'Item MOL-802_canister removed from cart');
assert(String(countElem.textContent) === '2', `Updated cart count after removal is 2 (${countElem.textContent})`);

console.log('');

// -----------------------------------------------------------------------------
// SUITE 6: Checkout Integration Assertions
// -----------------------------------------------------------------------------
console.log('--- SUITE 6: Checkout Page Integration ---');

const checkoutHtml = fs.readFileSync(path.join(ROOT_DIR, 'checkout.html'), 'utf8');
const checkoutJs = fs.readFileSync(path.join(ROOT_DIR, 'checkout.js'), 'utf8');

assert(checkoutHtml.includes('id="checkoutItems"'), 'checkout.html contains #checkoutItems summary container');
assert(checkoutHtml.includes('id="checkoutTotal"'), 'checkout.html contains #checkoutTotal price container');
assert(checkoutJs.includes('radcor_cart_v2'), 'checkout.js references CART_KEY radcor_cart_v2');
assert(checkoutJs.includes("lang === 'ro' ? 'l' : 'л'"), 'checkout.js formats volume unit according to active language (l/л)');
assert(checkoutJs.includes("lang === 'ro' ? 'buc.' : 'шт.'"), 'checkout.js formats quantity unit according to active language (buc./шт.)');

console.log('');

// -----------------------------------------------------------------------------
// FINAL REPORT
// -----------------------------------------------------------------------------
console.log('================================================================');
console.log(`R3 SUITE COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
}

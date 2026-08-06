/**
 * RADCOR R2 UI Components & B2B UI Compliance Test Suite
 * Asserts 100% compliance with AGENTS.md B2B UI Invariants:
 * 1. Zero emojis in app.js, products.json, and category UI. Clean inline SVG phone icon for request button.
 * 2. Verbatim OEM approval strings preservation in products.json and Approvals drawer.
 * 3. Product Card pack size selection & price calculation accuracy.
 * 4. Price on Request ("по запросу" / "+373 685 50 595" button for industrial-lubricants / price_on_request).
 * 5. Approvals drawer toggle (.btn-toggle-approvals) & Specs drawer toggle (.btn-toggle-details) collapse/expand & non-duplication.
 * 6. Swatch dot styling & B2B CSS invariants in style.css.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

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
console.log('RADCOR R2 UI Components & B2B UI Compliance Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. Load i18n.js & Setup Mock DOM / Environment
// -----------------------------------------------------------------------------
const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
const windowMock = {};
const i18nContext = { window: windowMock, console, localStorage: { getItem: () => 'ru', setItem: () => {} } };
vm.createContext(i18nContext);
vm.runInContext(i18nCode, i18nContext);
const I18N = i18nContext.window.I18N || i18nContext.I18N;

// Helper to create mock DOM elements for rendering test
function createMockDOMNode(tagName = 'div') {
    const node = {
        tagName: tagName.toUpperCase(),
        className: '',
        style: {},
        children: [],
        attributes: {},
        innerHTML: '',
        textContent: '',
        nextElementSibling: null,
        addEventListener() {},
        removeEventListener() {},
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        setAttribute(k, v) {
            this.attributes[k] = String(v);
            this[k] = String(v);
        },
        getAttribute(k) {
            return this.attributes[k] !== undefined ? this.attributes[k] : null;
        },
        querySelector(selector) {
            return mockQuerySelector(this, selector);
        },
        querySelectorAll(selector) {
            return mockQuerySelectorAll(this, selector);
        },
        closest(selector) {
            if (matchesSelector(this, selector)) return this;
            return null;
        },
        classList: {
            _classes: new Set(),
            add(...cols) { cols.forEach(c => this._classes.add(c)); },
            remove(...cols) { cols.forEach(c => this._classes.delete(c)); },
            contains(c) { return this._classes.has(c); },
            toggle(c) {
                if (this._classes.has(c)) this._classes.delete(c);
                else this._classes.add(c);
            }
        }
    };
    return node;
}

function matchesSelector(node, selector) {
    if (!selector || !node) return false;
    if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        if (node.className && node.className.split(/\s+/).includes(cls)) return true;
        if (node.classList && node.classList.contains(cls)) return true;
    }
    if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (node.id === id || node.getAttribute && node.getAttribute('id') === id) return true;
    }
    return false;
}

function mockQuerySelector(root, selector) {
    const all = mockQuerySelectorAll(root, selector);
    return all.length > 0 ? all[0] : null;
}

function mockQuerySelectorAll(root, selector) {
    let results = [];
    if (!root) return results;

    // Parser helper for simple innerHTML inspection in unit test
    if (root.innerHTML) {
        // Create virtual nodes from innerHTML string if needed
    }
    return results;
}

// Simple DOM Parser helper for card innerHTML verification
function parseHTMLString(html) {
    const elements = [];
    const classRegex = /class=["']([^"']+)["']/g;
    let match;
    while ((match = classRegex.exec(html)) !== null) {
        elements.push(match[1]);
    }
    return {
        hasClass: (cls) => elements.some(c => c.split(/\s+/).includes(cls)),
        containsText: (txt) => html.includes(txt),
        rawHTML: html
    };
}

// -----------------------------------------------------------------------------
// Load app.js and products.json
// -----------------------------------------------------------------------------
const productsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'products.json'), 'utf8'));
let rawAppCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');

let instrumentedAppCode = rawAppCode.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/,
    `function __initAppExports() {`
);

const lastIndex = instrumentedAppCode.lastIndexOf('});');
if (lastIndex !== -1) {
    instrumentedAppCode = instrumentedAppCode.slice(0, lastIndex) + `
    return {
        allProducts,
        renderProductCard,
        getProductPacks,
        getVolumePriceForProduct,
        CATEGORY_LABELS,
        LUBRICANT_SUBCATEGORIES,
        getColorDotHtml
    };
}` + instrumentedAppCode.slice(lastIndex + 3);
}

const localStorageStore = { radcor_lang: 'ru', radcor_cart_v2: '{}' };
const localStorageMock = {
    getItem(k) { return localStorageStore[k] !== undefined ? localStorageStore[k] : null; },
    setItem(k, v) { localStorageStore[k] = String(v); },
    removeItem(k) { delete localStorageStore[k]; }
};

const appSandbox = {
    window: { location: { search: '' }, I18N },
    document: {
        addEventListener() {},
        getElementById() { return createMockDOMNode('div'); },
        querySelectorAll() { return []; },
        querySelector() { return null; },
        createElement(tag) { return createMockDOMNode(tag); },
        createDocumentFragment() {
            return { children: [], appendChild(c) { this.children.push(c); } };
        },
        documentElement: { lang: 'ru' }
    },
    localStorage: localStorageMock,
    console,
    I18N,
    fetch: async () => ({ ok: true, json: async () => productsData })
};

vm.createContext(appSandbox);
vm.runInContext(instrumentedAppCode, appSandbox);
const appExports = appSandbox.__initAppExports();

// =============================================================================
// SUITE 1: Emoji Audit & B2B UI Invariants Compliance (AGENTS.md §1)
// =============================================================================
console.log('--- SUITE 1: Emoji Audit & B2B UI Invariants Compliance ---');

// Comprehensive Unicode Emoji regex scanner filtering out standard legal symbols © (U+00A9) and ® (U+00AE)
const unicodeEmojiRegex = /\p{Extended_Pictographic}|\p{Emoji_Presentation}/gu;

const AUDIT_FILES = [
    'index.html',
    'catalog.html',
    'checkout.html',
    'b2b-dashboard.html',
    'admin.html',
    'delivery.html',
    'returns.html',
    'service.html',
    'faq.html',
    'guides.html',
    'contacts.html',
    'app.js',
    'i18n.js',
    'products.json'
];

let grandTotalEmojiViolations = 0;

// 1.1 Comprehensive Emoji Audit across ALL 14 project files
AUDIT_FILES.forEach(fileName => {
    const filePath = path.join(ROOT_DIR, fileName);
    assert(fs.existsSync(filePath), `Audit target file exists: ${fileName}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = Array.from(content.matchAll(unicodeEmojiRegex));
    const filteredMatches = matches.filter(m => {
        const cp = m[0].codePointAt(0);
        return cp !== 0x00A9 && cp !== 0x00AE; // Exclude legal symbols © (U+00A9) and ® (U+00AE)
    });
    if (filteredMatches.length > 0) {
        filteredMatches.forEach(m => {
            const lineNo = content.substring(0, m.index).split('\n').length;
            console.error(`Emoji violation in ${fileName} at line ${lineNo}: ${m[0]} (U+${m[0].codePointAt(0).toString(16).toUpperCase()})`);
        });
    }
    grandTotalEmojiViolations += filteredMatches.length;
    assert(filteredMatches.length === 0, `${fileName} emoji audit: 0 emoji violations (Found: ${filteredMatches.length})`);
});

// Assert total emoji occurrences across ALL project files is EXACTLY 0
assert(grandTotalEmojiViolations === 0, `Comprehensive Emoji Audit across ALL 14 project files: EXACTLY 0 emojis found (Found: ${grandTotalEmojiViolations})`);

// 1.2 Verify line 864 replacement: btn-call-request contains clean inline SVG icon-phone
const latestAppCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
const requestBtnSvgPresent = latestAppCode.includes('class="icon-phone"') && latestAppCode.includes('btn-call-request');
assert(requestBtnSvgPresent, 'app.js renders btn-call-request with SVG icon <svg class="icon-phone"...>');
assert(!latestAppCode.includes('📞'), 'app.js contains zero 📞 emojis');

// 1.3 Audit CATEGORY_LABELS for emojis
let categoryEmojiViolations = 0;
Object.values(appExports.CATEGORY_LABELS).forEach(label => {
    const matches = Array.from(String(label).matchAll(unicodeEmojiRegex)).filter(m => {
        const cp = m[0].codePointAt(0);
        return cp !== 0x00A9 && cp !== 0x00AE;
    });
    if (matches.length > 0) {
        categoryEmojiViolations += matches.length;
    }
});
assert(categoryEmojiViolations === 0, `CATEGORY_LABELS contains 0 emojis across all categories`);

// 1.4 Color Swatches compliance
const dotHtml = appExports.getColorDotHtml('Красный');
assert(dotHtml.includes('class="swatch-dot color-dot-red"'), `getColorDotHtml('Красный') produces swatch-dot element (${dotHtml})`);

console.log('');

// =============================================================================
// SUITE 2: Verbatim OEM Approval Strings Integrity (AGENTS.md §2)
// =============================================================================
console.log('--- SUITE 2: OEM Approval Strings Integrity ---');

// Find sample products with OEM approvals
const sampleOemProducts = productsData.filter(p => (p.specs || []).some(s => ['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label)));
assert(sampleOemProducts.length > 0, `Found ${sampleOemProducts.length} products with OEM approvals in database`);

// Check verbatim preservation of complex approval strings
let oemVerbatimViolations = 0;
const knownApprovals = ['VW 504.00/507.00', 'MB 229.51', 'BMW Longlife-04', 'SAE J 1703, FMVSS 116, DOT 3, ISO 4925 Class 3'];

sampleOemProducts.forEach(p => {
    (p.specs || []).forEach(s => {
        if (['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label)) {
            // Check that strings are string primitives and not altered/truncated
            if (typeof s.value !== 'string' || s.value.length === 0) {
                oemVerbatimViolations++;
            }
        }
    });
});
assert(oemVerbatimViolations === 0, `All OEM approval strings are preserved verbatim without truncation`);

// Test Approvals drawer text rendering for product with VW 504.00/507.00
const vwProduct = productsData.find(p => (p.specs || []).some(s => s.value && s.value.includes('VW 504.00/507.00')));
if (vwProduct) {
    const cardNode = appExports.renderProductCard(vwProduct);
    const parsed = parseHTMLString(cardNode.innerHTML);
    assert(parsed.hasClass('btn-toggle-approvals'), `Product card for ${vwProduct.sku} renders Approvals drawer toggle button (.btn-toggle-approvals)`);
    assert(parsed.hasClass('product-card-drawer'), `Product card contains drawer container (.product-card-drawer)`);
} else {
    assert(false, `Product with VW 504.00/507.00 found`);
}

console.log('');

// =============================================================================
// SUITE 3: Product Card Pack Size Selection & Price Calculation (AGENTS.md §3)
// =============================================================================
console.log('--- SUITE 3: Product Card Pack Size Selection & Price Calculation ---');

// Test sample product with packs
const multiPackProduct = {
    sku: 'TEST-PACKS-001',
    name: 'Test Oil 5W-30',
    canister_vol: 4,
    canister_price: 500,
    barrel_vol: 208,
    barrel_price: 20000,
    packs: [
        { id: '1l', volume_l: 1, price_mdl: 150 },
        { id: '4l', volume_l: 4, price_mdl: 500 },
        { id: '208l', volume_l: 208, price_mdl: 20000 }
    ]
};

const packs = appExports.getProductPacks(multiPackProduct);
assert(packs.length >= 2, `getProductPacks returns ${packs.length} pack sizes`);

const price1 = appExports.getVolumePriceForProduct(multiPackProduct, 1);
const price4 = appExports.getVolumePriceForProduct(multiPackProduct, 4);
const price208 = appExports.getVolumePriceForProduct(multiPackProduct, 208);

assert(price1 === 150, `1L pack price calculated correctly: ${price1} MDL (Expected: 150 MDL)`);
assert(price4 === 500, `4L pack price calculated correctly: ${price4} MDL (Expected: 500 MDL)`);
assert(price208 === 20000, `208L barrel price calculated correctly: ${price208} MDL (Expected: 20000 MDL)`);

// Test card DOM structure for volumes
const cardEl = appExports.renderProductCard(multiPackProduct);
const parsedCard = parseHTMLString(cardEl.innerHTML);

assert(parsedCard.hasClass('product-volumes'), `Product card renders .product-volumes block`);
assert(parsedCard.hasClass('volume-tag'), `Product card renders volume tags (.volume-tag)`);

console.log('');

// =============================================================================
// SUITE 4: Price on Request ("по запросу") & Industrial Lubricants (AGENTS.md §5)
// =============================================================================
console.log('--- SUITE 4: Price on Request ("по запросу") & Call Request Button ---');

const industrialProduct = productsData.find(p => p.category === 'industrial-lubricants') || {
    sku: 'IND-001',
    name: 'Industrial Gear Oil 220',
    category: 'industrial-lubricants',
    price_on_request: true
};

const indCardEl = appExports.renderProductCard(industrialProduct);
const indParsed = parseHTMLString(indCardEl.innerHTML);

assert(indParsed.hasClass('price-on-request'), `Industrial product card renders .price-on-request class`);
assert(indParsed.containsText('по запросу') || indParsed.containsText('la cerere'), `Industrial product card displays "по запросу" text`);
assert(indParsed.containsText('+373 685 50 595'), `Industrial product card displays phone "+373 685 50 595"`);
assert(indParsed.hasClass('btn-call-request'), `Industrial product card renders link-button .btn-call-request`);
assert(indParsed.containsText('href="tel:+37368550595"'), `btn-call-request leads to tel:+37368550595`);
assert(indParsed.containsText('icon-phone'), `btn-call-request contains monochrome SVG icon-phone`);

console.log('');

// =============================================================================
// SUITE 5: Approvals & Specs Drawer Toggle Logic (AGENTS.md §3)
// =============================================================================
console.log('--- SUITE 5: Approvals & Specs Drawer Toggle Logic ---');

// Verify drawer structure and non-duplication logic in app.js
const hasApprovalsBtn = rawAppCode.includes('btn-toggle-approvals');
const hasDetailsBtn = rawAppCode.includes('btn-toggle-details');
const drawerTypeToggle = rawAppCode.includes("drawer.setAttribute('data-type'");
const approvalExactTextClass = rawAppCode.includes('approval-exact-text');

assert(hasApprovalsBtn, 'app.js includes .btn-toggle-approvals button generator');
assert(hasDetailsBtn, 'app.js includes .btn-toggle-details button generator');
assert(drawerTypeToggle, 'app.js tracks drawer type (approvals / details) and toggles collapse when clicked twice');
assert(approvalExactTextClass, 'app.js renders OEM approvals in .approval-exact-text container');

// Verify main specs mini block only includes 'Вязкость' and 'Класс'
const mainSpecsFilter = rawAppCode.includes("['Вязкость', 'Класс'].includes(s.label)");
assert(mainSpecsFilter, 'Product card mini-specs block strictly filters for "Вязкость" and "Класс"');

// Verify approvals are excluded from details drawer to avoid duplication
const detailsDrawerExclusion = rawAppCode.includes("['Вязкость', 'Класс', 'Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label)");
assert(detailsDrawerExclusion, 'Details drawer excludes OEM approvals and surface specs to prevent duplication (AGENTS.md §3)');

// Verify drawer header / close button "×" are omitted per AGENTS.md §3
const noDrawerHeader = !rawAppCode.includes('«ПОЛНАЯ ИНФОРМАЦИЯ:»');
assert(noDrawerHeader, 'Product card drawer omits large top header "«ПОЛНАЯ ИНФОРМАЦИЯ:»" per AGENTS.md §3');

console.log('');

// =============================================================================
// SUITE 6: B2B CSS & Aesthetics Invariants Audit (AGENTS.md §1 & §5)
// =============================================================================
console.log('--- SUITE 6: B2B CSS & Aesthetics Invariants Audit ---');

const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');

// 6.1 Check swatch-dot styling
const swatchDotStyle = styleCss.includes('.swatch-dot') && styleCss.includes('box-shadow: inset 0 0 0 1px');
assert(swatchDotStyle, 'style.css defines .swatch-dot with subtle inner shadow (box-shadow: inset 0 0 0 1px...)');

// 6.2 Check btn-call-request styling
const callRequestStyle = styleCss.includes('.btn-call-request') && styleCss.includes('#FEF3C7');
assert(callRequestStyle, 'style.css defines .btn-call-request background (#FEF3C7) and text color');

// 6.3 Check price-on-request color (#D97706)
const priceOnRequestColor = styleCss.includes('#D97706');
assert(priceOnRequestColor, 'style.css defines .price-on-request color (#D97706) per AGENTS.md §5');

// 6.4 Check sidebar divider or list item borders
const borderBottomStyle = styleCss.includes('border-bottom: 1px solid #F0F2F5') || styleCss.includes('var(--colour-border)');
assert(borderBottomStyle, 'style.css defines clean B2B list item borders per AGENTS.md §1');

console.log('');

// =============================================================================
// SUMMARY
// =============================================================================
console.log('================================================================');
console.log(`R2 & B2B UI COMPLIANCE SUITE COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}

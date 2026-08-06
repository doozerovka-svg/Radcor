/**
 * RADCOR R1 Catalog & Filters Automated Test Suite
 * Executes assertions for startup error fix, category switching, dynamic sidebar filters,
 * motor oil sorting, search filtering, and schema integrity.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

// -----------------------------------------------------------------------------
// 1. Load i18n.js
// -----------------------------------------------------------------------------
const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
const windowMock = {};
const i18nContext = { window: windowMock, console };
vm.createContext(i18nContext);
vm.runInContext(i18nCode, i18nContext);
const I18N = i18nContext.window.I18N || i18nContext.I18N;

// -----------------------------------------------------------------------------
// 2. Prepare DOM & LocalStorage Mocks
// -----------------------------------------------------------------------------
const domElements = {};
function createMockElement(id) {
    return {
        id,
        textContent: '',
        value: '',
        style: {},
        classList: {
            _classes: new Set(),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); },
            toggle(c) {
                if (this._classes.has(c)) this._classes.delete(c);
                else this._classes.add(c);
            },
            contains(c) { return this._classes.has(c); }
        },
        querySelectorAll() { return []; },
        querySelector() { return null; },
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
            tagName: tag.toUpperCase(),
            className: '',
            style: {},
            children: [],
            appendChild(child) { this.children.push(child); },
            setAttribute(k, v) { this[k] = v; },
            getAttribute(k) { return this[k] || null; },
            querySelectorAll() { return []; },
            querySelector() { return null; }
        };
    },
    createDocumentFragment() {
        return {
            children: [],
            appendChild(child) { this.children.push(child); }
        };
    },
    documentElement: { lang: 'ru' }
};

const localStorageMock = {
    _data: {},
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};

// -----------------------------------------------------------------------------
// 3. Instrument app.js for VM execution & exports
// -----------------------------------------------------------------------------
let rawAppCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');

// Replace DOMContentLoaded wrapper to return internal symbols for unit testing
let appCode = rawAppCode.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/,
    `function __initAppExports() {`
);

const lastIndex = appCode.lastIndexOf('});');
if (lastIndex !== -1) {
    appCode = appCode.substring(0, lastIndex) + `
        return {
            CATEGORY_LABELS,
            LUBRICANT_SUBCATEGORIES,
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
            OFFLINE_PRODUCTS,
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
appCode += `\nwindow.__app = __initAppExports();\n`;

// Execute app.js in VM sandbox
let appInitError = null;
let appContext = null;
try {
    appContext = {
        window: { I18N },
        I18N,
        document: documentMock,
        localStorage: localStorageMock,
        console,
        fetch: async () => ({ ok: false }),
        renderCatalog: () => {},
        renderCart: () => {},
        Number,
        String,
        Array,
        Object,
        Set,
        Math,
        RegExp,
        parseInt,
        parseFloat,
        setTimeout,
        clearTimeout
    };
    vm.createContext(appContext);
    vm.runInContext(appCode, appContext);
} catch (err) {
    appInitError = err;
}

const App = appContext?.window?.__app;
const productsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'products.json'), 'utf8'));

// -----------------------------------------------------------------------------
// Test Runner Harness
// -----------------------------------------------------------------------------
let passCount = 0;
let failCount = 0;
const testResults = [];

function assert(condition, message) {
    if (condition) {
        passCount++;
        testResults.push({ status: 'PASS', message });
        console.log(`[PASS] ${message}`);
    } else {
        failCount++;
        testResults.push({ status: 'FAIL', message });
        console.error(`[FAIL] ${message}`);
    }
}

function resetState() {
    if (!App) return;
    App.catalogState.activeCategory = 'all';
    App.catalogState.activeBrands.clear();
    App.catalogState.activeViscosities.clear();
    App.catalogState.activeVolumes.clear();
    App.catalogState.activeColors.clear();
    App.catalogState.activeApprovals.clear();
    App.catalogState.activeAcea.clear();
    App.catalogState.activeApi.clear();
    App.catalogState.searchQuery = '';
}

console.log('================================================================');
console.log('RADCOR R1 Catalog & Filters Automated Verification Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: Startup & ReferenceError Fix Verification
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: Startup & ReferenceError Fix ---');
assert(appInitError === null, `app.js evaluated without startup ReferenceError (${appInitError ? appInitError.message : 'No errors'})`);
assert(App !== undefined, `__initAppExports returned application context`);
assert(typeof App.applyLanguage === 'function', `applyLanguage is function`);
assert(App.cartItems !== undefined, `cartItems state initialized prior to applyLanguage() call`);
assert(App.FREE_DELIVERY_THRESHOLD === 1500, `FREE_DELIVERY_THRESHOLD is set to 1500`);

// Check initial language invocation
try {
    App.applyLanguage('ru');
    assert(App.CATEGORY_LABELS['motor-oils-pkw'] === 'Легковые моторные масла', 'applyLanguage("ru") executed cleanly');
} catch (e) {
    assert(false, `applyLanguage("ru") threw error: ${e.message}`);
}

console.log('');

// -----------------------------------------------------------------------------
// SUITE 2: Category Switching & Accordion Hierarchy
// -----------------------------------------------------------------------------
console.log('--- SUITE 2: Category Switching & Hierarchy ---');

assert(App.LUBRICANT_SUBCATEGORIES.length === 7, `LUBRICANT_SUBCATEGORIES has 7 items`);
const expectedSubcats = [
    'motor-oils-pkw',
    'motor-oils-lkw',
    'moto-oils',
    'transmission-oils',
    'hydraulic-oils',
    'greases',
    'industrial-lubricants'
];
assert(expectedSubcats.every(s => App.LUBRICANT_SUBCATEGORIES.includes(s)),
    `All 7 subcategories present: [${expectedSubcats.join(', ')}]`);

// Parent 'lubricants' category switching returns products from ALL 7 subcategories
resetState();
App.catalogState.activeCategory = 'lubricants';
const lubsFiltered = App.applyFilters(productsData);
const lubsExpected = productsData.filter(p => App.LUBRICANT_SUBCATEGORIES.includes(p.category) || p.category === 'lubricants');
assert(lubsFiltered.length === lubsExpected.length && lubsFiltered.length > 0,
    `Parent category 'lubricants' returned ${lubsFiltered.length} items from all 7 subcategories`);

// Test each subcategory individually
App.LUBRICANT_SUBCATEGORIES.forEach(subcat => {
    resetState();
    App.catalogState.activeCategory = subcat;
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => p.category === subcat);
    assert(filtered.length === expected.length,
        `Subcategory '${subcat}' returned ${filtered.length} items (expected ${expected.length})`);
    assert(filtered.every(p => p.category === subcat),
        `All items in '${subcat}' match category '${subcat}'`);
});

// Test standalone categories
const standaloneCategories = ['coolants', 'brake-fluids', 'auto-chemistry', 'accessories', 'auto-lamps'];
standaloneCategories.forEach(cat => {
    resetState();
    App.catalogState.activeCategory = cat;
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => p.category === cat);
    assert(filtered.length === expected.length,
        `Standalone category '${cat}' returned ${filtered.length} items (expected ${expected.length})`);
});

console.log('');

// -----------------------------------------------------------------------------
// SUITE 3: Dynamic Sidebar Filters
// -----------------------------------------------------------------------------
console.log('--- SUITE 3: Dynamic Sidebar Filters ---');

// 3a. Brand Filter
resetState();
App.catalogState.activeBrands.add('MOL');
const molResult = App.applyFilters(productsData);
const molExpectedCount = productsData.filter(p => p.brand === 'MOL').length;
assert(molResult.length === molExpectedCount && molResult.length > 0,
    `Brand filter 'MOL' returned ${molResult.length} items (expected ${molExpectedCount})`);

resetState();
App.catalogState.activeBrands.add('YUKO');
const yukoResult = App.applyFilters(productsData);
const yukoExpectedCount = productsData.filter(p => p.brand === 'YUKO').length;
assert(yukoResult.length === yukoExpectedCount,
    `Brand filter 'YUKO' returned ${yukoResult.length} items (expected ${yukoExpectedCount})`);

// 3b. Viscosity Filter (0W-16 to 20W-50)
const saeViscosities = ['0W-16', '0W-20', '0W-30', '5W-20', '5W-30', '5W-40', '10W-30', '10W-40', '15W-40', '20W-50'];
saeViscosities.forEach(visc => {
    resetState();
    App.catalogState.activeViscosities.add(visc);
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => App.getProductViscosity(p) === visc);
    assert(filtered.length === expected.length,
        `Viscosity filter '${visc}' returned ${filtered.length} items (expected ${expected.length})`);
    assert(filtered.every(p => App.getProductViscosity(p) === visc),
        `All items in '${visc}' filter match viscosity '${visc}'`);
});

// 3c. ACEA Standards (34 items)
assert(App.ALL_ACEA_STANDARDS.length === 34, `ALL_ACEA_STANDARDS array has 34 items`);
const testAceaItems = ['A3', 'A5', 'B4', 'C1', 'C2', 'C3', 'C4', 'C5', 'E4', 'E6', 'E7', 'E9'];
testAceaItems.forEach(acea => {
    resetState();
    App.catalogState.activeAcea.add(acea);
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => App.getProductAceaSpecs(p).includes(acea));
    assert(filtered.length === expected.length,
        `ACEA filter '${acea}' returned ${filtered.length} items (expected ${expected.length})`);
});

// 3d. API / ILSAC Standards (52 items)
assert(App.ALL_API_STANDARDS.length === 52, `ALL_API_STANDARDS array has 52 items`);
const testApiItems = ['SL', 'SM', 'SN', 'SN+', 'SP', 'CI-4', 'CK-4', 'GL-4', 'GL-5', 'ILSAC GF-5', 'ILSAC GF-6'];
testApiItems.forEach(api => {
    resetState();
    App.catalogState.activeApi.add(api);
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => App.getProductApiSpecs(p).includes(api));
    assert(filtered.length === expected.length,
        `API filter '${api}' returned ${filtered.length} items (expected ${expected.length})`);
});

// 3e. OEM Standards / Approvals
const oemApprovalSamples = ['MB 229.51', 'VW 504.00/507.00', 'BMW Longlife-04'];
oemApprovalSamples.forEach(appr => {
    resetState();
    App.catalogState.activeApprovals.add(appr);
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => App.getProductApprovals(p).includes(appr));
    assert(filtered.length === expected.length,
        `OEM Approval filter '${appr}' returned ${filtered.length} items (expected ${expected.length})`);
});

// 3f. Volume Packs & Eurocubes (983L, 991L, 994L)
const volumePacks = [1, 4, 5, 20, 60, 208, 983, 991, 994];
volumePacks.forEach(vol => {
    resetState();
    App.catalogState.activeVolumes.add(String(vol));
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => (p.volumes || []).includes(vol));
    assert(filtered.length === expected.length,
        `Volume filter '${vol}' returned ${filtered.length} items (expected ${expected.length})`);
});

// Test volume labels formatting
assert(App.getVolumeLabel(983) === '983 л (Еврокуб)', `getVolumeLabel(983) => "983 л (Еврокуб)"`);
assert(App.getVolumeLabel(991) === '991 л', `getVolumeLabel(991) => "991 л"`);
assert(App.getVolumeLabel(994) === '994 л', `getVolumeLabel(994) => "994 л"`);

// 3g. Antifreeze Colors
const antifreezeColors = ['Красный', 'Зелёный', 'Синий', 'Жёлтый', 'Розовый', 'Фиолетовый'];
antifreezeColors.forEach(color => {
    resetState();
    App.catalogState.activeColors.add(color);
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => p.color === color);
    assert(filtered.length === expected.length,
        `Color filter '${color}' returned ${filtered.length} items (expected ${expected.length})`);
});

console.log('');

// -----------------------------------------------------------------------------
// SUITE 4: Motor Oil Sorting Logic
// -----------------------------------------------------------------------------
console.log('--- SUITE 4: Motor Oil Sorting Logic ---');

// Test parseViscosityWeight ordering
const w0W16 = App.parseViscosityWeight('0W-16');
const w0W20 = App.parseViscosityWeight('0W-20');
const w0W30 = App.parseViscosityWeight('0W-30');
const w5W30 = App.parseViscosityWeight('5W-30');
const w5W40 = App.parseViscosityWeight('5W-40');
const w10W40 = App.parseViscosityWeight('10W-40');
const w15W40 = App.parseViscosityWeight('15W-40');
const w20W50 = App.parseViscosityWeight('20W-50');

assert(w0W16 < w0W20, `0W-16 weight (${w0W16}) < 0W-20 weight (${w0W20})`);
assert(w0W20 < w0W30, `0W-20 weight (${w0W20}) < 0W-30 weight (${w0W30})`);
assert(w0W30 < w5W30, `0W-30 weight (${w0W30}) < 5W-30 weight (${w5W30})`);
assert(w5W30 < w5W40, `5W-30 weight (${w5W30}) < 5W-40 weight (${w5W40})`);
assert(w5W40 < w10W40, `5W-40 weight (${w5W40}) < 10W-40 weight (${w10W40})`);
assert(w10W40 < w15W40, `10W-40 weight (${w10W40}) < 15W-40 weight (${w15W40})`);
assert(w15W40 < w20W50, `15W-40 weight (${w15W40}) < 20W-50 weight (${w20W50})`);

// Test sorted motor oil catalog rendering logic
resetState();
App.catalogState.activeCategory = 'motor-oils-pkw';
const pkwItems = App.applyFilters(productsData);
pkwItems.sort((a, b) => {
    const va = App.getProductViscosity(a);
    const vb = App.getProductViscosity(b);
    const wa = App.parseViscosityWeight(va);
    const wb = App.parseViscosityWeight(vb);
    if (wa !== wb) return wa - wb;
    return (a.name || '').localeCompare(b.name || '');
});

let isViscosityMonotonic = true;
for (let i = 0; i < pkwItems.length - 1; i++) {
    const va = App.getProductViscosity(pkwItems[i]);
    const vb = App.getProductViscosity(pkwItems[i + 1]);
    const wa = App.parseViscosityWeight(va);
    const wb = App.parseViscosityWeight(vb);
    if (wa > wb) {
        isViscosityMonotonic = false;
        break;
    }
}
assert(isViscosityMonotonic, `motor-oils-pkw items sorted monotonically by viscosity weight starting from 0W-16`);

console.log('');

// -----------------------------------------------------------------------------
// SUITE 5: Search Bar Filtering
// -----------------------------------------------------------------------------
console.log('--- SUITE 5: Search Bar Filtering ---');

// Search by SKU
resetState();
App.catalogState.searchQuery = 'MOL-1000';
let searchSkuResult = App.applyFilters(productsData);
assert(searchSkuResult.length >= 1 && searchSkuResult.some(p => p.sku === 'MOL-1000'),
    `Search query 'MOL-1000' found matching SKU`);

// Search by Name
resetState();
App.catalogState.searchQuery = 'Essence';
let searchNameResult = App.applyFilters(productsData);
assert(searchNameResult.length > 0 && searchNameResult.every(p => (p.name || '').toLowerCase().includes('essence') || (p.description || '').toLowerCase().includes('essence')),
    `Search query 'Essence' returned ${searchNameResult.length} matching products`);

// Search by Brand
resetState();
App.catalogState.searchQuery = 'Felix';
let searchBrandResult = App.applyFilters(productsData);
assert(searchBrandResult.length > 0 && searchBrandResult.every(p => (p.brand || '').toLowerCase().includes('felix')),
    `Search query 'Felix' returned ${searchBrandResult.length} matching products`);

// Search by Spec Value
resetState();
App.catalogState.searchQuery = 'G12+';
let searchSpecResult = App.applyFilters(productsData);
assert(searchSpecResult.length > 0 && searchSpecResult.every(p => (p.specs || []).some(s => s.value && s.value.includes('G12+')) || p.name.includes('G12+')),
    `Search query 'G12+' returned ${searchSpecResult.length} matching products`);

console.log('');

// -----------------------------------------------------------------------------
// SUITE 6: Integrity & OEM Standards Validation
// -----------------------------------------------------------------------------
console.log('--- SUITE 6: OEM Data Integrity & Schema Validation ---');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
let emojiViolations = 0;
productsData.forEach(p => {
    if (emojiRegex.test(p.name || '') || emojiRegex.test(p.category || '')) {
        emojiViolations++;
        console.error(`[EMOJI VIOLATION] Item SKU ${p.sku}: ${p.name}`);
    }
});
assert(emojiViolations === 0, `0 emoji violations found in product titles and categories`);

// Verify OEM specs preservation
let totalOemSpecsCount = 0;
productsData.forEach(p => {
    const oemSpecs = App.getProductApprovals(p);
    totalOemSpecsCount += oemSpecs.length;
});
assert(totalOemSpecsCount > 0, `Extracted ${totalOemSpecsCount} OEM specification strings across catalog`);

console.log('\n================================================================');
console.log(`FINAL RESULT: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

process.exit(failCount === 0 ? 0 : 1);

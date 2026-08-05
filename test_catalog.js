const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = 'c:\\Users\\DenCrut\\Documents\\radcor.md';

// -----------------------------------------------------------------------------
// Load i18n.js
// -----------------------------------------------------------------------------
const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
const windowMock = {};
const i18nContext = { window: windowMock, console };
vm.createContext(i18nContext);
vm.runInContext(i18nCode, i18nContext);
const I18N = i18nContext.window.I18N || i18nContext.I18N;

// -----------------------------------------------------------------------------
// Load app.js inner scope by instrumenting execution in VM context
// -----------------------------------------------------------------------------
let appCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');

// Modify DOMContentLoaded wrapper to expose internals for testing
// Replace "document.addEventListener('DOMContentLoaded', () => {" with export hook
appCode = appCode.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/,
    `function __initAppExports() {`
);

// Replace the last occurrence of }); with export block and closing brace
const lastIndex = appCode.lastIndexOf('});');
if (lastIndex !== -1) {
    appCode = appCode.substring(0, lastIndex) + `
        return {
            CATEGORY_LABELS,
            LUBRICANT_SUBCATEGORIES,
            catalogState,
            getProductViscosity,
            getVolumeLabel,
            applyCategoryFilterOnly,
            applyFilters,
            applyLanguage,
            getI18nText,
            OFFLINE_PRODUCTS
        };
    }` + appCode.substring(lastIndex + 3);
}
appCode += `\nwindow.__app = __initAppExports();\n`;

const domElements = {};
function createMockElement(id) {
    return {
        id,
        textContent: '',
        style: {},
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        querySelectorAll() { return []; },
        addEventListener() {}
    };
}

const documentMock = {
    addEventListener() {},
    getElementById(id) {
        if (!domElements[id]) domElements[id] = createMockElement(id);
        return domElements[id];
    },
    querySelectorAll() { return []; },
    documentElement: { lang: 'ru' }
};

const localStorageMock = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

const appContext = {
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
    Set
};

vm.createContext(appContext);
vm.runInContext(appCode, appContext);

const App = appContext.window.__app;

// -----------------------------------------------------------------------------
// Load products.json
// -----------------------------------------------------------------------------
const productsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'products.json'), 'utf8'));

// -----------------------------------------------------------------------------
// TEST RUNNER UTILS
// -----------------------------------------------------------------------------
let passCount = 0;
let failCount = 0;
const results = [];

function assert(condition, message) {
    if (condition) {
        passCount++;
        results.push({ status: 'PASS', message });
        console.log(`[PASS] ${message}`);
    } else {
        failCount++;
        results.push({ status: 'FAIL', message });
        console.error(`[FAIL] ${message}`);
    }
}

console.log('================================================================');
console.log('RADCOR Catalog & Filter Empirical Verification Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Category labels in RU and RO for motor-oils-pkw and motor-oils-lkw
// -----------------------------------------------------------------------------
console.log('--- TEST 1: Category Labels (RU / RO) ---');
assert(I18N && I18N.ru && I18N.ro, 'I18N dictionary loaded successfully with ru and ro sections');

assert(I18N.ru.cat_motor_oils_pkw === 'Легковые моторные масла',
    `RU cat_motor_oils_pkw is "${I18N.ru.cat_motor_oils_pkw}" (expected "Легковые моторные масла")`);

assert(I18N.ru.cat_motor_oils_lkw === 'Грузовые моторные масла',
    `RU cat_motor_oils_lkw is "${I18N.ru.cat_motor_oils_lkw}" (expected "Грузовые моторные масла")`);

assert(I18N.ro.cat_motor_oils_pkw === 'Uleiuri de motor autoturisme',
    `RO cat_motor_oils_pkw is "${I18N.ro.cat_motor_oils_pkw}" (expected "Uleiuri de motor autoturisme")`);

assert(I18N.ro.cat_motor_oils_lkw === 'Uleiuri de motor camioane',
    `RO cat_motor_oils_lkw is "${I18N.ro.cat_motor_oils_lkw}" (expected "Uleiuri de motor camioane")`);

// Test applyLanguage updates CATEGORY_LABELS dynamically
App.applyLanguage('ru');
assert(App.CATEGORY_LABELS['motor-oils-pkw'] === 'Легковые моторные масла',
    `CATEGORY_LABELS['motor-oils-pkw'] in RU is "${App.CATEGORY_LABELS['motor-oils-pkw']}"`);
assert(App.CATEGORY_LABELS['motor-oils-lkw'] === 'Грузовые моторные масла',
    `CATEGORY_LABELS['motor-oils-lkw'] in RU is "${App.CATEGORY_LABELS['motor-oils-lkw']}"`);

App.applyLanguage('ro');
assert(App.CATEGORY_LABELS['motor-oils-pkw'] === 'Uleiuri de motor autoturisme',
    `CATEGORY_LABELS['motor-oils-pkw'] in RO is "${App.CATEGORY_LABELS['motor-oils-pkw']}"`);
assert(App.CATEGORY_LABELS['motor-oils-lkw'] === 'Uleiuri de motor camioane',
    `CATEGORY_LABELS['motor-oils-lkw'] in RO is "${App.CATEGORY_LABELS['motor-oils-lkw']}"`);

// Reset language to ru
App.applyLanguage('ru');

console.log('');

// -----------------------------------------------------------------------------
// TEST 2: Brand, SAE Viscosity, and IBC Tote Volume Filtering
// -----------------------------------------------------------------------------
console.log('--- TEST 2: Catalog Filtering (Brand, Viscosity, IBC Volume) ---');

// Reset state
function resetState() {
    App.catalogState.activeCategory = 'all';
    App.catalogState.activeBrands.clear();
    App.catalogState.activeViscosities.clear();
    App.catalogState.activeVolumes.clear();
    App.catalogState.activeColors.clear();
    App.catalogState.searchQuery = '';
}

// 2a. Brand filtering: MOL & YUKO
resetState();
App.catalogState.activeBrands.add('MOL');
const molFiltered = App.applyFilters(productsData);
const molCountInDb = productsData.filter(p => p.brand === 'MOL').length;
assert(molFiltered.length === molCountInDb && molCountInDb > 0,
    `Brand filter 'MOL' returned ${molFiltered.length} items (DB total: ${molCountInDb})`);
assert(molFiltered.every(p => p.brand === 'MOL'),
    `All items filtered by 'MOL' have brand === 'MOL'`);

resetState();
App.catalogState.activeBrands.add('YUKO');
const yukoFiltered = App.applyFilters(productsData);
const yukoCountInDb = productsData.filter(p => p.brand === 'YUKO').length;
assert(yukoFiltered.length === yukoCountInDb,
    `Brand filter 'YUKO' returned ${yukoFiltered.length} items (DB total: ${yukoCountInDb})`);
if (yukoFiltered.length > 0) {
    assert(yukoFiltered.every(p => p.brand === 'YUKO'), `All items filtered by 'YUKO' have brand === 'YUKO'`);
}

// 2b. SAE Viscosity filtering: 0W-16 through 20W-50
const saeGrades = ['0W-16', '0W-20', '0W-30', '5W-20', '5W-30', '5W-40', '10W-30', '10W-40', '15W-40', '20W-50'];
saeGrades.forEach(visc => {
    resetState();
    App.catalogState.activeViscosities.add(visc);
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => App.getProductViscosity(p) === visc);
    assert(filtered.length === expected.length,
        `Viscosity filter '${visc}' returned ${filtered.length} items (Expected: ${expected.length})`);
    assert(filtered.every(p => App.getProductViscosity(p) === visc),
        `All items filtered by '${visc}' match viscosity '${visc}'`);
});

// 2c. IBC Tote Volume filtering: 983, 991, 994
const ibcVolumes = [983, 991, 994];
ibcVolumes.forEach(vol => {
    resetState();
    App.catalogState.activeVolumes.add(String(vol));
    const filtered = App.applyFilters(productsData);
    const expected = productsData.filter(p => (p.volumes || []).includes(vol));
    assert(filtered.length === expected.length,
        `IBC Volume filter '${vol}' returned ${filtered.length} items (Expected in DB: ${expected.length})`);
    assert(filtered.every(p => (p.volumes || []).includes(vol)),
        `All items filtered by volume '${vol}' contain volume ${vol} in volumes array`);
});

console.log('');

// -----------------------------------------------------------------------------
// TEST 3: Volume Label Formatting (getVolumeLabel)
// -----------------------------------------------------------------------------
console.log('--- TEST 3: Volume Label Formatting ---');

assert(App.getVolumeLabel(983) === '983 л (Еврокуб)',
    `getVolumeLabel(983) => "${App.getVolumeLabel(983)}" (expected "983 л (Еврокуб)")`);

assert(App.getVolumeLabel(991) === '991 л',
    `getVolumeLabel(991) => "${App.getVolumeLabel(991)}" (expected "991 л")`);

assert(App.getVolumeLabel(994) === '994 л',
    `getVolumeLabel(994) => "${App.getVolumeLabel(994)}" (expected "994 л")`);

// Additional volume checks
assert(App.getVolumeLabel(1) === '1 л', `getVolumeLabel(1) => "${App.getVolumeLabel(1)}"`);
assert(App.getVolumeLabel(4) === '4 л', `getVolumeLabel(4) => "${App.getVolumeLabel(4)}"`);
assert(App.getVolumeLabel(208) === '208 л', `getVolumeLabel(208) => "${App.getVolumeLabel(208)}"`);
assert(App.getVolumeLabel(0.5) === '500 мл', `getVolumeLabel(0.5) => "${App.getVolumeLabel(0.5)}"`);
assert(App.getVolumeLabel(983, { label: 'Custom Pack' }) === 'Custom Pack',
    `getVolumeLabel with pack.label => "${App.getVolumeLabel(983, { label: 'Custom Pack' })}"`);

console.log('');

// -----------------------------------------------------------------------------
// TEST 4: products.json Schema & Item Counts
// -----------------------------------------------------------------------------
console.log('--- TEST 4: products.json Schema & Item Counts ---');

assert(Array.isArray(productsData), `products.json loaded as array (Total items: ${productsData.length})`);
assert(productsData.length > 0, `products.json contains at least 1 product`);

// Check category breakdown
const categoryCounts = {};
productsData.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});

console.log('Category Counts in products.json:');
Object.keys(App.CATEGORY_LABELS).forEach(cat => {
    if (cat === 'all') return;
    console.log(`  - ${cat} (${App.CATEGORY_LABELS[cat]}): ${categoryCounts[cat] || 0}`);
});

const lubricantSubcategoriesSum = App.LUBRICANT_SUBCATEGORIES.reduce((sum, c) => sum + (categoryCounts[c] || 0), 0);
console.log(`  -> Total Lubricants Subcategories Sum: ${lubricantSubcategoriesSum}`);

// Validate schema of every item
const validCategoryKeys = new Set(Object.keys(App.CATEGORY_LABELS).filter(k => k !== 'all'));
const skuSet = new Set();
let invalidCategoryCount = 0;
let duplicateSkuCount = 0;
let missingCoreFieldsCount = 0;
let missingVolumesCount = 0;

productsData.forEach((p, idx) => {
    if (!p.sku || typeof p.sku !== 'string') {
        console.log(`[SCHEMA ERR] Item idx ${idx}: missing or invalid 'sku' (${p.sku})`);
        missingCoreFieldsCount++;
    }
    if (!p.name || typeof p.name !== 'string') {
        console.log(`[SCHEMA ERR] Item idx ${idx} (${p.sku}): missing or invalid 'name' (${p.name})`);
        missingCoreFieldsCount++;
    }
    if (!p.category || !validCategoryKeys.has(p.category)) {
        invalidCategoryCount++;
        console.log(`[SCHEMA ERR] Item idx ${idx} (${p.sku || 'No SKU'}): invalid category '${p.category}'`);
    }
    if (!Array.isArray(p.volumes)) {
        missingVolumesCount++;
        console.log(`[SCHEMA WARN] Item idx ${idx} (${p.sku}): missing 'volumes' array (using packs instead)`);
    }

    if (p.sku) {
        if (skuSet.has(p.sku)) {
            duplicateSkuCount++;
            console.log(`[SCHEMA ERR] Duplicate SKU found: ${p.sku}`);
        } else {
            skuSet.add(p.sku);
        }
    }
});

assert(invalidCategoryCount === 0, `0 items with invalid category key (Failed: ${invalidCategoryCount})`);
assert(duplicateSkuCount === 0, `0 duplicate SKUs found (Duplicates: ${duplicateSkuCount})`);
assert(missingCoreFieldsCount === 0, `0 items with missing core fields (sku, name)`);
assert(missingVolumesCount === 7, `7 grease items identified with packs instead of volumes array (Warnings: ${missingVolumesCount})`);

// Check for items with IBC volumes
const ibcItems = productsData.filter(p => (p.volumes || []).some(v => [983, 991, 994].includes(v)));
console.log(`\nFound ${ibcItems.length} product(s) with IBC tote volumes (983, 991, 994):`);
ibcItems.slice(0, 5).forEach(p => {
    const matchingVols = p.volumes.filter(v => [983, 991, 994].includes(v));
    console.log(`  * SKU: ${p.sku} | Name: ${p.name} | Category: ${p.category} | Volumes: [${p.volumes.join(', ')}] | Matching: ${matchingVols.join(', ')}`);
});
if (ibcItems.length > 5) {
    console.log(`  ... and ${ibcItems.length - 5} more items with IBC tote volumes.`);
}

assert(ibcItems.length === 72, `72 items correctly configured with IBC tote volumes 983, 991, 994`);

console.log('\n================================================================');
console.log(`TEST SUITE COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

process.exit(failCount === 0 ? 0 : 1);

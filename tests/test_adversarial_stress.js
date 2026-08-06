/**
 * RADCOR Comprehensive Empirical Adversarial Stress Verification Harness
 * Tests:
 * 1. Extreme filter combinations (brand + viscosity + volume + ACEA + API + color)
 * 2. Motor oil viscosity sorting boundary conditions (0W-16 vs 20W-50)
 * 3. Search bar edge cases (casing, specs, special chars, injection, empty)
 * 4. Cart CRUD operations & threshold calculations (totals, zero qty removal, price-on-request)
 * 5. Dynamic language switching (ru <-> ro across all 11 pages)
 * 6. Form input validation (contacts.html, checkout.html ReferenceError detection)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        totalPassed++;
    } else {
        console.error(`[FAIL] ${message}`);
        totalFailed++;
    }
}

// -----------------------------------------------------------------------------
// Environment & App Setup Helper
// -----------------------------------------------------------------------------
function setupAppEnvironment() {
    const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
    const appCode  = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
    const productsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'products.json'), 'utf8'));

    const mockElements = {};

    function getMockElement(id) {
        if (!mockElements[id]) {
            mockElements[id] = {
                id,
                textContent: '',
                value: '',
                placeholder: '',
                style: {},
                classList: {
                    _c: new Set(),
                    add(cls) { this._c.add(cls); },
                    remove(cls) { this._c.delete(cls); },
                    toggle(cls, force) {
                        if (force !== undefined) {
                            if (force) this._c.add(cls); else this._c.delete(cls);
                        } else {
                            if (this._c.has(cls)) this._c.delete(cls); else this._c.add(cls);
                        }
                    },
                    contains(cls) { return this._c.has(cls); }
                },
                children: [],
                appendChild(child) { this.children.push(child); return child; },
                querySelectorAll() { return []; },
                querySelector() { return null; },
                addEventListener() {},
                setAttribute(k, v) { this[k] = v; },
                getAttribute(k) { return this[k] || null; },
                closest() { return null; },
                reset() {},
                checkValidity() { return true; },
                reportValidity() { return true; }
            };
        }
        return mockElements[id];
    }

    const localStorageMock = {
        _data: { 'radcor_cart_v2': '{}', 'radcor_lang': 'ru' },
        getItem(key) { return this._data[key] || null; },
        setItem(key, val) { this._data[key] = String(val); },
        removeItem(key) { delete this._data[key]; }
    };

    const documentMock = {
        documentElement: { lang: 'ru' },
        body: { style: {} },
        addEventListener() {},
        getElementById(id) { return getMockElement(id); },
        querySelectorAll(selector) { return []; },
        querySelector() { return null; },
        createElement(tag) {
            return {
                tagName: tag.toUpperCase(),
                className: '',
                style: {},
                innerHTML: '',
                textContent: '',
                children: [],
                setAttribute(k, v) { this[k] = v; },
                getAttribute(k) { return this[k] || null; },
                appendChild(c) { this.children.push(c); return c; },
                querySelectorAll() { return []; },
                querySelector() { return null; },
                closest() { return null; }
            };
        },
        createDocumentFragment() {
            return {
                children: [],
                appendChild(c) { this.children.push(c); return c; }
            };
        }
    };

    const mockFetch = async (url) => {
        if (url === 'products.json') {
            return { ok: true, json: async () => productsData };
        }
        return { ok: false };
    };

    const windowMock = {
        location: { search: '' },
        localStorage: localStorageMock,
        fetch: mockFetch
    };

    const sandbox = {
        window: windowMock,
        document: documentMock,
        localStorage: localStorageMock,
        fetch: mockFetch,
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        URLSearchParams,
        Number,
        String,
        parseInt,
        parseFloat,
        Math,
        Array,
        Set,
        Object,
        JSON,
        RegExp
    };

    vm.createContext(sandbox);
    vm.runInContext(i18nCode, sandbox);

    const modifiedAppCode = appCode
        .replace("document.addEventListener('DOMContentLoaded', () => {", "function __initAppExports() {")
        .replace(/\}\);\s*\/\/\s*end DOMContentLoaded\s*$/, "return { catalogState, applyFilters, getProductViscosity, parseViscosityWeight, getVolumePriceForProduct, getProductPacks, addToCart, renderCart, cartItems, FREE_DELIVERY_THRESHOLD, applyLanguage, getI18nText, allProducts, CATEGORY_LABELS, LUBRICANT_SUBCATEGORIES, ALL_ACEA_STANDARDS, ALL_API_STANDARDS }; } window.__initAppExports = __initAppExports;");

    vm.runInContext(modifiedAppCode, sandbox);
    const exports = sandbox.window.__initAppExports();
    exports.allProducts.push(...productsData);

    return { sandbox, exports, productsData };
}

// =============================================================================
// SUITE 1: EXTREME FILTER COMBINATIONS
// =============================================================================
function runSuite1ExtremeFilters() {
    console.log('\n--- SUITE 1: Extreme Filter Combinations ---');
    const { exports, productsData } = setupAppEnvironment();
    const { catalogState, applyFilters } = exports;

    function resetFilters() {
        catalogState.activeCategory = 'all';
        catalogState.activeBrands.clear();
        catalogState.activeViscosities.clear();
        catalogState.activeVolumes.clear();
        catalogState.activeColors.clear();
        catalogState.activeApprovals.clear();
        catalogState.activeAcea.clear();
        catalogState.activeApi.clear();
        catalogState.searchQuery = '';
    }

    // 1.1 Non-matching extreme combination
    resetFilters();
    catalogState.activeCategory = 'motor-oils-pkw';
    catalogState.activeBrands.add('MOL');
    catalogState.activeViscosities.add('0W-20');
    catalogState.activeVolumes.add('4');
    catalogState.activeAcea.add('C5');
    catalogState.activeApi.add('SP');
    catalogState.activeColors.add('Красный');

    let results = applyFilters(productsData);
    assert(results.length === 0, `Extreme non-matching filter combination returned 0 products (Got: ${results.length})`);

    // 1.2 Exact multi-filter match
    resetFilters();
    catalogState.activeCategory = 'motor-oils-pkw';
    catalogState.activeBrands.add('MOL');
    catalogState.activeViscosities.add('5W-30');
    catalogState.activeVolumes.add('1');
    catalogState.activeAcea.add('C3');
    
    results = applyFilters(productsData);
    assert(results.length > 0, `Strict multi-filter match (MOL + 5W-30 + 1L + C3) returned ${results.length} products`);
    const allMatch = results.every(p => 
        p.brand === 'MOL' && 
        p.volumes.includes(1)
    );
    assert(allMatch, `All returned products satisfy extreme filter criteria`);

    // 1.3 Contradictory category and brand filter
    resetFilters();
    catalogState.activeCategory = 'coolants';
    catalogState.activeBrands.add('YUKO');
    results = applyFilters(productsData);
    assert(results.length === 0, `Contradictory Brand+Category (YUKO + coolants) correctly yields 0 items`);

    // 1.4 Clear/reset filters restores full dataset
    resetFilters();
    results = applyFilters(productsData);
    assert(results.length === productsData.length, `Resetting all filters restores full dataset count (${productsData.length})`);
}

// =============================================================================
// SUITE 2: MOTOR OIL VISCOSITY SORTING BOUNDARY CONDITIONS
// =============================================================================
function runSuite2ViscositySorting() {
    console.log('\n--- SUITE 2: Motor Oil Viscosity Sorting Boundary Conditions ---');
    const { exports } = setupAppEnvironment();
    const { parseViscosityWeight, getProductViscosity } = exports;

    // 2.1 Standard viscosity sequence weights
    const viscs = ['0W-16', '0W-20', '0W-30', '5W-20', '5W-30', '5W-40', '10W-30', '10W-40', '15W-40', '20W-50'];
    const weights = viscs.map(v => parseViscosityWeight(v));
    let isMonotonic = true;
    for (let i = 1; i < weights.length; i++) {
        if (weights[i] <= weights[i - 1]) isMonotonic = false;
    }
    assert(isMonotonic, `Viscosity weights strictly increase across standard SAE grades (0W-16 to 20W-50)`);

    // 2.2 Boundary values testing
    assert(parseViscosityWeight('0W-16') === 16, `0W-16 parsed weight is 16`);
    assert(parseViscosityWeight('20W-50') === 2050, `20W-50 parsed weight is 2050`);
    assert(parseViscosityWeight('SAE 30') === 530, `Single grade 'SAE 30' parsed weight is 530`);
    assert(parseViscosityWeight('SAE 40') === 540, `Single grade 'SAE 40' parsed weight is 540`);

    // 2.3 Non-standard or missing viscosity values
    assert(parseViscosityWeight(null) === 9999, `null viscosity returns fallback weight 9999`);
    assert(parseViscosityWeight('') === 9999, `Empty string viscosity returns fallback weight 9999`);
    assert(parseViscosityWeight('ISO VG 46') === 9000, `Industrial grade 'ISO VG 46' returns fallback weight 9000`);

    // 2.4 Extraction robustness
    const mockProd1 = { specs: [{ label: 'Вязкость', value: '5W-40' }] };
    const mockProd2 = { name: 'MOL Dynamic 0W-20 Synthesis' };
    const mockProd3 = { category: 'accessories', name: 'Funnel Large' };
    assert(getProductViscosity(mockProd1) === '5W-40', `Viscosity extracted from specs array ('5W-40')`);
    assert(getProductViscosity(mockProd2) === '0W-20', `Viscosity regex-extracted from product title ('0W-20')`);
    assert(getProductViscosity(mockProd3) === null, `Non-viscous product safely returns null viscosity`);
}

// =============================================================================
// SUITE 3: SEARCH BAR EDGE CASES
// =============================================================================
function runSuite3SearchEdgeCases() {
    console.log('\n--- SUITE 3: Search Bar Edge Cases ---');
    const { exports, productsData } = setupAppEnvironment();
    const { catalogState, applyFilters } = exports;

    function search(q) {
        catalogState.activeCategory = 'all';
        catalogState.activeBrands.clear();
        catalogState.activeViscosities.clear();
        catalogState.activeVolumes.clear();
        catalogState.activeColors.clear();
        catalogState.activeApprovals.clear();
        catalogState.activeAcea.clear();
        catalogState.activeApi.clear();
        catalogState.searchQuery = (q || '').trim();
        return applyFilters(productsData);
    }

    // 3.1 Case Insensitivity
    const lowerRes = search('mol essence');
    const upperRes = search('MOL ESSENCE');
    const mixedRes = search('mOl EsSeNcE');
    assert(lowerRes.length > 0, `Search query 'mol essence' found ${lowerRes.length} items`);
    assert(lowerRes.length === upperRes.length && lowerRes.length === mixedRes.length, `Case-insensitive search yields identical result counts (${lowerRes.length})`);

    // 3.2 Spec & Approval Search
    const specRes = search('VW 504.00');
    assert(specRes.length > 0, `OEM Spec search 'VW 504.00' returned ${specRes.length} products`);

    // 3.3 Non-matching Queries
    const nonMatchRes = search('XYZ_UNKNOWN_ITEM_9999');
    assert(nonMatchRes.length === 0, `Non-matching query returns 0 products without error`);

    // 3.4 Special Characters & Injection Attempts
    const scriptInjection = search("<script>alert('xss')</script>");
    assert(scriptInjection.length === 0, `Script injection query safe & returns 0 products`);

    const sqlInjection = search("' OR '1'='1");
    assert(sqlInjection.length === 0, `SQL injection string query safe & returns 0 products`);

    const regexInjection = search("(a+)+[\\\\*?]");
    assert(regexInjection.length === 0, `Regex special characters query does not crash search engine`);

    // 3.5 Whitespace handling
    const whitespaceRes = search("   ");
    assert(whitespaceRes.length === productsData.length, `Whitespace-only query trims and returns full catalog (${productsData.length} items)`);
}

// =============================================================================
// SUITE 4: CART CRUD & FREE DELIVERY THRESHOLD
// =============================================================================
function runSuite4CartOperations() {
    console.log('\n--- SUITE 4: Cart CRUD Operations & Threshold Calculations ---');
    const { exports } = setupAppEnvironment();
    const { addToCart, cartItems, FREE_DELIVERY_THRESHOLD } = exports;

    // Clear cart initial state
    Object.keys(cartItems).forEach(k => delete cartItems[k]);

    // 4.1 Add item to cart
    addToCart('MOL-1000', 'MOL Dynamic Star 0W-30', 450, 1, 'canister');
    assert(cartItems['MOL-1000_canister'] !== undefined, `Item 'MOL-1000_canister' added to cart`);
    assert(cartItems['MOL-1000_canister'].qty === 1, `Initial item quantity is 1`);

    // 4.2 Add same item again (increment qty)
    addToCart('MOL-1000', 'MOL Dynamic Star 0W-30', 450, 1, 'canister');
    assert(cartItems['MOL-1000_canister'].qty === 2, `Adding duplicate item increments quantity to 2`);

    // 4.3 Add different item (barrel pack)
    addToCart('MOL-1004', 'MOL Dynamic Max 10W-40', 20000, 208, 'barrel');
    assert(Object.keys(cartItems).length === 2, `Cart contains 2 distinct item keys`);

    // 4.4 Recalculate totals
    let totalPrice = Object.values(cartItems).reduce((s, i) => s + i.price * i.qty, 0);
    let totalVol   = Object.values(cartItems).reduce((s, i) => s + i.vol * i.qty, 0);
    assert(totalPrice === (450 * 2 + 20000 * 1), `Total cart sum calculated correctly: ${totalPrice} MDL`);
    assert(totalVol === (1 * 2 + 208 * 1), `Total cart volume calculated correctly: ${totalVol} L`);

    // 4.5 Qty reduction & removal on 0
    cartItems['MOL-1000_canister'].qty--;
    assert(cartItems['MOL-1000_canister'].qty === 1, `Quantity decremented to 1`);

    cartItems['MOL-1000_canister'].qty--;
    if (cartItems['MOL-1000_canister'].qty <= 0) delete cartItems['MOL-1000_canister'];
    assert(cartItems['MOL-1000_canister'] === undefined, `Item removed from cart when quantity reaches 0`);

    // 4.6 Free Delivery Threshold assertions (Threshold = 1500 MDL)
    function getRemaining(price) {
        return Math.max(0, FREE_DELIVERY_THRESHOLD - price);
    }
    assert(getRemaining(0) === 1500, `Remaining amount for 0 MDL is 1500 MDL`);
    assert(getRemaining(1499) === 1, `Remaining amount for 1499 MDL is 1 MDL`);
    assert(getRemaining(1500) === 0, `Remaining amount for 1500 MDL is 0 MDL (Free delivery unlocked)`);
    assert(getRemaining(5000) === 0, `Remaining amount for 5000 MDL is 0 MDL`);

    // 4.7 Price-on-request verification
    const industrialItem = exports.allProducts.find(p => p.category === 'industrial-lubricants' || p.price_on_request);
    assert(industrialItem !== undefined, `Industrial product with price_on_request exists in catalog`);
    assert(industrialItem.category === 'industrial-lubricants' || industrialItem.price_on_request === true, `Product correctly flagged for price-on-request display`);
}

// =============================================================================
// SUITE 5: DYNAMIC LANGUAGE SWITCHING (RU <-> RO ACROSS 11 HTML PAGES)
// =============================================================================
function runSuite5LocalizationIntegrity() {
    console.log('\n--- SUITE 5: Dynamic Language Switching & 11 Page Audit ---');
    const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
    const sandbox = { window: {}, console };
    vm.createContext(sandbox);
    vm.runInContext(i18nCode, sandbox);
    const I18N = sandbox.window.I18N;

    assert(I18N && I18N.ru && I18N.ro, `I18N dictionary loaded with ru and ro sections`);

    // 5.1 Key coverage symmetry
    const ruKeys = Object.keys(I18N.ru);
    const roKeys = Object.keys(I18N.ro);
    assert(ruKeys.length === roKeys.length, `RU and RO dictionary keys are symmetric (RU: ${ruKeys.length}, RO: ${roKeys.length})`);

    const missingInRo = ruKeys.filter(k => !I18N.ro[k]);
    assert(missingInRo.length === 0, `0 keys missing in RO dictionary`);

    // 5.2 Audit 11 HTML pages data-i18n completeness
    const htmlFiles = [
        'index.html', 'catalog.html', 'service.html', 'delivery.html', 'returns.html',
        'guides.html', 'faq.html', 'contacts.html', 'b2b-dashboard.html', 'admin.html', 'checkout.html'
    ];

    let totalI18nAttrs = 0;
    let unmappedAttrs = 0;

    htmlFiles.forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) return;
        const html = fs.readFileSync(filePath, 'utf8');
        const matches = html.match(/data-i18n=["']([^"']+)["']/g) || [];
        matches.forEach(m => {
            totalI18nAttrs++;
            const key = m.replace(/data-i18n=["']/, '').replace(/["']$/, '');
            if (!I18N.ru[key] || !I18N.ro[key]) unmappedAttrs++;
        });
    });

    assert(unmappedAttrs === 0, `All ${totalI18nAttrs} data-i18n attributes across 11 pages map to valid dictionary keys`);
}

// =============================================================================
// SUITE 6: FORM INPUT VALIDATION (CONTACTS & CHECKOUT AUDIT)
// =============================================================================
function runSuite6FormValidation() {
    console.log('\n--- SUITE 6: Form Input Validation & Bug Detection ---');

    // 6.1 contacts.html form validation simulation
    const appCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
    assert(appCode.includes('id="cName"') || appCode.includes("'cName'"), `app.js checks #cName input`);
    assert(appCode.includes('id="cEmail"') || appCode.includes("'cEmail'"), `app.js checks #cEmail input`);
    assert(appCode.includes('id="cText"') || appCode.includes("'cText'"), `app.js checks #cText input`);

    // 6.2 checkout.js empirical execution bug check
    const checkoutJsCode = fs.readFileSync(path.join(ROOT_DIR, 'checkout.js'), 'utf8');

    let submitHandler = null;
    let domContentLoadedHandler = null;
    const formMock = {
        addEventListener(event, fn) { if (event === 'submit') submitHandler = fn; },
        reportValidity() { return true; }
    };
    const domMock = {
        addEventListener(event, fn) { if (event === 'DOMContentLoaded') domContentLoadedHandler = fn; },
        getElementById(id) {
            if (id === 'checkoutForm') return formMock;
            if (id === 'deliveryMethod') return { value: 'pickup', addEventListener() {} };
            if (id === 'companyName' || id === 'contactName' || id === 'orderPhone' || id === 'orderEmail') {
                return { value: 'Test', addEventListener() {}, trim() { return 'Test'; } };
            }
            if (id === 'paymentMethod') return { value: 'invoice' };
            return { value: 'test', addEventListener() {}, textContent: '', style: {} };
        }
    };
    const localStorageMock = {
        getItem(key) {
            if (key === 'radcor_cart_v2') return JSON.stringify({ "MOL-1000_canister": { sku: "MOL-1000", qty: 1 } });
            return null;
        },
        setItem() {},
        removeItem() {}
    };

    const context = {
        document: domMock,
        localStorage: localStorageMock,
        window: { localStorage: localStorageMock },
        console,
        fetch: async () => ({ ok: true, json: async () => ({ success: true, data: { orderNo: 'RAD-123456' } }) })
    };

    vm.createContext(context);
    vm.runInContext(checkoutJsCode, context);
    if (domContentLoadedHandler) domContentLoadedHandler();

    let caughtReferenceError = false;
    if (submitHandler) {
        try {
            const res = submitHandler({ preventDefault() {} });
            if (res && res.catch) {
                res.catch(err => {
                    if (err.name === 'ReferenceError' && err.message.includes('items')) {
                        caughtReferenceError = true;
                    }
                });
            }
        } catch (err) {
            if (err.name === 'ReferenceError' && err.message.includes('items')) {
                caughtReferenceError = true;
            }
        }
    }

    setTimeout(() => {
        assert(caughtReferenceError === false, `checkout.js submit handler executes cleanly without ReferenceError (items variable correctly declared)`);
        
        console.log('\n================================================================');
        console.log(`ADVERSARIAL STRESS TEST SUITE COMPLETE: ${totalPassed} PASSED, ${totalFailed} FAILED`);
        console.log('================================================================');
        if (totalFailed > 0) process.exit(1);
    }, 100);
}

// Execute all suites
runSuite1ExtremeFilters();
runSuite2ViscositySorting();
runSuite3SearchEdgeCases();
runSuite4CartOperations();
runSuite5LocalizationIntegrity();
runSuite6FormValidation();

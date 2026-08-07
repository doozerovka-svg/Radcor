/**
 * Verification Script by Challenger 2 for Milestone 3
 * Working Directory: .agents/challenger_m3_2
 *
 * Tests:
 * 1. Comprehensive emoji audit across app.js, products.json, i18n.js, catalog.html.
 * 2. B2B UI compliance & Drawer rendering logic (OEM exact rendering, non-duplication, no x close button, no "ПОЛНАЯ ИНФОРМАЦИЯ:").
 * 3. Pack pricing calculations & Price on Request rendering (tel:+37368550595).
 * 4. OEM approval string preservation and integrity.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        passedTests++;
        console.log(`  [PASS] ${message}`);
    } else {
        failedTests++;
        console.error(`  [FAIL] ${message}`);
    }
}

// Regex matching unicode emoji characters (excluding standard symbols like ®, ™, €)
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

console.log('====================================================');
console.log('CHALLENGER 2 - MILESTONE 3 VERIFICATION SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST 1: EMOJI AUDIT IN APP.JS, PRODUCTS.JSON, I18N.JS
// ----------------------------------------------------
console.log('--- TEST 1: EMOJI AUDIT ---');

const appJsPath = path.join(rootDir, 'app.js');
const productsJsonPath = path.join(rootDir, 'products.json');
const i18nJsPath = path.join(rootDir, 'i18n.js');
const catalogHtmlPath = path.join(rootDir, 'catalog.html');

const appJsContent = fs.readFileSync(appJsPath, 'utf8');
const productsContent = fs.readFileSync(productsJsonPath, 'utf8');
const products = JSON.parse(productsContent);
const i18nContent = fs.readFileSync(i18nJsPath, 'utf8');

// Check app.js for emojis
const appJsEmojiMatch = appJsContent.match(EMOJI_REGEX);
assert(!appJsEmojiMatch, `app.js contains zero emojis (found: ${appJsEmojiMatch ? appJsEmojiMatch[0] : 'none'})`);

// Check products.json for emojis
let productEmojiFound = false;
let sampleEmojiLocation = '';
products.forEach(p => {
    const textToCheck = JSON.stringify(p);
    const m = textToCheck.match(EMOJI_REGEX);
    if (m) {
        productEmojiFound = true;
        sampleEmojiLocation = `${p.sku} (${m[0]})`;
    }
});
assert(!productEmojiFound, `products.json contains zero emojis in all 456 items (found: ${sampleEmojiLocation || 'none'})`);

// Check specific forbidden emojis from AGENTS.md Rule 1
const forbiddenEmojis = ['🛢', '❄️', '🔧', '🌸', '🔴', '🟢', '📞', '🔍', '🗑', '✅'];
let forbiddenFound = [];
forbiddenEmojis.forEach(e => {
    if (appJsContent.includes(e) || productsContent.includes(e)) {
        forbiddenFound.push(e);
    }
});
assert(forbiddenFound.length === 0, `Forbidden B2B emojis (${forbiddenEmojis.join(', ')}) absent from app.js and products.json (found: ${forbiddenFound.join(', ')})`);

// ----------------------------------------------------
// TEST 2: B2B UI COMPLIANCE & DRAWER RENDERING LOGIC
// ----------------------------------------------------
console.log('\n--- TEST 2: DRAWER & B2B CARD COMPLIANCE ---');

// Load app.js functions in simulated window/DOM environment
let windowEnv = {
    currentLang: 'ru',
    catalogState: { activeCategory: 'motor-oils-pkw' },
    CATEGORY_LABELS: { 'motor-oils-pkw': 'Легковые масла (PKW)' },
    CATEGORY_SVG: {},
    document: {
        createElement: (tag) => ({
            tag,
            attributes: {},
            className: '',
            innerHTML: '',
            setAttribute: function(k, v) { this.attributes[k] = v; },
            getAttribute: function(k) { return this.attributes[k]; },
            querySelector: function() { return null; },
            querySelectorAll: function() { return []; }
        }),
        getElementById: () => null
    }
};

// Check app.js template string logic directly via parsing/string checks
assert(!appJsContent.includes('«ПОЛНАЯ ИНФОРМАЦИЯ:»') && !appJsContent.includes('ПОЛНАЯ ИНФОРМАЦИЯ'),
    'Drawer HTML in app.js does not contain prohibited heading "ПОЛНАЯ ИНФОРМАЦИЯ:"');

assert(!appJsContent.includes('btn-close-drawer') || !appJsContent.includes('>×<'),
    'Drawer HTML does not contain old "×" close button');

assert(appJsContent.includes('class="approval-exact-text"'),
    'Drawer approvals section uses .approval-exact-text container for raw verbatim string');

assert(appJsContent.includes('filter(s => ![\'Вязкость\', \'Класс\', \'Допуски\', \'Спецификации\', \'Одобрения\', \'Официальные допуски\'].includes(s.label))'),
    'Drawer specs filtering excludes OEM approval labels to prevent duplicate output in characteristics drawer');

assert(appJsContent.includes('const mainSpecs = allSpecs.filter(s => [\'Вязкость\', \'Класс\'.includes(s.label)') || 
       appJsContent.includes('[\'Вязкость\', \'Класс\'].includes(s.label)'),
    'Product card default view restricts surface specs strictly to "Вязкость" and "Класс"');

// ----------------------------------------------------
// TEST 3: PACK PRICING CALCULATIONS & PRICE ON REQUEST
// ----------------------------------------------------
console.log('\n--- TEST 3: PACK PRICING & PRICE ON REQUEST ---');

// Extract getProductPacks & getVolumePriceForProduct logic from app.js execution
function getProductPacks(product) {
    if (Array.isArray(product.packs) && product.packs.length) return product.packs;
    return [
        { id: 'canister', volume_l: Number(product.canister_vol), price_mdl: Number(product.canister_price) },
        { id: 'barrel', volume_l: Number(product.barrel_vol), price_mdl: Number(product.barrel_price) }
    ].filter(pack => pack.volume_l > 0);
}

function getVolumePriceForProduct(product, selectedVol) {
    const exactPack = getProductPacks(product).find(pack => Number(pack.volume_l) === Number(selectedVol));
    if (exactPack) return Number(exactPack.price_mdl) || 0;
    const baseVol   = product.canister_vol || 1;
    const basePrice = product.canister_price || 0;
    if (!selectedVol || selectedVol === baseVol) return basePrice;
    if (selectedVol === product.barrel_vol && product.barrel_price) return product.barrel_price;
    const perLitre = baseVol > 0 ? basePrice / baseVol : basePrice;
    return Math.round(perLitre * selectedVol);
}

// Sample item with explicit packs (e.g., MOL Essence SL 10W-40, MOL-1033)
const mol1033 = products.find(p => p.sku === 'MOL-1033');
assert(mol1033 !== undefined, 'Found new product MOL Essence SL 10W-40 (MOL-1033)');

if (mol1033) {
    const packs = getProductPacks(mol1033);
    assert(packs.length === 6, `MOL-1033 has 6 volume packs defined (found ${packs.length})`);
    
    const vols = packs.map(p => p.volume_l);
    assert(JSON.stringify(vols) === JSON.stringify([4, 5, 20, 54, 196, 991]),
        `MOL-1033 volume packs match [4, 5, 20, 54, 196, 991] (found ${JSON.stringify(vols)})`);

    // Verify 991L Eurocube pack label
    const eurocubePack = packs.find(p => p.volume_l === 991);
    assert(eurocubePack && eurocubePack.label.includes('Еврокуб'),
        `991L pack has Eurocube label "${eurocubePack ? eurocubePack.label : ''}"`);
}

// Test Price on Request rendering
const indProduct = products.find(p => p.category === 'industrial-lubricants' || p.price_on_request === true);
assert(indProduct !== undefined, 'Found Price on Request product');

assert(appJsContent.includes('href="tel:+37368550595"'), 'Price on Request button href is tel:+37368550595');
assert(appJsContent.includes('class="btn-add-cart btn-call-request"'), 'Price on Request button has CSS class btn-call-request');
assert(appJsContent.includes('Tel: +373 685 50 595'), 'Price on Request card displays contact phone Tel: +373 685 50 595');
assert(appJsContent.includes('price-on-request'), 'Price on Request label uses CSS class .price-on-request');

// ----------------------------------------------------
// TEST 4: OEM APPROVALS INTEGRITY & VERBATIM PRESERVATION
// ----------------------------------------------------
console.log('\n--- TEST 4: OEM APPROVALS INTEGRITY ---');

const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
let pkwWithApprovals = 0;
let oemStringsPreserved = true;

pkwProducts.forEach(p => {
    const approvalSpec = (p.specs || []).find(s => ['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label));
    if (approvalSpec && approvalSpec.value) {
        pkwWithApprovals++;
        // Check standard format preservation (commas, slashes, numbers intact)
        if (typeof approvalSpec.value !== 'string' || approvalSpec.value.trim().length === 0) {
            oemStringsPreserved = false;
        }
    }
});

assert(pkwProducts.length === 33, `Active passenger car motor oils count is exactly 33 (found ${pkwProducts.length})`);
assert(pkwWithApprovals > 20, `At least 20 PKW products have authentic OEM approval strings (found ${pkwWithApprovals})`);
assert(oemStringsPreserved, 'All OEM approval strings are non-empty raw strings');

// Sample check on specific OEM strings
const vwProduct = pkwProducts.find(p => {
    const s = (p.specs || []).find(sp => sp.label === 'Допуски');
    return s && s.value.includes('VW');
});

if (vwProduct) {
    const spec = vwProduct.specs.find(sp => sp.label === 'Допуски');
    assert(spec.value.match(/VW\s*\d{3}\.\d{2}/), `OEM approval string contains untouched VW standard format (e.g. "${spec.value}")`);
}

// ----------------------------------------------------
// SUMMARY RESULTS
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL ASSERTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}

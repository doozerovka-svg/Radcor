const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../../products.json');
const APP_JS_PATH = path.join(__dirname, '../../app.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests++;
        failures.push(message);
        console.error(`❌ FAIL: ${message}`);
    }
}

console.log('====================================================');
console.log('CHALLENGER M2_2_2: VOLUME & UI RENDERING STRESS TEST');
console.log('====================================================\n');

// 1. LOAD DATA
let rawProducts, productsData;
try {
    rawProducts = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    productsData = JSON.parse(rawProducts);
    assert(true, 'products.json is valid JSON syntax');
} catch (e) {
    assert(false, `products.json JSON parse error: ${e.message}`);
    process.exit(1);
}

const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
assert(products.length === 423, `Total product count is exactly 423 (actual: ${products.length})`);

// 2. REPLICATE app.js LOGIC
function getVolumeLabel(v, pack) {
    if (pack && pack.label) return pack.label;
    const numV = Number(v);
    if (numV === 983) return '983 л (Еврокуб)';
    if (numV === 991) return '991 л (Еврокуб)';
    if (numV === 994) return '994 л';
    return numV >= 1 ? `${numV} л` : `${numV * 1000} мл`;
}

function getProductPacks(product) {
    if (Array.isArray(product.packs) && product.packs.length) return product.packs;
    return [
        { id: 'canister', volume_l: Number(product.canister_vol), price_mdl: Number(product.canister_price) },
        { id: 'barrel', volume_l: Number(product.barrel_vol), price_mdl: Number(product.barrel_price) }
    ].filter(pack => pack.volume_l > 0);
}

function getVolumePriceForProduct(product, selectedVol) {
    const exactPack = getProductPacks(product).find(pack => Number(pack.volume_l) === Number(selectedVol));
    if (exactPack) return Number(exactPack.price_mdl) || Number(exactPack.price) || 0;
    const baseVol   = product.canister_vol || 1;
    const basePrice = product.canister_price || 0;
    if (!selectedVol || selectedVol === baseVol) return basePrice;
    if (selectedVol === product.barrel_vol && product.barrel_price) return product.barrel_price;
    const perLitre = baseVol > 0 ? basePrice / baseVol : basePrice;
    return Math.round(perLitre * selectedVol);
}

// 3. SUITE 1: DATA SCHEMA & PACKS SYNC STRESS TEST
console.log('--- SUITE 1: Volumes & Packs Sync across all 423 products ---');
let syncFailuresCount = 0;
let missingLabelsCount = 0;
let invalidVolNumbersCount = 0;

products.forEach((product, idx) => {
    const sku = product.sku || product.id || `index_${idx}`;
    const packs = product.packs || [];
    const volumes = product.volumes || [];

    // Check non-empty volumes/packs consistency
    if (volumes.length > 0 || packs.length > 0) {
        if (volumes.length !== packs.length) {
            syncFailuresCount++;
            failures.push(`SKU ${sku}: volumes length (${volumes.length}) != packs length (${packs.length})`);
        } else {
            for (let i = 0; i < volumes.length; i++) {
                const volNum = volumes[i];
                const pack = packs[i];
                if (!pack || Number(pack.volume_l) !== Number(volNum)) {
                    syncFailuresCount++;
                    failures.push(`SKU ${sku}: volume mismatch at index ${i} (vol: ${volNum}, pack.volume_l: ${pack ? pack.volume_l : 'undefined'})`);
                }
            }
        }
    }

    // Check pack labels
    packs.forEach((pack, pIdx) => {
        if (!pack.label || typeof pack.label !== 'string' || pack.label.trim() === '') {
            missingLabelsCount++;
            failures.push(`SKU ${sku}: pack at index ${pIdx} missing label (pack: ${JSON.stringify(pack)})`);
        }
        if (typeof pack.volume_l !== 'number' || isNaN(pack.volume_l) || pack.volume_l <= 0) {
            invalidVolNumbersCount++;
            failures.push(`SKU ${sku}: pack at index ${pIdx} has invalid volume_l (${pack.volume_l})`);
        }
    });
});

assert(syncFailuresCount === 0, `0 volumes/packs sync mismatches across all products (actual: ${syncFailuresCount})`);
assert(missingLabelsCount === 0, `0 missing pack labels across all products (actual: ${missingLabelsCount})`);
assert(invalidVolNumbersCount === 0, `0 invalid volume_l numbers across all products (actual: ${invalidVolNumbersCount})`);

// 4. SUITE 2: GETVOLUMELABEL FALLBACK & UNIT RENDERING
console.log('\n--- SUITE 2: getVolumeLabel Helper Unit & Fallback Tests ---');
assert(getVolumeLabel(991) === '991 л (Еврокуб)', 'getVolumeLabel(991) returns "991 л (Еврокуб)"');
assert(getVolumeLabel(983) === '983 л (Еврокуб)', 'getVolumeLabel(983) returns "983 л (Еврокуб)"');
assert(getVolumeLabel(994) === '994 л', 'getVolumeLabel(994) returns "994 л"');
assert(getVolumeLabel(1) === '1 л', 'getVolumeLabel(1) returns "1 л"');
assert(getVolumeLabel(4) === '4 л', 'getVolumeLabel(4) returns "4 л"');
assert(getVolumeLabel(5) === '5 л', 'getVolumeLabel(5) returns "5 л"');
assert(getVolumeLabel(20) === '20 л', 'getVolumeLabel(20) returns "20 л"');
assert(getVolumeLabel(54) === '54 л', 'getVolumeLabel(54) returns "54 л"');
assert(getVolumeLabel(60) === '60 л', 'getVolumeLabel(60) returns "60 л"');
assert(getVolumeLabel(196) === '196 л', 'getVolumeLabel(196) returns "196 л"');
assert(getVolumeLabel(208) === '208 л', 'getVolumeLabel(208) returns "208 л"');
assert(getVolumeLabel(0.25) === '250 мл', 'getVolumeLabel(0.25) returns "250 мл"');
assert(getVolumeLabel(0.5) === '500 мл', 'getVolumeLabel(0.5) returns "500 мл"');
assert(getVolumeLabel(5, { label: '5 л BiB' }) === '5 л BiB', 'Explicit pack label priority over fallback');
assert(getVolumeLabel(20, { label: '20 л BiB carton' }) === '20 л BiB carton', 'Explicit BiB pack label priority');

// 5. SUITE 3: PRODUCT CARD RENDERING STRESS TEST
console.log('\n--- SUITE 3: Product Card Volume Tags & Price Stress Test ---');
let cardRenderingErrors = 0;
let nanPriceCount = 0;

products.forEach(product => {
    const sku = product.sku || product.id;
    const volumes = getProductPacks(product).map(pack => pack.volume_l);
    
    // Simulate volTagsHtml generation
    const volTagsHtml = volumes.length > 0
        ? volumes.map((v, i) => {
            const pack = getProductPacks(product).find(p => Number(p.volume_l) === Number(v));
            const label = getVolumeLabel(v, pack);
            return `<span class="volume-tag ${i === 0 ? 'active' : ''}" data-vol="${v}" data-sku="${product.sku}">${label}</span>`;
          }).join('')
        : '<span class="volume-tag active" data-vol="1">—</span>';

    if (volTagsHtml.includes('undefined') || volTagsHtml.includes('null') || volTagsHtml.includes('NaN') || volTagsHtml.includes('[object Object]')) {
        cardRenderingErrors++;
        failures.push(`SKU ${sku}: volTagsHtml contains invalid content: ${volTagsHtml}`);
    }

    // Price calculation check for each volume
    volumes.forEach(v => {
        const price = getVolumePriceForProduct(product, v);
        if (typeof price !== 'number' || isNaN(price)) {
            nanPriceCount++;
            failures.push(`SKU ${sku} vol ${v}: calculated price is NaN or non-number (${price})`);
        }
    });
});

assert(cardRenderingErrors === 0, `0 card volume tag rendering errors across all products (actual: ${cardRenderingErrors})`);
assert(nanPriceCount === 0, `0 NaN volume prices calculated across all products (actual: ${nanPriceCount})`);

// 6. SUITE 4: SIDEBAR VOLUME FILTER STRESS TEST BY CATEGORY
console.log('\n--- SUITE 4: Sidebar Volume Filter Stress Test across all Categories ---');
const categories = [...new Set(products.map(p => p.category))];
let filterRenderingErrors = 0;

categories.forEach(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const volumeMap = {};
    catProducts.forEach(p => {
        (p.volumes || []).forEach(v => {
            volumeMap[v] = (volumeMap[v] || 0) + 1;
        });
    });

    const volumes = Object.keys(volumeMap).map(Number).sort((a, b) => a - b);
    const filterHtml = volumes.map(v => {
        const label = getVolumeLabel(v);
        return `<label class="filter-cb-label">
            <input type="checkbox" class="filter-volume-cb" value="${v}">
            <span class="filter-cb-text">${label}</span>
            <span class="filter-count">${volumeMap[v]}</span>
        </label>`;
    }).join('');

    if (filterHtml.includes('undefined') || filterHtml.includes('null') || filterHtml.includes('NaN')) {
        filterRenderingErrors++;
        failures.push(`Category ${cat}: volume filter HTML contains invalid content`);
    }
});

assert(filterRenderingErrors === 0, `0 sidebar volume filter rendering errors across all categories (actual: ${filterRenderingErrors})`);

// 7. SUITE 5: BIB & EUROCUBE SPECIAL LABELS CHECK
console.log('\n--- SUITE 5: Special Volume Labels (BiB & Eurocube 991L) Audit ---');
let bibCount = 0;
let eurocubeCount = 0;

products.forEach(p => {
    (p.packs || []).forEach(pack => {
        if (pack.label && pack.label.toLowerCase().includes('bib')) {
            bibCount++;
        }
        if (Number(pack.volume_l) === 991 || (pack.label && pack.label.toLowerCase().includes('еврокуб'))) {
            eurocubeCount++;
        }
    });
});

console.log(`  BiB carton pack labels found in products.json: ${bibCount}`);
console.log(`  Eurocube (991L) pack labels found in products.json: ${eurocubeCount}`);
assert(bibCount > 0, `BiB carton pack labels exist in dataset (count: ${bibCount})`);
assert(eurocubeCount > 0, `Eurocube (991L) pack labels exist in dataset (count: ${eurocubeCount})`);

// 8. SUITE 6: B2B ANTI-EMOJI AUDIT
console.log('\n--- SUITE 6: B2B Anti-Emoji Audit in products.json ---');
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
const emojiMatches = rawProducts.match(emojiRegex) || [];
assert(emojiMatches.length === 0, `0 emojis present in products.json (actual matches: ${emojiMatches.length})`);

// 9. SUMMARY & VERDICT
console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} assertions.`);
console.log('====================================================');

if (failedTests > 0) {
    console.log('\nFAILURES SUMMARY:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log('\nVERDICT: REJECT');
    process.exit(1);
} else {
    console.log('\nALL STRESS TESTS PASSED SUCCESSFULLY!');
    console.log('VERDICT: APPROVE');
    process.exit(0);
}

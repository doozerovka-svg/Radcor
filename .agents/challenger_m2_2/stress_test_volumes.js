const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const productsPath = path.join(rootDir, 'products.json');
const appJsPath = path.join(rootDir, 'app.js');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const appJs = fs.readFileSync(appJsPath, 'utf8');

console.log('=== VOLUME RENDERING STRESS TEST ===');
console.log(`Total products loaded: ${products.length}`);

// Extract functions from app.js or simulate exact app.js logic
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
    if (exactPack) return Number(exactPack.price_mdl) || 0;
    const baseVol   = product.canister_vol || 1;
    const basePrice = product.canister_price || 0;
    if (!selectedVol || selectedVol === baseVol) return basePrice;
    if (selectedVol === product.barrel_vol && product.barrel_price) return product.barrel_price;
    const perLitre = baseVol > 0 ? basePrice / baseVol : basePrice;
    return Math.round(perLitre * selectedVol);
}

const tests = [];

// TEST 1: BiB pack labels (5 л BiB, 20 л BiB, 4 л BiB)
console.log('\n--- TEST 1: BiB Pack Labels ---');
const bibProducts = products.filter(p => p.packs && p.packs.some(pk => pk.label && pk.label.includes('BiB')));
console.log(`Found ${bibProducts.length} products with explicit BiB pack labels.`);
let test1Passed = true;

products.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = p.volumes || packs.map(pk => pk.volume_l);
    volumes.forEach(v => {
        const pack = packs.find(pk => Number(pk.volume_l) === Number(v));
        const label = getVolumeLabel(v, pack);
        if (pack && pack.label && pack.label.includes('BiB')) {
            if (label !== pack.label) {
                console.error(`FAIL: SKU ${p.sku} vol ${v} expected label '${pack.label}' but got '${label}'`);
                test1Passed = false;
            } else {
                console.log(`OK: SKU ${p.sku} (${p.name}) vol ${v} => rendered '${label}'`);
            }
        }
    });
});

// TEST 2: Eurocube pack labels (991 л (Еврокуб), 983 л (Еврокуб))
console.log('\n--- TEST 2: Eurocube Pack Labels ---');
const eurocubeProducts = products.filter(p => (p.volumes && (p.volumes.includes(991) || p.volumes.includes(983))) || (p.packs && p.packs.some(pk => pk.volume_l === 991 || pk.volume_l === 983 || (pk.label && pk.label.includes('Еврокуб')))));
console.log(`Found ${eurocubeProducts.length} products with Eurocube volumes.`);
let test2Passed = true;

products.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = p.volumes || packs.map(pk => pk.volume_l);
    if (volumes.includes(991) || volumes.includes(983)) {
        [991, 983].forEach(ev => {
            if (volumes.includes(ev)) {
                const pack = packs.find(pk => Number(pk.volume_l) === ev);
                const label = getVolumeLabel(ev, pack);
                const expected = (pack && pack.label) ? pack.label : `${ev} л (Еврокуб)`;
                if (!label.includes('Еврокуб')) {
                    console.error(`FAIL: SKU ${p.sku} vol ${ev} expected Eurocube in label, got '${label}'`);
                    test2Passed = false;
                } else {
                    console.log(`OK: SKU ${p.sku} (${p.name}) vol ${ev} => rendered '${label}'`);
                }
            }
        });
    }
});

// TEST 3: price_on_request products with custom volumes
console.log('\n--- TEST 3: price_on_request Products with Custom Volumes ---');
const requestProducts = products.filter(p => p.price_on_request || p.category === 'industrial-lubricants');
console.log(`Found ${requestProducts.length} price_on_request products.`);
let test3Passed = true;

requestProducts.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = (p.volumes && p.volumes.length) ? p.volumes : packs.map(pk => pk.volume_l);
    if (volumes.length === 0) {
        console.error(`FAIL: price_on_request SKU ${p.sku} (${p.name}) has NO volumes!`);
        test3Passed = false;
    } else {
        volumes.forEach(v => {
            const pack = packs.find(pk => Number(pk.volume_l) === Number(v));
            const label = getVolumeLabel(v, pack);
            console.log(`OK: price_on_request SKU ${p.sku} (${p.name}) vol ${v} => label '${label}'`);
        });
    }
});

// TEST 4: Volume click handler text updating simulation (app.js lines 1011-1014)
console.log('\n--- TEST 4: Volume Selection Text Update Logic in app.js ---');
let test4Passed = true;
// In app.js lines 1011-1014:
// const packObj = getProductPacks(product).find(p => Number(p.volume_l) === Number(vol));
// const volText = (packObj && packObj.label) ? packObj.label : (vol >= 1 ? `${vol} л` : `${vol * 1000} мл`);
// Notice if packObj is undefined or packObj.label is undefined, it falls back to vol >= 1 ? `${vol} л` : `${vol * 1000} мл`
// But wait! What if vol is 991 and packObj is not present or has no label?
// Let's test if getVolumeLabel should be used instead of manual string construction in click handler!
products.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = p.volumes || packs.map(pk => pk.volume_l);
    volumes.forEach(vol => {
        const packObj = packs.find(pk => Number(pk.volume_l) === Number(vol));
        const appJsVolText = (packObj && packObj.label) ? packObj.label : (vol >= 1 ? `${vol} л` : `${vol * 1000} мл`);
        const standardLabel = getVolumeLabel(vol, packObj);
        if (appJsVolText !== standardLabel) {
            console.warn(`DISCREPANCY DETECTED: SKU ${p.sku} vol ${vol}: app.js click handler produces '${appJsVolText}' vs getVolumeLabel '${standardLabel}'`);
            if (vol === 991 || vol === 983) {
                console.error(`FAIL: For volume ${vol}, app.js click handler displays '${appJsVolText}' losing Eurocube designation because packObj.label might be missing!`);
                test4Passed = false;
            }
        }
    });
});

console.log('\n================ SUMMARY ================');
console.log(`Test 1 (BiB Labels): ${test1Passed ? 'PASS' : 'FAIL'}`);
console.log(`Test 2 (Eurocube Labels): ${test2Passed ? 'PASS' : 'FAIL'}`);
console.log(`Test 3 (Price on Request Custom Volumes): ${test3Passed ? 'PASS' : 'FAIL'}`);
console.log(`Test 4 (Volume Click Handler Logic Consistency): ${test4Passed ? 'PASS' : 'FAIL'}`);

if (test1Passed && test2Passed && test3Passed && test4Passed) {
    console.log('\nOVERALL VERDICT: APPROVE');
} else {
    console.log('\nOVERALL VERDICT: REJECT');
}

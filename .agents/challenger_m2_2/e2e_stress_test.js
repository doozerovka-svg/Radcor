const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const productsPath = path.join(rootDir, 'products.json');
const appJsPath = path.join(rootDir, 'app.js');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const appJs = fs.readFileSync(appJsPath, 'utf8');

console.log('=== DOM VOLUME RENDERING STRESS TEST (PURE NODE) ===');

// Extract getVolumeLabel function from app.js
const getVolumeLabelMatch = appJs.match(/function getVolumeLabel\(v,\s*pack\)\s*\{[\s\S]*?\n    \}/);
if (!getVolumeLabelMatch) {
    console.error('CRITICAL: Could not find getVolumeLabel in app.js');
    process.exit(1);
}

const getVolumeLabelFn = new Function('v', 'pack', getVolumeLabelMatch[0] + '\nreturn getVolumeLabel(v, pack);');

function getProductPacks(product) {
    if (Array.isArray(product.packs) && product.packs.length) return product.packs;
    return [
        { id: 'canister', volume_l: Number(product.canister_vol), price_mdl: Number(product.canister_price) },
        { id: 'barrel', volume_l: Number(product.barrel_vol), price_mdl: Number(product.barrel_price) }
    ].filter(pack => pack.volume_l > 0);
}

let testErrors = [];

// 1. BiB Pack Labels Test
console.log('\n--- 1. BiB Pack Labels Test ---');
const bibProducts = products.filter(p => p.packs && p.packs.some(pk => pk.label && pk.label.includes('BiB')));
console.log(`Found ${bibProducts.length} BiB products.`);

bibProducts.forEach(p => {
    p.packs.filter(pk => pk.label && pk.label.includes('BiB')).forEach(pack => {
        const label = getVolumeLabelFn(pack.volume_l, pack);
        if (label !== pack.label) {
            testErrors.push(`Product ${p.sku} (${p.name}): volume ${pack.volume_l} expected '${pack.label}' but got '${label}'`);
        } else {
            console.log(`  [PASS] SKU ${p.sku} vol ${pack.volume_l}L => '${label}'`);
        }
    });
});

// 2. Eurocube Pack Labels Test
console.log('\n--- 2. Eurocube Pack Labels Test ---');
const eurocubeProducts = products.filter(p => (p.volumes && (p.volumes.includes(991) || p.volumes.includes(983))) || (p.packs && p.packs.some(pk => pk.volume_l === 991 || pk.volume_l === 983 || (pk.label && pk.label.includes('Еврокуб')))));
console.log(`Found ${eurocubeProducts.length} Eurocube products.`);

eurocubeProducts.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = p.volumes || packs.map(pk => pk.volume_l);
    [991, 983].forEach(v => {
        if (volumes.includes(v)) {
            const pack = packs.find(pk => Number(pk.volume_l) === v);
            const label = getVolumeLabelFn(v, pack);
            if (!label.includes('Еврокуб')) {
                testErrors.push(`Product ${p.sku} (${p.name}): volume ${v} expected '(Еврокуб)' in label, got '${label}'`);
            } else {
                console.log(`  [PASS] SKU ${p.sku} vol ${v}L => '${label}'`);
            }
        }
    });
});

// 3. Price on Request Products with Custom Volumes Test
console.log('\n--- 3. Price on Request Products with Custom Volumes Test ---');
const requestProducts = products.filter(p => p.price_on_request || p.category === 'industrial-lubricants');
console.log(`Found ${requestProducts.length} price_on_request / industrial products.`);

requestProducts.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = (p.volumes && p.volumes.length) ? p.volumes : packs.map(pk => pk.volume_l);
    if (!volumes || volumes.length === 0) {
        testErrors.push(`Product ${p.sku} (${p.name}): price_on_request has no volumes array!`);
    } else {
        volumes.forEach(v => {
            const pack = packs.find(pk => Number(pk.volume_l) === Number(v));
            const label = getVolumeLabelFn(v, pack);
            if (!label) {
                testErrors.push(`Product ${p.sku} (${p.name}): volume ${v} produced empty label!`);
            } else {
                console.log(`  [PASS] SKU ${p.sku} vol ${v} => label '${label}'`);
            }
        });
    }
});

// 4. Click Handler Volume Text Update Consistency Test
console.log('\n--- 4. Click Handler Volume Text Update Consistency Test ---');
// In app.js line 1011-1014:
// const packObj = getProductPacks(product).find(p => Number(p.volume_l) === Number(vol));
// const volText = (packObj && packObj.label) ? packObj.label : (vol >= 1 ? `${vol} л` : `${vol * 1000} мл`);
products.forEach(p => {
    const packs = getProductPacks(p);
    const volumes = p.volumes || packs.map(pk => pk.volume_l);
    volumes.forEach(vol => {
        const packObj = packs.find(pk => Number(pk.volume_l) === Number(vol));
        const appJsVolText = (packObj && packObj.label) ? packObj.label : (vol >= 1 ? `${vol} л` : `${vol * 1000} мл`);
        const fnVolText = getVolumeLabelFn(vol, packObj);
        
        if (appJsVolText !== fnVolText) {
            testErrors.push(`Inconsistent volume string for SKU ${p.sku} vol ${vol}: click handler '${appJsVolText}' vs getVolumeLabel '${fnVolText}'`);
        }
    });
});

console.log('\n================ SUMMARY ================');
if (testErrors.length === 0) {
    console.log('ALL STRESS TESTS PASSED WITH 0 ERRORS.');
    console.log('VERDICT: APPROVE');
} else {
    console.error(`FAILED WITH ${testErrors.length} ERRORS:`);
    testErrors.forEach(e => console.error(' - ' + e));
    console.log('VERDICT: REJECT');
}

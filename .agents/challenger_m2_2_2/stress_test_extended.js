const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../../products.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

console.log('--- EXTENDED ADVERSARIAL STRESS TEST: VOLUME CLICK HANDLERS & EUROCUBE 991L ---');

let totalChecks = 0;
let failedChecks = 0;
const errors = [];

function check(condition, msg) {
    totalChecks++;
    if (!condition) {
        failedChecks++;
        errors.push(msg);
        console.error(`❌ FAIL: ${msg}`);
    }
}

// 1. Check all 991L Eurocube pack labels across products.json
const eurocubeProducts = products.filter(p => (p.volumes || []).includes(991) || (p.packs || []).some(pk => Number(pk.volume_l) === 991));
console.log(`Total products with 991L Eurocube option: ${eurocubeProducts.length}`);

eurocubeProducts.forEach(p => {
    const pack991 = (p.packs || []).find(pk => Number(pk.volume_l) === 991);
    check(pack991 !== undefined, `SKU ${p.sku}: Product has 991 volume but missing pack object for 991L`);
    if (pack991) {
        check(pack991.label && pack991.label.includes('Еврокуб'), `SKU ${p.sku}: 991L pack label is "${pack991.label}" (expected to include "Еврокуб")`);
    }
});

// 2. Check line 1012 volText resolution for ALL products and ALL their volumes
products.forEach(product => {
    const volumes = (product.volumes || []);
    const packs = (product.packs || []);

    volumes.forEach(vol => {
        const packObj = packs.find(p => Number(p.volume_l) === Number(vol));
        
        // Test line 1012 logic
        const volText1012 = (packObj && packObj.label) ? packObj.label : (vol >= 1 ? `${vol} л` : `${vol * 1000} мл`);
        
        check(volText1012 !== undefined && volText1012 !== null && volText1012.trim() !== '', `SKU ${product.sku} vol ${vol}: volText line 1012 resolved to empty/invalid`);
        check(!volText1012.includes('undefined') && !volText1012.includes('NaN'), `SKU ${product.sku} vol ${vol}: volText line 1012 contains NaN/undefined (${volText1012})`);
        
        if (Number(vol) === 991) {
            check(volText1012.includes('Еврокуб'), `SKU ${product.sku} vol 991: line 1012 volText is "${volText1012}" (expected to include "Еврокуб")`);
        }
    });
});

// 3. Check price on request products (industrial-lubricants & price_on_request: true)
const priceOnRequestProducts = products.filter(p => p.price_on_request || p.category === 'industrial-lubricants');
console.log(`Total products with price_on_request: ${priceOnRequestProducts.length}`);

priceOnRequestProducts.forEach(p => {
    check(p.price_on_request === true, `SKU ${p.sku}: industrial product has price_on_request === true`);
    // Ensure contact phone or price label handles this gracefully
});

// 4. SUMMARY
console.log(`\nEXTENDED STRESS TEST SUMMARY: ${totalChecks - failedChecks} / ${totalChecks} assertions PASSED.`);
if (failedChecks > 0) {
    console.error('VERDICT: REJECT');
    process.exit(1);
} else {
    console.log('VERDICT: APPROVE');
    process.exit(0);
}

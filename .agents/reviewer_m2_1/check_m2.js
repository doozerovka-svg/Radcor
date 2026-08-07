const fs = require('fs');
const path = require('path');

const productsPath = 'c:/Users/DenCrut/Documents/radcor.md/products.json';
const appJsPath = 'c:/Users/DenCrut/Documents/radcor.md/app.js';

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const appJs = fs.readFileSync(appJsPath, 'utf8');

console.log('=== REVIEWER M2_1 VERIFICATION REPORT ===\n');

// 1. Motor Oils PKW Count
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log('1. PKW Category Item Count:', pkw.length);

// 2. All 11 Title Renames
console.log('\n2. Verifying 11 Title Renames:');
const expectedRenames = [
  { sku: 'MOL-HYBRID-0W16', name: 'MOL Dynamic Gold NG 0W-16' },
  { sku: 'MOL-DYN-STAR-0W20', name: 'MOL Dynamic Gold NG 0W-20' },
  { sku: 'MOL-DYN-ESS-5W30', name: 'MOL Essence 5W-30' },
  { sku: 'MOL-DYN-ESS-C2-5W30', name: 'MOL Essence DPF 5W-30' },
  { sku: 'MOL-DYN-ESS-5W40', name: 'MOL Essence 5W-40' },
  { sku: 'MOL-DYN-ESS-DSL-5W40', name: 'MOL Essence Diesel 5W-40' },
  { sku: 'MOL-DYN-PRIMA-5W40', name: 'MOL Prima 5W-40' },
  { sku: 'YUKO-SYNETIC-5W40', name: 'Yuko Synthetic 5W-40' },
  { sku: 'MOL-DYN-ESS-DSL-10W40', name: 'MOL Essence Diesel 10W-40' },
  { sku: 'YUKO-CLASSIC-15W40', name: 'Yuko Dynamic 15W-40' },
  { sku: 'MOL-DYN-ESS-15W40', name: 'MOL Essence 15W-40' }
];

let renamesPass = true;
expectedRenames.forEach(r => {
  const item = products.find(p => p.sku === r.sku);
  if (!item) {
    console.log(`  ✖ SKU ${r.sku} NOT FOUND`);
    renamesPass = false;
  } else if (item.name !== r.name) {
    console.log(`  ✖ SKU ${r.sku} name mismatch: Got "${item.name}", Expected "${r.name}"`);
    renamesPass = false;
  } else {
    console.log(`  ✔ SKU ${r.sku}: "${item.name}"`);
  }
});

// 3. Verify 2 New Products
console.log('\n3. Verifying 2 New Products:');
const starVL = products.find(p => p.name === 'MOL Dynamic Star VL 0W-30');
if (starVL) {
  console.log('  ✔ MOL Dynamic Star VL 0W-30 found:');
  console.log('    - SKU:', starVL.sku);
  console.log('    - Category:', starVL.category);
  console.log('    - Volumes:', JSON.stringify(starVL.volumes));
  console.log('    - Packs:', JSON.stringify(starVL.packs));
} else {
  console.log('  ✖ MOL Dynamic Star VL 0W-30 NOT FOUND!');
}

const essenceSL = products.find(p => p.name === 'MOL Essence SL 10W-40');
if (essenceSL) {
  console.log('  ✔ MOL Essence SL 10W-40 found:');
  console.log('    - SKU:', essenceSL.sku);
  console.log('    - Category:', essenceSL.category);
  console.log('    - Volumes:', JSON.stringify(essenceSL.volumes));
  console.log('    - Packs:', JSON.stringify(essenceSL.packs));
} else {
  console.log('  ✖ MOL Essence SL 10W-40 NOT FOUND!');
}

// 4. App.js Line 209 Fallback
console.log('\n4. Verifying app.js Line 209 Fallback:');
const appLines = appJs.split(/\r?\n/);
const line209 = appLines[208]; // line 209 in 1-based index
console.log('  Line 209 content:', line209 ? line209.trim() : 'UNDEFINED');
const line209Ok = line209 && line209.includes("if (numV === 991) return '991 л (Еврокуб)';");
console.log('  Line 209 check:', line209Ok ? '✔ PASS' : '✖ FAIL');

// 5. Integrity and Adversarial Checks
console.log('\n5. Additional Integrity Checks:');
// Duplicate SKUs or names in motor-oils-pkw
const pkwSkus = pkw.map(p => p.sku);
const pkwNames = pkw.map(p => p.name);
const uniqueSkus = new Set(pkwSkus);
const uniqueNames = new Set(pkwNames);

console.log(`  - PKW Unique SKUs: ${uniqueSkus.size} / ${pkw.length}`);
console.log(`  - PKW Unique Names: ${uniqueNames.size} / ${pkw.length}`);

// Check volume desyncs across all products
let desyncCount = 0;
products.forEach(p => {
  if (p.packs && Array.isArray(p.packs) && p.packs.length > 0) {
    const vols = (p.volumes || []).map(Number).sort((a,b)=>a-b);
    const packVols = p.packs.map(pk => Number(pk.volume_l)).sort((a,b)=>a-b);
    if (JSON.stringify(vols) !== JSON.stringify(packVols)) {
      desyncCount++;
      console.log(`  ✖ Desync in SKU ${p.sku}: vols=${JSON.stringify(vols)}, packVols=${JSON.stringify(packVols)}`);
    }
  }
});
console.log(`  - Volumes/Packs desyncs across entire products.json: ${desyncCount}`);

// Overall Verdict
console.log('\n=== OVERALL AUDIT SUMMARY ===');
if (pkw.length === 38 && renamesPass && starVL && essenceSL && line209Ok && uniqueSkus.size === 38 && uniqueNames.size === 38 && desyncCount === 0) {
  console.log('VERDICT: APPROVE');
} else {
  console.log('VERDICT: REQUEST_CHANGES');
}

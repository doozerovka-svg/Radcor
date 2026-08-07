const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// 1. Verify motor-oils-pkw count is exactly 38
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log('PKW Product Count:', pkw.length);
if (pkw.length !== 38) {
  console.error('✖ FAIL: Expected 38 PKW items, found ' + pkw.length);
  process.exit(1);
}

// 2. Verify all 11 title renames are active
const renames = [
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

let renamesOk = true;
renames.forEach(r => {
  const p = products.find(prod => prod.sku === r.sku);
  if (!p || p.name !== r.name) {
    console.error('✖ FAIL: Title mismatch for SKU ' + r.sku + '. Expected: "' + r.name + '", Got: "' + (p ? p.name : 'MISSING') + '"');
    renamesOk = false;
  }
});
if (!renamesOk) process.exit(1);
console.log('✔ All 11 title renames verified.');

// 3. Verify packs and volumes are 100% in sync for ALL products
let desyncCount = 0;
products.forEach(p => {
  if (p.packs && Array.isArray(p.packs) && p.packs.length > 0) {
    const vols = (p.volumes || []).map(Number);
    const packVols = p.packs.map(pk => Number(pk.volume_l));
    const setV = new Set(vols);
    const setP = new Set(packVols);
    if (vols.length !== packVols.length || !vols.every(v => setP.has(v)) || !packVols.every(pv => setV.has(pv))) {
      desyncCount++;
      console.error('✖ Desync in SKU ' + p.sku + ': vols=' + JSON.stringify(vols) + ', packs=' + JSON.stringify(packVols));
    }
  }
});
if (desyncCount !== 0) {
  console.error('✖ FAIL: Found ' + desyncCount + ' products with desynchronized volumes and packs.');
  process.exit(1);
}
console.log('✔ Packs and volumes are 100% in sync across all products.');

// 4. Verify app.js fallback for 991L
const appJs = fs.readFileSync('app.js', 'utf8');
if (!appJs.includes("if (numV === 991) return '991 л (Еврокуб)';")) {
  console.error('✖ FAIL: app.js fallback for 991L is not updated.');
  process.exit(1);
}
console.log('✔ app.js fallback for 991L Eurocube verified.');

console.log('SUCCESS: All Milestone 2 verification checks passed!');

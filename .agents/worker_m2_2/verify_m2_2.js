const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const productsPath = path.join(rootDir, 'products.json');

console.log('=== Empirical Verification Script Worker M2_2 ===');

// 1. JSON Syntax Check
let fileContent;
try {
  fileContent = fs.readFileSync(productsPath, 'utf8');
  console.log('[PASS] products.json file read successfully.');
} catch (err) {
  console.error('[FAIL] Reading products.json failed:', err.message);
  process.exit(1);
}

let products;
try {
  products = JSON.parse(fileContent);
  console.log('[PASS] Valid JSON syntax confirmed.');
} catch (err) {
  console.error('[FAIL] Invalid JSON syntax:', err.message);
  process.exit(1);
}

// 2. Count Check
console.log(`Total products count: ${products.length}`);
if (products.length === 423) {
  console.log('[PASS] Total product count is exactly 423.');
} else {
  console.error(`[FAIL] Expected 423 products, found ${products.length}.`);
}

const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`motor-oils-pkw count: ${pkwProducts.length}`);
if (pkwProducts.length === 38) {
  console.log('[PASS] motor-oils-pkw count remains exactly 38.');
} else {
  console.error(`[FAIL] Expected 38 motor-oils-pkw products, found ${pkwProducts.length}.`);
}

// 3. 100% Volumes vs Packs Sync Check
let syncFailures = 0;
products.forEach((p, idx) => {
  const vols = p.volumes || [];
  const packs = p.packs || [];

  if (vols.length !== packs.length) {
    syncFailures++;
    console.error(`[SYNC FAIL] Index ${idx} [${p.sku || p.id} - "${p.name}"]: vols count (${vols.length}) != packs count (${packs.length})`);
  } else {
    for (let i = 0; i < vols.length; i++) {
      const volVal = Number(vols[i]);
      const packVol = Number(packs[i] && packs[i].volume_l);
      if (volVal !== packVol) {
        syncFailures++;
        console.error(`[SYNC FAIL] Index ${idx} [${p.sku || p.id} - "${p.name}"] at pos ${i}: volume (${volVal}) != pack.volume_l (${packVol})`);
        break;
      }
    }
  }
});

if (syncFailures === 0) {
  console.log('[PASS] 100% of all products (423/423) have volumes and packs perfectly synchronized!');
} else {
  console.error(`[FAIL] Found ${syncFailures} unsynced products.`);
}

console.log('=============================================');
if (products.length === 423 && pkwProducts.length === 38 && syncFailures === 0) {
  console.log('FINAL VERDICT: WORKER M2_2 VERIFICATION PASSED');
} else {
  console.log('FINAL VERDICT: WORKER M2_2 VERIFICATION FAILED');
  process.exit(1);
}
console.log('=============================================');

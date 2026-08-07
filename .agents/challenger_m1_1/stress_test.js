const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const rawContent = fs.readFileSync(productsPath, 'utf8');
const products = JSON.parse(rawContent);

console.log('=== ADVERSARIAL STRESS-TESTING FOR PRODUCTS.JSON ===\n');

// 1. Raw text search for any of the 35 deleted SKUs in the entire products.json file string
const targetSKUs = [
  'YUKO-HYBRID-0W16', 'YUKO-SYNETIC-0W16', 'MOL-1080', 'YUKO-SYNETIC-0W20', 'MOL-DYN-GOLD-0W20',
  'MOL-DYN-GOLD-0W20-VAG', 'MOL-1067', 'YUKO-SYNETIC-0W30', 'MOL-DYN-GOLD-0W30', 'MOL-1000',
  'YUKO-SYNETIC-5W20', 'MOL-DYN-GOLD-HUN-5W30', 'MOL-1028', 'MOL-DYN-GOLD-5W40', 'YUKO-VEGA-5W40',
  'MOL-DYN-SYNT-RN-5W40', 'MOL-DYN-ESS-DPF-5W40', 'MOL-1065', 'YUKO-SEMISYNT-10W30', 'YUKO-SYNETIC-10W30',
  'MOL-SYNT-10W30', 'MOL-1081', 'MOL-15W40-MIN', 'YUKO-CLASSIC-20W50', 'MOL-1064',
  'MOL-1073', 'MOL-DYN-GOLD-LONGLIFE-5W30', 'MOL-1071', 'MOL-1053', 'MOL-DYN-ESS-DIESEL-5W40',
  'MOL-1062', 'MOL-1074', 'MOL-1010', 'MOL-ESSENCE-10W40', 'MOL-1056'
];

let rawLeaks = 0;
targetSKUs.forEach(sku => {
  if (rawContent.includes(sku)) {
    console.error(`[STRESS-FAIL] Raw file content still contains reference to SKU '${sku}'`);
    rawLeaks++;
  }
});
if (rawLeaks === 0) {
  console.log('[STRESS-PASS] Raw text search confirms 0 references to all 35 removed SKUs in products.json file content.');
}

// 2. Case-insensitive SKU uniqueness & trailing/leading space check
const normalizedSKUMap = new Map();
let duplicateNormSKUs = 0;
products.forEach(p => {
  const norm = p.sku.trim().toUpperCase();
  if (normalizedSKUMap.has(norm)) {
    console.error(`[STRESS-FAIL] Case-insensitive SKU collision: '${p.sku}' collides with '${normalizedSKUMap.get(norm)}'`);
    duplicateNormSKUs++;
  } else {
    normalizedSKUMap.set(norm, p.sku);
  }
});
if (duplicateNormSKUs === 0) {
  console.log('[STRESS-PASS] Case-insensitive SKU uniqueness verified (0 collisions).');
}

// 3. Emoji presence check in all products
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
let emojiMatches = 0;
products.forEach(p => {
  const str = JSON.stringify(p);
  if (emojiRegex.test(str)) {
    console.error(`[STRESS-FAIL] Product SKU ${p.sku} contains emoji character!`);
    emojiMatches++;
  }
});
if (emojiMatches === 0) {
  console.log('[STRESS-PASS] 0 emojis found in entire products.json dataset (AGENTS.md rule compliant).');
}

// 4. Check for invalid price/volume or corrupt packs
let corruptPacks = 0;
products.forEach(p => {
  if (p.packs && Array.isArray(p.packs)) {
    p.packs.forEach(pack => {
      if (typeof pack.volume_l !== 'number' || isNaN(pack.volume_l) || pack.volume_l <= 0) {
        console.error(`[STRESS-FAIL] Product SKU ${p.sku} has invalid pack volume_l: ${pack.volume_l}`);
        corruptPacks++;
      }
    });
  }
});
if (corruptPacks === 0) {
  console.log('[STRESS-PASS] All pack volume values are positive numbers.');
}

console.log('\n=== ADVERSARIAL STRESS-TEST COMPLETE ===');

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', '..', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('--- STRESS & ADVERSARIAL TEST SUITE ---');

let errors = [];
let warnings = [];

// Test 1: Category distribution
const categoryCounts = {};
products.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});
console.log('Category breakdown:', categoryCounts);

// Test 2: Check motor-oils-pkw products detail
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`\nChecking all ${pkw.length} motor-oils-pkw products:`);

pkw.forEach((p, idx) => {
  const pId = p.sku || p.id;
  const pName = p.name || p.title;
  if (!pId || !pName) {
    errors.push(`PKW item #${idx} missing id/sku or name/title`);
  }
  if (!Array.isArray(p.volumes) || p.volumes.length === 0) {
    errors.push(`PKW item ${pName} (${pId}) has empty or invalid volumes`);
  }
  if (!Array.isArray(p.packs) || p.packs.length === 0) {
    errors.push(`PKW item ${pName} (${pId}) has empty or invalid packs`);
  }
  if (p.volumes.length !== p.packs.length) {
    errors.push(`PKW item ${pName} (${pId}) volumes/packs length mismatch (${p.volumes.length} vs ${p.packs.length})`);
  }
});

// Test 3: Check BiB and 991L Eurocube packs formatting
let bibCount = 0;
let eurocube991Count = 0;
products.forEach(p => {
  (p.packs || []).forEach(pk => {
    if (pk.label && pk.label.includes('BiB')) {
      bibCount++;
    }
    if (pk.volume_l === 991 || (pk.label && pk.label.includes('991'))) {
      eurocube991Count++;
      if (pk.label !== '991 л (Еврокуб)' && pk.label !== '991 л (IBC Eurocube)' && !pk.label.includes('Еврокуб')) {
        warnings.push(`Product ${p.name || p.title} (${p.sku || p.id}) has 991L pack label: '${pk.label}'`);
      }
    }
  });
});
console.log(`Found ${bibCount} BiB pack options across products.`);
console.log(`Found ${eurocube991Count} 991L Eurocube pack options across products.`);

// Test 4: Verify MOL Dynamic Star VL 0W-30 & MOL Essence SL 10W-40
const starVL = products.find(p => (p.name || p.title) && (p.name || p.title).includes('Star VL 0W-30'));
const essenceSL = products.find(p => (p.name || p.title) && (p.name || p.title).includes('Essence SL 10W-40'));

if (!starVL) {
  errors.push('MOL Dynamic Star VL 0W-30 not found in products.json!');
} else {
  console.log(`\nFound MOL Dynamic Star VL 0W-30: volumes = [${starVL.volumes.join(', ')}]`);
}

if (!essenceSL) {
  errors.push('MOL Essence SL 10W-40 not found in products.json!');
} else {
  console.log(`Found MOL Essence SL 10W-40: volumes = [${essenceSL.volumes.join(', ')}]`);
}

// Test 5: Search for any emojis across entire products.json
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
products.forEach(p => {
  const str = JSON.stringify(p);
  if (emojiRegex.test(str)) {
    errors.push(`Emoji found in product ${p.sku || p.id} (${p.name || p.title})`);
  }
});

console.log('\n--- STRESS TEST SUMMARY ---');
console.log(`Errors count: ${errors.length}`);
console.log(`Warnings count: ${warnings.length}`);
if (errors.length > 0) {
  console.log('Errors detail:', errors);
}
if (warnings.length > 0) {
  console.log('Warnings detail:', warnings);
}

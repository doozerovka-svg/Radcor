const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');

console.log('--- STARTING INDEPENDENT VERIFICATION (Reviewer M2_2_2) ---');

let rawData;
try {
  rawData = fs.readFileSync(productsPath, 'utf-8');
  console.log('1. JSON Syntax Check: PASS (Successfully read products.json)');
} catch (err) {
  console.error('1. JSON Syntax Check: FAIL - File read error:', err.message);
  process.exit(1);
}

let products;
try {
  products = JSON.parse(rawData);
  console.log('2. JSON Parsing Check: PASS (Successfully parsed JSON)');
} catch (err) {
  console.error('2. JSON Parsing Check: FAIL - Invalid JSON syntax:', err.message);
  process.exit(1);
}

console.log(`Total Products Count: ${products.length}`);

// Emoji regex matching common emoji ranges
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

let syncFailures = 0;
let labelFailures = 0;
let emojiFailures = 0;
let missingFieldsFailures = 0;

products.forEach((product, idx) => {
  const pId = product.id || `index_${idx}`;
  const pTitle = product.title || product.name || 'Untitled';
  
  // Check volumes & packs presence
  const volumes = Array.isArray(product.volumes) ? product.volumes : [];
  const packs = Array.isArray(product.packs) ? product.packs : [];

  // Check if volumes and packs match
  const packVolumes = packs.map(p => Number(p.volume_l)).sort((a, b) => a - b);
  const sortedVolumes = [...volumes].map(Number).sort((a, b) => a - b);

  if (JSON.stringify(packVolumes) !== JSON.stringify(sortedVolumes)) {
    console.error(`SYNC FAIL [${idx}] ID: ${pId} ("${pTitle}"): volumes [${sortedVolumes.join(', ')}] != pack volume_l [${packVolumes.join(', ')}]`);
    syncFailures++;
  }

  // Check pack label formatting & emojis
  packs.forEach((pack, pIdx) => {
    if (!pack.label || typeof pack.label !== 'string' || pack.label.trim() === '') {
      console.error(`LABEL FAIL [${idx}] ID: ${pId} pack #${pIdx}: label is missing or empty`);
      labelFailures++;
    } else {
      if (emojiRegex.test(pack.label)) {
        console.error(`EMOJI FAIL [${idx}] ID: ${pId} pack #${pIdx} label ("${pack.label}") contains emoji!`);
        emojiFailures++;
      }
    }
  });

  // Check title & category for emojis
  if (emojiRegex.test(pTitle)) {
    console.error(`EMOJI FAIL [${idx}] ID: ${pId} title ("${pTitle}") contains emoji!`);
    emojiFailures++;
  }
  if (product.category && emojiRegex.test(product.category)) {
    console.error(`EMOJI FAIL [${idx}] ID: ${pId} category ("${product.category}") contains emoji!`);
    emojiFailures++;
  }
});

console.log('\n--- VERIFICATION SUMMARY ---');
console.log(`Total Products: ${products.length}`);
console.log(`Volume/Pack Sync Failures: ${syncFailures}`);
console.log(`Pack Label Failures: ${labelFailures}`);
console.log(`Emoji Failures: ${emojiFailures}`);

if (syncFailures === 0 && labelFailures === 0 && emojiFailures === 0) {
  console.log('\n>>> OVERALL VERDICT: PASS <<<');
} else {
  console.log('\n>>> OVERALL VERDICT: FAIL <<<');
}

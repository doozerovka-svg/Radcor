const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const productsPath = path.join(rootDir, 'products.json');
const appJsPath = path.join(rootDir, 'app.js');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`=== Empirical Verification Script M2_1 ===`);
console.log(`Total products loaded: ${products.length}`);

let passedAll = true;

// 1. Check 11 Title Renames
console.log('\n--- 1. Verification of 11 Title Renames ---');
const renames = [
  { oldName: 'MOL Dynamic Hybrid 0W-16', newName: 'MOL Dynamic Gold NG 0W-16' },
  { oldName: 'MOL Dynamic Star 0W-20', newName: 'MOL Dynamic Gold NG 0W-20' },
  { oldName: 'MOL Dynamic Essence 5W-30', newName: 'MOL Essence 5W-30' },
  { oldName: 'MOL Dynamic Essence C2 5W-30', newName: 'MOL Essence DPF 5W-30' },
  { oldName: 'MOL Dynamic Essence 5W-40', newName: 'MOL Essence 5W-40' },
  { oldName: 'MOL Dynamic Essence Diesel 5W-40', newName: 'MOL Essence Diesel 5W-40' },
  { oldName: 'MOL Dynamic Prima 5W-40', newName: 'MOL Prima 5W-40' },
  { oldName: 'Yuko Syntetic 5W-40 (1 л)', newName: 'Yuko Synthetic 5W-40' },
  { oldName: 'MOL Dynamic Essence Diesel 10W-40', newName: 'MOL Essence Diesel 10W-40' },
  { oldName: 'Yuko Classic 15W-40', newName: 'Yuko Dynamic 15W-40' },
  { oldName: 'MOL Dynamic Essence 15W-40', newName: 'MOL Essence 15W-40' }
];

renames.forEach(({ oldName, newName }, idx) => {
  const foundNew = products.find(p => p.name === newName);
  const foundOld = products.find(p => p.name === oldName);
  
  if (foundNew && !foundOld) {
    console.log(`[PASS] ${idx+1}. Renamed correctly: "${newName}" exists, old name "${oldName}" is gone.`);
  } else {
    passedAll = false;
    console.error(`[FAIL] ${idx+1}. Rename check failed for old: "${oldName}", new: "${newName}". Found new: ${!!foundNew}, Found old: ${!!foundOld}`);
  }
});

// 2. Check 2 New Positions
console.log('\n--- 2. Verification of New Positions ---');

const item1Name = 'MOL Dynamic Star VL 0W-30';
const item1 = products.find(p => p.name === item1Name);
if (item1) {
  console.log(`[PASS] New item "${item1Name}" found.`);
  console.log(`  Category: ${item1.category}`);
  console.log(`  Volumes: ${JSON.stringify(item1.volumes)}`);
  console.log(`  Packs: ${JSON.stringify(item1.packs)}`);
  
  const expectedVols = [1, 4];
  const volsMatch = Array.isArray(item1.volumes) && 
    expectedVols.every(v => item1.volumes.includes(v)) && 
    item1.volumes.length === expectedVols.length;
    
  const packsMatch = Array.isArray(item1.packs) &&
    expectedVols.every(v => item1.packs.some(pk => Number(pk.volume_l) === v)) &&
    item1.packs.length === expectedVols.length;

  if (volsMatch && packsMatch) {
    console.log(`[PASS] ${item1Name} volume array [1, 4] and packs match expectation.`);
  } else {
    passedAll = false;
    console.error(`[FAIL] ${item1Name} volumes or packs mismatch.`);
  }
} else {
  passedAll = false;
  console.error(`[FAIL] New item "${item1Name}" NOT found.`);
}

const item2Name = 'MOL Essence SL 10W-40';
const item2 = products.find(p => p.name === item2Name);
if (item2) {
  console.log(`[PASS] New item "${item2Name}" found.`);
  console.log(`  Category: ${item2.category}`);
  console.log(`  Volumes: ${JSON.stringify(item2.volumes)}`);
  console.log(`  Packs: ${JSON.stringify(item2.packs)}`);
  
  const expectedVols = [4, 5, 20, 54, 196, 991];
  const volsMatch = Array.isArray(item2.volumes) && 
    expectedVols.every(v => item2.volumes.includes(v)) && 
    item2.volumes.length === expectedVols.length;
    
  const packsMatch = Array.isArray(item2.packs) &&
    expectedVols.every(v => item2.packs.some(pk => Number(pk.volume_l) === v)) &&
    item2.packs.length === expectedVols.length;

  if (volsMatch && packsMatch) {
    console.log(`[PASS] ${item2Name} volume array [4, 5, 20, 54, 196, 991] and packs match expectation.`);
  } else {
    passedAll = false;
    console.error(`[FAIL] ${item2Name} volumes or packs mismatch.`);
  }
} else {
  passedAll = false;
  console.error(`[FAIL] New item "${item2Name}" NOT found.`);
}

// 3. Volumes vs Packs Sync Check across all products
console.log('\n--- 3. Verification of Volumes vs Packs Sync Across All Products ---');
let syncFailures = 0;

products.forEach((p, index) => {
  const vols = p.volumes || [];
  const packs = p.packs || [];
  
  if (vols.length !== packs.length) {
    syncFailures++;
    console.error(`[SYNC FAIL] Product index ${index} (${p.id} - "${p.name}"): volumes count (${vols.length}) != packs count (${packs.length})`);
    console.error(`  vols: ${JSON.stringify(vols)}`);
    console.error(`  packs: ${JSON.stringify(packs)}`);
  } else {
    for (let i = 0; i < vols.length; i++) {
      const volVal = Number(vols[i]);
      const packVol = Number(packs[i] && packs[i].volume_l);
      if (volVal !== packVol) {
        syncFailures++;
        console.error(`[SYNC FAIL] Product index ${index} (${p.id} - "${p.name}") at pos ${i}: volume (${volVal}) != pack.volume_l (${packVol})`);
        break;
      }
    }
  }
});

if (syncFailures === 0) {
  console.log(`[PASS] All ${products.length} products have perfectly synchronized 'volumes' arrays and 'packs' objects.`);
} else {
  passedAll = false;
  console.error(`[FAIL] Found ${syncFailures} products with volumes/packs sync mismatches.`);
}

// 4. Check getVolumeLabel(991) in app.js
console.log('\n--- 4. Verification of app.js getVolumeLabel(991) ---');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract getVolumeLabel function from app.js using regex or eval
const match = appJsContent.match(/function getVolumeLabel\(v,\s*pack\)\s*\{([\s\S]*?)\n    \}/);
if (match) {
  const fnBody = match[1];
  const getVolumeLabel = new Function('v', 'pack', fnBody);
  
  const result991 = getVolumeLabel(991);
  console.log(`getVolumeLabel(991) returned: "${result991}"`);
  
  if (result991 === '991 л (Еврокуб)') {
    console.log(`[PASS] getVolumeLabel(991) correctly returned '991 л (Еврокуб)'`);
  } else {
    passedAll = false;
    console.error(`[FAIL] getVolumeLabel(991) returned "${result991}", expected "991 л (Еврокуб)"`);
  }
} else {
  passedAll = false;
  console.error(`[FAIL] Could not locate getVolumeLabel in app.js`);
}

console.log('\n=============================================');
if (passedAll) {
  console.log('FINAL VERDICT: APPROVE');
} else {
  console.log('FINAL VERDICT: REJECT');
}
console.log('=============================================');

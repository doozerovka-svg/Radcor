const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', '..', 'products.json');
const appJsPath = path.join(__dirname, '..', '..', 'app.js');

console.log('--- EMPIRICAL TEST RUNNER: Challenger M2_2_1 ---');

// 1. Read products.json
const productsRaw = fs.readFileSync(productsPath, 'utf-8');
const products = JSON.parse(productsRaw);

console.log(`Total products in products.json: ${products.length}`);

// 2. Count motor-oils-pkw
const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`Products in category 'motor-oils-pkw': ${pkwProducts.length}`);

// 3. Verify volumes vs packs sync across all products
let syncPassedCount = 0;
let syncFailedCount = 0;
const syncErrors = [];

products.forEach((p, idx) => {
  const pId = p.id || `idx_${idx}`;
  const pTitle = p.title || p.name || 'Unnamed';
  
  if (!p.volumes || !Array.isArray(p.volumes)) {
    syncErrors.push({ id: pId, title: pTitle, error: 'Missing or invalid volumes array' });
    syncFailedCount++;
    return;
  }
  
  if (!p.packs || !Array.isArray(p.packs)) {
    syncErrors.push({ id: pId, title: pTitle, error: 'Missing or invalid packs array' });
    syncFailedCount++;
    return;
  }
  
  if (p.volumes.length !== p.packs.length) {
    syncErrors.push({
      id: pId,
      title: pTitle,
      error: `Length mismatch: volumes.length=${p.volumes.length}, packs.length=${p.packs.length}`,
      volumes: p.volumes,
      packs: p.packs.map(pk => pk.volume_l)
    });
    syncFailedCount++;
    return;
  }
  
  let itemMismatch = false;
  for (let i = 0; i < p.volumes.length; i++) {
    const vol = p.volumes[i];
    const packVol = p.packs[i] ? p.packs[i].volume_l : undefined;
    if (vol !== packVol) {
      itemMismatch = true;
      break;
    }
  }
  
  if (itemMismatch) {
    syncErrors.push({
      id: pId,
      title: pTitle,
      error: 'Value mismatch between volumes and packs.volume_l',
      volumes: p.volumes,
      packs: p.packs.map(pk => pk.volume_l)
    });
    syncFailedCount++;
  } else {
    syncPassedCount++;
  }
});

console.log(`Sync status: ${syncPassedCount} passed, ${syncFailedCount} desync issues.`);
if (syncErrors.length > 0) {
  console.log('Sync errors:', JSON.stringify(syncErrors, null, 2));
}

// 4. Check getVolumeLabel(991) in app.js
const appJsContent = fs.readFileSync(appJsPath, 'utf-8');

let volumeLabel991 = null;
try {
  const startIdx = appJsContent.indexOf('function getVolumeLabel(');
  if (startIdx !== -1) {
    const endIdx = appJsContent.indexOf('function getProductApprovals(', startIdx);
    const funcCode = appJsContent.slice(startIdx, endIdx);
    
    const vm = require('vm');
    const context = {};
    vm.createContext(context);
    vm.runInContext(funcCode, context);
    volumeLabel991 = context.getVolumeLabel(991);
  } else {
    console.log('Could not find getVolumeLabel in app.js');
  }
} catch (err) {
  console.error('Error evaluating getVolumeLabel:', err.message);
}

console.log(`getVolumeLabel(991) returned: '${volumeLabel991}'`);

// Summary Verdict logic
const checks = {
  totalItemsIs423: products.length === 423,
  pkwItemsIs38: pkwProducts.length === 38,
  zeroDesync: syncFailedCount === 0 && syncPassedCount === products.length,
  volumeLabel991IsEurocube: volumeLabel991 === '991 л (Еврокуб)'
};

console.log('\n--- VERIFICATION CHECKLIST ---');
console.log(`- Total items is 423: ${checks.totalItemsIs423} (Actual: ${products.length})`);
console.log(`- PKW items is 38: ${checks.pkwItemsIs38} (Actual: ${pkwProducts.length})`);
console.log(`- Zero desynchronization issues (100% match): ${checks.zeroDesync} (${syncPassedCount}/${products.length} synchronized)`);
console.log(`- getVolumeLabel(991) === '991 л (Еврокуб)': ${checks.volumeLabel991IsEurocube} (Actual: '${volumeLabel991}')`);

const overallApprove = Object.values(checks).every(Boolean);
console.log(`\nVERDICT: ${overallApprove ? 'APPROVE' : 'REJECT'}`);

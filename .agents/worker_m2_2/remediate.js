const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const appJsPath = path.resolve(__dirname, '../../app.js');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract getVolumeLabel from app.js
const match = appJsContent.match(/function getVolumeLabel\(v,\s*pack\)\s*\{([\s\S]*?)\n    \}/);
if (!match) {
  throw new Error('Could not find getVolumeLabel in app.js');
}
const fnBody = match[1];
const getVolumeLabel = new Function('v', 'pack', fnBody);

console.log(`Initial total products: ${products.length}`);
const initialPkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`Initial motor-oils-pkw count: ${initialPkw.length}`);

let updatedCount = 0;

products.forEach((p, idx) => {
  const vols = p.volumes || [];
  const packs = p.packs || [];

  let needsRemediation = false;
  if (vols.length > 0 && (!packs || packs.length === 0)) {
    needsRemediation = true;
  } else if (vols.length !== packs.length) {
    needsRemediation = true;
  } else {
    for (let i = 0; i < vols.length; i++) {
      if (Number(vols[i]) !== Number(packs[i] && packs[i].volume_l)) {
        needsRemediation = true;
        break;
      }
    }
  }

  if (needsRemediation) {
    updatedCount++;
    console.log(`Remediating product index ${idx} [${p.sku || p.id}]: "${p.name}" (${p.category})`);
    p.packs = vols.map(v => {
      const price = p.price_mdl || p.price || p.canister_price || 0;
      return {
        id: `p-${v}`,
        volume_l: v,
        price_mdl: price,
        label: getVolumeLabel(v)
      };
    });
  }
});

console.log(`Total products remediated: ${updatedCount}`);

// Save updated products.json
const jsonOutput = JSON.stringify(products, null, 2) + '\n';
fs.writeFileSync(productsPath, jsonOutput, 'utf8');
console.log('Saved updated products.json successfully.');

// Verification
const reloaded = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
console.log(`Reloaded total products: ${reloaded.length}`);

const reloadedPkw = reloaded.filter(p => p.category === 'motor-oils-pkw');
console.log(`Reloaded motor-oils-pkw count: ${reloadedPkw.length}`);

let syncFailures = 0;
reloaded.forEach((p, index) => {
  const vols = p.volumes || [];
  const packs = p.packs || [];

  if (vols.length !== packs.length) {
    syncFailures++;
    console.error(`[SYNC FAIL] Index ${index} (${p.name}): vols ${vols.length} != packs ${packs.length}`);
  } else {
    for (let i = 0; i < vols.length; i++) {
      if (Number(vols[i]) !== Number(packs[i] && packs[i].volume_l)) {
        syncFailures++;
        console.error(`[SYNC FAIL] Index ${index} (${p.name}): vol[${i}] ${vols[i]} != pack.vol ${packs[i].volume_l}`);
        break;
      }
    }
  }
});

console.log(`Sync failures count: ${syncFailures}`);
if (syncFailures === 0 && reloaded.length === 423 && reloadedPkw.length === 38) {
  console.log('REMEDIATION COMPLETED SUCCESSFULLY WITH 100% PASS!');
} else {
  console.error('REMEDIATION FAILED VERIFICATION!');
}

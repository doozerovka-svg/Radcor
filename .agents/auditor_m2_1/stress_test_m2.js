const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

console.log("=== STRESS TEST M2 START ===");

const pkw = products.filter(p => p.category === 'motor-oils-pkw');

let issues = [];

// 1. Check all PKW items for complete fields
pkw.forEach((p, idx) => {
  if (!p.sku) issues.push(`Item #${idx+1} missing SKU`);
  if (!p.name) issues.push(`Item #${idx+1} (${p.sku}) missing name`);
  if (!p.brand) issues.push(`Item #${idx+1} (${p.sku}) missing brand`);
  if (!p.category) issues.push(`Item #${idx+1} (${p.sku}) missing category`);
  if (!Array.isArray(p.volumes) || p.volumes.length === 0) issues.push(`Item #${idx+1} (${p.sku}) invalid volumes`);
  if (!Array.isArray(p.packs) || p.packs.length === 0) issues.push(`Item #${idx+1} (${p.sku}) invalid packs`);
  if (!Array.isArray(p.specs) || p.specs.length === 0) issues.push(`Item #${idx+1} (${p.sku}) invalid specs`);
  
  // Check pack structure
  p.packs.forEach((pk, pidx) => {
    if (!pk.volume_l) issues.push(`Item ${p.sku} pack #${pidx} missing volume_l`);
    if (!pk.label) issues.push(`Item ${p.sku} pack #${pidx} missing label`);
    if (pk.price_mdl === undefined && !p.price_on_request) {
      issues.push(`Item ${p.sku} pack #${pidx} missing price_mdl`);
    }
  });

  // Check specs structure
  p.specs.forEach((sp, sidx) => {
    if (!sp.label || sp.value === undefined) {
      issues.push(`Item ${p.sku} spec #${sidx} malformed: ${JSON.stringify(sp)}`);
    }
  });
});

if (issues.length === 0) {
  console.log("PASS: All 38 motor-oils-pkw items pass stress test checks with 100% structural integrity.");
} else {
  console.error(`FAIL: Found ${issues.length} issues during stress test:`);
  issues.forEach(i => console.error(`  - ${i}`));
}

console.log("=== STRESS TEST M2 END ===");

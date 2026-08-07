const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

let violations = [];

// 1. Check count of total products
if (products.length !== 423) {
  violations.push(`Expected 423 products, found ${products.length}`);
}

// 2. Check each product for valid packs array matching volumes array
products.forEach((p, index) => {
  if (!p.sku) {
    violations.push(`Product index ${index} missing sku`);
  }
  if (!Array.isArray(p.volumes)) {
    violations.push(`Product ${p.sku} missing volumes array`);
    return;
  }
  if (!Array.isArray(p.packs)) {
    violations.push(`Product ${p.sku} missing packs array`);
    return;
  }
  if (p.volumes.length !== p.packs.length) {
    violations.push(`Product ${p.sku} (${p.name}): volumes length ${p.volumes.length} !== packs length ${p.packs.length}`);
  } else {
    p.volumes.forEach((v, i) => {
      const pack = p.packs[i];
      if (!pack) {
        violations.push(`Product ${p.sku} packs[${i}] is undefined`);
      } else {
        if (pack.volume_l !== v) {
          violations.push(`Product ${p.sku} packs[${i}].volume_l (${pack.volume_l}) !== volumes[${i}] (${v})`);
        }
        if (typeof pack.label !== 'string' || pack.label.trim() === '') {
          violations.push(`Product ${p.sku} packs[${i}].label is invalid or empty`);
        }
      }
    });
  }
});

// 3. Check for specific M2_2 items
const starVL = products.find(p => p.name && p.name.includes('Star VL 0W-30'));
if (!starVL) {
  violations.push('Missing product: MOL Dynamic Star VL 0W-30');
} else {
  console.log('Star VL 0W-30 volumes:', starVL.volumes, 'packs:', starVL.packs);
}

const essenceSL = products.find(p => p.name && p.name.includes('Essence SL 10W-40'));
if (!essenceSL) {
  violations.push('Missing product: MOL Essence SL 10W-40');
} else {
  console.log('Essence SL 10W-40 volumes:', essenceSL.volumes, 'packs:', essenceSL.packs);
}

console.log('Total violations found:', violations.length);
if (violations.length > 0) {
  console.log('Violations list:', violations);
} else {
  console.log('ALL 423 PRODUCTS PASSED EMPIRICAL AUDIT WITH 0 VIOLATIONS!');
}

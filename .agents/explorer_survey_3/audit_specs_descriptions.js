const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

console.log('=== DESCRIPTION FIELDS AUDIT ===');
let hasDescObj = 0;
let hasDescRoProp = 0;
let hasDescString = 0;

products.forEach(p => {
  if (p.description_ro) hasDescRoProp++;
  if (typeof p.description === 'object' && p.description !== null) hasDescObj++;
  if (typeof p.description === 'string') hasDescString++;
});

console.log(`Products with description_ro property: ${hasDescRoProp}`);
console.log(`Products with description as object {ru, ro}: ${hasDescObj}`);
console.log(`Products with description as string: ${hasDescString}`);

// Check PKW items specifically
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`\n=== PKW ITEMS DESCRIPTION AUDIT (${pkw.length} items) ===`);
pkw.forEach((p, idx) => {
  console.log(`\n[${idx + 1}] ID: ${p.id || 'NO_ID'} | Name: ${p.name}`);
  console.log(`  description (RU): ${typeof p.description === 'string' ? p.description.substring(0, 40) + '...' : JSON.stringify(p.description)}`);
  console.log(`  description_ro (RO): ${p.description_ro ? p.description_ro.substring(0, 40) + '...' : 'NONE'}`);
});

console.log(`\n=== PKW ITEMS SPECS & APPROVALS AUDIT ===`);
pkw.forEach((p, idx) => {
  console.log(`\n[${idx + 1}] Name: ${p.name}`);
  if (Array.isArray(p.specs)) {
    p.specs.forEach(s => {
      console.log(`  - [${s.label}]: ${s.value}`);
    });
  } else {
    console.log(`  specs format: ${JSON.stringify(p.specs)}`);
  }
});

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../products.json');
const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

console.log(`Total products: ${data.length}`);

const keyCounts = {};
let countWithId = 0;
let countWithSku = 0;

data.forEach((p, idx) => {
  if (p.id) countWithId++;
  if (p.sku) countWithSku++;
  for (const k of Object.keys(p)) {
    keyCounts[k] = (keyCounts[k] || 0) + 1;
  }
});

console.log(`Products with 'id': ${countWithId}`);
console.log(`Products with 'sku': ${countWithSku}`);
console.log("Key frequency:", keyCounts);

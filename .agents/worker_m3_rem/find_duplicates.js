const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const pkw = products.filter(p => p.category === 'motor-oils-pkw');

console.log('=== PKW Products List (Count: ' + pkw.length + ') ===');
pkw.forEach((p, index) => {
  console.log(`${index + 1}. [${p.sku}] ${p.name}`);
});

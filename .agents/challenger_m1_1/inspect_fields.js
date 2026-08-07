const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('Sample product keys:', Object.keys(products[0]));
console.log('Sample product 0:', products[0]);

// Find product with MOL-1042
const mol1042 = products.find(p => p.sku === 'MOL-1042');
console.log('MOL-1042 full object:', mol1042);

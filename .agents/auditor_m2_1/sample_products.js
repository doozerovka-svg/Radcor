const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

const starVL = products.find(p => p.name === 'MOL Dynamic Star VL 0W-30');
const essenceSL = products.find(p => p.name === 'MOL Essence SL 10W-40');

console.log("Star VL:", JSON.stringify(starVL, null, 2));
console.log("Essence SL:", JSON.stringify(essenceSL, null, 2));

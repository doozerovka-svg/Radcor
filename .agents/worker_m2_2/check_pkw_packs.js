const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf8'));

const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`motor-oils-pkw count: ${pkw.length}`);
console.log('Sample PKW pack:', JSON.stringify(pkw[0].packs, null, 2));

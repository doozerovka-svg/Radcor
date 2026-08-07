const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`Total PKW items: ${pkw.length}`);

pkw.forEach((p, idx) => {
  console.log(`${idx + 1}. ID: ${p.id} | Title: "${p.title}" | Name: "${p.name}"`);
});

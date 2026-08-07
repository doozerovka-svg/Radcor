const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf-8'));

console.log('=== CHECKING RECENTLY ADDED/MODIFIED ITEMS IN PRODUCTS.JSON ===');

const starVL = products.find(p => p.name && p.name.includes('Star VL'));
const essenceSL = products.find(p => p.name && p.name.includes('Essence SL'));

console.log('\nMOL Dynamic Star VL 0W-30 check:');
if (starVL) {
  console.log('Name:', starVL.name);
  console.log('Category:', starVL.category);
  console.log('Volumes:', JSON.stringify(starVL.volumes));
  console.log('Packs:', JSON.stringify(starVL.packs, null, 2));
}

console.log('\nMOL Essence SL 10W-40 check:');
if (essenceSL) {
  console.log('Name:', essenceSL.name);
  console.log('Category:', essenceSL.category);
  console.log('Volumes:', JSON.stringify(essenceSL.volumes));
  console.log('Packs:', JSON.stringify(essenceSL.packs, null, 2));
}

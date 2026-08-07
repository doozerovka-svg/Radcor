const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf8'));

let withPacks = 0;
let keysFreq = {};
products.forEach(p => {
  if (Array.isArray(p.packs) && p.packs.length > 0) {
    withPacks++;
    p.packs.forEach(pack => {
      Object.keys(pack).forEach(k => {
        keysFreq[k] = (keysFreq[k] || 0) + 1;
      });
    });
  }
});

console.log(`Products with non-empty packs: ${withPacks}`);
console.log('Keys frequency in pack objects:', keysFreq);

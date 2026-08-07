const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf8'));

const packKeys = new Set();
products.forEach(p => {
  if (Array.isArray(p.packs)) {
    p.packs.forEach(pack => {
      Object.keys(pack).forEach(k => packKeys.add(k));
    });
  }
});

console.log('Pack keys found across all products:', Array.from(packKeys));

// Sample some packs from different categories
const samples = [];
products.forEach(p => {
  if (Array.isArray(p.packs) && p.packs.length > 0 && samples.length < 10) {
    samples.push({ category: p.category, packSample: p.packs[0] });
  }
});
console.log('Samples:', JSON.stringify(samples, null, 2));

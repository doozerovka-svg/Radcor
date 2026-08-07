const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

// R1 removals:
const removeNames = [
  'Yuko Super Hybrid 0W-16', 'Yuko Syntetic 0W-16', 'MOL Dynamic Gold Ultra 0W-16',
  'Yuko Syntetic 0W-20', 'MOL Dynamic Gold 0W-20', 'MOL Dynamic Gold 0W-20 VAG', 'MOL Dynamic Synt RN17FE 0W-20',
  'Yuko Syntetic 0W-30', 'MOL Dynamic Gold 0W-30', 'MOL Dynamic Star 0W-30',
  'Yuko Syntetic 5W-20', 'MOL Dynamic Gold HUN 5W-30', 'MOL Dynamic Synt 5W-30',
  'MOL Dynamic Gold 5W-40', 'Yuko Vega Synt 5W-40', 'MOL Dynamic Synt RN 5W-40', 'MOL Dynamic Essence DPF 5W-40', 'MOL Essence Multi Gaz 5W-40',
  'Yuko Semisynt 10W-30', 'Yuko Synetic 10W-30', 'MOL Dynamic Synt 10W-30', 'MOL Dynamic Transit 10W-30',
  'MOL 15W-40', 'Yuko Classic 20W-50', 'MOL Dynamic Race R5'
];

// R1 duplicates to remove:
const duplicateMatches = [
  'MOL Dynamic Gold Longlife 0W-30',
  'MOL Dynamic Gold Longlife 5W-30',
  'MOL Essence 5W-30',
  'MOL Dynamic Essence Diesel 5W-40',
  'MOL Dynamic Prima 5W-40',
  'MOL Essence 5W-40',
  'MOL Essence Diesel 10W-40'
];

const pkw = products.filter(p => p.category === 'motor-oils-pkw');

console.log(`Initial PKW count: ${pkw.length}`);

// Inspect all PKW product names & IDs
pkw.forEach((p, i) => {
  console.log(`[${i+1}] ID: ${p.id || 'N/A'} | SKU: ${p.sku || 'N/A'} | Name: "${p.name}"`);
});

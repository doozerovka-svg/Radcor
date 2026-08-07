const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`Total products in products.json: ${products.length}`);

// Count by category
const categoryCounts = {};
products.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});
console.log('Category breakdown:', categoryCounts);

// Find MOL-1042
const mol1042 = products.find(p => p.sku === 'MOL-1042');
console.log('MOL-1042 product:', mol1042 ? { sku: mol1042.sku, title: mol1042.title, category: mol1042.category } : 'Not found');

// Check SKU uniqueness
const skuMap = {};
const duplicateSKUs = [];
products.forEach(p => {
  if (skuMap[p.sku]) {
    duplicateSKUs.push(p.sku);
  } else {
    skuMap[p.sku] = true;
  }
});
console.log(`Duplicate SKUs count: ${duplicateSKUs.length}`);
if (duplicateSKUs.length > 0) {
  console.log('Duplicate SKUs:', duplicateSKUs);
}

// Discontinued titles/names to check
const discontinuedNames = [
  'Yuko Super Hybrid 0W-16', 'Yuko Syntetic 0W-16', 'Yuko Synthetic 0W-16', 'MOL Dynamic Gold Ultra 0W-16',
  'Yuko Syntetic 0W-20', 'MOL Dynamic Gold 0W-20', 'MOL Dynamic Gold 0W-20 VAG', 'MOL Dynamic Synt RN17FE 0W-20',
  'Yuko Syntetic 0W-30', 'MOL Dynamic Gold 0W-30', 'MOL Dynamic Star 0W-30',
  'Yuko Syntetic 5W-20', 'MOL Dynamic Gold HUN 5W-30', 'MOL Dynamic Synt 5W-30',
  'MOL Dynamic Gold 5W-40', 'Yuko Vega Synt 5W-40', 'MOL Dynamic Synt RN 5W-40', 'MOL Dynamic Essence DPF 5W-40', 'MOL Essence Multi Gaz 5W-40',
  'Yuko Semisynt 10W-30', 'Yuko Synetic 10W-30', 'MOL Dynamic Synt 10W-30', 'MOL Dynamic Transit 10W-30',
  'MOL 15W-40', 'Yuko Classic 20W-50', 'MOL Dynamic Race R5'
];

const foundDiscontinued = products.filter(p => discontinuedNames.some(name => p.title.toLowerCase().includes(name.toLowerCase())));
console.log(`Found discontinued products count: ${foundDiscontinued.length}`);
if (foundDiscontinued.length > 0) {
  console.log('Found discontinued items:', foundDiscontinued.map(p => ({ sku: p.sku, title: p.title })));
}

// Check motor-oils-pkw products
const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`PKW products count: ${pkwProducts.length}`);

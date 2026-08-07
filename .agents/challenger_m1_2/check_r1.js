const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../products.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

const R1_DISCONTINUED = [
  "Yuko Super Hybrid 0W-16", "Yuko Syntetic 0W-16", "MOL Dynamic Gold Ultra 0W-16",
  "Yuko Syntetic 0W-20", "MOL Dynamic Gold 0W-20", "MOL Dynamic Gold 0W-20 VAG", "MOL Dynamic Synt RN17FE 0W-20",
  "Yuko Syntetic 0W-30", "MOL Dynamic Gold 0W-30", "MOL Dynamic Star 0W-30",
  "Yuko Syntetic 5W-20", "MOL Dynamic Gold HUN 5W-30", "MOL Dynamic Synt 5W-30",
  "MOL Dynamic Gold 5W-40", "Yuko Vega Synt 5W-40", "MOL Dynamic Synt RN 5W-40", "MOL Dynamic Essence DPF 5W-40", "MOL Essence Multi Gaz 5W-40",
  "Yuko Semisynt 10W-30", "Yuko Synetic 10W-30", "MOL Dynamic Synt 10W-30", "MOL Dynamic Transit 10W-30",
  "MOL 15W-40", "Yuko Classic 20W-50", "MOL Dynamic Race R5"
];

const R1_DUPLICATES = [
  "MOL Dynamic Gold Longlife 0W-30", "MOL Dynamic Gold Longlife 5W-30", "MOL Essence 5W-30", 
  "MOL Dynamic Essence Diesel 5W-40", "MOL Dynamic Prima 5W-40", "MOL Essence 5W-40", 
  "MOL Essence Diesel 10W-40"
];

console.log("=== CHECKING DISCONTINUED ITEMS IN MOTOR-OILS-PKW ===");
const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`Total PKW products: ${pkwProducts.length}`);

R1_DISCONTINUED.forEach(name => {
  const inPkw = pkwProducts.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
  const inAll = products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
  if (inPkw) {
    console.log(`[DISCONTINUED PRESENT IN PKW] ${name} (SKU: ${inPkw.sku})`);
  } else if (inAll) {
    console.log(`[DISCONTINUED PRESENT IN OTHER CAT] ${name} (Category: ${inAll.category}, SKU: ${inAll.sku})`);
  } else {
    console.log(`[CLEARED] ${name}`);
  }
});

console.log("\n=== LISTING ALL PKW PRODUCTS ===");
pkwProducts.forEach((p, i) => {
  console.log(`${i + 1}. [${p.sku}] ${p.name}`);
});

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const productsPath = path.join(rootDir, 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`=== PRODUCTS.JSON OVERALL STATS ===`);
console.log(`Total items in products.json: ${products.length}`);

// Category breakdown
const categoryCounts = {};
products.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});
console.log('Category counts:', JSON.stringify(categoryCounts, null, 2));

// 1. Inspect PKW items and MOL Arol 2T
const pkwItems = products.filter(p => p.category === 'motor-oils-pkw');
const arolItems = products.filter(p => p.id === 'mol-arol-2t' || (p.name && p.name.includes('Arol')));

console.log(`\n=== MOTOR-OILS-PKW ITEMS (${pkwItems.length}) ===`);

// Let's check description structures for PKW items
let pkwDescStringCount = 0;
let pkwDescObjCount = 0;
let pkwMissingRuCount = 0;
let pkwMissingRoCount = 0;

pkwItems.forEach(p => {
  if (typeof p.description === 'string') {
    pkwDescStringCount++;
  } else if (typeof p.description === 'object' && p.description !== null) {
    pkwDescObjCount++;
    if (!p.description.ru) pkwMissingRuCount++;
    if (!p.description.ro) pkwMissingRoCount++;
  } else {
    pkwMissingRuCount++;
    pkwMissingRoCount++;
  }
});

console.log(`Description stats in PKW:`);
console.log(`  String descriptions: ${pkwDescStringCount}`);
console.log(`  Object descriptions: ${pkwDescObjCount}`);
console.log(`  Missing RU: ${pkwMissingRuCount}`);
console.log(`  Missing RO: ${pkwMissingRoCount}`);

// Inspect specs structure across PKW items
let arraySpecsCount = 0;
let objectSpecsCount = 0;
let missingSpecsCount = 0;

pkwItems.forEach(p => {
  if (!p.specs) {
    missingSpecsCount++;
  } else if (Array.isArray(p.specs)) {
    arraySpecsCount++;
  } else if (typeof p.specs === 'object') {
    objectSpecsCount++;
  }
});

console.log(`\nSpecs format stats in PKW:`);
console.log(`  Array format [{label, value}]: ${arraySpecsCount}`);
console.log(`  Object format {Key: Value}: ${objectSpecsCount}`);
console.log(`  Missing specs: ${missingSpecsCount}`);

// Inspect OEM Approvals location and integrity
let approvalsInRoot = 0;
let approvalsInSpecs = 0;
let missingApprovals = 0;

pkwItems.forEach(p => {
  const rootApp = p.approvals || p.approvals_ru || p.approvals_ro;
  let specApp = null;
  if (Array.isArray(p.specs)) {
    const item = p.specs.find(s => s.label === 'Допуски' || s.label === 'Approvals' || s.label === 'Спецификации');
    if (item) specApp = item.value;
  } else if (typeof p.specs === 'object' && p.specs !== null) {
    specApp = p.specs.Approvals || p.specs.Допуски || p.specs['OEM Approvals'];
  }

  if (rootApp) approvalsInRoot++;
  if (specApp) approvalsInSpecs++;
  if (!rootApp && !specApp) missingApprovals++;
});

console.log(`\nApprovals location in PKW:`);
console.log(`  Root property (approvals/approvals_ru/ro): ${approvalsInRoot}`);
console.log(`  Inside specs: ${approvalsInSpecs}`);
console.log(`  Missing approvals: ${missingApprovals}`);

// Details of all PKW items
console.log(`\n=== DETAILED LIST OF PKW ITEMS ===`);
pkwItems.forEach((p, idx) => {
  console.log(`\n[${idx + 1}] ID: ${p.id || 'NO_ID'} | Name: ${p.name}`);
  console.log(`    Category: ${p.category}`);
  console.log(`    Desc type: ${typeof p.description === 'object' && p.description !== null ? 'Object { ' + Object.keys(p.description).join(', ') + ' }' : typeof p.description}`);
  if (typeof p.description === 'object' && p.description !== null) {
    console.log(`    RU desc: ${p.description.ru ? 'Present (' + p.description.ru.length + ' chars)' : 'MISSING'}`);
    console.log(`    RO desc: ${p.description.ro ? 'Present (' + p.description.ro.length + ' chars)' : 'MISSING'}`);
  } else if (typeof p.description === 'string') {
    console.log(`    String desc: ${p.description.substring(0, 60)}...`);
  }
  console.log(`    Root Approvals: ${p.approvals || p.approvals_ru || 'NONE'}`);
  console.log(`    Specs: ${JSON.stringify(p.specs)}`);
  console.log(`    Volumes: ${JSON.stringify(p.volumes)}`);
});

// Check MOL Arol 2T specifically
console.log(`\n=== MOL AROL 2T CHECK ===`);
arolItems.forEach(p => {
  console.log(`ID: ${p.id} | Name: ${p.name} | Category: ${p.category}`);
});

const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');

console.log('=== EMPIRICAL TEST SUITE FOR M1 DATA INTEGRITY ===\n');

const testResults = [];

function recordTest(testName, passed, details) {
  testResults.push({ testName, passed, details });
  const statusSymbol = passed ? '[PASS]' : '[FAIL]';
  console.log(`${statusSymbol} ${testName}`);
  if (details) {
    console.log(`  Details: ${details}`);
  }
}

// 1. File existence and JSON Parsing
let products = [];
try {
  const rawData = fs.readFileSync(productsPath, 'utf8');
  products = JSON.parse(rawData);
  recordTest('JSON Parse & File Existence', true, `Successfully loaded products.json (${products.length} items)`);
} catch (err) {
  recordTest('JSON Parse & File Existence', false, `Failed to load/parse products.json: ${err.message}`);
  process.exit(1);
}

// 2. Exact Total Product Count (421)
const expectedTotalCount = 421;
if (products.length === expectedTotalCount) {
  recordTest(`Total Product Count === ${expectedTotalCount}`, true, `Total product count is exactly ${products.length}`);
} else {
  recordTest(`Total Product Count === ${expectedTotalCount}`, false, `Expected ${expectedTotalCount}, found ${products.length}`);
}

// 3. Schema & Data Consistency across all 421 products
const validCategories = new Set([
  'coolants',
  'auto-chemistry',
  'transmission-oils',
  'motor-oils-pkw',
  'industrial-lubricants',
  'motor-oils-lkw',
  'moto-oils',
  'accessories',
  'brake-fluids',
  'greases',
  'hydraulic-oils'
]);

let schemaFailures = 0;
const schemaErrorDetails = [];

products.forEach((p, idx) => {
  if (!p || typeof p !== 'object') {
    schemaFailures++;
    schemaErrorDetails.push(`Item at index ${idx} is not an object`);
    return;
  }
  if (!p.sku || typeof p.sku !== 'string' || p.sku.trim() === '') {
    schemaFailures++;
    schemaErrorDetails.push(`Item index ${idx} missing valid SKU`);
  }
  if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
    schemaFailures++;
    schemaErrorDetails.push(`Item SKU ${p.sku || idx} missing valid name`);
  }
  if (!p.category || !validCategories.has(p.category)) {
    schemaFailures++;
    schemaErrorDetails.push(`Item SKU ${p.sku || idx} has invalid category: '${p.category}'`);
  }
  if (p.volumes && !Array.isArray(p.volumes)) {
    schemaFailures++;
    schemaErrorDetails.push(`Item SKU ${p.sku || idx} volumes is not an array`);
  }
  if (p.packs && !Array.isArray(p.packs)) {
    schemaFailures++;
    schemaErrorDetails.push(`Item SKU ${p.sku || idx} packs is not an array`);
  }
});

if (schemaFailures === 0) {
  recordTest('Schema & Data Consistency (All 421 Products)', true, `All ${products.length} products passed structural & field validations.`);
} else {
  recordTest('Schema & Data Consistency (All 421 Products)', false, `${schemaFailures} items failed schema check: ${schemaErrorDetails.slice(0, 5).join('; ')}`);
}

// 4. Unique SKU Constraint
const skuCounts = {};
const duplicatesFound = [];

products.forEach(p => {
  if (p.sku) {
    skuCounts[p.sku] = (skuCounts[p.sku] || 0) + 1;
  }
});

Object.keys(skuCounts).forEach(sku => {
  if (skuCounts[sku] > 1) {
    duplicatesFound.push(`${sku} (count: ${skuCounts[sku]})`);
  }
});

if (duplicatesFound.length === 0) {
  recordTest('Unique SKU Constraint Across All Products', true, `All ${Object.keys(skuCounts).length} SKUs are 100% unique.`);
} else {
  recordTest('Unique SKU Constraint Across All Products', false, `Found duplicate SKUs: ${duplicatesFound.join(', ')}`);
}

// 5. Discontinued SKUs Verification (25 SKUs)
const discontinuedSKUs = [
  'YUKO-HYBRID-0W16', 'YUKO-SYNETIC-0W16', 'MOL-1080', 'YUKO-SYNETIC-0W20', 'MOL-DYN-GOLD-0W20',
  'MOL-DYN-GOLD-0W20-VAG', 'MOL-1067', 'YUKO-SYNETIC-0W30', 'MOL-DYN-GOLD-0W30', 'MOL-1000',
  'YUKO-SYNETIC-5W20', 'MOL-DYN-GOLD-HUN-5W30', 'MOL-1028', 'MOL-DYN-GOLD-5W40', 'YUKO-VEGA-5W40',
  'MOL-DYN-SYNT-RN-5W40', 'MOL-DYN-ESS-DPF-5W40', 'MOL-1065', 'YUKO-SEMISYNT-10W30', 'YUKO-SYNETIC-10W30',
  'MOL-SYNT-10W30', 'MOL-1081', 'MOL-15W40-MIN', 'YUKO-CLASSIC-20W50', 'MOL-1064'
];

const remainingDiscontinued = products.filter(p => discontinuedSKUs.includes(p.sku));
if (remainingDiscontinued.length === 0) {
  recordTest('Zero References to 25 Discontinued SKUs', true, '0 discontinued SKUs found in products.json.');
} else {
  recordTest('Zero References to 25 Discontinued SKUs', false, `Found ${remainingDiscontinued.length} discontinued SKUs: ${remainingDiscontinued.map(p => p.sku).join(', ')}`);
}

// 6. Duplicate SKUs Removal Verification (10 SKUs)
const duplicateSKUs = [
  'MOL-1073', 'MOL-DYN-GOLD-LONGLIFE-5W30', 'MOL-1071', 'MOL-1053', 'MOL-DYN-ESS-DIESEL-5W40',
  'MOL-1062', 'MOL-1074', 'MOL-1010', 'MOL-ESSENCE-10W40', 'MOL-1056'
];

const remainingDuplicates = products.filter(p => duplicateSKUs.includes(p.sku));
if (remainingDuplicates.length === 0) {
  recordTest('Zero References to 10 Duplicate SKUs', true, '0 target duplicate SKUs found in products.json.');
} else {
  recordTest('Zero References to 10 Duplicate SKUs', false, `Found ${remainingDuplicates.length} duplicate SKUs: ${remainingDuplicates.map(p => p.sku).join(', ')}`);
}

// 7. MOL-1042 Category === 'moto-oils'
const mol1042 = products.find(p => p.sku === 'MOL-1042');
if (mol1042 && mol1042.category === 'moto-oils') {
  recordTest("MOL-1042 category === 'moto-oils'", true, `MOL-1042 ('${mol1042.name}') is categorized as '${mol1042.category}'`);
} else if (!mol1042) {
  recordTest("MOL-1042 category === 'moto-oils'", false, 'MOL-1042 not found in dataset!');
} else {
  recordTest("MOL-1042 category === 'moto-oils'", false, `MOL-1042 category is '${mol1042.category}', expected 'moto-oils'`);
}

// 8. motor-oils-pkw Category Count === 36
const pkwCount = products.filter(p => p.category === 'motor-oils-pkw').length;
if (pkwCount === 36) {
  recordTest('motor-oils-pkw Product Count === 36', true, `Exactly ${pkwCount} items remain in motor-oils-pkw.`);
} else {
  recordTest('motor-oils-pkw Product Count === 36', false, `Expected 36 items in motor-oils-pkw, found ${pkwCount}.`);
}

// Summary Assessment
const totalTests = testResults.length;
const passedTests = testResults.filter(r => r.passed).length;
const failedTests = totalTests - passedTests;

console.log('\n=== TEST SUMMARY ===');
console.log(`Passed: ${passedTests}/${totalTests}`);
console.log(`Failed: ${failedTests}/${totalTests}`);

if (failedTests === 0) {
  console.log('\nFINAL VERDICT: APPROVE');
} else {
  console.log('\nFINAL VERDICT: REJECT');
}

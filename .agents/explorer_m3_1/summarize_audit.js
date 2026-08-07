const fs = require('fs');
const path = require('path');

const auditData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'audit_data.json'), 'utf-8'));

console.log('=== OVERALL SUMMARY ===');
console.log(`Total products in motor-oils-pkw: ${auditData.length}`);

let completeCount = 0;
let incompleteCount = 0;
let missingAllSpecsCount = 0;

const missingFieldsStats = {
  'Вязкость': 0,
  'Класс': 0,
  'Допуски': 0,
  'Плотность при 15°C': 0,
  'Температура вспышки (по Кливленду)': 0,
  'Температура застывания': 0
};

auditData.forEach(item => {
  if (item.specsCount === 0) {
    missingAllSpecsCount++;
  }
  if (item.missingKeys.length === 0) {
    completeCount++;
  } else {
    incompleteCount++;
  }
  item.missingKeys.forEach(k => {
    if (missingFieldsStats[k] !== undefined) {
      missingFieldsStats[k]++;
    }
  });
});

console.log(`Products with ALL 6 required specs: ${completeCount}`);
console.log(`Products missing 1 or more specs: ${incompleteCount}`);
console.log(`Products with 0 specs (empty specs array): ${missingAllSpecsCount}`);

console.log('\n=== MISSING FIELDS BREAKDOWN ===');
for (const [key, count] of Object.entries(missingFieldsStats)) {
  console.log(`- "${key}": missing in ${count} / ${auditData.length} products (${((count / auditData.length) * 100).toFixed(1)}%)`);
}

console.log('\n=== PRODUCT DETAILS LISTING ===');
auditData.forEach(item => {
  console.log(`\nItem #${item.index} | SKU: ${item.sku} | Name: "${item.name}"`);
  console.log(`  Brand: ${item.brand} | Specs Count: ${item.specsCount}`);
  console.log(`  Present Spec Keys: ${item.presentKeys.join(', ') || 'NONE'}`);
  if (item.missingKeys.length > 0) {
    console.log(`  MISSING Spec Keys: ${item.missingKeys.join(', ')}`);
  }
  if (item.specMap['Допуски']) {
    console.log(`  [Допуски]: "${item.specMap['Допуски']}"`);
  } else {
    console.log(`  [Допуски]: MISSING`);
  }
});

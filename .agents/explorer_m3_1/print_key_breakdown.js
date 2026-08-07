const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'detailed_report.json'), 'utf-8'));

console.log('=== KEY COVERAGE ACROSS ALL 38 PKW PRODUCTS ===');
for (const [key, count] of Object.entries(report.keyCoverage)) {
  console.log(`Key "${key}": ${count} / ${report.totalCount} products present (${((count / report.totalCount) * 100).toFixed(1)}%), MISSING in ${report.totalCount - count}`);
}

console.log('\n=== DETAILED ITEM BREAKDOWN (38 ITEMS) ===');
report.incompleteSpecs.forEach(item => {
  console.log(`Item #${item.index} [SKU: ${item.sku}] "${item.name}"`);
  console.log(`  Present (${item.presentKeys.length}): ${item.presentKeys.join(', ')}`);
  console.log(`  MISSING (${item.missingKeys.length}): ${item.missingKeys.join(', ')}`);
  console.log(`  OEM string: ${item.oemApprovalRaw ? `"${item.oemApprovalRaw}"` : 'MISSING'}`);
  console.log('---');
});

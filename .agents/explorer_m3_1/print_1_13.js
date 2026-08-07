const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'detailed_report.json'), 'utf-8'));

console.log('=== ITEMS 1 TO 13 BREAKDOWN ===');
report.incompleteSpecs.slice(0, 13).forEach(item => {
  console.log(`Item #${item.index} [SKU: ${item.sku}] "${item.name}"`);
  console.log(`  Present (${item.presentKeys.length}): ${item.presentKeys.join(', ')}`);
  console.log(`  MISSING (${item.missingKeys.length}): ${item.missingKeys.join(', ')}`);
  console.log(`  OEM string: ${item.oemApprovalRaw ? `"${item.oemApprovalRaw}"` : 'MISSING'}`);
  console.log('---');
});

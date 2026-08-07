const fs = require('fs');
const path = require('path');

const auditData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'audit_data.json'), 'utf-8'));

console.log('=== ITEMS 1 TO 17 ===');
auditData.slice(0, 17).forEach(item => {
  console.log(`Item #${item.index} | SKU: ${item.sku} | Name: "${item.name}"`);
  console.log(`  Brand: ${item.brand} | Specs Count: ${item.specsCount}`);
  console.log(`  Present Spec Keys: ${item.presentKeys.join(', ') || 'NONE'}`);
  if (item.missingKeys.length > 0) {
    console.log(`  MISSING Spec Keys: ${item.missingKeys.join(', ')}`);
  }
  console.log(`  [Допуски]: "${item.specMap['Допуски'] || 'MISSING'}"\n`);
});

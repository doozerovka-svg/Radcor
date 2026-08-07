const fs = require('fs');

const results = JSON.parse(fs.readFileSync('c:/Users/DenCrut/Documents/radcor.md/.agents/explorer_m3_2/pkw_audit_results.json', 'utf8'));

results.forEach(r => {
  console.log(`### ${r.num}. ${r.name} (SKU: ${r.sku})`);
  console.log(`- **RU Description**: "${r.desc_ru}"`);
  console.log(`- **RO Description**: "${r.desc_ro}"`);
  if (r.issues.length > 0) {
    console.log(`- **Issues**: ${r.issues.join(' | ')}`);
  }
  if (r.warnings.length > 0) {
    console.log(`- **Warnings**: ${r.warnings.join(' | ')}`);
  }
  if (r.issues.length === 0 && r.warnings.length === 0) {
    console.log(`- **Status**: ✅ Clean (No issues)`);
  }
  console.log('');
});

const fs = require('fs');

const results = JSON.parse(fs.readFileSync('c:/Users/DenCrut/Documents/radcor.md/.agents/explorer_m3_2/pkw_audit_results.json', 'utf8'));

let out = `FULL AUDIT SUMMARY FOR MOTOR-OILS-PKW (${results.length} PRODUCTS)\n\n`;

results.forEach(r => {
  out += `[${r.num}/${results.length}] SKU: ${r.sku} | Name: "${r.name}"\n`;
  out += `  RU: "${r.desc_ru}"\n`;
  out += `  RO: "${r.desc_ro}"\n`;
  if (r.issues.length > 0) {
    out += `  ❌ ISSUES: ${r.issues.join(' | ')}\n`;
  }
  if (r.warnings.length > 0) {
    out += `  ⚠️ WARNINGS: ${r.warnings.join(' | ')}\n`;
  }
  if (r.issues.length === 0 && r.warnings.length === 0) {
    out += `  ✅ STATUS: Clean\n`;
  }
  out += `\n`;
});

fs.writeFileSync('c:/Users/DenCrut/Documents/radcor.md/.agents/explorer_m3_2/full_audit_summary.txt', out, 'utf8');
console.log('Saved full audit summary to full_audit_summary.txt');

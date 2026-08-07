const data = require('./full_audit_data.json');
const fs = require('fs');
const path = require('path');

let output = '';
const log = (msg) => { output += msg + '\n'; };

log('======================================================================');
log('RADCOR E2E AUDIT - 11 HTML FILES COMPREHENSIVE ANALYSIS');
log('======================================================================\n');

// AREA 1 & 2: Versioning & Script Order
log('### AREA 1 & 2: ASSET VERSIONING (?v=36.0) & SCRIPT ORDER\n');
for (const [file, info] of Object.entries(data)) {
  log(`--- ${file} ---`);
  log('CSS / Link Tags:');
  info.links.forEach(l => {
    log(`  ${l}`);
  });
  log('Script Tags (Order preserved):');
  info.scripts.forEach((s, idx) => {
    log(`  [${idx + 1}] ${s.full}`);
  });
  log('');
}

// AREA 3: Forms in checkout.html & contacts.html
log('======================================================================');
log('### AREA 3: FORMS, FIELD IDs & SUBMISSION HANDLERS\n');

['checkout.html', 'contacts.html'].forEach(f => {
  log(`--- ${f} ---`);
  const info = data[f];
  log(`Forms found: ${info.forms.length}`);
  info.forms.forEach((form, i) => {
    log(`Form #${i + 1} tag: ${form.formTag}`);
    log('Inputs/Controls:');
    form.inputs.forEach(inp => log(`  - ${inp}`));
  });
  log(`Standalone inputs/buttons found: ${info.standaloneInputs.length}`);
  info.standaloneInputs.forEach(inp => log(`  - ${inp}`));
  log('');
});

// AREA 4: Language Switcher & i18n Attributes
log('======================================================================');
log('### AREA 4: LANGUAGE SWITCHER & i18n ATTRIBUTES\n');

for (const [file, info] of Object.entries(data)) {
  log(`--- ${file} ---`);
  log(`Lang Switcher Container Present: ${info.langSwitcher.hasContainer}`);
  if (info.langSwitcher.containerHTML) {
    log(`  Container HTML: ${info.langSwitcher.containerHTML.replace(/\n/g, ' ')}`);
  }
  log(`Lang Links (${info.langSwitcher.langLinks.length}):`);
  info.langSwitcher.langLinks.forEach(ll => log(`  - ${ll.full} (text: "${ll.text}")`));
  log(`i18n Attribute Counts:`);
  log(`  data-i18n: ${info.i18n.dataI18n.length}`);
  log(`  data-i18n-placeholder: ${info.i18n.dataI18nPlaceholder.length} -> [${info.i18n.dataI18nPlaceholder.join(', ')}]`);
  log(`  data-i18n-title: ${info.i18n.dataI18nTitle.length} -> [${info.i18n.dataI18nTitle.join(', ')}]`);
  log('');
}

fs.writeFileSync(path.join(__dirname, 'summary_output.txt'), output);
console.log('Summary output generated.');

const fs = require('fs');

const prodData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const patchData = JSON.parse(fs.readFileSync('.agents/explorer_m3_3/m3_patch_spec.json', 'utf8'));

const items = Array.isArray(prodData) ? prodData : prodData.products;
const pkw = items.filter(p => p.category === 'motor-oils-pkw');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

console.log('=== VALIDATION OF M3 PATCH SPEC ===');
console.log('PKW items count in products.json:', pkw.length);
console.log('Patch items count:', patchData.length);

let errors = 0;

if (pkw.length !== patchData.length) {
  console.error(`ERROR: Count mismatch! PKW: ${pkw.length}, Patch: ${patchData.length}`);
  errors++;
}

const requiredLabels = [
  "Вязкость",
  "Класс",
  "Допуски",
  "Плотность при 15°C",
  "Температура вспышки (по Кливленду)",
  "Температура застывания"
];

patchData.forEach((item, i) => {
  const pkwMatch = pkw.find(p => p.sku === item.sku);
  if (!pkwMatch) {
    console.error(`[Item ${i+1}] SKU ${item.sku} not found in products.json!`);
    errors++;
    return;
  }

  // Check emoji
  const str = JSON.stringify(item);
  if (emojiRegex.test(str)) {
    console.error(`[Item ${i+1}] Emoji detected in product ${item.sku}!`);
    errors++;
  }

  // Check descriptions
  if (!item.description || item.description.trim().length === 0) {
    console.error(`[Item ${i+1}] SKU ${item.sku} missing description!`);
    errors++;
  }
  if (!item.description_ro || item.description_ro.trim().length === 0) {
    console.error(`[Item ${i+1}] SKU ${item.sku} missing description_ro!`);
    errors++;
  }

  // Check specs
  const itemLabels = item.specs.map(s => s.label);
  requiredLabels.forEach(lbl => {
    if (!itemLabels.includes(lbl)) {
      console.error(`[Item ${i+1}] SKU ${item.sku} missing spec label: ${lbl}`);
      errors++;
    }
  });
});

if (errors === 0) {
  console.log('ALL QA CHECKS PASSED PERFECTLY! ZERO ERRORS FOUND.');
} else {
  console.error(`VALIDATION FAILED WITH ${errors} ERRORS.`);
}

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

// List of 33 target retained products after R1 & R2
// Let's inspect all items in products.json currently and check which ones have complete R3 data
const allPkw = products.filter(p => p.category === 'motor-oils-pkw' || (p.id && p.id.includes('arol')) || (p.name && p.name.includes('Arol')));

console.log(`=== FULL AUDIT OF R3 DATA IN PRODUCTS.JSON FOR ALL ${allPkw.length} PKW/AROL ITEMS ===`);

let missingRuDesc = 0;
let missingRoDesc = 0;
let missingApprovals = 0;
let missingViscosity = 0;
let missingClass = 0;
let missingDensity = 0;
let missingFlashPoint = 0;
let missingPourPoint = 0;

allPkw.forEach((p, idx) => {
  const name = p.name || 'UNKNOWN';
  const sku = p.sku || 'N/A';
  const ruDesc = p.description || '';
  const roDesc = p.description_ro || '';

  const specs = Array.isArray(p.specs) ? p.specs : [];

  const getSpec = (labels) => {
    const found = specs.find(s => labels.includes(s.label));
    return found ? found.value : null;
  };

  const viscosity = getSpec(['Вязкость', 'Viscosity']);
  const klass = getSpec(['Класс', 'Class']);
  const approvals = getSpec(['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски']) || p.approvals || p.approvals_ru;
  const density = getSpec(['Плотность при 15°C', 'Плотность', 'Density']);
  const flash = getSpec(['Температура вспышки (по Кливленду)', 'Температура вспышки', 'Flash point']);
  const pour = getSpec(['Температура застывания', 'Pour point']);

  const missing = [];
  if (!ruDesc) { missingRuDesc++; missing.push('RU_desc'); }
  if (!roDesc) { missingRoDesc++; missing.push('RO_desc'); }
  if (!approvals) { missingApprovals++; missing.push('Approvals'); }
  if (!viscosity) { missingViscosity++; missing.push('Viscosity'); }
  if (!klass) { missingClass++; missing.push('Class'); }
  if (!density) { missingDensity++; missing.push('Density'); }
  if (!flash) { missingFlashPoint++; missing.push('FlashPoint'); }
  if (!pour) { missingPourPoint++; missing.push('PourPoint'); }

  console.log(`[${idx+1}] SKU: ${sku} | Name: "${name}"`);
  console.log(`     Category: ${p.category}`);
  console.log(`     RU desc: ${ruDesc ? 'YES (' + ruDesc.substring(0, 30) + '...)' : 'NO'}`);
  console.log(`     RO desc: ${roDesc ? 'YES (' + roDesc.substring(0, 30) + '...)' : 'NO'}`);
  console.log(`     Viscosity: ${viscosity || 'MISSING'}`);
  console.log(`     Class: ${klass || 'MISSING'}`);
  console.log(`     Approvals: ${approvals ? approvals.substring(0, 40) + '...' : 'MISSING'}`);
  console.log(`     Density: ${density || 'MISSING'}`);
  console.log(`     Flash Point: ${flash || 'MISSING'}`);
  console.log(`     Pour Point: ${pour || 'MISSING'}`);
  if (missing.length > 0) {
    console.log(`     ⚠️ Missing fields: ${missing.join(', ')}`);
  }
});

console.log(`\n=== SUMMARY OF MISSING R3 FIELDS ACROSS ALL PKW ITEMS (${allPkw.length}) ===`);
console.log(`Missing RU Description: ${missingRuDesc}`);
console.log(`Missing RO Description: ${missingRoDesc}`);
console.log(`Missing Approvals: ${missingApprovals}`);
console.log(`Missing Viscosity: ${missingViscosity}`);
console.log(`Missing Class: ${missingClass}`);
console.log(`Missing Density: ${missingDensity}`);
console.log(`Missing Flash Point: ${missingFlashPoint}`);
console.log(`Missing Pour Point: ${missingPourPoint}`);

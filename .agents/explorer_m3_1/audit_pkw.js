const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');

console.log(`Total motor-oils-pkw products count: ${pkwProducts.length}`);

const requiredSpecKeys = [
  'Вязкость',
  'Класс',
  'Допуски',
  'Плотность при 15°C',
  'Температура вспышки (по Кливленду)',
  'Температура застывания'
];

const auditResults = pkwProducts.map((p, idx) => {
  const specs = p.specs || [];
  const specMap = {};
  specs.forEach(s => {
    specMap[s.label] = s.value;
  });

  const missingKeys = requiredSpecKeys.filter(key => !specMap[key] || specMap[key].trim() === '');
  const presentKeys = requiredSpecKeys.filter(key => specMap[key] && specMap[key].trim() !== '');

  // Check extra keys in specs if any
  const extraKeys = Object.keys(specMap).filter(key => !requiredSpecKeys.includes(key));

  return {
    index: idx + 1,
    sku: p.sku,
    name: p.name,
    name_ro: p.name_ro || null,
    brand: p.brand,
    has_description: Boolean(p.description && p.description.trim()),
    has_description_ro: Boolean(p.description_ro && p.description_ro.trim()),
    specsCount: specs.length,
    presentKeys,
    missingKeys,
    extraKeys,
    specMap,
    allSpecs: specs
  };
});

fs.writeFileSync(
  path.resolve(__dirname, 'audit_data.json'),
  JSON.stringify(auditResults, null, 2),
  'utf-8'
);

console.log('Audit completed. Written to audit_data.json');

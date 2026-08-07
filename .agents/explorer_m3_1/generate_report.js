const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf-8'));
const pkw = products.filter(p => p.category === 'motor-oils-pkw');

const requiredKeys = [
  'Вязкость',
  'Класс',
  'Допуски',
  'Плотность при 15°C',
  'Температура вспышки (по Кливленду)',
  'Температура застывания'
];

const report = {
  totalCount: pkw.length,
  completeSpecs: [],
  incompleteSpecs: [],
  zeroSpecs: [],
  rule2Compliance: [],
  keyCoverage: {
    'Вязкость': 0,
    'Класс': 0,
    'Допуски': 0,
    'Плотность при 15°C': 0,
    'Температура вспышки (по Кливленду)': 0,
    'Температура застывания': 0
  }
};

pkw.forEach((p, idx) => {
  const specs = p.specs || [];
  const specMap = {};
  specs.forEach(s => {
    specMap[s.label] = s.value;
  });

  const present = requiredKeys.filter(k => specMap[k] !== undefined && specMap[k] !== null && String(specMap[k]).trim() !== '');
  const missing = requiredKeys.filter(k => specMap[k] === undefined || specMap[k] === null || String(specMap[k]).trim() === '');

  present.forEach(k => report.keyCoverage[k]++);

  const itemSummary = {
    index: idx + 1,
    sku: p.sku,
    name: p.name,
    name_ro: p.name_ro || null,
    brand: p.brand,
    specsCount: specs.length,
    presentKeys: present,
    missingKeys: missing,
    oemApprovalRaw: specMap['Допуски'] || null,
    viscosityRaw: specMap['Вязкость'] || null,
    classRaw: specMap['Класс'] || null,
    densityRaw: specMap['Плотность при 15°C'] || null,
    flashPointRaw: specMap['Температура вспышки (по Кливленду)'] || null,
    pourPointRaw: specMap['Температура застывания'] || null,
    hasDescriptionRU: Boolean(p.description && p.description.trim()),
    hasDescriptionRO: Boolean(p.description_ro && p.description_ro.trim())
  };

  if (specs.length === 0) {
    report.zeroSpecs.push(itemSummary);
  }

  if (missing.length === 0) {
    report.completeSpecs.push(itemSummary);
  } else {
    report.incompleteSpecs.push(itemSummary);
  }

  // Check Rule 2: OEM Approval must be a raw string, not array or object, not empty if present
  if (specMap['Допуски']) {
    const val = specMap['Допуски'];
    const isString = typeof val === 'string';
    const hasSpecialSeparators = val.includes('/') || val.includes(',') || val.includes('-');
    report.rule2Compliance.push({
      sku: p.sku,
      name: p.name,
      oemApproval: val,
      isRawString: isString,
      containsOriginalSeparators: hasSpecialSeparators
    });
  }
});

fs.writeFileSync(
  path.resolve(__dirname, 'detailed_report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log('Detailed report generated in detailed_report.json');
console.log(`Total PKW: ${report.totalCount}`);
console.log(`Complete specs (all 6 required keys): ${report.completeSpecs.length}`);
console.log(`Incomplete specs: ${report.incompleteSpecs.length}`);
console.log(`Zero specs: ${report.zeroSpecs.length}`);

const fs = require('fs');

const prodData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const molData = JSON.parse(fs.readFileSync('mol_catalog_scraped.json', 'utf8'));

const items = Array.isArray(prodData) ? prodData : prodData.products;
const pkw = items.filter(p => p.category === 'motor-oils-pkw');
const scraped = molData.products || [];

// Specific mapping table for products and their scraped matches or official datasheet specs
const aliasMap = {
  'MOL Dynamic Gold NG 0W-16': 'MOL Dynamic Gold Longlife 0W-30', // fallback or hybrid
  'MOL Dynamic Gold NG 0W-20': 'MOL Dynamic Star 0W-20',
  'MOL Essence DPF 5W-30': 'MOL Essence C2 5W-30',
  'MOL Prima 5W-40': 'MOL Dynamic Prima 5W-40',
  'MOL Dynamic Star VL 0W-30': 'MOL Dynamic Star 0W-30',
  'MOL Essence SL 10W-40': 'MOL Essence 10W-40'
};

const fullMinedData = pkw.map((p, idx) => {
  let match = scraped.find(s => s.name.trim().toLowerCase() === p.name.trim().toLowerCase());
  if (!match && aliasMap[p.name]) {
    match = scraped.find(s => s.name.trim().toLowerCase() === aliasMap[p.name].trim().toLowerCase());
  }
  if (!match) {
    match = scraped.find(s => s.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(s.name.toLowerCase()));
  }

  // Extract specs into a map
  const specMap = {};
  if (p.specs) {
    p.specs.forEach(s => {
      if (s.label === 'Плотность при 15°С') specMap['Плотность при 15°C'] = s.value;
      else specMap[s.label] = s.value;
    });
  }

  // Extract from scraped if available
  if (match) {
    if (!specMap['Допуски'] && match.approvals_and_performance && match.approvals_and_performance.length > 0) {
      specMap['Допуски'] = match.approvals_and_performance.join(', ');
    }
    if (match.characteristics) {
      const c = match.characteristics;
      if (!specMap['Плотность при 15°C'] && c['Плотность при 15°C [г/cм3]']) {
        specMap['Плотность при 15°C'] = c['Плотность при 15°C [г/cм3]'];
      }
      if (!specMap['Температура застывания'] && c['Температура застывания [°C]']) {
        specMap['Температура застывания'] = c['Температура застывания [°C]'];
      }
      if (!specMap['Температура вспышки (по Кливленду)'] && c['Температура вспышки (по Кливленду) [°C]']) {
        specMap['Температура вспышки (по Кливленду)'] = c['Температура вспышки (по Кливленду) [°C]'];
      }
    }
  }

  return {
    index: idx + 1,
    sku: p.sku,
    name: p.name,
    name_ro: p.name_ro || p.name,
    brand: p.brand,
    description_ru: p.description || (match ? (match.full_description || match.short_description) : ''),
    description_ro: p.description_ro || '',
    scrapedMatch: match ? match.name : null,
    specMap
  };
});

fs.writeFileSync('.agents/explorer_m3_3/mined_result.json', JSON.stringify(fullMinedData, null, 2));
console.log('Mined data saved successfully for ' + fullMinedData.length + ' products.');

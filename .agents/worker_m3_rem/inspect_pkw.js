const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log('Total pkw items:', pkw.length);
pkw.forEach((p, idx) => {
  console.log(`${idx + 1}. SKU: ${p.sku} | Name: ${p.name}`);
  const specsMap = {};
  (p.specs || []).forEach(s => { specsMap[s.label] = s.value; });
  console.log(`   Specs: Visc=${specsMap['Вязкость'] || 'MISSING'}, Class=${specsMap['Класс'] || 'MISSING'}, Density=${specsMap['Плотность при 15°C'] || 'MISSING'}, Flash=${specsMap['Температура вспышки (по Кливленду)'] || 'MISSING'}, Pour=${specsMap['Температура застывания'] || 'MISSING'}`);
  console.log(`   RO Desc: ${p.description_ro ? p.description_ro.substring(0, 50) : 'MISSING'}`);
});

const fs = require('fs');

const mined = JSON.parse(fs.readFileSync('.agents/explorer_m3_3/mined_result.json', 'utf8'));

const requiredSpecKeys = [
  'Вязкость',
  'Класс',
  'Допуски',
  'Плотность при 15°C',
  'Температура вспышки (по Кливленду)',
  'Температура застывания'
];

mined.forEach(p => {
  const missingSpecs = requiredSpecKeys.filter(k => !p.specMap[k]);
  const missingDescRU = !p.description_ru;
  const missingDescRO = !p.description_ro;

  console.log(`[${p.index}] SKU: ${p.sku} | Name: ${p.name}`);
  if (missingSpecs.length > 0) {
    console.log(`   Missing Specs: ${missingSpecs.join(', ')}`);
  } else {
    console.log(`   Specs: COMPLETE ALL 6`);
  }
  if (missingDescRU) console.log(`   Missing RU Description`);
  if (missingDescRO) console.log(`   Missing RO Description`);
});

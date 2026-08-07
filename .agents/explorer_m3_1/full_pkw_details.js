const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf-8'));
const pkw = products.filter(p => p.category === 'motor-oils-pkw');

console.log(`Total PKW products in products.json: ${pkw.length}`);

pkw.forEach((p, idx) => {
  const specs = p.specs || [];
  const labels = specs.map(s => s.label);
  const oem = specs.find(s => s.label === 'Допуски')?.value || null;
  const visc = specs.find(s => s.label === 'Вязкость')?.value || null;
  const cls = specs.find(s => s.label === 'Класс')?.value || null;
  const density = specs.find(s => s.label === 'Плотность при 15°C')?.value || null;
  const flash = specs.find(s => s.label === 'Температура вспышки (по Кливленду)')?.value || null;
  const pour = specs.find(s => s.label === 'Температура застывания')?.value || null;

  console.log(`\n[${idx + 1}] SKU: ${p.sku} | Name: "${p.name}"`);
  console.log(`    RU Desc: ${p.description ? (p.description.substring(0, 40) + '...') : 'MISSING'}`);
  console.log(`    RO Desc: ${p.description_ro ? (p.description_ro.substring(0, 40) + '...') : 'MISSING'}`);
  console.log(`    Specs count: ${specs.length} | Labels: ${labels.join(', ') || 'NONE'}`);
  console.log(`    Viscosity: ${visc || 'MISSING'} | Class: ${cls || 'MISSING'}`);
  console.log(`    OEM Approvals: ${oem || 'MISSING'}`);
  console.log(`    Density (15°C): ${density || 'MISSING'}`);
  console.log(`    Flash Point: ${flash || 'MISSING'}`);
  console.log(`    Pour Point: ${pour || 'MISSING'}`);
});

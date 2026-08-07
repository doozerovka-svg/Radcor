const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../../products.json'), 'utf8'));

const pkw = products.filter(p => p.category === 'motor-oils-pkw' || (p.id && p.id.includes('arol')) || (p.name && p.name.includes('Arol')));

console.log(`Total PKW + Arol items: ${pkw.length}`);

pkw.forEach((p, idx) => {
  console.log(`\n--- [${idx + 1}] ID: ${p.id || 'N/A'} ---`);
  console.log(`Name: ${p.name || 'N/A'}`);
  console.log(`Category: ${p.category || 'N/A'}`);
  console.log(`Price: ${p.price}, Price on Request: ${p.price_on_request}`);
  console.log(`Description structure:`, typeof p.description === 'object' && p.description !== null ? Object.keys(p.description) : typeof p.description);
  if (typeof p.description === 'object' && p.description !== null) {
    console.log(`  Desc RU: ${p.description.ru ? p.description.ru.substring(0, 60) + '...' : 'MISSING'}`);
    console.log(`  Desc RO: ${p.description.ro ? p.description.ro.substring(0, 60) + '...' : 'MISSING'}`);
  } else {
    console.log(`  Desc string: ${p.description}`);
  }
  console.log(`Approvals:`, p.approvals || p.approvals_ru || (p.specs && p.specs.Approvals) || 'NONE');
  console.log(`Specs keys:`, p.specs ? Object.keys(p.specs) : 'NO SPECS');
  if (p.specs) {
    console.log(`Specs content:`, JSON.stringify(p.specs, null, 2));
  }
  console.log(`Volumes:`, p.volumes);
});

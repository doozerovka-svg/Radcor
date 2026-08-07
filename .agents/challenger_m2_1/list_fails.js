const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));

const syncFails = products.filter(p => {
  const vols = p.volumes || [];
  const packs = p.packs || [];
  return vols.length !== packs.length || !vols.every((v, i) => Number(v) === Number(packs[i] && packs[i].volume_l));
});

console.log(`Total unsynced products: ${syncFails.length}`);
syncFails.forEach((p, idx) => {
  console.log(`${idx + 1}. ID: ${p.id || 'undefined'}, Name: "${p.name}", Category: ${p.category}, Vols: ${JSON.stringify(p.volumes)}, Packs: ${JSON.stringify(p.packs)}`);
});

const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../products.json'), 'utf8'));

const unsynced = products.filter(p => {
  const vols = p.volumes || [];
  const packs = p.packs || [];
  return vols.length !== packs.length || !vols.every((v, i) => Number(v) === Number(packs[i] && packs[i].volume_l));
});

console.log('Unsynced products price fields summary:');
unsynced.forEach(p => {
  console.log(`${p.sku} | ${p.name}: price=${p.price}, price_mdl=${p.price_mdl}, canister_price=${p.canister_price}, barrel_price=${p.barrel_price}`);
});

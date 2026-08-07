const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const appJsPath = path.resolve(__dirname, '../../app.js');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const match = appJsContent.match(/function getVolumeLabel\(v,\s*pack\)\s*\{([\s\S]*?)\n    \}/);
const fnBody = match[1];
const getVolumeLabel = new Function('v', 'pack', fnBody);

console.log(`Loaded ${products.length} products.`);

const unsynced = [];
products.forEach((p, idx) => {
  const vols = p.volumes || [];
  const packs = p.packs || [];

  let synced = true;
  if (vols.length !== packs.length) {
    synced = false;
  } else {
    for (let i = 0; i < vols.length; i++) {
      if (Number(vols[i]) !== Number(packs[i] && packs[i].volume_l)) {
        synced = false;
        break;
      }
    }
  }

  if (!synced) {
    unsynced.push({ idx, id: p.id, sku: p.sku, name: p.name, category: p.category, volumes: vols, packs, canister_price: p.canister_price, price: p.price });
  }
});

console.log(`Unsynced count: ${unsynced.length}`);
console.log(JSON.stringify(unsynced, null, 2));

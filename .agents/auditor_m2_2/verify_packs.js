const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

console.log('Total products count:', products.length);

let missingPacks = 0;
let emptyPacks = 0;
let mismatchVolumes = 0;
let totalPacksCount = 0;
let invalidPacks = 0;

let bibPacksCount = 0;
let eurocubePacksCount = 0;

products.forEach((p, idx) => {
  if (!p.packs) {
    missingPacks++;
    console.log(`Product ${p.id} (${p.title}) missing packs array`);
    return;
  }
  if (!Array.isArray(p.packs) || p.packs.length === 0) {
    emptyPacks++;
    console.log(`Product ${p.id} (${p.title}) has empty or non-array packs`);
    return;
  }

  const volumes = p.volumes || [];
  const packVolumes = p.packs.map(pk => pk.volume_l);
  
  if (volumes.length !== p.packs.length) {
    mismatchVolumes++;
    console.log(`Mismatch in length ${p.id} (${p.title}): volumes len ${volumes.length} vs packs len ${p.packs.length}`);
  } else {
    for (let i = 0; i < volumes.length; i++) {
      if (volumes[i] !== packVolumes[i]) {
        mismatchVolumes++;
        console.log(`Mismatch in value ${p.id} (${p.title}): volume[${i}]=${volumes[i]} !== packVolume[${i}]=${packVolumes[i]}`);
        break;
      }
    }
  }

  totalPacksCount += p.packs.length;

  p.packs.forEach(pk => {
    if (!pk || typeof pk.volume_l !== 'number' || typeof pk.label !== 'string' || pk.label.trim() === '') {
      invalidPacks++;
      console.log(`Invalid pack item in ${p.id}:`, pk);
    }
    if (pk.label.includes('BiB')) bibPacksCount++;
    if (pk.label.includes('Еврокуб') || pk.label.includes('Eurocube') || pk.volume_l === 991) eurocubePacksCount++;
  });
});

console.log('--- SUMMARY ---');
console.log('Total products:', products.length);
console.log('Missing packs:', missingPacks);
console.log('Empty packs:', emptyPacks);
console.log('Mismatch volumes vs packs:', mismatchVolumes);
console.log('Invalid pack items:', invalidPacks);
console.log('Total packs across all products:', totalPacksCount);
console.log('BiB packs count:', bibPacksCount);
console.log('Eurocube packs count:', eurocubePacksCount);

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const productsPath = path.join(rootDir, 'products.json');
const appPath = path.join(rootDir, 'app.js');

console.log("=== FORENSIC AUDIT M2 START ===");

// 1. Load products.json
const rawProducts = fs.readFileSync(productsPath, 'utf8');
let products;
try {
  products = JSON.parse(rawProducts);
  console.log("PASS: products.json is valid JSON.");
} catch (e) {
  console.error("FAIL: products.json is invalid JSON:", e.message);
  process.exit(1);
}

// 2. Load app.js
const appJs = fs.readFileSync(appPath, 'utf8');

// 3. Inspect Categories
const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`INFO: Total motor-oils-pkw count: ${pkwProducts.length}`);

// 4. Verify 11 Renames
const expectedRenames = [
  { id: 'MOL-HYBRID-0W16', name: 'MOL Dynamic Gold NG 0W-16' },
  { id: 'MOL-DYN-STAR-0W20', name: 'MOL Dynamic Gold NG 0W-20' },
  { id: 'MOL-DYN-ESS-5W30', name: 'MOL Essence 5W-30' },
  { id: 'MOL-DYN-ESS-C2-5W30', name: 'MOL Essence DPF 5W-30' },
  { id: 'MOL-DYN-ESS-5W40', name: 'MOL Essence 5W-40' },
  { id: 'MOL-DYN-ESS-DSL-5W40', name: 'MOL Essence Diesel 5W-40' },
  { id: 'MOL-DYN-PRIMA-5W40', name: 'MOL Prima 5W-40' },
  { id: 'YUKO-SYNETIC-5W40', name: 'Yuko Synthetic 5W-40' },
  { id: 'MOL-DYN-ESS-DSL-10W40', name: 'MOL Essence Diesel 10W-40' },
  { id: 'YUKO-CLASSIC-15W40', name: 'Yuko Dynamic 15W-40' },
  { id: 'MOL-DYN-ESS-15W40', name: 'MOL Essence 15W-40' }
];

let renamesOk = true;
expectedRenames.forEach(r => {
  const prod = products.find(p => p.id === r.id);
  if (!prod) {
    console.error(`FAIL: Product ${r.id} not found.`);
    renamesOk = false;
  } else if (prod.title !== r.name && prod.name !== r.name) {
    console.error(`FAIL: Product ${r.id} expected name "${r.name}", got title="${prod.title}", name="${prod.name}"`);
    renamesOk = false;
  } else {
    console.log(`PASS Rename: ${r.id} -> "${prod.title || prod.name}"`);
  }
});

// 5. Verify 2 New Positions
const newStarVL = products.find(p => p.id === 'MOL-DYN-STAR-VL-0W30' || p.title === 'MOL Dynamic Star VL 0W-30' || p.name === 'MOL Dynamic Star VL 0W-30');
const newEssenceSL = products.find(p => p.id === 'MOL-ESSENCE-SL-10W40' || p.title === 'MOL Essence SL 10W-40' || p.name === 'MOL Essence SL 10W-40');

let newPosOk = true;
if (!newStarVL) {
  console.error("FAIL: MOL Dynamic Star VL 0W-30 not found!");
  newPosOk = false;
} else {
  console.log("PASS New Item 1:", newStarVL.id, newStarVL.title || newStarVL.name, "Volumes:", newStarVL.volumes);
}

if (!newEssenceSL) {
  console.error("FAIL: MOL Essence SL 10W-40 not found!");
  newPosOk = false;
} else {
  console.log("PASS New Item 2:", newEssenceSL.id, newEssenceSL.title || newEssenceSL.name, "Volumes:", newEssenceSL.volumes);
}

// 6. Check MOL Arol 2T category
const arol2T = products.find(p => p.id === 'MOL-1042' || (p.title && p.title.includes('Arol 2T')) || (p.name && p.name.includes('Arol 2T')));
if (arol2T) {
  console.log(`INFO: MOL Arol 2T category = "${arol2T.category}"`);
  if (arol2T.category !== 'moto-oils') {
    console.error(`FAIL: MOL Arol 2T expected category "moto-oils", got "${arol2T.category}"`);
  } else {
    console.log("PASS: MOL Arol 2T is in moto-oils.");
  }
} else {
  console.error("FAIL: MOL Arol 2T not found in products.json");
}

// 7. Packs & Volumes Sync Check
let syncOk = true;
products.forEach(p => {
  if (p.packs && Array.isArray(p.packs)) {
    const packVolumes = p.packs.map(pk => Number(pk.volume_l)).sort((a,b) => a-b);
    const prodVolumes = (p.volumes || []).map(v => Number(v)).sort((a,b) => a-b);
    if (JSON.stringify(packVolumes) !== JSON.stringify(prodVolumes)) {
      console.error(`FAIL Sync: Product ${p.id} desync! packs volumes=${JSON.stringify(packVolumes)}, volumes array=${JSON.stringify(prodVolumes)}`);
      syncOk = false;
    }
  }
});
if (syncOk) console.log("PASS: All products have synchronized packs and volumes arrays.");

// 8. 991L Pack Labels Check
let label991Ok = true;
products.forEach(p => {
  if (p.packs) {
    p.packs.forEach(pk => {
      if (Number(pk.volume_l) === 991) {
        if (pk.label !== '991 л (Еврокуб)') {
          console.error(`FAIL Label 991: Product ${p.id} 991L pack label is "${pk.label}", expected "991 л (Еврокуб)"`);
          label991Ok = false;
        }
      }
    });
  }
});
if (label991Ok) console.log("PASS: All 991L pack labels are '991 л (Еврокуб)'.");

// 9. app.js Fallback Check
const app991Regex = /numV\s*===\s*991.*?['"]991\s*л\s*\(Еврокуб\)['"]/;
if (app991Regex.test(appJs)) {
  console.log("PASS: app.js contains 991L fallback logic '991 л (Еврокуб)'.");
} else {
  console.error("FAIL: app.js does not contain expected 991L fallback logic!");
}

// 10. Emoji Detection
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
let emojiCount = 0;
products.forEach(p => {
  const str = JSON.stringify(p);
  if (emojiRegex.test(str)) {
    console.error(`FAIL Emoji: Product ${p.id} contains emoji!`);
    emojiCount++;
  }
});
if (emojiCount === 0) console.log("PASS: Zero emojis found in products.json.");

console.log("=== FORENSIC AUDIT M2 END ===");

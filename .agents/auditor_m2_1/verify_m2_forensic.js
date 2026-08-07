const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));
const appJs = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');

console.log("=== COMPREHENSIVE FORENSIC VERIFICATION M2 ===");

let passed = true;

// 1. Motor Oils PKW count
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`[CHECK 1] motor-oils-pkw product count: ${pkw.length}`);
if (pkw.length !== 38) {
  console.error(`  FAIL: Expected 38 motor-oils-pkw items, got ${pkw.length}`);
  passed = false;
} else {
  console.log(`  PASS: Count is exactly 38.`);
}

// 2. Renames verification
const expectedRenamedNames = [
  "MOL Dynamic Gold NG 0W-16",
  "MOL Dynamic Gold NG 0W-20",
  "MOL Essence 5W-30",
  "MOL Essence DPF 5W-30",
  "MOL Essence 5W-40",
  "MOL Essence Diesel 5W-40",
  "MOL Prima 5W-40",
  "Yuko Synthetic 5W-40",
  "MOL Essence Diesel 10W-40",
  "Yuko Dynamic 15W-40",
  "MOL Essence 15W-40"
];

console.log("[CHECK 2] Renamed Product Names Verification:");
expectedRenamedNames.forEach(targetName => {
  const found = pkw.find(p => p.name === targetName);
  if (!found) {
    console.error(`  FAIL: Renamed product "${targetName}" NOT found in PKW catalog!`);
    passed = false;
  } else {
    console.log(`  PASS: Found renamed item "${targetName}" (SKU: ${found.sku})`);
  }
});

// Check old names are gone
const oldNamesProhibited = [
  "MOL Dynamic Hybrid 0W-16",
  "MOL Dynamic Star 0W-20",
  "MOL Dynamic Essence 5W-30",
  "MOL Dynamic Essence C2 5W-30",
  "MOL Dynamic Essence 5W-40",
  "MOL Dynamic Essence Diesel 5W-40",
  "MOL Dynamic Prima 5W-40",
  "Yuko Syntetic 5W-40 (1 л)",
  "MOL Dynamic Essence Diesel 10W-40",
  "Yuko Classic 15W-40",
  "MOL Dynamic Essence 15W-40"
];

console.log("[CHECK 3] Prohibited Old Names Absence:");
oldNamesProhibited.forEach(oldName => {
  const found = products.find(p => p.name === oldName);
  if (found) {
    console.error(`  FAIL: Old prohibited name "${oldName}" STILL EXISTS in products.json!`);
    passed = false;
  } else {
    console.log(`  PASS: Old name "${oldName}" confirmed absent.`);
  }
});

// 3. New product additions
console.log("[CHECK 4] New Product Additions:");
const starVL = pkw.find(p => p.name === "MOL Dynamic Star VL 0W-30");
if (!starVL) {
  console.error("  FAIL: MOL Dynamic Star VL 0W-30 missing!");
  passed = false;
} else {
  const vols = starVL.volumes ? starVL.volumes.join(',') : '';
  if (vols === '1,4') {
    console.log(`  PASS: MOL Dynamic Star VL 0W-30 present with volumes [1, 4]`);
  } else {
    console.error(`  FAIL: MOL Dynamic Star VL 0W-30 volumes expected [1, 4], got [${vols}]`);
    passed = false;
  }
}

const essenceSL = pkw.find(p => p.name === "MOL Essence SL 10W-40");
if (!essenceSL) {
  console.error("  FAIL: MOL Essence SL 10W-40 missing!");
  passed = false;
} else {
  const vols = essenceSL.volumes ? essenceSL.volumes.join(',') : '';
  if (vols === '4,5,20,54,196,991') {
    console.log(`  PASS: MOL Essence SL 10W-40 present with volumes [4, 5, 20, 54, 196, 991]`);
  } else {
    console.error(`  FAIL: MOL Essence SL 10W-40 volumes expected [4,5,20,54,196,991], got [${vols}]`);
    passed = false;
  }
}

// 4. MOL Arol 2T Re-categorization
console.log("[CHECK 5] MOL Arol 2T Re-categorization:");
const arol = products.find(p => p.name && p.name.includes("Arol 2T"));
if (!arol) {
  console.error("  FAIL: MOL Arol 2T not found anywhere in products.json!");
  passed = false;
} else if (arol.category !== "moto-oils") {
  console.error(`  FAIL: MOL Arol 2T in category "${arol.category}", expected "moto-oils"!`);
  passed = false;
} else {
  console.log(`  PASS: MOL Arol 2T is in category "moto-oils" (SKU: ${arol.sku}).`);
}

// 5. Packs vs Volumes Synchronization & 991L Eurocube Label
console.log("[CHECK 6] Packs & Volumes Sync Across Entire Catalog:");
let desyncCount = 0;
let label991MismatchCount = 0;
products.forEach(p => {
  if (p.packs && Array.isArray(p.packs)) {
    const packVols = p.packs.map(pk => Number(pk.volume_l)).sort((a,b) => a-b);
    const itemVols = (p.volumes || []).map(v => Number(v)).sort((a,b) => a-b);
    if (JSON.stringify(packVols) !== JSON.stringify(itemVols)) {
      console.error(`  FAIL desync: SKU ${p.sku} packs=${JSON.stringify(packVols)} vs volumes=${JSON.stringify(itemVols)}`);
      desyncCount++;
    }
    p.packs.forEach(pk => {
      if (Number(pk.volume_l) === 991 && pk.label !== '991 л (Еврокуб)') {
        console.error(`  FAIL label 991: SKU ${p.sku} pack label "${pk.label}" != "991 л (Еврокуб)"`);
        label991MismatchCount++;
      }
    });
  }
});

if (desyncCount === 0) {
  console.log("  PASS: 100% of products with packs have volumes perfectly synchronized.");
} else {
  passed = false;
}

if (label991MismatchCount === 0) {
  console.log("  PASS: 100% of 991L pack labels are '991 л (Еврокуб)'.");
} else {
  passed = false;
}

// 6. app.js Fallback for 991L Eurocube
console.log("[CHECK 7] app.js Fallback Functionality:");
const has991InApp = appJs.includes("if (numV === 991) return '991 л (Еврокуб)';") || appJs.includes("991 л (Еврокуб)");
if (has991InApp) {
  console.log("  PASS: app.js contains 991L fallback logic.");
} else {
  console.error("  FAIL: app.js missing 991L fallback logic!");
  passed = false;
}

// 7. Check for Emojis in products.json
console.log("[CHECK 8] Emoji Absence Inspection:");
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
let emojiFound = false;
products.forEach(p => {
  const jsonStr = JSON.stringify(p);
  if (emojiRegex.test(jsonStr)) {
    console.error(`  FAIL Emoji: Product ${p.sku} / ${p.name} contains emoji!`);
    emojiFound = true;
  }
});
if (!emojiFound) {
  console.log("  PASS: Zero emojis found in products.json.");
} else {
  passed = false;
}

// 8. Cheating / Facade / Mock Bypass Inspection
console.log("[CHECK 9] Facade & Hardcode Forensic Detection:");
let facadeFound = false;

// Check if any product is dummy / placeholder (e.g. empty specs, missing description, empty packs)
pkw.forEach(p => {
  if (!p.description || p.description.length < 10) {
    console.error(`  FAIL Facade: Product ${p.sku} has empty/short description!`);
    facadeFound = true;
  }
  if (!p.specs || !Array.isArray(p.specs) || p.specs.length === 0) {
    console.error(`  FAIL Facade: Product ${p.sku} has no specs!`);
    facadeFound = true;
  }
  if (!p.packs || !Array.isArray(p.packs) || p.packs.length === 0) {
    console.error(`  FAIL Facade: Product ${p.sku} has no packs!`);
    facadeFound = true;
  }
});

// Check app.js for mock bypass or fake hardcoding
if (appJs.includes("mockReturn") || appJs.includes("fakeCatalog") || appJs.includes("// HARDCODED")) {
  console.error("  FAIL Facade: app.js contains suspicious fake/mock keywords!");
  facadeFound = true;
}

if (!facadeFound) {
  console.log("  PASS: No facade, dummy, or hardcoded mock implementations detected.");
} else {
  passed = false;
}

console.log("===============================================");
console.log(`FINAL FORENSIC VERDICT: ${passed ? 'CLEAN' : 'INTEGRITY VIOLATION'}`);

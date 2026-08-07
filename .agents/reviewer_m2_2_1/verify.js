const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`Total products in catalog: ${products.length}`);

// 1. Category counts
const pkwProducts = products.filter(p => p.category === 'motor-oils-pkw');
console.log(`Products in motor-oils-pkw: ${pkwProducts.length}`);

// 2. Check 11 title renames
const expectedRenames = [
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

console.log("\n--- Checking 11 Title Renames ---");
let renamePassCount = 0;
for (const title of expectedRenames) {
    const found = products.find(p => p.title === title || p.name === title);
    if (found) {
        console.log(`[PASS] Found renamed product: "${title}" (ID: ${found.id}, Category: ${found.category})`);
        renamePassCount++;
    } else {
        console.log(`[FAIL] Missing renamed product: "${title}"`);
    }
}

// Check old names are gone
const oldNames = [
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

console.log("\n--- Checking Old Names Absence ---");
let oldAbsencePassCount = 0;
for (const oldTitle of oldNames) {
    const found = products.find(p => p.title === oldTitle || p.name === oldTitle);
    if (!found) {
        console.log(`[PASS] Old title successfully removed/replaced: "${oldTitle}"`);
        oldAbsencePassCount++;
    } else {
        console.log(`[FAIL] Old title still exists: "${oldTitle}" (ID: ${found.id})`);
    }
}

// 3. Check 2 new products
console.log("\n--- Checking 2 New Products ---");
const starVL = products.find(p => (p.title === 'MOL Dynamic Star VL 0W-30' || p.name === 'MOL Dynamic Star VL 0W-30') && p.category === 'motor-oils-pkw');
if (starVL) {
    console.log(`[PASS] Found new product: "MOL Dynamic Star VL 0W-30" (ID: ${starVL.id})`);
    console.log(`       Volumes: ${JSON.stringify(starVL.volumes)}`);
    console.log(`       Packs: ${JSON.stringify(starVL.packs)}`);
} else {
    console.log(`[FAIL] Missing new product: "MOL Dynamic Star VL 0W-30"`);
}

const essenceSL = products.find(p => (p.title === 'MOL Essence SL 10W-40' || p.name === 'MOL Essence SL 10W-40') && p.category === 'motor-oils-pkw');
if (essenceSL) {
    console.log(`[PASS] Found new product: "MOL Essence SL 10W-40" (ID: ${essenceSL.id})`);
    console.log(`       Volumes: ${JSON.stringify(essenceSL.volumes)}`);
    console.log(`       Packs: ${JSON.stringify(essenceSL.packs)}`);
} else {
    console.log(`[FAIL] Missing new product: "MOL Essence SL 10W-40"`);
}

// 4. Check global Volume vs Pack Sync across all 423 items
console.log("\n--- Checking Global Volume/Pack Sync (all 423 items) ---");
let syncFailures = 0;
products.forEach((p, idx) => {
    const volumes = p.volumes || [];
    const packs = p.packs || [];

    if (volumes.length !== packs.length) {
        console.log(`[FAIL] Sync mismatch on ID ${p.id} (#${idx}): volumes length ${volumes.length} vs packs length ${packs.length}`);
        syncFailures++;
        return;
    }

    for (let i = 0; i < volumes.length; i++) {
        const vol = volumes[i];
        const pack = packs[i];
        if (!pack || pack.volume_l !== vol) {
            console.log(`[FAIL] Pack volume mismatch on ID ${p.id} (#${idx}): vol[${i}]=${vol}, pack volume_l=${pack ? pack.volume_l : 'undefined'}`);
            syncFailures++;
            break;
        }
    }
});

if (syncFailures === 0) {
    console.log(`[PASS] 100% volume/pack sync across all ${products.length} products!`);
} else {
    console.log(`[FAIL] Found ${syncFailures} products with volume/pack sync failures.`);
}

// 5. Check emoji prohibition
console.log("\n--- Checking Emoji Prohibition (AGENTS.md) ---");
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
let emojiFound = 0;
products.forEach(p => {
    const str = JSON.stringify(p);
    if (emojiRegex.test(str)) {
        console.log(`[FAIL] Emoji found in product ID ${p.id} (${p.title || p.name})`);
        emojiFound++;
    }
});
if (emojiFound === 0) {
    console.log("[PASS] Zero emojis found in products.json.");
}

console.log("\n=== SUMMARY ===");
console.log(`11 Title Renames PASS: ${renamePassCount === 11 && oldAbsencePassCount === 11}`);
console.log(`2 New Products PASS: ${Boolean(starVL && essenceSL)}`);
console.log(`PKW Count = 38 PASS: ${pkwProducts.length === 38}`);
console.log(`100% Sync PASS: ${syncFailures === 0}`);

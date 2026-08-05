const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\DenCrut\\Documents\\radcor.md';

console.log('=== REVIEWER 2 VERIFICATION RUN ===\n');

// Test 1: Check i18n.js dictionary keys for RO coverage
const i18nContent = fs.readFileSync(path.join(rootDir, 'i18n.js'), 'utf8');
const window = {};
eval(i18nContent);
const I18N = window.I18N;

const roCategoryKeys = [
    'cat_all', 'cat_lubricants', 'cat_motor_oils_pkw', 'cat_motor_oils_lkw',
    'cat_moto_oils', 'cat_transmission_oils', 'cat_hydraulic_oils',
    'cat_greases', 'cat_industrial_lubricants', 'cat_coolants',
    'cat_brake_fluids', 'cat_auto_chemistry', 'cat_accessories', 'cat_auto_lamps'
];

console.log('--- TEST 1: i18n Category & Filter Keys in RO ---');
console.log('filter_viscosity in RO:', I18N.ro.filter_viscosity);

let missingRoCats = 0;
roCategoryKeys.forEach(k => {
    if (!I18N.ro[k]) {
        console.log(`[FAIL] Key missing in RO: ${k}`);
        missingRoCats++;
    } else {
        console.log(`[PASS] ${k} (RO): "${I18N.ro[k]}"`);
    }
});

// Test 1b: Check HTML data-i18n attributes in catalog.html against RO dictionary
console.log('\n--- TEST 1b: HTML data-i18n attributes in catalog.html vs RO values ---');
const catalogHtml = fs.readFileSync(path.join(rootDir, 'catalog.html'), 'utf8');
const dataI18nRegex = /data-i18n="([^"]+)"/g;
let match;
const dataI18nKeys = new Set();
while ((match = dataI18nRegex.exec(catalogHtml)) !== null) {
    dataI18nKeys.add(match[1]);
}

let untranslatedInRo = 0;
dataI18nKeys.forEach(key => {
    const roVal = I18N.ro[key];
    const ruVal = I18N.ru[key];
    if (!roVal) {
        console.log(`[WARN] data-i18n key "${key}" NOT found in RO dictionary!`);
        untranslatedInRo++;
    } else if (/[а-яА-ЯёЁ]/.test(roVal) && !/[a-zA-ZăâîșțĂÂÎȘȚ]/.test(roVal)) {
        console.log(`[FAIL] data-i18n key "${key}" in RO has Cyrillic Russian value: "${roVal}" (RU: "${ruVal}")`);
        untranslatedInRo++;
    }
});

// Test 2: Check duplicate IDs in catalog.html
console.log('\n--- TEST 2: Check Duplicate Element IDs in catalog.html ---');
const idRegex = /id="([^"]+)"/g;
const idCounts = {};
while ((match = idRegex.exec(catalogHtml)) !== null) {
    const id = match[1];
    idCounts[id] = (idCounts[id] || 0) + 1;
}

Object.keys(idCounts).forEach(id => {
    if (idCounts[id] > 1) {
        console.log(`[FAIL] Duplicate HTML ID found: "${id}" (Count: ${idCounts[id]})`);
    }
});

// Test 3: Check Emojis in B2B UI (AGENTS.md Section 1 Violation)
console.log('\n--- TEST 3: Check Emojis in HTML and JS Files ---');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;

const filesToCheck = ['catalog.html', 'index.html', 'app.js', 'i18n.js'];
filesToCheck.forEach(file => {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        let m;
        while ((m = emojiRegex.exec(line)) !== null) {
            console.log(`[EMOJI VIOLATION] ${file}:${idx + 1} -> Emoji "${m[0]}" in: "${line.trim().substring(0, 80)}"`);
        }
    });
});

// Test 4: Volume Tag & Unit Rendering in app.js
console.log('\n--- TEST 4: Volume Unit & Label Hardcoding in app.js ---');
const appJs = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');
if (appJs.includes("if (numV === 983) return '983 л (Еврокуб)';")) {
    console.log('[FAIL] app.js getVolumeLabel hardcodes Russian Cyrillic "983 л (Еврокуб)" regardless of currentLang.');
}
if (appJs.includes("`${numV} л`")) {
    console.log('[FAIL] app.js getVolumeLabel hardcodes Russian unit "л" instead of localized unit.');
}
if (appJs.includes("`${totalVol.toFixed(1)} л`")) {
    console.log('[FAIL] app.js renderCart hardcodes total volume unit as Russian "л".');
}

console.log('\n=== VERIFICATION END ===');

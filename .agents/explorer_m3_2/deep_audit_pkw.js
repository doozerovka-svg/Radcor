const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:/Users/DenCrut/Documents/radcor.md/products.json', 'utf8'));

const products = data.filter(p => p.category === 'motor-oils-pkw');

const legacyNameCheck = [
  { legacy: 'MOL Dynamic Essence', current: 'MOL Essence' },
  { legacy: 'MOL Dynamic Prima', current: 'MOL Prima' },
  { legacy: 'MOL Dynamic Hybrid', current: 'MOL Dynamic Gold NG' },
  { legacy: 'MOL Dynamic Star 0W-20', current: 'MOL Dynamic Gold NG 0W-20' },
  { legacy: 'YUKO CLASSIC', current: 'Yuko Dynamic' },
  { legacy: 'Yuko Classic', current: 'Yuko Dynamic' },
];

const results = [];

products.forEach((p, idx) => {
  const sku = p.sku || `ITEM_${idx+1}`;
  const name = p.name || 'UNNAMED';
  const desc_ru = p.description || '';
  const desc_ro = p.description_ro || '';

  const issues = [];
  const warnings = [];

  // 1. RU Description Audit
  if (!desc_ru) {
    issues.push('RU description is MISSING');
  } else {
    if (/\bсвысокими\b/i.test(desc_ru)) {
      issues.push('RU typo: "свысокими" (missing space)');
    }
    legacyNameCheck.forEach(ln => {
      if (desc_ru.includes(ln.legacy)) {
        warnings.push(`RU description contains legacy product name "${ln.legacy}" (should be "${ln.current}")`);
      }
    });
  }

  // 2. RO Description Audit
  if (!('description_ro' in p)) {
    issues.push('description_ro field MISSING');
  } else if (!desc_ro) {
    issues.push('RO description is EMPTY');
  } else if (desc_ro === desc_ru) {
    issues.push('RO description 100% UNTRANSLATED (identical to RU)');
  } else {
    // Check Cyrillic characters in RO description
    const cyrillicMatch = desc_ro.match(/[а-яА-ЯёЁ]+/g);
    if (cyrillicMatch) {
      const uniqueCyrillic = Array.from(new Set(cyrillicMatch));
      issues.push(`RO description MIXED/UNTRANSLATED (contains Cyrillic text: "${uniqueCyrillic.join(', ')}")`);
    }
    legacyNameCheck.forEach(ln => {
      if (desc_ro.includes(ln.legacy)) {
        warnings.push(`RO description contains legacy product name "${ln.legacy}"`);
      }
    });
  }

  // 3. Emojis and Artifacts
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u;
  if (emojiRegex.test(name)) issues.push('Title/Name contains emoji');
  if (emojiRegex.test(desc_ru)) issues.push('RU description contains emoji');
  if (emojiRegex.test(desc_ro)) issues.push('RO description contains emoji');

  [desc_ru, desc_ro, name].forEach(text => {
    if (text && (text.includes('TODO') || text.includes('FIXME') || text.includes('<') || text.includes('>'))) {
      issues.push('Contains formatting/placeholder artifacts');
    }
  });

  results.push({
    num: idx + 1,
    sku,
    name,
    desc_ru,
    desc_ro,
    issues,
    warnings,
    needs_update: issues.length > 0 || warnings.length > 0
  });
});

fs.writeFileSync('c:/Users/DenCrut/Documents/radcor.md/.agents/explorer_m3_2/pkw_audit_results.json', JSON.stringify(results, null, 2), 'utf8');

console.log(`Saved audit results for ${products.length} products.`);
console.log(`Products needing update (issues or warnings): ${results.filter(r => r.needs_update).length}`);
console.log(`Products fully clean (zero issues & zero warnings): ${results.filter(r => !r.needs_update).length}`);

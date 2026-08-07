const fs = require('fs');

const raw = fs.readFileSync('c:/Users/DenCrut/Documents/radcor.md/products.json', 'utf8');
const data = JSON.parse(raw);

const products = Array.isArray(data) ? data.filter(p => p.category === 'motor-oils-pkw') : (data.products || []).filter(p => p.category === 'motor-oils-pkw');

console.log(`Total PKW products found: ${products.length}`);

function checkEmoji(str) {
  if (!str) return false;
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u;
  return emojiRegex.test(str);
}

function checkArtifacts(str) {
  if (!str) return [];
  const artifacts = [];
  if (str.includes('TODO') || str.includes('FIXME')) artifacts.push('TODO/FIXME');
  if (str.includes('<') || str.includes('>')) artifacts.push('HTML tags');
  if (/\*\*[^*]+\*\*/.test(str)) artifacts.push('Markdown bold');
  if (str.includes('\\n')) artifacts.push('Escaped \\n');
  if (str.includes('undefined') || str.includes('null')) artifacts.push('undefined/null');
  return artifacts;
}

const auditResults = [];
let issueCount = 0;

products.forEach((p, idx) => {
  const pid = p.id || p.sku || `ITEM_${idx+1}`;
  const title = p.title || p.name || 'UNNAMED';
  const desc_ru = p.description || '';
  const desc_ro = p.description_ro || '';

  const issues = [];

  // RU description audit
  if (!desc_ru) {
    issues.push('RU description MISSING');
  } else if (desc_ru.trim().length < 15) {
    issues.push(`RU description too short/placeholder ("${desc_ru}")`);
  }

  if (checkEmoji(desc_ru)) issues.push('RU description contains EMOJI');
  const ruArt = checkArtifacts(desc_ru);
  if (ruArt.length > 0) issues.push(`RU description artifacts: ${ruArt.join(', ')}`);

  // RO description audit
  if (!('description_ro' in p)) {
    issues.push('description_ro field MISSING');
  } else if (!desc_ro) {
    issues.push('RO description EMPTY/MISSING');
  } else if (desc_ro === desc_ru) {
    issues.push('RO description UNTRANSLATED (identical to RU)');
  } else if (desc_ro.trim().length < 15) {
    issues.push(`RO description too short/placeholder ("${desc_ro}")`);
  }

  if (checkEmoji(desc_ro)) issues.push('RO description contains EMOJI');
  const roArt = checkArtifacts(desc_ro);
  if (roArt.length > 0) issues.push(`RO description artifacts: ${roArt.join(', ')}`);

  // Title check
  if (checkEmoji(title)) issues.push('Title contains EMOJI');

  if (issues.length > 0) issueCount++;

  auditResults.push({
    index: idx + 1,
    id: pid,
    title,
    desc_ru,
    desc_ro,
    issues
  });
});

console.log('=== DETAILED PRODUCT AUDIT ===\n');
auditResults.forEach(r => {
  console.log(`[${r.index}/${products.length}] ID: ${r.id} | Title: "${r.title}"`);
  console.log(`  RU (${r.desc_ru.length} chars): "${r.desc_ru}"`);
  console.log(`  RO (${r.desc_ro.length} chars): "${r.desc_ro}"`);
  if (r.issues.length > 0) {
    console.log(`  ❌ ISSUES (${r.issues.length}): ${r.issues.join(' | ')}`);
  } else {
    console.log(`  ✅ ISSUES: None (OK)`);
  }
  console.log('');
});

console.log(`========================================`);
console.log(`Summary: ${issueCount} out of ${products.length} products have issues.`);

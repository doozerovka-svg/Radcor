const fs = require('fs');
const path = require('path');
const data = require('./full_audit_data.json');

// Load i18n dictionary from i18n.js
const i18nContent = fs.readFileSync('c:\\Users\\DenCrut\\Documents\\radcor.md\\i18n.js', 'utf8');

// Extract I18N object by evaluating in a clean context or regex
let I18N = {};
try {
  const evalFunc = new Function(`${i18nContent}; return I18N;`);
  I18N = evalFunc();
} catch (e) {
  console.error('Error evaluating i18n.js:', e.message);
}

console.log(`Loaded i18n keys: RU=${Object.keys(I18N.ru || {}).length}, RO=${Object.keys(I18N.ro || {}).length}`);

const report = {};

for (const [file, info] of Object.entries(data)) {
  const missingRU = [];
  const missingRO = [];
  const missingPlaceholderRU = [];
  const missingPlaceholderRO = [];

  info.i18n.dataI18n.forEach(key => {
    if (!I18N.ru || !(key in I18N.ru)) missingRU.push(key);
    if (!I18N.ro || !(key in I18N.ro)) missingRO.push(key);
  });

  info.i18n.dataI18nPlaceholder.forEach(key => {
    if (!I18N.ru || !(key in I18N.ru)) missingPlaceholderRU.push(key);
    if (!I18N.ro || !(key in I18N.ro)) missingPlaceholderRO.push(key);
  });

  report[file] = {
    totalDataI18n: info.i18n.dataI18n.length,
    missingRU: [...new Set(missingRU)],
    missingRO: [...new Set(missingRO)],
    totalPlaceholder: info.i18n.dataI18nPlaceholder.length,
    missingPlaceholderRU: [...new Set(missingPlaceholderRU)],
    missingPlaceholderRO: [...new Set(missingPlaceholderRO)]
  };
}

console.log(JSON.stringify(report, null, 2));

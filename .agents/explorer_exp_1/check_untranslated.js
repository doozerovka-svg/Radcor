const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'catalog.html', 'checkout.html', 'b2b-dashboard.html',
  'admin.html', 'delivery.html', 'returns.html', 'service.html',
  'faq.html', 'guides.html', 'contacts.html'
];

files.forEach(file => {
  const content = fs.readFileSync(path.join('c:\\Users\\DenCrut\\Documents\\radcor.md', file), 'utf8');
  console.log(`\n================ ${file} UNTRANSLATED NODES CHECK ================`);

  // Simple heuristic: find HTML tags with text inside that don't have data-i18n or inside script/style
  // Match tags like <h1..>, <p..>, <a..>, <span..>, <td..>, <th..>, <label..>, <button..>, <option..>
  const tagRegex = /<(h[1-6]|p|a|span|td|th|label|button|option|div)\b([^>]*)>([^<]+)<\/\1>/gi;
  let match;
  let count = 0;
  while ((match = tagRegex.exec(content)) !== null) {
    const tagName = match[1];
    const attrs = match[2];
    const text = match[3].trim();

    // Skip empty text or text with only numbers/symbols
    if (!text || /^[\d\s\W]+$/.test(text) || text.length < 2) continue;
    // Skip if contains data-i18n
    if (attrs.includes('data-i18n')) continue;
    // Skip logo text or standard non-translated branding like MOL, RADCOR, etc if purely branding
    if (text === 'RADCOR' || text === 'prim' || text === 'R' || text === 'RU' || text === 'RO' || text === '|') continue;

    count++;
    if (count <= 15) {
      console.log(`  [${count}] <${tagName} ${attrs.trim()}> -> "${text}"`);
    }
  }
  if (count > 15) {
    console.log(`  ... and ${count - 15} more untranslated text elements.`);
  }
});

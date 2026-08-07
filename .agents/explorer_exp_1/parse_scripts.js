const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'catalog.html', 'checkout.html', 'b2b-dashboard.html',
  'admin.html', 'delivery.html', 'returns.html', 'service.html',
  'faq.html', 'guides.html', 'contacts.html'
];

files.forEach(file => {
  const content = fs.readFileSync(path.join('c:\\Users\\DenCrut\\Documents\\radcor.md', file), 'utf8');
  console.log(`=== ${file} ===`);
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    count++;
    const attrs = match[1];
    const body = match[2];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      console.log(`  [Script ${count}] EXTERNAL: src="${srcMatch[1]}"`);
    } else {
      console.log(`  [Script ${count}] INLINE: body length = ${body.length} bytes`);
    }
  }
});

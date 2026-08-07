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
  const langMatch = content.match(/<div[^>]*class=["'][^"']*(lang-selector|lang-switcher|nav-actions)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  if (langMatch) {
    langMatch.forEach(m => console.log('  FOUND CONTAINER:', m.replace(/\s+/g, ' ')));
  } else {
    const linksMatch = content.match(/<a[^>]*class=["'][^"']*lang-link[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi);
    if (linksMatch) {
      console.log('  FOUND LANG LINKS WITHOUT CONTAINER:', linksMatch);
    } else {
      console.log('  NO LANGUAGE SWITCHER FOUND!');
    }
  }
});

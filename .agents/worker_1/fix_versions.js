const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\DenCrut\\Documents\\radcor.md';
const files = [
  'index.html', 'catalog.html', 'b2b-dashboard.html', 'checkout.html',
  'admin.html', 'contacts.html', 'delivery.html', 'faq.html',
  'guides.html', 'returns.html', 'service.html'
];

files.forEach(f => {
  const filePath = path.join(rootDir, f);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\?v=[\d\.]+/g, '?v=16.0');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed versions in ' + f);
});

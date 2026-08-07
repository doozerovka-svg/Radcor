const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/DenCrut/Documents/radcor.md';
const htmlFiles = [
  'admin.html', 'b2b-dashboard.html', 'catalog.html', 'checkout.html',
  'contacts.html', 'delivery.html', 'faq.html', 'guides.html',
  'index.html', 'returns.html', 'service.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('v=36.0')) {
    content = content.replaceAll('v=36.0', 'v=37.0');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file + ' to v=37.0');
  }
});

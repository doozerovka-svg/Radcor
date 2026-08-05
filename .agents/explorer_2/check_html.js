const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/DenCrut/Documents/radcor.md';
const htmlFiles = [
    'admin.html',
    'b2b-dashboard.html',
    'catalog.html',
    'checkout.html',
    'contacts.html',
    'delivery.html',
    'faq.html',
    'guides.html',
    'index.html',
    'returns.html',
    'service.html'
];

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File missing: ${file}`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`\n=== ${file} ===`);
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('style.css') || line.includes('i18n.js') || line.includes('app.js') || line.includes('checkout.js')) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
    });
});

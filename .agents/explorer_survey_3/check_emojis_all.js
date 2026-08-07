const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');

// Regex for emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}]/u;

const filesToScan = [
  'products.json',
  'app.js',
  'i18n.js',
  'checkout.js',
  'style.css',
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

console.log('=== EMOJI AUDIT ACROSS ALL PROJECT FILES ===');
let totalEmojiViolations = 0;

filesToScan.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] File not found: ${relPath}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let fileViolations = 0;

  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      fileViolations++;
      totalEmojiViolations++;
      console.log(`[EMOJI FOUND] ${relPath}:${idx + 1} -> ${line.trim()}`);
    }
  });

  if (fileViolations === 0) {
    console.log(`[CLEAN] ${relPath}: 0 emojis found`);
  }
});

console.log(`\nTOTAL EMOJI VIOLATIONS: ${totalEmojiViolations}`);

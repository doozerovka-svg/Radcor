const fs = require('fs');
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

const i18n = fs.readFileSync('i18n.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const catHtml = fs.readFileSync('catalog.html', 'utf8');

console.log('--- Checking Category Keys in i18n.js ---');
const catMatches = i18n.match(/cat_[a_z_]+:\s*['"][^'"]+['"]/g) || [];
catMatches.forEach(m => {
  if (m.match(emojiRegex)) console.log('EMOJI IN CAT KEY:', m);
});

console.log('--- Checking CATEGORY_LABELS in app.js ---');
const categoryLabelsMatch = app.match(/CATEGORY_LABELS = \{[\s\S]*?\};/);
if (categoryLabelsMatch && categoryLabelsMatch[0].match(emojiRegex)) {
  console.log('EMOJI IN CATEGORY_LABELS:', categoryLabelsMatch[0]);
} else {
  console.log('No emojis in CATEGORY_LABELS');
}

console.log('--- Checking Sidebar category links in catalog.html ---');
const sidebarMatch = catHtml.match(/<aside[\s\S]*?<\/aside>/);
if (sidebarMatch) {
  const links = sidebarMatch[0].match(/<a[\s\S]*?<\/a>/g) || [];
  links.forEach(l => {
    if (l.match(emojiRegex)) console.log('EMOJI IN SIDEBAR LINK:', l);
  });
}

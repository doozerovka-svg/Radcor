const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/DenCrut/Documents/radcor.md/products.json', 'utf8'));
const pkw = data.filter(p => p.category === 'motor-oils-pkw');
console.log(`Total count: ${pkw.length}`);
pkw.forEach((p, i) => {
  console.log(`${(i+1).toString().padStart(2, ' ')}. ID: ${p.id} | Title: "${p.title}"`);
});

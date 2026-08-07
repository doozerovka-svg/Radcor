const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '../../products.json');
const appJsPath = path.resolve(__dirname, '../../app.js');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const match = appJsContent.match(/function getVolumeLabel\(v,\s*pack\)\s*\{([\s\S]*?)\n    \}/);
const fnBody = match[1];
const getVolumeLabel = new Function('v', 'pack', fnBody);

const uniqueVols = new Set();
products.forEach(p => {
  if (Array.isArray(p.volumes)) {
    p.volumes.forEach(v => uniqueVols.add(v));
  }
});

const volArray = Array.from(uniqueVols).sort((a, b) => a - b);
console.log('Unique volumes in catalog:', volArray);
volArray.forEach(v => {
  console.log(`v = ${v} => label = "${getVolumeLabel(v)}"`);
});

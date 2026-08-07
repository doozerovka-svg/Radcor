const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

console.log('Total products loaded:', products.length);

// Check price_on_request or industrial-lubricants items
const industrialItems = products.filter(p => p.category === 'industrial-lubricants' || p.price_on_request);
console.log('Industrial / price_on_request items count:', industrialItems.length);
industrialItems.slice(0, 5).forEach(p => {
    console.log(`  SKU: ${p.sku} | Name: ${p.name} | Cat: ${p.category} | price_on_request: ${p.price_on_request}`);
});

// Check OEM standards strings for verbatim examples
const oemSpecItems = products.filter(p => p.specs && p.specs.some(s => ['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label)));
console.log('Items with OEM Approval specs:', oemSpecItems.length);
oemSpecItems.slice(0, 5).forEach(p => {
    const s = p.specs.find(spec => ['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(spec.label));
    console.log(`  SKU: ${p.sku} | OEM Spec Label: "${s.label}" | Value: "${s.value}"`);
});

// Check viscosity values for motor-oils-pkw
const pkwOils = products.filter(p => p.category === 'motor-oils-pkw');
const viscositiesPkw = new Set();
pkwOils.forEach(p => {
    const v = p.viscosity || (p.specs && p.specs.find(s => s.label === 'Вязкость')?.value);
    if (v) viscositiesPkw.add(v);
});
console.log('Motor Oils PKW unique viscosities:', Array.from(viscositiesPkw));

// Check IBC volumes (983, 991, 994)
const ibcItems = products.filter(p => p.volumes && (p.volumes.includes(983) || p.volumes.includes(991) || p.volumes.includes(994)));
console.log('IBC Eurocube volume items count:', ibcItems.length);
ibcItems.slice(0, 3).forEach(p => {
    console.log(`  SKU: ${p.sku} | Name: ${p.name} | Volumes: ${JSON.stringify(p.volumes)}`);
});

// Check Antifreeze colors
const coolants = products.filter(p => p.category === 'coolants');
const coolantColors = new Set();
coolants.forEach(p => { if (p.color) coolantColors.add(p.color); });
console.log('Coolant colors found:', Array.from(coolantColors));

// Check emojis in product names, descriptions, or specs
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const emojiProducts = products.filter(p => emojiRegex.test(p.name) || emojiRegex.test(p.description || '') || (p.specs && p.specs.some(s => emojiRegex.test(s.value))));
console.log('Products containing emojis:', emojiProducts.length);
if (emojiProducts.length > 0) {
    emojiProducts.forEach(p => console.log(`  SKU: ${p.sku} | Name: ${p.name}`));
}

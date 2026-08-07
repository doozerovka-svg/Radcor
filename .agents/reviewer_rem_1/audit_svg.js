const fs = require('fs');
const glob = [
  'index.html', 'catalog.html', 'checkout.html', 'b2b-dashboard.html', 
  'admin.html', 'delivery.html', 'returns.html', 'service.html', 
  'faq.html', 'guides.html', 'contacts.html', 'app.js'
];

let totalSvgs = 0;
let validStroke = 0;
let validWidth = 0;
let nonCompliant = [];

glob.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const svgMatches = content.match(/<svg[\s\S]*?<\/svg>/gi) || [];
  totalSvgs += svgMatches.length;
  console.log(`${file}: ${svgMatches.length} SVG icons`);
  
  svgMatches.forEach((svg, idx) => {
    const strokeMatch = svg.match(/stroke="([^"]+)"/i) || svg.match(/stroke='([^']+)'/i);
    const strokeWidthMatch = svg.match(/stroke-width="([^"]+)"/i) || svg.match(/stroke-width='([^']+)'/i);
    
    const stroke = strokeMatch ? strokeMatch[1] : 'none';
    const strokeWidth = strokeWidthMatch ? parseFloat(strokeWidthMatch[1]) : 0;
    
    const strokeOk = (stroke === 'currentColor');
    const widthOk = (strokeWidth >= 1.5 && strokeWidth <= 2.5);
    
    if (strokeOk) validStroke++;
    if (widthOk) validWidth++;
    
    if (!strokeOk || !widthOk) {
      nonCompliant.push({ file, idx, stroke, strokeWidth, snippet: svg.substring(0, 100) });
    }
  });
});

console.log('\n--- SVG AUDIT SUMMARY ---');
console.log(`Total SVGs found: ${totalSvgs}`);
console.log(`SVGs with stroke="currentColor": ${validStroke}`);
console.log(`SVGs with stroke-width between 1.8 and 2.0 (1.5-2.5 range): ${validWidth}`);
console.log(`Non-compliant SVG count: ${nonCompliant.length}`);

if (nonCompliant.length > 0) {
  console.log('\nNon-compliant details:');
  nonCompliant.forEach(item => {
    console.log(`- ${item.file} #${item.idx}: stroke="${item.stroke}", stroke-width="${item.strokeWidth}" | Snippet: ${item.snippet}`);
  });
}

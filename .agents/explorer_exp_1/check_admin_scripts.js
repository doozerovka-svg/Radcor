const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\DenCrut\\Documents\\radcor.md\\admin.html', 'utf8');
const scripts = [...content.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m, i) => ({
  index: i,
  src: (m[0].match(/src=["']([^"']+)["']/i) || [])[1] || null,
  length: m[1].length
}));
console.log(scripts);

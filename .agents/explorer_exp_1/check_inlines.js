const data = require('./full_audit_data.json');
for (const [f, info] of Object.entries(data)) {
  const inlines = info.scripts.filter(s => !s.src);
  if (inlines.length > 0) {
    console.log(`Inline script found in ${f}: count = ${inlines.length}`);
  }
}

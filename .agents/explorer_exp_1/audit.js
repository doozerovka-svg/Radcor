const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'catalog.html',
  'checkout.html',
  'b2b-dashboard.html',
  'admin.html',
  'delivery.html',
  'returns.html',
  'service.html',
  'faq.html',
  'guides.html',
  'contacts.html'
];

const rootDir = 'c:\\Users\\DenCrut\\Documents\\radcor.md';

const detailedReport = {};

files.forEach(f => {
  const filePath = path.join(rootDir, f);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Links & Scripts
  const linkTags = [...content.matchAll(/<link\s+[^>]*>/gi)].map(m => m[0]);
  const scriptTags = [...content.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => {
    const srcMatch = m[0].match(/src=["']([^"']+)["']/i);
    return {
      full: m[0].replace(/\n/g, ' '),
      src: srcMatch ? srcMatch[1] : null,
      inlineSnippet: m[1].trim() ? m[1].trim().substring(0, 100) + '...' : null
    };
  });

  // 2. Language Switcher
  const langSwitcherBlock = content.match(/<div\s+[^>]*class=["'][^"']*lang-switcher[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const langLinks = [...content.matchAll(/<a\s+[^>]*class=["'][^"']*lang-link[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({
    full: m[0],
    text: m[1].trim()
  }));

  // 3. i18n attributes
  const dataI18n = [...content.matchAll(/data-i18n=["']([^"']+)["']/g)].map(m => m[1]);
  const dataI18nPlaceholder = [...content.matchAll(/data-i18n-placeholder=["']([^"']+)["']/g)].map(m => m[1]);
  const dataI18nTitle = [...content.matchAll(/data-i18n-title=["']([^"']+)["']/g)].map(m => m[1]);

  // 4. Forms & Inputs
  const forms = [...content.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)].map(m => {
    const formTag = m[0].match(/<form\b[^>]*>/i)[0];
    const inputs = [...m[1].matchAll(/<(input|select|textarea|button)\b[^>]*>/gi)].map(im => im[0]);
    return { formTag, inputs };
  });

  // Standalone inputs outside forms
  const standaloneInputs = [...content.matchAll(/<(input|select|textarea|button)\b[^>]*>/gi)]
    .map(m => m[0])
    .filter(tag => !forms.some(f => f.inputs.includes(tag)));

  detailedReport[f] = {
    links: linkTags,
    scripts: scriptTags,
    langSwitcher: {
      hasContainer: !!langSwitcherBlock,
      containerHTML: langSwitcherBlock ? langSwitcherBlock[0] : null,
      langLinks
    },
    i18n: {
      dataI18n,
      dataI18nPlaceholder,
      dataI18nTitle
    },
    forms,
    standaloneInputs
  };
});

fs.writeFileSync(
  path.join(rootDir, '.agents', 'explorer_exp_1', 'full_audit_data.json'),
  JSON.stringify(detailedReport, null, 2)
);

console.log('Audit data written to full_audit_data.json successfully.');

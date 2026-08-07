const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
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

console.log("================================================================");
console.log("M4 CHALLENGER 1 EMPIRICAL VERIFICATION SCRIPT");
console.log("================================================================\n");

// 1. Asset Versioning Check
console.log("--- 1. ASSET VERSIONING AUDIT ACROSS 11 HTML FILES ---");
let versionMap = {};
let nonV38Files = [];

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all src and href tags for local css/js assets
  const assetRegex = /(?:src|href)=["']([^"']+\.(?:css|js)(?:\?[^"']*)?)["']/g;
  let match;
  let fileVersions = new Set();
  
  while ((match = assetRegex.exec(content)) !== null) {
    const assetUrl = match[1];
    if (!assetUrl.startsWith('http') && !assetUrl.startsWith('//')) {
      const vMatch = assetUrl.match(/\?v=([^&"']+)/);
      if (vMatch) {
        fileVersions.add(vMatch[1]);
      } else {
        fileVersions.add('NO_PARAM');
      }
    }
  }
  
  const versionArr = Array.from(fileVersions);
  versionMap[file] = versionArr;
  console.log(`[FILE] ${file}: versions found -> ${versionArr.join(', ')}`);
  if (!versionArr.includes('38.0') || versionArr.some(v => v !== '38.0')) {
    nonV38Files.push({ file, versions: versionArr });
  }
});

console.log("\nSummary of asset versioning audit:");
if (nonV38Files.length === 0) {
  console.log("[PASS] All 11 HTML files consistently use ?v=38.0 for local CSS and JS assets.");
} else {
  console.log(`[FAIL] ${nonV38Files.length} file(s) do NOT consistently use ?v=38.0:`);
  nonV38Files.forEach(item => {
    console.log(` - ${item.file}: [${item.versions.join(', ')}]`);
  });
}

// 2. products.json Catalog Integrity Audit
console.log("\n--- 2. PRODUCTS.JSON CATALOG INTEGRITY AUDIT ---");
const productsPath = path.join(rootDir, 'products.json');
let products = [];
try {
  const productsRaw = fs.readFileSync(productsPath, 'utf8');
  products = JSON.parse(productsRaw);
  console.log(`[PASS] products.json is valid JSON with total ${products.length} items.`);
} catch (e) {
  console.log(`[FAIL] Failed to parse products.json: ${e.message}`);
}

if (products.length > 0) {
  // Check active count and category distribution
  const activeProducts = products.filter(p => p.active !== false);
  const inactiveProducts = products.filter(p => p.active === false);
  console.log(`Total Products: ${products.length}`);
  console.log(`Active Products: ${activeProducts.length}`);
  console.log(`Inactive Products: ${inactiveProducts.length}`);
  
  // Category counts
  const activeByCategory = {};
  const totalByCategory = {};
  products.forEach(p => {
    const cat = p.category || 'UNKNOWN';
    totalByCategory[cat] = (totalByCategory[cat] || 0) + 1;
    if (p.active !== false) {
      activeByCategory[cat] = (activeByCategory[cat] || 0) + 1;
    }
  });

  console.log("\nCategory Distribution (Active / Total):");
  Object.keys(totalByCategory).sort().forEach(cat => {
    console.log(` - ${cat}: ${activeByCategory[cat] || 0} active / ${totalByCategory[cat]} total`);
  });

  // Duplicate ID check
  const idMap = {};
  const duplicateIds = [];
  products.forEach((p, idx) => {
    if (idMap[p.id]) {
      duplicateIds.push({ id: p.id, originalIndex: idMap[p.id], duplicateIndex: idx, name: p.name });
    } else {
      idMap[p.id] = idx;
    }
  });

  if (duplicateIds.length === 0) {
    console.log("[PASS] Zero duplicate product IDs found.");
  } else {
    console.log(`[FAIL] Found ${duplicateIds.length} duplicate product IDs:`, duplicateIds);
  }

  // Duplicate SKU check
  const skuMap = {};
  const duplicateSkus = [];
  products.forEach((p, idx) => {
    if (p.sku) {
      if (skuMap[p.sku]) {
        duplicateSkus.push({ sku: p.sku, firstId: skuMap[p.sku].id, duplicateId: p.id, name: p.name });
      } else {
        skuMap[p.sku] = { id: p.id, index: idx };
      }
    }
  });

  if (duplicateSkus.length === 0) {
    console.log("[PASS] Zero duplicate SKUs found.");
  } else {
    console.log(`[FAIL] Found ${duplicateSkus.length} duplicate SKUs:`, duplicateSkus);
  }

  // Passenger car motor oils (motor-oils-pkw) check
  const pkwActive = activeProducts.filter(p => p.category === 'motor-oils-pkw');
  console.log(`\nActive motor-oils-pkw products count: ${pkwActive.length} (Expected: 33)`);
  if (pkwActive.length === 33) {
    console.log("[PASS] Exactly 33 active products in motor-oils-pkw category.");
  } else {
    console.log(`[FAIL] motor-oils-pkw active count is ${pkwActive.length}, expected 33.`);
  }

  // Check MOL Arol 2T category
  const arol2t = products.find(p => p.name && p.name.includes('Arol 2T'));
  if (arol2t) {
    console.log(`[INFO] MOL Arol 2T item found: id=${arol2t.id}, category=${arol2t.category}`);
    if (arol2t.category === 'moto-oils') {
      console.log("[PASS] MOL Arol 2T is assigned to category 'moto-oils'.");
    } else {
      console.log(`[FAIL] MOL Arol 2T is assigned to category '${arol2t.category}' instead of 'moto-oils'.`);
    }
  } else {
    console.log("[FAIL] MOL Arol 2T not found in products.json.");
  }
}

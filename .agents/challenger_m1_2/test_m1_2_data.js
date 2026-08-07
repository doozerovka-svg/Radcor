const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../products.json');

const VALID_CATEGORIES = new Set([
  'motor-oils-pkw',
  'motor-oils-lkw',
  'moto-oils',
  'transmission-oils',
  'hydraulic-oils',
  'greases',
  'industrial-lubricants',
  'coolants',
  'brake-fluids',
  'auto-chemistry',
  'accessories',
  'auto-lamps'
]);

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{F251}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}]/u;

const DISCONTINUED_PKW_ITEMS = [
  "Yuko Super Hybrid 0W-16", "Yuko Syntetic 0W-16", "MOL Dynamic Gold Ultra 0W-16",
  "Yuko Syntetic 0W-20", "MOL Dynamic Gold 0W-20", "MOL Dynamic Gold 0W-20 VAG", "MOL Dynamic Synt RN17FE 0W-20",
  "Yuko Syntetic 0W-30", "MOL Dynamic Gold 0W-30", "MOL Dynamic Star 0W-30",
  "Yuko Syntetic 5W-20", "MOL Dynamic Gold HUN 5W-30", "MOL Dynamic Synt 5W-30",
  "MOL Dynamic Gold 5W-40", "Yuko Vega Synt 5W-40", "MOL Dynamic Synt RN 5W-40", "MOL Dynamic Essence DPF 5W-40", "MOL Essence Multi Gaz 5W-40",
  "Yuko Semisynt 10W-30", "Yuko Synetic 10W-30", "MOL Dynamic Synt 10W-30",
  "MOL 15W-40", "Yuko Classic 20W-50", "MOL Dynamic Race R5"
];

function runStressTest() {
  console.log("=================================================");
  console.log("   CHALLENGER M1_2 DATA INTEGRITY STRESS TEST    ");
  console.log("=================================================");

  const errors = [];
  const warnings = [];
  const testResults = [];

  function recordTest(name, passed, detail) {
    testResults.push({ name, passed, detail });
    if (passed) {
      console.log(`[PASS] ${name}: ${detail}`);
    } else {
      console.error(`[FAIL] ${name}: ${detail}`);
    }
  }

  // 1. Load & parse JSON
  let data;
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    data = JSON.parse(raw);
    recordTest("JSON Parse Test", true, `Successfully loaded and parsed products.json (${data.length} items)`);
  } catch (err) {
    recordTest("JSON Parse Test", false, `JSON Syntax Error: ${err.message}`);
    return summarize(testResults, errors, warnings);
  }

  if (!Array.isArray(data)) {
    recordTest("Root Schema Structure", false, "Root element in products.json is not an Array.");
    return summarize(testResults, errors, warnings);
  }
  recordTest("Root Schema Structure", true, "Root element is a valid JSON Array.");

  // 2. Product Required Fields & Schema Integrity
  const seenSkus = new Map();
  let invalidCategoryCount = 0;
  let missingFieldCount = 0;

  data.forEach((item, index) => {
    const skuRef = item.sku ? `SKU '${item.sku}'` : `Item index #${index}`;

    // Required fields: sku, name, category, brand, name_ro
    const required = ['sku', 'name', 'category', 'brand', 'name_ro'];
    required.forEach(field => {
      if (!item[field] || typeof item[field] !== 'string' || item[field].trim() === '') {
        errors.push(`${skuRef}: Missing or invalid required field '${field}'`);
        missingFieldCount++;
      }
    });

    // SKU uniqueness
    if (item.sku) {
      if (seenSkus.has(item.sku)) {
        errors.push(`Duplicate SKU detected: '${item.sku}' (First seen at index ${seenSkus.get(item.sku)}, repeated at index ${index})`);
      } else {
        seenSkus.set(item.sku, index);
      }
    }

    // Category validation
    if (item.category && !VALID_CATEGORIES.has(item.category)) {
      errors.push(`${skuRef}: Invalid category '${item.category}' (must be valid v15.0 category key)`);
      invalidCategoryCount++;
    }

    // Volumes array check
    if (item.volumes !== undefined) {
      if (!Array.isArray(item.volumes)) {
        errors.push(`${skuRef}: 'volumes' is not an Array.`);
      } else {
        item.volumes.forEach((v, vIdx) => {
          if (typeof v !== 'number' || isNaN(v) || v <= 0) {
            errors.push(`${skuRef}: volumes[${vIdx}] is invalid number '${v}'`);
          }
        });
      }
    }

    // Packs array check
    if (item.packs !== undefined) {
      if (!Array.isArray(item.packs)) {
        errors.push(`${skuRef}: 'packs' is not an Array.`);
      } else {
        item.packs.forEach((p, pIdx) => {
          if (!p || typeof p !== 'object') {
            errors.push(`${skuRef}: packs[${pIdx}] is not an object.`);
          } else {
            if (typeof p.volume_l !== 'number' || isNaN(p.volume_l)) {
              errors.push(`${skuRef}: packs[${pIdx}].volume_l must be a valid number.`);
            }
            if (typeof p.label !== 'string' || p.label.trim() === '') {
              errors.push(`${skuRef}: packs[${pIdx}].label must be a non-empty string.`);
            }
          }
        });
      }
    }

    // Specs array check & raw OEM string check
    if (item.specs !== undefined) {
      if (!Array.isArray(item.specs)) {
        errors.push(`${skuRef}: 'specs' is not an Array.`);
      } else {
        item.specs.forEach((s, sIdx) => {
          if (!s || typeof s !== 'object') {
            errors.push(`${skuRef}: specs[${sIdx}] is not an object.`);
          } else {
            if (typeof s.label !== 'string' || s.label.trim() === '') {
              errors.push(`${skuRef}: specs[${sIdx}].label must be a non-empty string.`);
            }
            if (typeof s.value !== 'string') {
              errors.push(`${skuRef}: specs[${sIdx}].value must be a string.`);
            }
          }
        });
      }
    }

    // Emoji check
    function scanForEmoji(obj, currentPath) {
      if (typeof obj === 'string') {
        if (EMOJI_REGEX.test(obj)) {
          errors.push(`${skuRef}: Emoji detected in '${currentPath}': "${obj}"`);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((child, idx) => scanForEmoji(child, `${currentPath}[${idx}]`));
      } else if (obj && typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
          scanForEmoji(v, `${currentPath}.${k}`);
        }
      }
    }
    scanForEmoji(item, 'item');
  });

  recordTest("Required Fields Validation", missingFieldCount === 0, missingFieldCount === 0 ? "All items have required fields (sku, name, category, brand, name_ro)" : `Found ${missingFieldCount} missing field violations.`);
  recordTest("SKU Uniqueness", seenSkus.size === data.length, `Unique SKUs: ${seenSkus.size} / Total items: ${data.length}`);
  recordTest("Category Schema Compliance", invalidCategoryCount === 0, invalidCategoryCount === 0 ? "All categories adhere to AGENTS.md v15.0 scheme." : `Found ${invalidCategoryCount} invalid category keys.`);

  // 3. Check MOL Arol 2T Re-categorization
  const arolItem = data.find(i => i.sku === 'MOL-1042' || (i.name && i.name.toLowerCase().includes('arol 2t')));
  if (!arolItem) {
    errors.push("MOL Arol 2T (MOL-1042) is missing from products.json!");
    recordTest("MOL Arol 2T Location", false, "MOL Arol 2T product missing.");
  } else if (arolItem.category !== 'moto-oils') {
    errors.push(`MOL Arol 2T category is '${arolItem.category}', expected 'moto-oils'.`);
    recordTest("MOL Arol 2T Location", false, `Category is '${arolItem.category}', expected 'moto-oils'.`);
  } else {
    recordTest("MOL Arol 2T Location", true, "MOL Arol 2T (MOL-1042) is correctly categorized under 'moto-oils'.");
  }

  // 4. Check R1 Discontinued Items Cleanup in motor-oils-pkw
  const pkwItems = data.filter(i => i.category === 'motor-oils-pkw');
  let discontinuedInPkwCount = 0;

  DISCONTINUED_PKW_ITEMS.forEach(discName => {
    const foundInPkw = pkwItems.find(i => i.name.trim().toLowerCase() === discName.trim().toLowerCase());
    if (foundInPkw) {
      errors.push(`Discontinued product '${discName}' still found in motor-oils-pkw (SKU: ${foundInPkw.sku})`);
      discontinuedInPkwCount++;
    }
  });

  recordTest("Discontinued Items Cleanup", discontinuedInPkwCount === 0, discontinuedInPkwCount === 0 ? "All 25 discontinued items successfully removed from motor-oils-pkw." : `Found ${discontinuedInPkwCount} discontinued items still present.`);

  // 5. PKW Catalog Model Count & Duplicates Audit
  console.log(`[INFO] Current active motor-oils-pkw models count: ${pkwItems.length}`);
  
  // Check for duplicate product names in motor-oils-pkw
  const pkwNameCounts = new Map();
  pkwItems.forEach(item => {
    const normName = item.name.trim().toLowerCase();
    pkwNameCounts.set(normName, (pkwNameCounts.get(normName) || 0) + 1);
  });

  let duplicateNameCount = 0;
  pkwNameCounts.forEach((count, name) => {
    if (count > 1) {
      warnings.push(`Duplicate PKW product name detected: '${name}' (count: ${count})`);
      duplicateNameCount++;
    }
  });

  recordTest("PKW Name Uniqueness Audit", duplicateNameCount === 0, duplicateNameCount === 0 ? "No duplicate product names in motor-oils-pkw." : `Found ${duplicateNameCount} duplicate names in motor-oils-pkw.`);

  return summarize(testResults, errors, warnings);
}

function summarize(testResults, errors, warnings) {
  console.log("\n=================================================");
  console.log("                  TEST SUMMARY                   ");
  console.log("=================================================");
  console.log(`Total Checks Executed: ${testResults.length}`);
  console.log(`Passed Checks:        ${testResults.filter(t => t.passed).length}`);
  console.log(`Failed Checks:        ${testResults.filter(t => !t.passed).length}`);
  console.log(`Total Errors Logged:  ${errors.length}`);
  console.log(`Total Warnings:       ${warnings.length}`);

  if (errors.length > 0) {
    console.log("\n--- ERRORS ---");
    errors.forEach(e => console.log(`  - ${e}`));
  }
  if (warnings.length > 0) {
    console.log("\n--- WARNINGS ---");
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  const overallPassed = testResults.every(t => t.passed) && errors.length === 0;

  console.log("\n=================================================");
  if (overallPassed) {
    console.log("       EXPLICIT VERDICT: APPROVE                 ");
  } else {
    console.log("       EXPLICIT VERDICT: REJECT                  ");
  }
  console.log("=================================================\n");

  return { passed: overallPassed, errors, warnings, testResults };
}

runStressTest();

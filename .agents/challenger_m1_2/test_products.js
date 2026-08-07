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

const DISCONTINUED_ITEMS = [
  "Yuko Super Hybrid 0W-16", "Yuko Syntetic 0W-16", "MOL Dynamic Gold Ultra 0W-16",
  "Yuko Syntetic 0W-20", "MOL Dynamic Gold 0W-20", "MOL Dynamic Gold 0W-20 VAG", "MOL Dynamic Synt RN17FE 0W-20",
  "Yuko Syntetic 0W-30", "MOL Dynamic Gold 0W-30", "MOL Dynamic Star 0W-30",
  "Yuko Syntetic 5W-20", "MOL Dynamic Gold HUN 5W-30", "MOL Dynamic Synt 5W-30",
  "MOL Dynamic Gold 5W-40", "Yuko Vega Synt 5W-40", "MOL Dynamic Synt RN 5W-40", "MOL Dynamic Essence DPF 5W-40", "MOL Essence Multi Gaz 5W-40",
  "Yuko Semisynt 10W-30", "Yuko Synetic 10W-30", "MOL Dynamic Synt 10W-30", "MOL Dynamic Transit 10W-30",
  "MOL 15W-40", "Yuko Classic 20W-50", "MOL Dynamic Race R5"
];

function runTests() {
  console.log("=== EMPIRICAL STRESS TEST: PRODUCTS.JSON ===");
  const errors = [];
  const warnings = [];

  let data;
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    data = JSON.parse(raw);
    console.log(`[PASS] JSON syntax valid. Loaded ${data.length} total products.`);
  } catch (err) {
    console.error(`[FAIL] Failed to load/parse products.json: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    errors.push("Root JSON value is not an Array.");
    return finish(errors, warnings);
  }

  const seenIds = new Set();
  const seenSkus = new Set();
  const pkwItems = [];

  data.forEach((item, index) => {
    const idRef = item && item.id ? `ID '${item.id}'` : `Item #${index}`;

    if (!item || typeof item !== 'object') {
      errors.push(`${idRef}: Product entry is not an object.`);
      return;
    }

    // Required fields check
    const requiredFields = ['id', 'sku', 'name', 'category', 'brand', 'volumes', 'packs', 'specs'];
    for (const field of requiredFields) {
      if (!(field in item) || item[field] === undefined || item[field] === null) {
        errors.push(`${idRef}: Missing required field '${field}'`);
      }
    }

    // ID uniqueness & format
    if (item.id) {
      if (typeof item.id !== 'string' || item.id.trim() === '') {
        errors.push(`${idRef}: 'id' must be a non-empty string.`);
      }
      if (seenIds.has(item.id)) {
        errors.push(`Duplicate ID detected: '${item.id}'`);
      }
      seenIds.add(item.id);
    }

    // SKU uniqueness & format
    if (item.sku) {
      if (typeof item.sku !== 'string' || item.sku.trim() === '') {
        errors.push(`${idRef}: 'sku' must be a non-empty string.`);
      }
      if (seenSkus.has(item.sku)) {
        errors.push(`Duplicate SKU detected: '${item.sku}'`);
      }
      seenSkus.add(item.sku);
    }

    // Name check
    if (item.name !== undefined && (typeof item.name !== 'string' || item.name.trim() === '')) {
      errors.push(`${idRef}: 'name' must be a non-empty string.`);
    }

    // Category check
    if (item.category) {
      if (!VALID_CATEGORIES.has(item.category)) {
        errors.push(`${idRef}: Invalid category key '${item.category}'.`);
      }
      if (item.category === 'motor-oils-pkw') {
        pkwItems.push(item);
      }
    }

    // Brand check
    if (item.brand !== undefined && (typeof item.brand !== 'string' || item.brand.trim() === '')) {
      errors.push(`${idRef}: 'brand' must be a non-empty string.`);
    }

    // Volumes check
    if (item.volumes) {
      if (!Array.isArray(item.volumes)) {
        errors.push(`${idRef}: 'volumes' must be an Array.`);
      } else {
        item.volumes.forEach((vol, vIdx) => {
          if (typeof vol !== 'number' || isNaN(vol) || vol <= 0) {
            errors.push(`${idRef}: 'volumes[${vIdx}]' is invalid (${vol}). Must be positive number.`);
          }
        });
      }
    }

    // Packs check
    if (item.packs) {
      if (!Array.isArray(item.packs)) {
        errors.push(`${idRef}: 'packs' must be an Array.`);
      } else {
        item.packs.forEach((pack, pIdx) => {
          if (!pack || typeof pack !== 'object') {
            errors.push(`${idRef}: 'packs[${pIdx}]' is not an object.`);
          } else {
            if (typeof pack.volume_l !== 'number') {
              errors.push(`${idRef}: 'packs[${pIdx}].volume_l' must be a number.`);
            }
            if (typeof pack.label !== 'string' || pack.label.trim() === '') {
              errors.push(`${idRef}: 'packs[${pIdx}].label' must be a non-empty string.`);
            }
            if (typeof pack.price !== 'number') {
              errors.push(`${idRef}: 'packs[${pIdx}].price' must be a number.`);
            }
          }
        });
      }
    }

    // Specs check
    if (item.specs) {
      if (!Array.isArray(item.specs)) {
        errors.push(`${idRef}: 'specs' must be an Array.`);
      } else {
        item.specs.forEach((spec, sIdx) => {
          if (!spec || typeof spec !== 'object') {
            errors.push(`${idRef}: 'specs[${sIdx}]' is not an object.`);
          } else {
            if (typeof spec.label !== 'string' || spec.label.trim() === '') {
              errors.push(`${idRef}: 'specs[${sIdx}].label' must be a non-empty string.`);
            }
            if (typeof spec.value !== 'string') {
              errors.push(`${idRef}: 'specs[${sIdx}].value' must be a string.`);
            }
          }
        });
      }
    }

    // Emoji check across object
    function checkEmojiInObject(obj, currentPath) {
      if (typeof obj === 'string') {
        if (EMOJI_REGEX.test(obj)) {
          errors.push(`${idRef}: Emoji found in field '${currentPath}': "${obj}"`);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((elem, i) => checkEmojiInObject(elem, `${currentPath}[${i}]`));
      } else if (obj && typeof obj === 'object') {
        for (const [key, val] of Object.entries(obj)) {
          checkEmojiInObject(val, `${currentPath}.${key}`);
        }
      }
    }

    checkEmojiInObject(item, 'item');
  });

  // Re-categorization verification (MOL Arol 2T)
  const arolItem = data.find(i => i.id === 'MOL-1042' || (i.name && i.name.includes('Arol 2T')));
  if (!arolItem) {
    errors.push("MOL Arol 2T (MOL-1042) is missing from products.json!");
  } else if (arolItem.category !== 'moto-oils') {
    errors.push(`MOL Arol 2T category is '${arolItem.category}', expected 'moto-oils'.`);
  } else {
    console.log("[PASS] MOL Arol 2T correctly assigned to 'moto-oils'.");
  }

  // Discontinued items check
  for (const discName of DISCONTINUED_ITEMS) {
    const found = data.find(i => i.name && i.name.trim().toLowerCase() === discName.trim().toLowerCase());
    if (found) {
      errors.push(`Discontinued item '${discName}' is still present in products.json (ID: ${found.id})`);
    }
  }

  // PKW Count check
  console.log(`[INFO] Active motor-oils-pkw count: ${pkwItems.length}`);
  if (pkwItems.length !== 33) {
    errors.push(`Expected exactly 33 active motor-oils-pkw products, found ${pkwItems.length}`);
  } else {
    console.log("[PASS] Exactly 33 motor-oils-pkw products present.");
  }

  finish(errors, warnings);
}

function finish(errors, warnings) {
  console.log("\n--- SUMMARY RESULTS ---");
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log("\n[!] DETECTED ERRORS:");
    errors.forEach(e => console.log(`  - ${e}`));
  }
  if (warnings.length > 0) {
    console.log("\n[!] DETECTED WARNINGS:");
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (errors.length === 0) {
    console.log("\n>>> VERDICT: APPROVE <<<");
    process.exit(0);
  } else {
    console.log("\n>>> VERDICT: REJECT <<<");
    process.exit(1);
  }
}

runTests();

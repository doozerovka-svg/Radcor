# HANDOFF REPORT — Explorer M2: Titles, New Positions & Pack Volume Sync

## 1. Observation

### A. Current Dataset State
- **File**: `c:\Users\DenCrut\Documents\radcor.md\products.json`
- **Current PKW Product Count**: Exactly 36 active items in category `motor-oils-pkw` (following Milestone 1 cleanup of discontinued and duplicate products, and moving `MOL Arol 2T` to `moto-oils`).
- **Current Total Dataset Size**: 421 items.

### B. Title Renames Specification (11 Items)
Target SKUs and their current vs required names in `products.json`:
1. `MOL-HYBRID-0W16`: `"MOL Dynamic Hybrid 0W-16"` $\rightarrow$ `"MOL Dynamic Gold NG 0W-16"`
2. `MOL-DYN-STAR-0W20`: `"MOL Dynamic Star 0W-20"` $\rightarrow$ `"MOL Dynamic Gold NG 0W-20"`
3. `MOL-DYN-ESS-5W30`: `"Моторное масло MOL Dynamic Essence 5W-30"` $\rightarrow$ `"MOL Essence 5W-30"`
4. `MOL-DYN-ESS-C2-5W30`: `"MOL Dynamic Essence C2 5W-30"` $\rightarrow$ `"MOL Essence DPF 5W-30"`
5. `MOL-DYN-ESS-5W40`: `"Моторное масло MOL Dynamic Essence 5W-40"` $\rightarrow$ `"MOL Essence 5W-40"`
6. `MOL-DYN-ESS-DSL-5W40`: `"MOL Dynamic Essence Diesel 5W-40"` $\rightarrow$ `"MOL Essence Diesel 5W-40"`
7. `MOL-DYN-PRIMA-5W40`: `"Моторное масло MOL Dynamic Prima 5W-40"` $\rightarrow$ `"MOL Prima 5W-40"`
8. `YUKO-SYNETIC-5W40`: `"Моторное масло YUKO Synetic 5W-40 (1 л)"` $\rightarrow$ `"Yuko Synthetic 5W-40"`
9. `MOL-DYN-ESS-DSL-10W40`: `"MOL Dynamic Essence Diesel 10W-40"` $\rightarrow$ `"MOL Essence Diesel 10W-40"`
10. `YUKO-CLASSIC-15W40`: `"Моторное масло YUKO CLASSIC 15W-40"` $\rightarrow$ `"Yuko Dynamic 15W-40"`
11. `MOL-DYN-ESS-15W40`: `"MOL Dynamic Essence 15W-40"` $\rightarrow$ `"MOL Essence 15W-40"`

### C. New Product Additions (2 Items under `motor-oils-pkw`)
1. `MOL Dynamic Star VL 0W-30` (SKU `MOL-DYN-STAR-VL-0W30`):
   - Category: `"motor-oils-pkw"`
   - Brand: `"MOL"`
   - Volumes: `[1, 4]`
   - Packs: 1L (`"1 л"`), 4L (`"4 л"`)
   - Specs: Viscosity `"0W-30"`, Class `"ACEA A5/B5, A1/B1"`, OEM Approval `"Volvo VCC 95200377"`
2. `MOL Essence SL 10W-40` (SKU `MOL-ESSENCE-SL-10W40`):
   - Category: `"motor-oils-pkw"`
   - Brand: `"MOL"`
   - Volumes: `[4, 5, 20, 54, 196, 991]`
   - Packs: 4L (`"4 л"`), 5L (`"5 л BiB"`), 20L (`"20 л BiB"`), 54L (`"54 л (Бочка)"`), 196L (`"196 л (Бочка)"`), 991L (`"991 л (Еврокуб)"`)
   - Specs: Viscosity `"10W-40"`, Class `"API SL/CF, ACEA A3/B4"`, OEM Approval `"VW 501.01/505.00"`

### D. Volumes & Packs Desynchronization & Label Formatting
- **File**: `c:\Users\DenCrut\Documents\radcor.md\products.json`
- **Observed Desync**: 4 PKW SKUs (`MOL-1005`, `MOL-1006`, `MOL-1025`, `MOL-1070`) currently have volumes in `product.volumes` (`[1, 4, 60, 208, ...]`) that are missing from their `product.packs` array.
- **991L Eurocube Label**: 36 products with volume 991 currently have pack label `"991 л"`. They require label `"991 л (Еврокуб)"` for consistency with 983L (`"983 л (Еврокуб)"`).

### E. `app.js` Fallback Code Location
- **File**: `c:\Users\DenCrut\Documents\radcor.md\app.js`
- **Line 209**: `if (numV === 991) return '991 л';`
- **Target Change**: Update line 209 to `if (numV === 991) return '991 л (Еврокуб)';`

---

## 2. Logic Chain

1. **Title Renames**: Updating product titles removes redundant brand/type prefixes (e.g. `Моторное масло`), aligns `Essence` and `Prima` product lines with Alexandr Radcor-prim SRL standards, and fixes YUKO naming conventions.
2. **New Product Insertions**: Adding `MOL Dynamic Star VL 0W-30` and `MOL Essence SL 10W-40` expands `motor-oils-pkw` from 36 to exactly 38 active items, fulfilling Requirement R2.
3. **Packs & Volumes Sync**:
   - `product.volumes` is used by sidebar volume filter checkboxes.
   - `product.packs` is used for rendering card volume options and cart pricing.
   - Setting `product.volumes = product.packs.map(p => Number(p.volume_l))` guarantees 100% alignment across the catalog.
   - Updating pack labels for volume `991` to `"991 л (Еврокуб)"` ensures Eurocubes render correctly on product cards, drawers, and cart items.
4. **`app.js` Fallback Update**: Updating `getVolumeLabel` line 209 ensures that if any product tag or filter lacks an explicit `pack.label`, 991L volume is consistently formatted as `'991 л (Еврокуб)'`.

---

## 3. Caveats

No caveats. All 11 target SKUs exist, exact JSON schemas are defined, and the codebase state is verified.

---

## 4. Conclusion & Step-by-Step Instructions for Worker M2

Worker M2 should perform the following four sequential tasks:

### Step 1: Update `products.json` Titles, Packs, and Volumes
Execute a Node.js script to modify `products.json`:

```javascript
const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// 1. Apply 11 Title Renames
const titleMap = {
  'MOL-HYBRID-0W16': 'MOL Dynamic Gold NG 0W-16',
  'MOL-DYN-STAR-0W20': 'MOL Dynamic Gold NG 0W-20',
  'MOL-DYN-ESS-5W30': 'MOL Essence 5W-30',
  'MOL-DYN-ESS-C2-5W30': 'MOL Essence DPF 5W-30',
  'MOL-DYN-ESS-5W40': 'MOL Essence 5W-40',
  'MOL-DYN-ESS-DSL-5W40': 'MOL Essence Diesel 5W-40',
  'MOL-DYN-PRIMA-5W40': 'MOL Prima 5W-40',
  'YUKO-SYNETIC-5W40': 'Yuko Synthetic 5W-40',
  'MOL-DYN-ESS-DSL-10W40': 'MOL Essence Diesel 10W-40',
  'YUKO-CLASSIC-15W40': 'Yuko Dynamic 15W-40',
  'MOL-DYN-ESS-15W40': 'MOL Essence 15W-40'
};

products.forEach(p => {
  if (titleMap[p.sku]) {
    p.name = titleMap[p.sku];
  }
});

// 2. Insert 2 New Product Items into motor-oils-pkw
const newProduct1 = {
  "sku": "MOL-DYN-STAR-VL-0W30",
  "name": "MOL Dynamic Star VL 0W-30",
  "category": "motor-oils-pkw",
  "brand": "MOL",
  "photo_url": "",
  "volumes": [1, 4],
  "description": "Синтетическое энергосберегающее моторное масло высшего качества для современных бензиновых и дизельных двигателей легковых автомобилей Volvo.",
  "name_ro": "MOL Dynamic Star VL 0W-30",
  "description_ro": "Ulei de motor sintetic de calitate superioară pentru motoarele moderne pe benzină și motorină ale autoturismelor Volvo.",
  "specs": [
    { "label": "Вязкость", "value": "0W-30" },
    { "label": "Класс", "value": "ACEA A5/B5, A1/B1" },
    { "label": "Допуски", "value": "Volvo VCC 95200377" }
  ],
  "canister_vol": 1,
  "canister_price": 210,
  "barrel_vol": 4,
  "barrel_price": 780,
  "packs": [
    { "id": "p-1", "volume_l": 1, "price_mdl": 210, "label": "1 л" },
    { "id": "p-4", "volume_l": 4, "price_mdl": 780, "label": "4 л" }
  ]
};

const newProduct2 = {
  "sku": "MOL-ESSENCE-SL-10W40",
  "name": "MOL Essence SL 10W-40",
  "category": "motor-oils-pkw",
  "brand": "MOL",
  "photo_url": "",
  "volumes": [4, 5, 20, 54, 196, 991],
  "description": "Полусинтетическое моторное масло с высоким уровнем защиты от износа для бензиновых и дизельных двигателей легковых автомобилей.",
  "name_ro": "MOL Essence SL 10W-40",
  "description_ro": "Ulei de motor semisintetic cu nivel înalt de protecție împotriva uzurii pentru motoare pe benzină și motorină ale autoturismelor.",
  "specs": [
    { "label": "Вязкость", "value": "10W-40" },
    { "label": "Класс", "value": "API SL/CF, ACEA A3/B4" },
    { "label": "Допуски", "value": "VW 501.01/505.00" }
  ],
  "canister_vol": 4,
  "canister_price": 390,
  "barrel_vol": 196,
  "barrel_price": 16500,
  "packs": [
    { "id": "p-4", "volume_l": 4, "price_mdl": 390, "label": "4 л" },
    { "id": "p-5", "volume_l": 5, "price_mdl": 475, "label": "5 л BiB" },
    { "id": "p-20", "volume_l": 20, "price_mdl": 1820, "label": "20 л BiB" },
    { "id": "p-54", "volume_l": 54, "price_mdl": 4700, "label": "54 л (Бочка)" },
    { "id": "p-196", "volume_l": 196, "price_mdl": 16500, "label": "196 л (Бочка)" },
    { "id": "p-991", "volume_l": 991, "price_mdl": 79000, "label": "991 л (Еврокуб)" }
  ]
};

// Check if not already added, then push
if (!products.some(p => p.sku === newProduct1.sku)) products.push(newProduct1);
if (!products.some(p => p.sku === newProduct2.sku)) products.push(newProduct2);

// 3. Sync packs & volumes and update 991L pack labels across all products
products.forEach(p => {
  if (p.packs && Array.isArray(p.packs)) {
    p.packs.forEach(pk => {
      if (pk.volume_l === 991 && pk.label === '991 л') {
        pk.label = '991 л (Еврокуб)';
      }
    });
    // Guarantee 100% sync of volumes array with packs volume_l values
    p.volumes = p.packs.map(pk => Number(pk.volume_l));
  }
});

fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf8');
console.log('Updated products.json successfully.');
```

### Step 2: Update `app.js` Line 209 Fallback
In `c:\Users\DenCrut\Documents\radcor.md\app.js`, replace:
```javascript
if (numV === 991) return '991 л';
```
with:
```javascript
if (numV === 991) return '991 л (Еврокуб)';
```

---

## 5. Verification Method

Worker M2 should run the following Node.js script from `c:\Users\DenCrut\Documents\radcor.md` to verify all Milestone 2 criteria:

```bash
node -e "
const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// 1. Verify motor-oils-pkw count is exactly 38
const pkw = products.filter(p => p.category === 'motor-oils-pkw');
console.log('PKW Product Count:', pkw.length);
if (pkw.length !== 38) {
  console.error('✖ FAIL: Expected 38 PKW items, found ' + pkw.length);
  process.exit(1);
}

// 2. Verify all 11 title renames are active
const renames = [
  { sku: 'MOL-HYBRID-0W16', name: 'MOL Dynamic Gold NG 0W-16' },
  { sku: 'MOL-DYN-STAR-0W20', name: 'MOL Dynamic Gold NG 0W-20' },
  { sku: 'MOL-DYN-ESS-5W30', name: 'MOL Essence 5W-30' },
  { sku: 'MOL-DYN-ESS-C2-5W30', name: 'MOL Essence DPF 5W-30' },
  { sku: 'MOL-DYN-ESS-5W40', name: 'MOL Essence 5W-40' },
  { sku: 'MOL-DYN-ESS-DSL-5W40', name: 'MOL Essence Diesel 5W-40' },
  { sku: 'MOL-DYN-PRIMA-5W40', name: 'MOL Prima 5W-40' },
  { sku: 'YUKO-SYNETIC-5W40', name: 'Yuko Synthetic 5W-40' },
  { sku: 'MOL-DYN-ESS-DSL-10W40', name: 'MOL Essence Diesel 10W-40' },
  { sku: 'YUKO-CLASSIC-15W40', name: 'Yuko Dynamic 15W-40' },
  { sku: 'MOL-DYN-ESS-15W40', name: 'MOL Essence 15W-40' }
];

let renamesOk = true;
renames.forEach(r => {
  const p = products.find(prod => prod.sku === r.sku);
  if (!p || p.name !== r.name) {
    console.error('✖ FAIL: Title mismatch for SKU ' + r.sku + '. Expected: \"' + r.name + '\", Got: \"' + (p ? p.name : 'MISSING') + '\"');
    renamesOk = false;
  }
});
if (!renamesOk) process.exit(1);
console.log('✔ All 11 title renames verified.');

// 3. Verify packs and volumes are 100% in sync for ALL products
let desyncCount = 0;
products.forEach(p => {
  const vols = (p.volumes || []).map(Number);
  const packVols = (p.packs || []).map(pk => Number(pk.volume_l));
  const setV = new Set(vols);
  const setP = new Set(packVols);
  if (vols.length !== packVols.length || !vols.every(v => setP.has(v)) || !packVols.every(pv => setV.has(pv))) {
    desyncCount++;
    console.error('✖ Desync in SKU ' + p.sku + ': vols=' + JSON.stringify(vols) + ', packs=' + JSON.stringify(packVols));
  }
});
if (desyncCount !== 0) {
  console.error('✖ FAIL: Found ' + desyncCount + ' products with desynchronized volumes and packs.');
  process.exit(1);
}
console.log('✔ Packs and volumes are 100% in sync across all products.');

// 4. Verify app.js fallback for 991L
const appJs = fs.readFileSync('app.js', 'utf8');
if (!appJs.includes(\"if (numV === 991) return '991 \\u043b (\\u0415\\u0432\\u0440\\u043e\\u043a\\u0443\\u0431)';\") && !appJs.includes(\"if (numV === 991) return '991 л (Еврокуб)';\")) {
  console.error('✖ FAIL: app.js fallback for 991L is not updated.');
  process.exit(1);
}
console.log('✔ app.js fallback for 991L Eurocube verified.');

console.log('SUCCESS: All Milestone 2 verification checks passed!');
"
```

**Invalidation conditions**:
- PKW count != 38.
- Any of 11 product titles do not match exact expected target.
- Any product has `volumes` array not matching `packs` volume numbers.
- `app.js` line 209 does not return `'991 л (Еврокуб)'`.

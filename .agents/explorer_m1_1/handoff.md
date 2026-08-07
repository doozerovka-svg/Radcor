# Milestone 1 Handoff Report: Strategy & Execution Plan for Catalog Cleanup & Re-categorization (M1)

## 1. Observation

### 1.1 Source Files Audited
- **Assigned Working Directory**: `c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_m1_1`
- **Original User Request**: `c:\Users\DenCrut\Documents\radcor.md\.agents\ORIGINAL_REQUEST.md` (R1 § 12-21, R2 § 39)
- **Project Specifications & Rules**:
  - `c:\Users\DenCrut\Documents\radcor.md\AGENTS.md` (B2B UI design invariants, data integrity, category hierarchy)
  - `c:\Users\DenCrut\Documents\radcor.md\PROJECT.md` (Milestone decomposition & data schema contract)
- **Explorer 1 Survey Report**: `c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_survey_1\handoff.md`
- **Catalog Dataset**: `c:\Users\DenCrut\Documents\radcor.md\products.json`

### 1.2 Baseline Dataset State (Prior to M1 Edits)
Command executed: `node -e "const p = JSON.parse(fs.readFileSync('products.json')); ..."`
Results observed:
- Total products in `products.json`: **456 items**.
- Total products in `motor-oils-pkw` category: **72 items**.
- Discontinued items present in `products.json`: **25 items** (all tagged as `motor-oils-pkw`).
- Duplicate items present in `products.json`: **10 items** (all tagged as `motor-oils-pkw`).
- SKU `MOL-1042` (`MOL Arol 2T`) currently tagged as `motor-oils-pkw`: **1 item**.

### 1.3 Exact Lists of SKUs for Worker M1 Execution

#### 1.3.1 Discontinued / Absent Products (25 SKUs to Remove)
1. `YUKO-HYBRID-0W16` — Yuko Super Hybrid 0W-16
2. `YUKO-SYNETIC-0W16` — Yuko Syntetic 0W-16
3. `MOL-1080` — MOL Dynamic Gold Ultra 0W-16
4. `YUKO-SYNETIC-0W20` — Yuko Syntetic 0W-20
5. `MOL-DYN-GOLD-0W20` — MOL Dynamic Gold 0W-20
6. `MOL-DYN-GOLD-0W20-VAG` — MOL Dynamic Gold 0W-20 VAG
7. `MOL-1067` — MOL Dynamic Synt RN17FE 0W-20
8. `YUKO-SYNETIC-0W30` — Yuko Syntetic 0W-30
9. `MOL-DYN-GOLD-0W30` — MOL Dynamic Gold 0W-30
10. `MOL-1000` — MOL Dynamic Star 0W-30
11. `YUKO-SYNETIC-5W20` — Yuko Syntetic 5W-20
12. `MOL-DYN-GOLD-HUN-5W30` — MOL Dynamic Gold HUN 5W-30
13. `MOL-1028` — MOL Dynamic Synt 5W-30
14. `MOL-DYN-GOLD-5W40` — MOL Dynamic Gold 5W-40
15. `YUKO-VEGA-5W40` — Yuko Vega Synt 5W-40
16. `MOL-DYN-SYNT-RN-5W40` — MOL Dynamic Synt RN 5W-40
17. `MOL-DYN-ESS-DPF-5W40` — MOL Dynamic Essence DPF 5W-40
18. `MOL-1065` — MOL Essence Multi Gaz 5W-40
19. `YUKO-SEMISYNT-10W30` — Yuko Semisynt 10W-30
20. `YUKO-SYNETIC-10W30` — Yuko Synetic 10W-30
21. `MOL-SYNT-10W30` — MOL Dynamic Synt 10W-30
22. `MOL-1081` — MOL Dynamic Transit 10W-30
23. `MOL-15W40-MIN` — MOL 15W-40
24. `YUKO-CLASSIC-20W50` — Yuko Classic 20W-50
25. `MOL-1064` — MOL Dynamic Race R5

#### 1.3.2 Duplicate Entries (10 SKUs to Remove)
1. `MOL-1073` — MOL Dynamic Gold Longlife 0W-30 (Duplicate of `MOL-1061`)
2. `MOL-DYN-GOLD-LONGLIFE-5W30` — MOL Dynamic Gold Longlife 5W-30 (Duplicate of `MOL-1011`)
3. `MOL-1071` — MOL Essence 5W-30 (Duplicate of `MOL-DYN-ESS-5W30`)
4. `MOL-1053` — MOL Essence Diesel 5W-40 (Duplicate of `MOL-DYN-ESS-DSL-5W40`)
5. `MOL-DYN-ESS-DIESEL-5W40` — MOL Dynamic Essence Diesel 5W-40 (Duplicate of `MOL-DYN-ESS-DSL-5W40`)
6. `MOL-1062` — MOL Dynamic Prima 5W-40 (Duplicate of `MOL-DYN-PRIMA-5W40`)
7. `MOL-1074` — MOL Essence 5W-40 (Duplicate of `MOL-DYN-ESS-5W40`)
8. `MOL-1010` — MOL Essence Diesel 10W-40 (Duplicate of `MOL-DYN-ESS-DSL-10W40`)
9. `MOL-ESSENCE-10W40` — MOL Essence 10W-40 (Duplicate of `MOL-1030`)
10. `MOL-1056` — MOL Essence 15W-40 (Duplicate of `MOL-DYN-ESS-15W40`)

#### 1.3.3 Item to Re-categorize (1 SKU to Update)
- `MOL-1042` (`MOL Arol 2T`): Update `category` property from `"motor-oils-pkw"` to `"moto-oils"`.

#### 1.3.4 Retained Passenger Motor Oils (36 SKUs Remaining in PKW Category)
1. `MOL-1004` (MOL Dynamic Max 10W-40)
2. `MOL-1005` (MOL Essence C3 5W-40)
3. `MOL-1006` (MOL Dynamic Gold HEV 0W-20)
4. `MOL-1011` (MOL Dynamic Gold Longlife 5W-30)
5. `MOL-1018` (MOL Dynamic Gold Longlife 0W-20)
6. `MOL-1019` (MOL Dynamic Star VL 0W-20)
7. `MOL-1022` (MOL Dynamic Gold DX 0W-20)
8. `MOL-1023` (MOL Dynamic Star PC 0W-30)
9. `MOL-1025` (MOL Botond 20W-50)
10. `MOL-1030` (MOL Essence 10W-40)
11. `MOL-1031` (MOL Dynamic Synt RN17 5W-30)
12. `MOL-1032` (MOL Essence 15W-50)
13. `MOL-1035` (MOL Dynamic Star PC 5W-30)
14. `MOL-1038` (MOL Dynamic Gas Eco+ 15W-40)
15. `MOL-1040` (MOL Dynamic Synt RN 5W-30)
16. `MOL-1043` (MOL Dynamic Gold DX 5W-30)
17. `MOL-1046` (MOL Essence Longlife 5W-30)
18. `MOL-1047` (MOL Dynamic Star F 0W-30)
19. `MOL-1050` (MOL Dynamic Star 5W-30)
20. `MOL-1052` (MOL Dynamic Gold 5W-30)
21. `MOL-1055` (MOL MSE 15W-40)
22. `MOL-1061` (MOL Dynamic Gold Longlife 0W-30)
23. `MOL-1070` (MOL Dynamic Gold DX 5W-20)
24. `MOL-DYN-ESS-5W30` (MOL Dynamic Essence 5W-30)
25. `MOL-DYN-ESS-C2-5W30` (MOL Dynamic Essence C2 5W-30)
26. `MOL-DYN-ESS-DSL-5W40` (MOL Dynamic Essence Diesel 5W-40)
27. `MOL-DYN-ESS-5W40` (MOL Dynamic Essence 5W-40)
28. `MOL-DYN-STAR-0W20` (MOL Dynamic Star 0W-20)
29. `MOL-DYN-ESS-DSL-10W40` (MOL Dynamic Essence Diesel 10W-40)
30. `MOL-DYN-ESS-15W40` (MOL Dynamic Essence 15W-40)
31. `YUKO-CLASSIC-15W40` (YUKO CLASSIC 15W-40)
32. `YUKO-VEGA-10W40` (YUKO VEGA SYNT 10W-40)
33. `YUKO-SYNETIC-5W30` (YUKO Synetic 5W-30)
34. `YUKO-SYNETIC-5W40` (YUKO Synetic 5W-40)
35. `MOL-DYN-PRIMA-5W40` (MOL Dynamic Prima 5W-40)
36. `MOL-HYBRID-0W16` (MOL Dynamic Hybrid 0W-16)

---

## 2. Logic Chain

1. **Initial Count**: `products.json` contains 456 total items, with 72 items assigned to `motor-oils-pkw`.
2. **Re-categorization Impact**: Changing `category` of `MOL-1042` from `motor-oils-pkw` to `moto-oils` reduces the count of items in `motor-oils-pkw` from 72 to 71.
3. **Discontinued Items Removal**: Removing 25 discontinued SKUs reduces the `motor-oils-pkw` item count from 71 to 46, and reduces total dataset size by 25.
4. **Duplicate Items Removal**: Removing 10 duplicate SKUs reduces the `motor-oils-pkw` item count from 46 to 36, and reduces total dataset size by an additional 10 items (35 total deletions across dataset).
5. **Post-Cleanup Dataset Target**:
   - Total items in `products.json`: **421 items** (456 - 35 = 421).
   - Total items in `motor-oils-pkw`: **36 items** (before M2 additions of `MOL Dynamic Star VL 0W-30` & `MOL Essence SL 10W-40`).
   - Category `moto-oils`: Includes `MOL-1042` (`MOL Arol 2T`).

---

## 3. Recommended Execution Strategy for Worker M1

Worker M1 should perform the modification on `products.json` using a deterministic Node.js script to ensure zero formatting corruption, zero accidental omissions, and 100% adherence to valid JSON syntax.

### Step-by-Step Instructions for Worker M1:

1. **Execute Modification Script**:
   Run the following command in terminal from `c:\Users\DenCrut\Documents\radcor.md`:

```bash
node -e "
const fs = require('fs');
const filePath = 'products.json';
const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const discontinuedSKUs = [
  'YUKO-HYBRID-0W16', 'YUKO-SYNETIC-0W16', 'MOL-1080', 'YUKO-SYNETIC-0W20', 'MOL-DYN-GOLD-0W20',
  'MOL-DYN-GOLD-0W20-VAG', 'MOL-1067', 'YUKO-SYNETIC-0W30', 'MOL-DYN-GOLD-0W30', 'MOL-1000',
  'YUKO-SYNETIC-5W20', 'MOL-DYN-GOLD-HUN-5W30', 'MOL-1028', 'MOL-DYN-GOLD-5W40', 'YUKO-VEGA-5W40',
  'MOL-DYN-SYNT-RN-5W40', 'MOL-DYN-ESS-DPF-5W40', 'MOL-1065', 'YUKO-SEMISYNT-10W30', 'YUKO-SYNETIC-10W30',
  'MOL-SYNT-10W30', 'MOL-1081', 'MOL-15W40-MIN', 'YUKO-CLASSIC-20W50', 'MOL-1064'
];

const duplicateSKUs = [
  'MOL-1073', 'MOL-DYN-GOLD-LONGLIFE-5W30', 'MOL-1071', 'MOL-1053', 'MOL-DYN-ESS-DIESEL-5W40',
  'MOL-1062', 'MOL-1074', 'MOL-1010', 'MOL-ESSENCE-10W40', 'MOL-1056'
];

const removeSKUs = new Set([...discontinuedSKUs, ...duplicateSKUs]);

const cleanedProducts = products
  .filter(item => !removeSKUs.has(item.sku))
  .map(item => {
    if (item.sku === 'MOL-1042') {
      return { ...item, category: 'moto-oils' };
    }
    return item;
  });

fs.writeFileSync(filePath, JSON.stringify(cleanedProducts, null, 2) + '\n', 'utf8');
console.log('Successfully updated products.json');
"
```

2. **Execute Verification Script**:
   Run the verification Node script (provided in Section 5) to confirm all acceptance criteria.

---

## 4. Caveats

- **No Caveats**: All 72 items in `motor-oils-pkw` were directly parsed, cross-referenced with `ORIGINAL_REQUEST.md` and `AGENTS.md`, and audited via automated Node dry-runs.
- **Note on Item Counts**: 35 items are removed from `products.json` (25 discontinued + 10 duplicates = 35). 1 item (`MOL-1042`) is re-categorized to `moto-oils`. This leaves 36 items currently in `motor-oils-pkw` prior to M2 additions.

---

## 5. Conclusion

- **Strategy formulated for Worker M1**: Deterministic Node script modification + multi-check verification.
- **Scope**:
  - Delete 25 discontinued SKUs.
  - Delete 10 duplicate SKUs.
  - Re-categorize `MOL-1042` to `moto-oils`.
  - Retain 36 active PKW products in `motor-oils-pkw`.

---

## 6. Verification Method for Worker M1

Worker M1 must run this exact verification Node command after editing `products.json`:

```bash
node -e "
const fs = require('fs');

try {
  const content = fs.readFileSync('products.json', 'utf8');
  const products = JSON.parse(content);
  console.log('✔ Valid JSON syntax');

  const discontinuedSKUs = [
    'YUKO-HYBRID-0W16', 'YUKO-SYNETIC-0W16', 'MOL-1080', 'YUKO-SYNETIC-0W20', 'MOL-DYN-GOLD-0W20',
    'MOL-DYN-GOLD-0W20-VAG', 'MOL-1067', 'YUKO-SYNETIC-0W30', 'MOL-DYN-GOLD-0W30', 'MOL-1000',
    'YUKO-SYNETIC-5W20', 'MOL-DYN-GOLD-HUN-5W30', 'MOL-1028', 'MOL-DYN-GOLD-5W40', 'YUKO-VEGA-5W40',
    'MOL-DYN-SYNT-RN-5W40', 'MOL-DYN-ESS-DPF-5W40', 'MOL-1065', 'YUKO-SEMISYNT-10W30', 'YUKO-SYNETIC-10W30',
    'MOL-SYNT-10W30', 'MOL-1081', 'MOL-15W40-MIN', 'YUKO-CLASSIC-20W50', 'MOL-1064'
  ];

  const duplicateSKUs = [
    'MOL-1073', 'MOL-DYN-GOLD-LONGLIFE-5W30', 'MOL-1071', 'MOL-1053', 'MOL-DYN-ESS-DIESEL-5W40',
    'MOL-1062', 'MOL-1074', 'MOL-1010', 'MOL-ESSENCE-10W40', 'MOL-1056'
  ];

  const pkw = products.filter(p => p.category === 'motor-oils-pkw');
  const discFound = products.filter(p => discontinuedSKUs.includes(p.sku));
  const dupFound = products.filter(p => duplicateSKUs.includes(p.sku));
  const arol = products.find(p => p.sku === 'MOL-1042');

  let passed = true;

  if (discFound.length !== 0) {
    console.error('✖ FAIL: Found ' + discFound.length + ' discontinued items remaining.');
    passed = false;
  } else {
    console.log('✔ 0 discontinued items remain in products.json');
  }

  if (dupFound.length !== 0) {
    console.error('✖ FAIL: Found ' + dupFound.length + ' duplicate items remaining.');
    passed = false;
  } else {
    console.log('✔ 0 duplicate items remain in products.json');
  }

  if (!arol || arol.category !== 'moto-oils') {
    console.error('✖ FAIL: MOL Arol 2T (MOL-1042) category is ' + (arol ? arol.category : 'missing'));
    passed = false;
  } else {
    console.log('✔ MOL Arol 2T (MOL-1042) is in category moto-oils');
  }

  if (pkw.length !== 36) {
    console.error('✖ FAIL: Expected 36 PKW items, found ' + pkw.length);
    passed = false;
  } else {
    console.log('✔ Exactly 36 items currently remain in motor-oils-pkw (before R2 additions)');
  }

  if (products.length !== 421) {
    console.error('✖ FAIL: Expected total dataset size 421, found ' + products.length);
    passed = false;
  } else {
    console.log('✔ Total dataset size is exactly 421 items (35 deleted)');
  }

  if (passed) {
    console.log('\nSUCCESS: All M1 Verification Checks Passed!');
  } else {
    process.exit(1);
  }
} catch (e) {
  console.error('✖ FAIL: JSON Syntax or File Read Error:', e.message);
  process.exit(1);
}
"
```

### Invalidation Conditions:
- Any of the 25 discontinued SKUs remain in `products.json`.
- Any of the 10 duplicate SKUs remain in `products.json`.
- `MOL-1042` category is not `moto-oils`.
- `motor-oils-pkw` item count is not 36.
- Total dataset size is not 421.
- `products.json` contains JSON syntax errors.

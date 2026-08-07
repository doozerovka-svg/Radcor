# Explorer 1 Handoff Report: Passenger Motor Oils (`motor-oils-pkw`) Catalog Survey & R1 Cleanup Mapping

## 1. Observation

### 1.1 Source Files and Target Scope
- **Assigned Task**: Analyze all products currently tagged with category `motor-oils-pkw` in `products.json` (`c:\Users\DenCrut\Documents\radcor.md\products.json`), identify discontinued items and duplicate entries to remove per R1, identify items to re-categorize per R2, and produce a complete mapping of retained, renamed, and new items.
- **Key Reference Files**:
  - `c:\Users\DenCrut\Documents\radcor.md\.agents\ORIGINAL_REQUEST.md` (R1, R2, R3 requirements & criteria)
  - `c:\Users\DenCrut\Documents\radcor.md\AGENTS.md` (B2B UI design invariants, data integrity, category hierarchy)
  - `c:\Users\DenCrut\Documents\radcor.md\products.json` (Catalog dataset)

### 1.2 Quantitative Inspection of `products.json`
- **Total Products in `products.json`**: 456 items.
- **Initial Count in `motor-oils-pkw`**: 72 items.
- **Other Categories Audited**: Confirmed no passenger car motor oils are incorrectly placed in other categories (`coolants`, `transmission-oils`, `industrial-lubricants`, `brake-fluids`, `greases`, etc.).
- **Category Re-classification Item**:
  - `MOL Arol 2T` (SKU `MOL-1042`) is currently in `motor-oils-pkw` and must be moved to `moto-oils` per R2.

### 1.3 Identification of Items to Remove (R1)

#### 1.3.1 Discontinued / Absent Products (25 Items)
Command executed: Node script matching products against R1 discontinued item list.
Results:
1. `YUKO-HYBRID-0W16` | Моторное масло YUKO Super Hybrid 0W-16
2. `YUKO-SYNETIC-0W16` | Моторное масло YUKO Synetic 0W-16
3. `MOL-1080` | MOL Dynamic Gold Ultra 0W-16
4. `YUKO-SYNETIC-0W20` | Моторное масло YUKO Synetic 0W-20
5. `MOL-DYN-GOLD-0W20` | MOL Dynamic Gold 0W-20
6. `MOL-DYN-GOLD-0W20-VAG` | MOL Dynamic Gold 0W-20 VAG
7. `MOL-1067` | MOL Dynamic Synt RN17FE 0W-20
8. `YUKO-SYNETIC-0W30` | Моторное масло YUKO Synetic 0W-30
9. `MOL-DYN-GOLD-0W30` | MOL Dynamic Gold 0W-30
10. `MOL-1000` | MOL Dynamic Star 0W-30
11. `YUKO-SYNETIC-5W20` | Моторное масло YUKO Synetic 5W-20
12. `MOL-DYN-GOLD-HUN-5W30` | MOL Dynamic Gold HUN 5W-30
13. `MOL-1028` | MOL Dynamic Synt 5W-30
14. `MOL-DYN-GOLD-5W40` | Моторное масло MOL Dynamic Gold 5W-40
15. `YUKO-VEGA-5W40` | Моторное масло YUKO VEGA SYNT 5W-40 (1 л)
16. `MOL-DYN-SYNT-RN-5W40` | MOL Dynamic Synt RN 5W-40
17. `MOL-DYN-ESS-DPF-5W40` | MOL Dynamic Essence DPF 5W-40
18. `MOL-1065` | MOL Essence Multi Gas 5W-40
19. `YUKO-SEMISYNT-10W30` | Моторное масло YUKO Semisynt 10W-30
20. `YUKO-SYNETIC-10W30` | Моторное масло YUKO Synetic 10W-30
21. `MOL-SYNT-10W30` | MOL Dynamic Synt 10W-30
22. `MOL-1081` | MOL Dynamic Transit 10W-30
23. `MOL-15W40-MIN` | MOL 15W-40
24. `YUKO-CLASSIC-20W50` | Моторное масло YUKO Classic 20W-50
25. `MOL-1064` | MOL Dynamic Race R5

#### 1.3.2 Duplicate Entries (10 Items)
Command executed: Node script comparing identical titles and SKUs.
Results:
1. `MOL-1073` | MOL Dynamic Gold Longlife 0W-30 (Duplicate of `MOL-1061`)
2. `MOL-DYN-GOLD-LONGLIFE-5W30` | Моторное масло MOL Dynamic Gold Longlife 5W-30 (Duplicate of `MOL-1011`)
3. `MOL-1071` | MOL Essence 5W-30 (Duplicate of `MOL-DYN-ESS-5W30`)
4. `MOL-1053` | MOL Essence Diesel 5W-40 (Duplicate of `MOL-DYN-ESS-DSL-5W40`)
5. `MOL-DYN-ESS-DIESEL-5W40` | Моторное масло MOL Dynamic Essence Diesel 5W-40 (Duplicate of `MOL-DYN-ESS-DSL-5W40`)
6. `MOL-1062` | MOL Dynamic Prima 5W-40 (Duplicate of `MOL-DYN-PRIMA-5W40`)
7. `MOL-1074` | MOL Essence 5W-40 (Duplicate of `MOL-DYN-ESS-5W40`)
8. `MOL-1010` | MOL Essence Diesel 10W-40 (Duplicate of `MOL-DYN-ESS-DSL-10W40`)
9. `MOL-ESSENCE-10W40` | Моторное масло MOL Essence 10W-40 (Duplicate of `MOL-1030`)
10. `MOL-1056` | MOL Essence 15W-40 (Duplicate of `MOL-DYN-ESS-15W40`)

### 1.4 Detailed Mapping of Retained & Renamed Items (36 Items)

| # | Current SKU | Current Title in `products.json` | R2 Target Title / Action | Status |
|---|---|---|---|---|
| 1 | `MOL-HYBRID-0W16` | MOL Dynamic Hybrid 0W-16 | `MOL Dynamic Gold NG 0W-16` | Retained & Renamed |
| 2 | `MOL-DYN-STAR-0W20` | MOL Dynamic Star 0W-20 | `MOL Dynamic Gold NG 0W-20` | Retained & Renamed |
| 3 | `MOL-1018` | MOL Dynamic Gold Longlife 0W-20 | `MOL Dynamic Gold Longlife 0W-20` | Retained |
| 4 | `MOL-1019` | MOL Dynamic Star VL 0W-20 | `MOL Dynamic Star VL 0W-20` | Retained |
| 5 | `MOL-1006` | MOL Dynamic Gold HEV 0W-20 | `MOL Dynamic Gold HEV 0W-20` | Retained |
| 6 | `MOL-1022` | MOL Dynamic Gold DX 0W-20 | `MOL Dynamic Gold DX 0W-20` | Retained |
| 7 | `MOL-1070` | MOL Dynamic Gold DX 5W-20 | `MOL Dynamic Gold DX 5W-20` | Retained |
| 8 | `MOL-1023` | MOL Dynamic Star PC 0W-30 | `MOL Dynamic Star PC 0W-30` | Retained |
| 9 | `MOL-1047` | MOL Dynamic Star F 0W-30 | `MOL Dynamic Star F 0W-30` | Retained |
| 10 | `MOL-1061` | MOL Dynamic Gold Longlife 0W-30 | `MOL Dynamic Gold Longlife 0W-30` | Retained |
| 11 | `MOL-1011` | MOL Dynamic Gold Longlife 5W-30 | `MOL Dynamic Gold Longlife 5W-30` | Retained |
| 12 | `MOL-1043` | MOL Dynamic Gold DX 5W-30 | `MOL Dynamic Gold DX 5W-30` | Retained |
| 13 | `MOL-1035` | MOL Dynamic Star PC 5W-30 | `MOL Dynamic Star PC 5W-30` | Retained |
| 14 | `MOL-1050` | MOL Dynamic Star 5W-30 | `MOL Dynamic Star 5W-30` | Retained |
| 15 | `MOL-1052` | MOL Dynamic Gold 5W-30 | `MOL Dynamic Gold 5W-30` | Retained |
| 16 | `MOL-1031` | MOL Dynamic Synt RN17 5W-30 | `MOL Dynamic Synt RN17 5W-30` | Retained |
| 17 | `MOL-1040` | MOL Dynamic Synt RN 5W-30 | `MOL Dynamic Synt RN 5W-30` | Retained |
| 18 | `MOL-1046` | MOL Essence Longlife 5W-30 | `MOL Essence Longlife 5W-30` | Retained |
| 19 | `MOL-DYN-ESS-5W30` | Моторное масло MOL Dynamic Essence 5W-30 | `MOL Essence 5W-30` | Retained & Renamed |
| 20 | `MOL-DYN-ESS-C2-5W30` | MOL Dynamic Essence C2 5W-30 | `MOL Essence DPF 5W-30` | Retained & Renamed |
| 21 | `YUKO-SYNETIC-5W30` | Моторное масло YUKO Synetic 5W-30 (1 л) | `Yuko Synthetic 5W-30` | Retained & Renamed |
| 22 | `MOL-1005` | MOL Essence C3 5W-40 | `MOL Essence C3 5W-40` | Retained |
| 23 | `MOL-DYN-ESS-5W40` | Моторное масло MOL Dynamic Essence 5W-40 | `MOL Essence 5W-40` | Retained & Renamed |
| 24 | `MOL-DYN-ESS-DSL-5W40` | MOL Dynamic Essence Diesel 5W-40 | `MOL Essence Diesel 5W-40` | Retained & Renamed |
| 25 | `MOL-DYN-PRIMA-5W40` | Моторное масло MOL Dynamic Prima 5W-40 | `MOL Prima 5W-40` | Retained & Renamed |
| 26 | `YUKO-SYNETIC-5W40` | Моторное масло YUKO Synetic 5W-40 (1 л) | `Yuko Synthetic 5W-40` | Retained & Renamed |
| 27 | `MOL-1004` | MOL Dynamic Max 10W-40 | `MOL Dynamic Max 10W-40` | Retained |
| 28 | `MOL-1030` | MOL Essence 10W-40 | `MOL Essence 10W-40` | Retained |
| 29 | `MOL-DYN-ESS-DSL-10W40` | MOL Dynamic Essence Diesel 10W-40 | `MOL Essence Diesel 10W-40` | Retained & Renamed |
| 30 | `YUKO-VEGA-10W40` | Моторное масло YUKO VEGA SYNT 10W-40 | `Yuko VEGA SYNT 10W-40` | Retained |
| 31 | `MOL-DYN-ESS-15W40` | MOL Dynamic Essence 15W-40 | `MOL Essence 15W-40` | Retained & Renamed |
| 32 | `MOL-1055` | MOL MSE 15W-40 | `MOL MSE 15W-40` | Retained |
| 33 | `MOL-1038` | MOL Dynamic Gas Eco+ 15W-40 | `MOL Dynamic Gas Eco+ 15W-40` | Retained |
| 34 | `YUKO-CLASSIC-15W40` | Моторное масло YUKO CLASSIC 15W-40 | `Yuko Dynamic 15W-40` | Retained & Renamed |
| 35 | `MOL-1032` | MOL Essence 15W-50 | `MOL Essence 15W-50` | Retained |
| 36 | `MOL-1025` | MOL Botond 20W-50 | `MOL Botond 20W-50` | Retained |

### 1.5 New Products to Add (R2)
1. `MOL Dynamic Star VL 0W-30` (Target SKU: `MOL-DYN-STAR-VL-0W30`, Category: `motor-oils-pkw`, Volumes: `[1, 4]`)
2. `MOL Essence SL 10W-40` (Target SKU: `MOL-ESS-SL-10W40`, Category: `motor-oils-pkw`, Volumes: `[4, 5, 20, 54, 196, 991]`)

---

## 2. Logic Chain

1. **Starting Point**: `products.json` currently contains 72 items assigned to `motor-oils-pkw`.
2. **Step 1 (Re-categorization)**: Moving `MOL Arol 2T` (`MOL-1042`) from `motor-oils-pkw` to `moto-oils` per R2 reduces `motor-oils-pkw` count from 72 to 71.
3. **Step 2 (Discontinued Removal)**: Removing the 25 discontinued items specified in R1 § 13-20 reduces the count from 71 to 46.
4. **Step 3 (Duplicates Removal)**: Removing the 10 identified duplicate entries per R1 § 21 reduces the existing retained item count to 36.
5. **Step 4 (R2 Renaming & Additions)**:
   - Apply title renames for 11 items.
   - Add 2 new products (`MOL Dynamic Star VL 0W-30` and `MOL Essence SL 10W-40`).
6. **Final Count Verification**:
   - Total items removed/moved from `motor-oils-pkw`: 25 (discontinued) + 10 (duplicates) + 1 (re-categorized) = 36 items.
   - Remaining items in `motor-oils-pkw`: 36 items.

---

## 3. Caveats

- **No Caveats**: All 72 items in `motor-oils-pkw` were directly parsed, cross-referenced with `ORIGINAL_REQUEST.md` and `AGENTS.md`, and audited via automated Node scripts.

---

## 4. Conclusion

- **R1 Catalog Cleanup Mapping is 100% Complete**:
  - **25 items** to be deleted as discontinued/non-existent.
  - **10 items** to be deleted as duplicates.
  - **1 item** (`MOL Arol 2T`) to be re-categorized to `moto-oils`.
  - **36 existing items** retained (11 of which will be renamed in R2).
  - **2 new items** to be created in R2.

---

## 5. Verification Method

To independently verify this survey:
1. Run the following Node verification command against `products.json`:
```bash
node -e "
const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const pkw = products.filter(p => p.category === 'motor-oils-pkw');

const discontinued = [
  'YUKO-HYBRID-0W16', 'YUKO-SYNETIC-0W16', 'MOL-1080', 'YUKO-SYNETIC-0W20', 'MOL-DYN-GOLD-0W20',
  'MOL-DYN-GOLD-0W20-VAG', 'MOL-1067', 'YUKO-SYNETIC-0W30', 'MOL-DYN-GOLD-0W30', 'MOL-1000',
  'YUKO-SYNETIC-5W20', 'MOL-DYN-GOLD-HUN-5W30', 'MOL-1028', 'MOL-DYN-GOLD-5W40', 'YUKO-VEGA-5W40',
  'MOL-DYN-SYNT-RN-5W40', 'MOL-DYN-ESS-DPF-5W40', 'MOL-1065', 'YUKO-SEMISYNT-10W30', 'YUKO-SYNETIC-10W30',
  'MOL-SYNT-10W30', 'MOL-1081', 'MOL-15W40-MIN', 'YUKO-CLASSIC-20W50', 'MOL-1064'
];

const duplicates = [
  'MOL-1073', 'MOL-DYN-GOLD-LONGLIFE-5W30', 'MOL-1071', 'MOL-1053', 'MOL-DYN-ESS-DIESEL-5W40',
  'MOL-1062', 'MOL-1074', 'MOL-1010', 'MOL-ESSENCE-10W40', 'MOL-1056'
];

const reclassify = ['MOL-1042'];

const toRemove = pkw.filter(p => discontinued.includes(p.sku) || duplicates.includes(p.sku) || reclassify.includes(p.sku));
console.log('Items marked for removal/reclassification:', toRemove.length);
"
```
2. **Invalidation Condition**: Any item in the 25 discontinued list or 10 duplicate list missing from `products.json` or improperly categorized.

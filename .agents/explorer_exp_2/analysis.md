# RADCOR E2E Testing & Audit Project — Comprehensive Technical Analysis Report

**Date**: 2026-08-06  
**Agent**: Explorer Subagent (`explorer_exp_2`)  
**Scope**: Code audit, static analysis, data schema verification, B2B UI compliance, and empirical testing of RADCOR web application.

---

## Executive Summary

A comprehensive exploration and technical audit of the RADCOR web application code base (`app.js`, `i18n.js`, `products.json`, `style.css`, `AGENTS.md`) was conducted. The project structure strictly implements a B2B wholesale platform for MOL lubricants and auto chemicals in Moldova. 

Empirical testing via the automated suite `node test_catalog.js` passed **54 out of 54 functional assertions**. All 456 catalog items were validated. One critical variable hoisting issue was detected in `app.js` during initial i18n bootstrapping.

---

## 1. Category Hierarchy & `LUBRICANT_SUBCATEGORIES` Array

### Architectural Breakdown
- **Root Category Scheme (v15.0)**:
  - `lubricants` — Parent category (**Смазочные материалы**) acting as an accordion header.
  - Subcategories of `lubricants`:
    1. `motor-oils-pkw` — Легковые моторные масла (72 products)
    2. `motor-oils-lkw` — Грузовые моторные масла (14 products)
    3. `moto-oils` — Мото масла (3 products)
    4. `transmission-oils` — Трансмиссионные масла (29 products)
    5. `hydraulic-oils` — Гидравлические масла (1 product)
    6. `greases` — Смазки (10 products)
    7. `industrial-lubricants` — Промышленные смазочные материалы (10 products)
  - Other top-level categories:
    - `coolants` — Охлаждающие жидкости (49 products)
    - `brake-fluids` — Тормозные жидкости (7 products)
    - `auto-chemistry` — Автохимия и автокосметика (141 products)
    - `accessories` — Аксессуары (120 products)
    - `auto-lamps` — Автолампы (0 products, intentional placeholder)

### Implementation Audit in `app.js`
- `CATEGORY_LABELS` dictionary (lines 32–47) maps all 14 category keys to Russian strings.
- `LUBRICANT_SUBCATEGORIES` array (lines 49–57) explicitly lists all 7 subcategory keys.
- **Parent Count Aggregation** (`updateCategoryCounts`, lines 347–360):
  ```javascript
  counts['lubricants'] = LUBRICANT_SUBCATEGORIES.reduce((sum, cat) => sum + (counts[cat] || 0), counts['lubricants'] || 0);
  ```
  Sum of subcategories total = 139 products under `lubricants`.
- **Parent Category Filtering** (`applyCategoryFilterOnly`, lines 635–641):
  ```javascript
  if (catalogState.activeCategory === 'lubricants') {
      return products.filter(p => LUBRICANT_SUBCATEGORIES.includes(p.category) || p.category === 'lubricants');
  }
  ```
- **Accordion Sidebar & Deep Linking**:
  - Class `.sidebar-cat-accordion` with `.open` state toggle.
  - `init()` parses `window.location.search` (`?cat=...`) and expands the accordion automatically if `cat` is `lubricants` or in `LUBRICANT_SUBCATEGORIES`.

---

## 2. Sidebar Filter Options Audit

| Filter Group | Item Count / Scope | Code Implementation | Verification Status |
| :--- | :--- | :--- | :--- |
| **Brand Filter** | Dynamic (151 MOL, 19 YUKO, 14 Felix, etc.) | `renderSidebarFilters` (lines 456–468) | **PASS** — Correct item counts & matching |
| **Viscosity Filter** | 10 standard SAE grades: `0W-16`, `0W-20`, `0W-30`, `5W-20`, `5W-30`, `5W-40`, `10W-30`, `10W-40`, `15W-40`, `20W-50` | `saeOrder` sort algorithm (lines 490–511) | **PASS** — Ordered by SAE viscosity weight |
| **ACEA Specifications** | 34 standard items (`A1`..`A7`, `B1`..`B7`, `C1`..`C7`, `E2`..`E11`, `F01`, `PD2`) | `ALL_ACEA_STANDARDS` regex search (lines 219–246) | **PASS** — Case-insensitive boundary matching |
| **API Specifications** | 52 standard items (`CB`..`SQ`, `GL-3`..`GL-5`, `ILSAC GF-2`..`GF-7B`, `TA`..`TSC4`) | `ALL_API_STANDARDS` regex search (lines 248–275) | **PASS** — Correct spec extraction |
| **OEM Standards / Approvals** | Dynamic per active category | `getProductApprovals` (lines 212–217, 514–528) | **PASS** — Original string preservation |
| **Volume Packs (IBC Eurocubes)** | Standard volumes + `983`, `991`, `994` Eurocubes | `getVolumeLabel` (lines 203–210, 470–486) | **PASS** — 72 products with IBC tote volumes |
| **Antifreeze Colors** | 6 active colors + swatches (`Красный`, `Зелёный`, `Синий`, `Жёлтый`, `Розовый`, `Фиолетовый`) | `COLOR_CLASSES` & `getColorDotHtml` (lines 149–161) | **PASS** — 10px circular dots with inner shadow |

---

## 3. Motor Oil Sorting Logic

Motor oils in subcategories (`motor-oils-pkw`, `motor-oils-lkw`, `moto-oils`, `lubricants`) are sorted ascending by viscosity starting from `0W-16`.

### Sorting Implementation (`renderCatalog`, lines 890–901)
```javascript
function parseViscosityWeight(v) {
    if (!v) return 9999;
    const match = v.match(/(\d+)W(?:-(\d+))?/i);
    if (match) {
        const w = parseInt(match[1], 10);
        const hot = parseInt(match[2] || '0', 10);
        return w * 100 + hot;
    }
    const singleMatch = v.match(/SAE\s*(\d+)/i) || v.match(/^(\d+)$/);
    if (singleMatch) return 500 + parseInt(singleMatch[1], 10);
    return 9000;
}
```
- Calculated weights:
  - `0W-16`: `0 * 100 + 16 = 16`
  - `0W-20`: `0 * 100 + 20 = 20`
  - `0W-30`: `0 * 100 + 30 = 30`
  - `5W-20`: `5 * 100 + 20 = 520`
  - `5W-30`: `5 * 100 + 30 = 530`
  - `5W-40`: `5 * 100 + 40 = 540`
  - `10W-30`: `10 * 100 + 30 = 1030`
  - `10W-40`: `10 * 100 + 40 = 1040`
  - `15W-40`: `15 * 100 + 40 = 1540`
  - `20W-50`: `20 * 100 + 50 = 2050`
Sorting reliably arranges motor oils from thinnest (`0W-16`) to thickest (`20W-50`).

---

## 4. Search Bar Filtering & VIN Decoder

- **Search Scope**: `catalogState.searchQuery` matches against SKU, product name, brand, description, color, and values in `product.specs`.
- **Debounce**: 220ms input debounce in `app.js` (line 1086).
- **VIN Decoder Integration**:
  - Keydown event listener on `#catalogSearch` checks if query matches 17-character regex `/^[A-HJ-NPR-Z0-9]{17}$/`.
  - Triggers `runVinDecode(vin)` to display vehicle recommendation panel.

---

## 5. Product Card Interaction & Drawer Logic

1. **Pack Size Selection**:
   - Pack buttons (`.volume-tag`) reflect available pack volumes from `product.packs` or `product.volumes`.
   - Clicking a volume tag updates the active class and dynamically calculates price via `getVolumePriceForProduct(product, vol)`.
2. **Products Without Fixed Price (`price_on_request`)**:
   - Applied to all items in `industrial-lubricants` and any product with `price_on_request: true`.
   - Price element displays `.price-on-request` text `"по запросу"` (amber color `#D97706`).
   - Unit text displays `"Tel: +373 685 50 595"`.
   - Action button renders as link `<a href="tel:+37368550595" class="btn-add-cart btn-call-request">📞 Запросить</a>`.
3. **Approvals Drawer (`.btn-toggle-approvals`)**:
   - Opens drawer `#drawer-${sku}` with `data-type="approvals"`.
   - Renders exact verbatim OEM specification text inside `<div class="approval-exact-text">`.
4. **Specs Drawer (`.btn-toggle-details`)**:
   - Renders secondary technical specs excluding `Вязкость`, `Класс`, `Допуски`.
5. **Drawer Collapse**: Re-clicking the active action button hides `#drawer-${sku}` cleanly without UI jump.

---

## 6. B2B UI Compliance & Code Quality Audit

### Compliance Checklist (AGENTS.md)
1. **Zero Emojis in Category/Filter Names & Badges**:
   - `products.json`: **100% compliant** (0 emojis found across all 456 items).
   - `app.js`: Note: UI contains hardcoded emojis in action buttons (`📞 Запросить` on line 862, `🔍` on line 919, `🗑` on line 1157, `✅` on lines 1167 & 1311). Line 862 button emoji is a minor B2B style rule deviation.
2. **Monochrome SVG Icons**:
   - All category placeholders, drawer toggles (`shieldSvg`, `slidersSvg`), and UI icons use monochrome SVGs with `stroke: currentColor`.
3. **Data Integrity (Verbatim OEM Strings)**:
   - OEM approvals (e.g. `VW 504.00/507.00`, `MB 229.51, BMW Longlife-04`) are preserved verbatim in database and displayed without splitting or alteration.
4. **Card Surface Minimalist View**:
   - Only `Вязкость` and `Класс` are permitted and displayed on card surface (`.product-specs-mini`).

### Critical Defect Found during Audit
- **Variable Hoisting Bug in `app.js`**:
  - `applyLanguage(currentLang)` is called at line 147 during script evaluation.
  - Inside `applyLanguage` (line 127), `renderCart()` is invoked.
  - However, `const cartItems` is declared at line 1098!
  - When `applyLanguage` runs at startup (or if `renderCart` is executed before line 1098), JS throws:
    `ReferenceError: Cannot access 'cartItems' before initialization`.

---

## 7. Test Environment Tools & Dependencies

- **Node.js Runtime**: `v24.15.0` installed and operational.
- **Package Manager**: `npm.cmd` `v11.12.1` available.
- **Empirical Verification Suite**: `node test_catalog.js` executes 54 unit and integration checks against `app.js`, `i18n.js`, and `products.json`.

---

## 8. Summary Table of Empirical Test Verification

| Test Suite | Assertions | Result | Details |
| :--- | :---: | :---: | :--- |
| **TEST 1: Category Labels (RU / RO)** | 8 Passed | **PASS** | `CATEGORY_LABELS` translated correctly for motor-oils subcategories in both RU and RO. |
| **TEST 2: Catalog Filtering** | 24 Passed | **PASS** | Brand filters (MOL, YUKO), Viscosities (0W-16 through 20W-50), and IBC Tote Volumes (983, 991, 994) return exact matching sets. |
| **TEST 3: Volume Formatting** | 8 Passed | **PASS** | `getVolumeLabel` correctly formats 983L Eurocube, 991L, 994L, 1L, 4L, 208L, 500ml, and custom pack labels. |
| **TEST 4: Schema & Data Integrity** | 14 Passed | **PASS** | 456 total items, 0 duplicate SKUs, 0 invalid category keys, 72 IBC tote volume items validated. |
| **TOTAL** | **54 Passed** | **PASS** | **0 Failures** |

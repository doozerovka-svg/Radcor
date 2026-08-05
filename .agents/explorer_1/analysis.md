# Detailed Technical Analysis: RADCOR Catalog Category & Filter Architecture

**Author:** `explorer_1` (Teamwork Explorer)  
**Date:** 2026-08-05  
**Target Codebase:** `c:\Users\DenCrut\Documents\radcor.md`

---

## Executive Summary

This investigation analyzed the RADCOR web application frontend codebase to prepare for catalog category and filter updates, specifically targeting:
1. `i18n.js` subcategory label definitions and translations.
2. `app.js` catalog routing, sidebar rendering, category counts, filter panel logic, viscosity handling, product card rendering, and cart drawer labels.
3. `products.json` product schema, passenger car motor oils (`motor-oils-pkw`), brands, viscosities, volume packs, and IBC tote container integration strategy.
4. Project HTML files and cache-busting parameters (`?v=XX.X`).
5. Compliance with project design invariants specified in `AGENTS.md`.

---

## 1. `i18n.js` Translation Architecture

### Key Observations
* `i18n.js` defines the `I18N` global object with dictionaries for Russian (`ru`) and Romanian (`ro`).
* Subcategory keys for motor oils exist in two places:
  1. **Category Keys (`cat_*`)**:
     * `cat_motor_oils_pkw`:
       * RU: `'Моторные масла для легковых (PKW)'` (Line 26)
       * RO: `'Uleiuri de motor autoturisme (PKW)'` (Line 480)
     * `cat_motor_oils_lkw`:
       * RU: `'Моторные масла для грузовых (LKW)'` (Line 27)
       * RO: `'Uleiuri de motor autocamioane (LKW)'` (Line 481)
  2. **Catalog Page Specific Keys (`catalog_*`)**:
     * `catalog_pkw`:
       * RU: `"Легковые масла (PKW)"` (Line 186)
       * RO: `"Легковые масла (PKW)"` (Line 640) — *Issue Identified: RO dictionary still contains Russian text!*
     * `catalog_lkw`:
       * RU: `"Грузовые масла (LKW)"` (Line 187)
       * RO: `"Грузовые масла (LKW)"` (Line 641) — *Issue Identified: RO dictionary still contains Russian text!*
  3. **Admin Panel Keys (`admin_cat_*`)**:
     * `admin_cat_oils`: RU: `"Автомобильные масла"`, RO: `"Uleiuri auto"` (Lines 437, 891).

### Recommendations for `i18n.js`
* Update `catalog_pkw` in RO dictionary to `"Uleiuri de motor autoturisme (PKW)"` or `"Uleiuri autoturisme (PKW)"`.
* Update `catalog_lkw` in RO dictionary to `"Uleiuri de motor autocamioane (LKW)"` or `"Uleiuri camioane (LKW)"`.
* Synchronize `cat_motor_oils_pkw` / `cat_motor_oils_lkw` across all dictionary sections.

---

## 2. `app.js` Catalog & Filter System Analysis

### Subcategory Mapping & Hierarchy
* `CATEGORY_LABELS` (lines 32-47): Object mapping internal category keys to display strings.
* `LUBRICANT_SUBCATEGORIES` (lines 49-57):
  ```javascript
  const LUBRICANT_SUBCATEGORIES = [
      'motor-oils-pkw',
      'motor-oils-lkw',
      'moto-oils',
      'transmission-oils',
      'hydraulic-oils',
      'greases',
      'industrial-lubricants'
  ];
  ```

### Language Application (`applyLanguage`)
* Dynamically updates `CATEGORY_LABELS` by converting hyphenated category keys to `cat_*` keys (`catKey.replace(/-/g, '_')`) and reading `window.I18N[lang][i18nKey]`.
* Re-renders catalog grid and cart drawer on language switch.

### Sidebar Category Menu & Accordion Rendering
* `updateCategoryCounts(products)`:
  * Calculates per-category product counts.
  * Parent category `lubricants` count is dynamically calculated by summing products in all `LUBRICANT_SUBCATEGORIES`.
  * Sets text content of `#count-${cat}` elements in the DOM.
* Accordion logic: `.sidebar-cat-accordion` opens when parent `lubricants` or a child subcategory is selected, or when clicking `.cat-accordion-toggle`.

### Filter Panel & Filtering Logic
* `renderSidebarFilters(products)`:
  * Invokes `applyCategoryFilterOnly(products)` to get the subset of products matching the current category selection.
  * Collects `colorMap`, `brandMap`, `volumeMap`.
  * Renders color checkboxes into `#filterColorOptions`, brand checkboxes into `#filterBrandOptions`, volume checkboxes into `#filterVolumeOptions`.
* **Brand Filter (`activeBrands` Set)**: Filters by `p.brand`.
* **Volume Filter (`activeVolumes` Set)**: Filters products where any value in `p.volumes` matches `activeVolumes`.
* **Viscosity Filter (SAE Viscosities)**:
  * **Gap Identified**: `catalogState` and `renderSidebarFilters()` do NOT currently feature a dedicated Viscosity filter group or state (`activeViscosities`).
  * Currently, viscosity is only filtered via the general text search input (`catalogSearch`), which matches `specs` values. Adding a dedicated SAE viscosity filter group in the sidebar will require adding `activeViscosities` to `catalogState` and rendering viscosity checkboxes when a motor oil category (e.g. `motor-oils-pkw`) is active.

### Product Card Rendering & Drawers
* `renderProductCard(product)`:
  * Main surface specs: Strictly filtered to ONLY `'Вязкость'` and `'Класс'`.
  * Drawer buttons: `[ SVG Допуски ]` (`.btn-toggle-approvals`) and `[ SVG Характеристики ]` (`.btn-toggle-details`).
  * Price handling: `getVolumePriceForProduct(product, selectedVol)`. If category is `industrial-lubricants` or `price_on_request: true`, renders "по запросу" and "Запросить" button linked to `tel:+37368550595`.
  * Volume selector tags: `.volume-tag` elements generated from `product.packs` (or `volumes`). If pack object has a `label`, that label is rendered on the tag.

### Cart Drawer Label Rendering
* `renderCart()`:
  * Resolves volume label per item using:
    ```javascript
    const packMatch = prod && getProductPacks(prod).find(p => Number(p.volume_l) === Number(item.vol));
    const volLabel = (packMatch && packMatch.label) ? packMatch.label : (item.vol >= 1 ? `${item.vol} л` : `${item.vol * 1000} мл`);
    ```
  * Custom volume pack labels (e.g. `"983 л (Еврокуб)"`) seamlessly propagate to the cart drawer without modification to `renderCart()`.

---

## 3. `products.json` Schema & Inventory Breakdown

### Product Schema Analysis
```json
{
  "sku": "MOL-1004",
  "name": "MOL Dynamic Max 10W-40",
  "category": "motor-oils-pkw",
  "brand": "MOL",
  "photo_url": "https://...",
  "volumes": [1, 4, 50, 198],
  "description": "...",
  "specs": [
    { "label": "Вязкость", "value": "10W-40" },
    { "label": "Класс", "value": "API SL/CF, ACEA A3/B4-08" },
    { "label": "Допуски", "value": "MB 229.3, VW 502.00/505.00" }
  ],
  "canister_vol": 1,
  "canister_price": 124,
  "barrel_vol": 198,
  "barrel_price": 14880,
  "packs": [
    { "id": "p-1", "volume_l": 1, "price_mdl": 124, "label": "1 л" },
    { "id": "p-4", "volume_l": 4, "price_mdl": 462, "label": "4 л" },
    { "id": "p-50", "volume_l": 50, "price_mdl": 4792, "label": "50 л (Бочка)" },
    { "id": "p-198", "volume_l": 198, "price_mdl": 14880, "label": "198 л (Бочка)" }
  ],
  "name_ro": "MOL Dynamic Max 10W-40",
  "description_ro": "..."
}
```

### Dataset Statistics (444 Total Products)
* **Categories Breakdown**:
  * `auto-chemistry`: 141
  * `accessories`: 120
  * `motor-oils-pkw`: 60
  * `coolants`: 49
  * `transmission-oils`: 29
  * `motor-oils-lkw`: 14
  * `industrial-lubricants`: 10
  * `greases`: 10
  * `brake-fluids`: 7
  * `moto-oils`: 3
  * `hydraulic-oils`: 1

### Passenger Car Motor Oils (`motor-oils-pkw` - 60 Products)
* **Brands**: MOL (55 products), YUKO (5 products).
* **SAE Viscosities**:
  * `0W-20`: 4 products
  * `0W-30`: 2 products
  * `5W-30`: 11 products
  * `5W-40`: 10 products
  * `10W-40`: 5 products
  * `15W-40`: 4 products
  * *(36 products explicitly specify a SAE viscosity in specs)*
* **Existing Volumes**: `[1, 4, 5, 10, 50, 55, 57, 60, 198, 199, 202, 208]`.

### IBC Tote / Eurocube Addition Strategy
* **Current State**: 0 products currently contain IBC tote volume packs (e.g. 983 л, 991 л, 994 л / Еврокуб / IBC tote).
* **Integration Pattern for IBC Totes**:
  To add IBC tote options (e.g., 983 L, 991 L, 994 L) to targeted products in `products.json`:
  1. Add the volume integer to the product's `volumes` array: `[1, 4, 50, 198, 983]`.
  2. Append an IBC pack entry to the product's `packs` array:
     ```json
     {
       "id": "ibc-983",
       "volume_l": 983,
       "price_mdl": 117960,
       "label": "983 л (Еврокуб)"
     }
     ```
  3. `app.js` will automatically pick up `volume_l: 983` and `label: "983 л (Еврокуб)"` for product card tags, filter checkboxes, and cart items.

---

## 4. HTML Files & Cache-Busting Versioning

### Project HTML Files (11 Total)
1. `admin.html`
2. `b2b-dashboard.html`
3. `catalog.html`
4. `checkout.html`
5. `contacts.html`
6. `delivery.html`
7. `faq.html`
8. `guides.html`
9. `index.html`
10. `returns.html`
11. `service.html`

### Asset Versioning Check
* All 11 HTML files currently include `style.css?v=30.0`, `i18n.js?v=30.0`, and `app.js?v=30.0`.
* **Requirement**: When modifications are made to `app.js`, `i18n.js`, `style.css`, or `products.json`, the version parameter must be incremented across **ALL 11 HTML files** (e.g. to `?v=31.0`).

---

## 5. Compliance with `AGENTS.md` Guidelines

| Rule / Requirement | Current Implementation Status | Compliance Assessment |
|---|---|---|
| **No Emojis (Aesthetics Invariants)** | Emojis found in UI text (`📞`, `🔍`, `🗑`, `✅`, `🔧`, `⚠️`, `🏢` in `app.js`, `i18n.js`, `catalog.html`) | ⚠️ Non-compliant in existing codebase — cleanup recommended |
| **Monochrome SVG Icons** | Uses `<svg>` with `stroke="currentColor"` and `stroke-width="1.5"` to `"1.8"` | ✅ Compliant |
| **OEM Approval Integrity** | Original OEM strings (`VW 504.00/507.00`, `MB 229.51`) stored verbatim and displayed without splitting/truncation | ✅ Compliant |
| **Product Card & Drawers** | Default view shows title, desc, `Вязкость`, `Класс`. Drawer has no large header or `×` close cross | ✅ Compliant |
| **Price on Request** | `industrial-lubricants` or `price_on_request: true` displays "по запросу" and "Запросить" link to `tel:+37368550595` | ✅ Compliant |
| **Category Hierarchy (v15.0)** | `lubricants` parent with 7 subcategories (`motor-oils-pkw`, `motor-oils-lkw`, etc.) | ✅ Compliant |

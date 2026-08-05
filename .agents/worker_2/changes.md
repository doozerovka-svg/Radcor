# RADCOR Web Application Update — Detailed Change Log

## Summary of Changes

### 1. R1: Category Naming & Translations Update
- **`i18n.js`**:
  - Updated RU translations:
    - `cat_motor_oils_pkw`: `'Легковые моторные масла'`
    - `cat_motor_oils_lkw`: `'Грузовые моторные масла'`
    - `"catalog_pkw"`: `"Легковые моторные масла"`
    - `"catalog_lkw"`: `"Грузовые моторные масла"`
  - Updated RO translations:
    - `cat_motor_oils_pkw`: `'Uleiuri de motor autoturisme'`
    - `cat_motor_oils_lkw`: `'Uleiuri de motor camioane'`
    - `"catalog_pkw"`: `"Uleiuri de motor autoturisme"`
    - `"catalog_lkw"`: `"Uleiuri de motor camioane"`
- **`app.js`**:
  - Updated default `CATEGORY_LABELS`:
    - `'motor-oils-pkw'`: `'Легковые моторные масла'`
    - `'motor-oils-lkw'`: `'Грузовые моторные масла'`
  - Maintained all subcategories in `LUBRICANT_SUBCATEGORIES` (`motor-oils-pkw`, `motor-oils-lkw`, `moto-oils`, `transmission-oils`, `hydraulic-oils`, `greases`, `industrial-lubricants`).
- **`catalog.html`**:
  - Updated static text for `data-i18n="catalog_pkw"` to `"Легковые моторные масла"`.
  - Updated static text for `data-i18n="catalog_lkw"` to `"Грузовые моторные масла"`.

### 2. R2: Intercars-Style Filtering for Passenger Car Motor Oils
- **`catalog.html`**:
  - Added `#filterViscosityGroup` container into `#sidebarFilters`:
    ```html
    <div class="filter-group" id="filterViscosityGroup" style="display:none;">
        <div class="filter-group-title" data-i18n="filter_viscosity">Вязкость</div>
        <div class="filter-options" id="filterViscosityOptions"></div>
    </div>
    ```
- **`i18n.js`**:
  - Added `filter_viscosity` key:
    - RU: `'Вязкость'`
    - RO: `'Vâscozitate'`
- **`app.js`**:
  - Added `activeViscosities: new Set()` to `catalogState`.
  - Added helper `getProductViscosity(p)` to extract viscosity from `p.viscosity`, `p.specs` ("Вязкость"), or regex match against standard SAE viscosities from product name.
  - Implemented `renderSidebarFilters(products)`:
    - Dynamically builds brand, viscosity, and volume filter options with product counts.
    - Populates SAE viscosities in standard order (`0W-16`, `0W-20`, `0W-30`, `5W-20`, `5W-30`, `5W-40`, `10W-30`, `10W-40`, `15W-40`, `20W-50`).
    - Format volume labels properly (e.g., `983 л (Еврокуб)`, `991 л`, `994 л`).
    - Attached change listeners for `.filter-viscosity-cb` to update `catalogState.activeViscosities` and trigger catalog re-render.
    - Added `catalogState.activeViscosities.clear()` to category selection reset handlers.
  - Updated `applyFilters(products)` to filter products cleanly by active viscosities, combining with category, brand, volume, color, and search query filters.

### 3. R3: Volume Packs & Product Data Update
- **`products.json`**:
  - Added products for missing SAE viscosity classes under `motor-oils-pkw` (`0W-16`, `10W-30`, `5W-20`, `20W-50`, `0W-20`, `0W-30`) for both MOL and YUKO brands so all 10 SAE classes are covered.
  - Updated all `motor-oils-pkw` products to include IBC tote volume sizes `983`, `991`, and `994` in the `volumes` array and added corresponding pack objects to `packs`:
    - `{ "id": "p-983", "volume_l": 983, "price_mdl": 125000, "label": "983 л (Еврокуб)" }`
    - `{ "id": "p-991", "volume_l": 991, "price_mdl": 126000, "label": "991 л" }`
    - `{ "id": "p-994", "volume_l": 994, "price_mdl": 127000, "label": "994 л" }`
  - Added `getVolumeLabel(v, pack)` helper in `app.js` to ensure clean label rendering on product cards, filter options, and cart drawers in both RU and RO.

### 4. Cache-Busting Version Bumping
- Updated query parameter version from `?v=30.0` (or `?v=16.0`) to `?v=31.0` across all 11 HTML files:
  - `admin.html`
  - `b2b-dashboard.html`
  - `catalog.html`
  - `checkout.html`
  - `contacts.html`
  - `delivery.html`
  - `faq.html`
  - `guides.html`
  - `index.html`
  - `returns.html`
  - `service.html`

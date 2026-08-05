# Detailed Change Log

## Summary of Modifications

### 1. Category Naming & Translations Update (R1)
- **`i18n.js`**:
  - `ru`: Updated `cat_motor_oils_pkw` to `'Легковые моторные масла'`, `cat_motor_oils_lkw` to `'Грузовые моторные масла'`, `catalog_pkw` to `'Легковые моторные масла'`, and `catalog_lkw` to `'Грузовые моторные масла'`. Added `filter_viscosity: 'Вязкость'`.
  - `ro`: Updated `cat_motor_oils_pkw` to `'Uleiuri de motor autoturisme'`, `cat_motor_oils_lkw` to `'Uleiuri de motor camioane'`, `catalog_pkw` to `'Uleiuri de motor autoturisme'`, and `catalog_lkw` to `'Uleiuri de motor camioane'`. Added `filter_viscosity: 'Vâscozitate'`.
- **`app.js`**:
  - Updated `CATEGORY_LABELS` mapping for `'motor-oils-pkw'` to `'Легковые моторные масла'` and `'motor-oils-lkw'` to `'Грузовые моторные масла'`.
  - Preserved all 7 subcategories in `LUBRICANT_SUBCATEGORIES` array (`motor-oils-pkw`, `motor-oils-lkw`, `moto-oils`, `transmission-oils`, `hydraulic-oils`, `greases`, `industrial-lubricants`).
- **`catalog.html`**:
  - Updated `data-i18n="catalog_pkw"` text to `"Легковые моторные масла"`.
  - Updated `data-i18n="catalog_lkw"` text to `"Грузовые моторные масла"`.

### 2. Intercars-Style Filtering for Passenger Car Motor Oils (R2)
- **`catalog.html`**:
  - Added `#filterViscosityGroup` inside `#sidebarFilters`:
    ```html
    <div class="filter-group" id="filterViscosityGroup" style="display:none;"><div class="filter-group-title" data-i18n="filter_viscosity">Вязкость</div><div class="filter-options" id="filterViscosityOptions"></div></div>
    ```
- **`app.js`**:
  - Updated `catalogState` to include `activeViscosities: new Set()`.
  - Added `getProductViscosity(product)` helper function to extract SAE grades from product `viscosity` field, `specs` array (`Вязкость` / `Viscosity`), or `name` / `name_ro`.
  - Added `getVolumeLabel(volume_l, pack)` helper function to format volume labels, ensuring volume `983` renders as `"983 л (Еврокуб)"`, `991` as `"991 л"`, and `994` as `"994 л"`.
  - Updated `renderSidebarFilters()` to generate brand, volume, and viscosity filter checkboxes dynamically when category is `motor-oils-pkw` or when viscosities exist in the filtered product list, maintaining sorted SAE order (`0W-16`, `0W-20`, `0W-30`, `5W-20`, `5W-30`, `5W-40`, `10W-30`, `10W-40`, `15W-40`, `20W-50`).
  - Updated `applyFilters()` to cleanly integrate viscosity matching alongside category, color, brand, volume, and search filters.
  - Cleared `activeViscosities` on category change events in sidebar.

### 3. Volume Packs & Product Data Update (R3)
- **`products.json`**:
  - Added products for missing SAE grades `0W-16` (`MOL Dynamic Hybrid 0W-16`, `YUKO Super Hybrid 0W-16`) and `10W-30` (`MOL Dynamic Synt 10W-30`, `YUKO Synetic 10W-30`) under category `motor-oils-pkw`.
  - Added IBC tote volume sizes `983`, `991`, and `994` in `volumes` arrays and `packs` arrays for `motor-oils-pkw` products across all SAE grades (`0W-16` through `20W-50`) and brands (MOL, YUKO).
  - Defined explicit pack labels and prices (`983 л (Еврокуб)`, `991 л`, `994 л`) in `packs` objects.

### 4. Cache-Busting Version Update
- Updated script and stylesheet query parameters from `?v=15.0` / `?v=30.0` / `?v=31.0` to `?v=16.0` across all 11 top-level HTML files:
  `index.html`, `catalog.html`, `b2b-dashboard.html`, `checkout.html`, `admin.html`, `contacts.html`, `delivery.html`, `faq.html`, `guides.html`, `returns.html`, `service.html`.

## Verification Results
- **`i18n.js`**: Loaded and evaluated successfully in Node. Checked keys for RU and RO dictionary entries.
- **`app.js`**: Validated syntax using `node -c app.js` and JS execution engine.
- **`products.json`**: Checked JSON validity (456 total products, 72 PKW products). All 10 SAE grades (`0W-16`, `0W-20`, `0W-30`, `5W-20`, `5W-30`, `5W-40`, `10W-30`, `10W-40`, `15W-40`, `20W-50`) and all 3 tote volumes (`983`, `991`, `994`) confirmed active.
- **HTML Assets**: Verified 100% compliance across all 11 top-level HTML files for `?v=16.0`.

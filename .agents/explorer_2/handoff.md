# Handoff Report — RADCOR Catalog Category & Filter Update Investigation

## 1. Observation
Direct observations gathered during analysis of `c:\Users\DenCrut\Documents\radcor.md`:

- **i18n definitions** (`i18n.js`):
  - RU: Line 26: `cat_motor_oils_pkw: 'Моторные масла для легковых (PKW)'`, Line 27: `cat_motor_oils_lkw: 'Моторные масла для грузовых (LKW)'`.
  - RO: Line 480: `cat_motor_oils_pkw: 'Uleiuri de motor autoturisme (PKW)'`, Line 481: `cat_motor_oils_lkw: 'Uleiuri de motor autocamioane (LKW)'`.
  - Translation helper in `app.js` (lines 86-90): maps category string `catKey` to `cat_${catKey.replace(/-/g, '_')}`.
  - HTML attribute mismatch: `catalog.html` line 167 uses `data-i18n="catalog_pkw"` and line 174 uses `data-i18n="catalog_lkw"` instead of standard `cat_motor_oils_pkw` / `cat_motor_oils_lkw`.

- **App Application Logic** (`app.js`):
  - Subcategories array (lines 49-57): `LUBRICANT_SUBCATEGORIES = ['motor-oils-pkw', 'motor-oils-lkw', 'moto-oils', 'transmission-oils', 'hydraulic-oils', 'greases', 'industrial-lubricants']`.
  - Filtering (lines 367-373): `applyCategoryFilterOnly` maps `lubricants` to include all subcategories.
  - Dynamic filter panel (lines 259-365): renders Color, Brand, and Volume filters dynamically, but **lacks a Viscosity filter group**.
  - Product cards (lines 438-582): displays surface specs (`Вязкость`, `Класс`), drawer buttons for Approvals (`.approval-exact-text`) and Specs (`.drawer-specs-table`), and volume tags. Price on request supported for `industrial-lubricants` and `price_on_request: true`.

- **Products Dataset** (`products.json`):
  - Total 444 products. `motor-oils-pkw` contains 60 products.
  - Brands in PKW: `MOL`, `YUKO`.
  - Viscosities in PKW: `0W-20`, `0W-30`, `5W-30`, `5W-40`, `10W-40`, `15W-40`.
  - Volumes in PKW: `1`, `4`, `5`, `10`, `50`, `55`, `57`, `60`, `198`, `199`, `202`, `208`.
  - IBC totes: 0 products currently contain volume > 500 or IBC/Еврокуб tags in `products.json`.

- **HTML Cache-Busting**:
  - All 11 HTML files (`admin.html`, `b2b-dashboard.html`, `catalog.html`, `checkout.html`, `contacts.html`, `delivery.html`, `faq.html`, `guides.html`, `index.html`, `returns.html`, `service.html`) currently use `?v=30.0` for `style.css`, `i18n.js`, and `app.js`.

- **AGENTS.md Compliance Violations (Emojis)**:
  - `app.js` line 566 (`📞`), line 610 (`🔍`), line 845 (`🗑`), line 854 (`✅`), line 998 (`✅`).
  - `i18n.js` line 67 (`🏢`).
  - `catalog.html` line 287 (`🔧`), line 298 (`🔍`).

---

## 2. Logic Chain
1. *From i18n Observation*: The translation dictionary keys for PKW and LKW motor oils (`cat_motor_oils_pkw`, `cat_motor_oils_lkw`) exist in both RU and RO in `i18n.js`. Standardizing `data-i18n` in `catalog.html` will ensure seamless language switching.
2. *From app.js Filter Observation*: `renderSidebarFilters` dynamically calculates available brands and volumes for whatever subcategory is active. Adding a Viscosity filter section for `motor-oils-pkw` requires extending `renderSidebarFilters` to extract unique `Вязкость` values from product `specs` and adding `activeViscosities` to `catalogState`.
3. *From products.json Observation*: IBC tote volume packs (983 л, 991 л, 994 л / Еврокуб / IBC tote) can be integrated by adding numeric volume values (`983`, `991`, `994`) to `volumes` arrays and adding corresponding pack objects `{ id: "p-983", volume_l: 983, price_mdl: X, label: "983 л (Еврокуб)" }` to `packs` arrays.
4. *From AGENTS.md Observation*: Multiple UI elements currently contain hardcoded emojis (📞, 🔍, 🗑, ✅, 🏢, 🔧). These must be replaced with inline SVG icons (`stroke: currentColor`, `stroke-width: 1.8-2.0`) to comply with AGENTS.md Section 1.
5. *From HTML Cache-Busting Observation*: Any update to `products.json`, `app.js`, `i18n.js`, or `style.css` requires updating `?v=30.0` to `?v=31.0` (or `?v=30.1`) across all 11 HTML files.

---

## 3. Caveats
- Exact price calculation for new IBC tote packs (983 л, 991 л, 994 л) depends on whether prices are specified by supplier or extrapolated per-liter from barrel prices (`barrel_price / barrel_vol * 983`).
- Offline fallback data (`OFFLINE_PRODUCTS` in `app.js`, lines 174-199) can be updated to include IBC packs if offline testing is desired.

---

## 4. Conclusion
The codebase is structurally well-prepared for the category and filter update. The implementation work required consists of:
1. Harmonizing `data-i18n` attributes in `catalog.html` and updating `i18n.js` if necessary.
2. Adding dedicated Viscosity filtering for motor oils in `app.js`.
3. Replacing all identified emoji occurrences in `app.js`, `i18n.js`, and `catalog.html` with SVG icons.
4. Adding IBC tote volume packs (`983 л`, `991 л`, `994 л` / `Еврокуб`) to target products in `products.json`.
5. Bumping `?v=30.0` -> `?v=31.0` across all 11 HTML files.

Detailed technical specifics are documented in `c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_2\analysis.md`.

---

## 5. Verification Method
- **File Inspection**:
  - View `c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_2\analysis.md`
  - View `c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_2\handoff.md`
- **Execution / Verification Commands**:
  - Run `node .agents/explorer_2/check_html.js` to verify HTML cache-busting query strings.
  - Run node verification scripts to confirm `products.json` schema and category counts.

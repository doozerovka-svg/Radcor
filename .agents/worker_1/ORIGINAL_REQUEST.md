## 2026-08-05T16:17:04Z
Implement the RADCOR Web Application catalog category naming update, Intercars-style filter panel for Passenger Car Motor Oils, and IBC Tote volume pack updates.

Objectives:
1. R1: Category Naming & Translations Update
   - In i18n.js:
     - Under ru: update cat_motor_oils_pkw to 'Легковые моторные масла' and cat_motor_oils_lkw to 'Грузовые моторные масла'. Also update catalog_pkw to 'Легковые моторные масла' and catalog_lkw to 'Грузовые моторные масла'.
     - Under ro: update cat_motor_oils_pkw to 'Uleiuri de motor autoturisme' and cat_motor_oils_lkw to 'Uleiuri de motor camioane'. Also update catalog_pkw to 'Uleiuri de motor autoturisme' and catalog_lkw to 'Uleiuri de motor camioane'.
   - In app.js:
     - Update default CATEGORY_LABELS:
       'motor-oils-pkw': 'Легковые моторные масла'
       'motor-oils-lkw': 'Грузовые моторные масла'
     - Maintain all subcategories in LUBRICANT_SUBCATEGORIES ('motor-oils-pkw', 'motor-oils-lkw', 'moto-oils', 'transmission-oils', 'hydraulic-oils', 'greases', 'industrial-lubricants').
   - In catalog.html:
     - Update data-i18n elements for catalog_pkw ("Легковые моторные масла") and catalog_lkw ("Грузовые моторные масла").

2. R2: Intercars-Style Filtering for Passenger Car Motor Oils
   - In catalog.html:
     - Add filterViscosityGroup to #sidebarFilters:
       <div class="filter-group" id="filterViscosityGroup" style="display:none;"><div class="filter-group-title" data-i18n="filter_viscosity">Вязкость</div><div class="filter-options" id="filterViscosityOptions"></div></div>
   - In i18n.js:
     - Add translations for filter_viscosity (ru: 'Вязкость', ro: 'Vâscozitate').
   - In app.js:
     - Update catalogState to include activeViscosities: new Set().
     - In renderSidebarFilters(products):
       - Render brand filter checkboxes for brands in filtered category (MOL, YUKO, etc.).
       - Render viscosity filter checkboxes when category is motor-oils-pkw (or when viscosities exist in filtered products).
       - Full list of SAE viscosities supported (e.g. 0W-16, 0W-20, 0W-30, 5W-20, 5W-30, 5W-40, 10W-30, 10W-40, 15W-40, 20W-50).
       - Render volume filter checkboxes with proper labels: 983 л, 991 л, 994 л (with label format "983 л (Еврокуб)" for 983L tote).
     - In applyFilters(products):
       - Implement viscosity matching check against product viscosity property, specs array ("Вязкость" / "Вязкость SAE"), or name string.
       - Ensure brand, viscosity, volume, and search filters combine cleanly without breaking category counts or search results.

3. R3: Volume Packs & Product Data Update
   - In products.json:
     - Update/add IBC tote volume sizes 983, 991, 994 in volumes array and packs array for motor-oils-pkw products.
     - Ensure products with different SAE viscosities (0W-16 through 20W-50) exist under motor-oils-pkw with brands like MOL, YUKO.
     - Ensure volume labels and price strings render cleanly on product cards and cart drawers in both RU and RO languages.
     - For volume 983, display tag label "983 л (Еврокуб)".
     - For volume 991, display tag label "991 л".
     - For volume 994, display tag label "994 л".

4. Cache-Busting Version Update
   - Update asset script/style query version from ?v=15.0 to ?v=16.0 in all top-level HTML files (index.html, catalog.html, b2b-dashboard.html, checkout.html, admin.html, contacts.html, delivery.html, faq.html, guides.html, returns.html, service.html).

5. Verification & Testing
   - Run verification (e.g., node syntax checks or linting if available) to ensure i18n.js, app.js, products.json, and HTML files are valid and error-free.
   - Write a detailed change log and verification output to worker_1/changes.md and a handoff report to worker_1/handoff.md.

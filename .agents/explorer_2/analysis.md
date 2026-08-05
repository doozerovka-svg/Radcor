# Detailed Technical Analysis: RADCOR Catalog Category & Filter System

## Overview & Scope
This analysis supports the catalog category and filter update for RADCOR (`c:\Users\DenCrut\Documents\radcor.md`). It covers five core components:
1. `i18n.js` internationalization dictionary and subcategory translation mapping.
2. `app.js` application logic (categories, accordion, counts, filtering, product card rendering, cart drawer).
3. `products.json` schema, passenger car motor oils (`motor-oils-pkw`), brands, viscosities, volumes, and IBC tote integration.
4. HTML files cache-busting audit (`?v=XX.X`).
5. `AGENTS.md` compliance audit (emoji prohibition, SVG icons, OEM approval integrity, product cards/drawers, price-on-request).

---

## 1. `i18n.js` Localization & Translation Architecture

### Subcategory Definitions (`ru` & `ro`)
- **Russian (`ru`)**:
  - `cat_motor_oils_pkw`: `'Моторные масла для легковых (PKW)'` (line 26)
  - `cat_motor_oils_lkw`: `'Моторные масла для грузовых (LKW)'` (line 27)
  - `cat_lubricants`: `'Смазочные материалы'` (line 25)
  - `cat_moto_oils`: `'Мото масла'` (line 28)
  - `cat_transmission_oils`: `'Трансмиссионные масла'` (line 29)
  - `cat_hydraulic_oils`: `'Гидравлические масла'` (line 30)
  - `cat_greases`: `'Смазки'` (line 31)
  - `cat_industrial_lubricants`: `'Промышленные смазочные материалы'` (line 32)
- **Romanian (`ro`)**:
  - `cat_motor_oils_pkw`: `'Uleiuri de motor autoturisme (PKW)'` (line 480)
  - `cat_motor_oils_lkw`: `'Uleiuri de motor autocamioane (LKW)'` (line 481)
  - `cat_lubricants`: `'Lubrifianți'` (line 479)
  - `cat_moto_oils`: `'Uleiuri moto'` (line 482)
  - `cat_transmission_oils`: `'Uleiuri de transmisie'` (line 483)
  - `cat_hydraulic_oils`: `'Uleiuri hidraulice'` (line 484)
  - `cat_greases`: `'Vaseline și unsori'` (line 485)
  - `cat_industrial_lubricants`: `'Lubrifianți industriali'` (line 486)

### Translation Flow
In `app.js`, `applyLanguage(lang)` updates category labels dynamically:
```javascript
Object.keys(CATEGORY_LABELS).forEach(catKey => {
    const i18nKey = `cat_${catKey.replace(/-/g, '_')}`;
    if (window.I18N && window.I18N[lang] && window.I18N[lang][i18nKey]) {
        CATEGORY_LABELS[catKey] = window.I18N[lang][i18nKey];
    }
});
```
*Note*: `catalog.html` has explicit `data-i18n` attributes on subcategory list items (e.g. `data-i18n="catalog_pkw"` on line 167 and `data-i18n="catalog_lkw"` on line 174). Standardizing these to `cat_motor_oils_pkw` / `cat_motor_oils_lkw` ensures consistency across the application.

---

## 2. `app.js` Architecture & Filter Logic Analysis

### Subcategory Mapping & Accordion
- **Mapping**: `LUBRICANT_SUBCATEGORIES` array (lines 49-57):
  `['motor-oils-pkw', 'motor-oils-lkw', 'moto-oils', 'transmission-oils', 'hydraulic-oils', 'greases', 'industrial-lubricants']`
- **Sidebar Accordion**: Subcategories are wrapped in `.sidebar-cat-accordion`. The toggle button `.cat-accordion-toggle` toggles the `.open` class.
- **Parent Lubricants Filter**:
  ```javascript
  function applyCategoryFilterOnly(products) {
      if (catalogState.activeCategory === 'all') return products;
      if (catalogState.activeCategory === 'lubricants') {
          return products.filter(p => LUBRICANT_SUBCATEGORIES.includes(p.category) || p.category === 'lubricants');
      }
      return products.filter(p => p.category === catalogState.activeCategory);
  }
  ```
  Clicking `lubricants` correctly displays items from all 7 subcategories.

### Breadcrumb & Counts Calculation
- `updateCategoryCounts(products)` calculates product totals per category key, aggregates all subcategories into `counts['lubricants']`, and updates `#count-${cat}` DOM elements.
- `renderCatalog(products)` updates `#catalogBreadcrumbTitle` with `CATEGORY_LABELS[catalogState.activeCategory]` and `#catalogProductCount` with `${visible.length} тов.`.

### Filter Panel Rendering & Gaps
- `renderSidebarFilters(products)` dynamically extracts unique **Colors** (`filterColorGroup`), **Brands** (`filterBrandGroup`), and **Volumes** (`filterVolumeGroup`) for the active category subset.
- **Key Architectural Gap**: Currently, there is **no dedicated Viscosity filter group** (e.g. `#filterViscosityGroup`) in `renderSidebarFilters`, nor is `activeViscosities` part of `catalogState`. Viscosity is currently searched only via the free-text search input. For `motor-oils-pkw` and `motor-oils-lkw`, adding a Viscosity checkbox filter (SAE grades: 0W-20, 0W-30, 5W-30, 5W-40, 10W-40, 15W-40) is strongly recommended.

### Product Card & Cart Drawer Volume Rendering
- `renderProductCard` displays surface specs (`Вязкость` and `Класс`), drawer buttons for Approvals (`.approval-exact-text`) and Specs (`.drawer-specs-table`), and volume tags.
- For `industrial-lubricants` or `price_on_request: true`, price displays `"по запросу"` (`.price-on-request`, color `#D97706`), with a direct call link `tel:+37368550595`.
- In `renderCart()`, item volume labels are formatted using `pack.label` if present or fallback `${vol} л` / `${vol * 1000} мл`.

---

## 3. `products.json` Dataset & IBC Tote Integration

### Current Schema & Dataset Statistics
- **Total Products**: 444 products across 11 categories.
- **Category Counts**:
  - `coolants`: 49
  - `auto-chemistry`: 141
  - `motor-oils-pkw`: 60
  - `transmission-oils`: 29
  - `industrial-lubricants`: 10
  - `motor-oils-lkw`: 14
  - `accessories`: 120
  - `brake-fluids`: 7
  - `greases`: 10
  - `moto-oils`: 3
  - `hydraulic-oils`: 1

### Passenger Car Motor Oils (`motor-oils-pkw`) Details
- **Count**: 60 products.
- **Brands**: `MOL`, `YUKO`.
- **SAE Viscosities**: `0W-20`, `0W-30`, `5W-30`, `5W-40`, `10W-40`, `15W-40`.
- **Volumes**: `1`, `4`, `5`, `10`, `50`, `55`, `57`, `60`, `198`, `199`, `202`, `208`.
- **Pack Labels**: `1 л`, `4 л`, `5 л`, `10 л`, `50 л (Бочка)`, `55 л`, `57 л`, `198 л (Бочка)`, `199 л (Бочка)`, `202 л (Бочка)`.

### Adding IBC Tote Volume Packs (983 л, 991 л, 994 л / Еврокуб / IBC tote)
- Currently, 0 products in `products.json` have volume > 500 or IBC tote tags.
- **Implementation Pattern for IBC Totes**:
  1. Add numeric volume (e.g. `983`, `991`, `994`) to the `volumes` array of relevant products (e.g., MOL Dynamic / MOL Essence / MOL Farm / industrial oils).
  2. Add pack object to `packs` array:
     ```json
     {
       "id": "p-983",
       "volume_l": 983,
       "price_mdl": 73725,
       "label": "983 л (Еврокуб)"
     }
     ```
  3. In `app.js`, `renderSidebarFilters` formats volumes >= 1 as `${v} л`, while `renderProductCard` and `renderCart` automatically display the custom `pack.label` ("983 л (Еврокуб)").

---

## 4. HTML Cache-Busting Audit (`?v=XX.X`)

All 11 top-level HTML files in the project were audited for asset version query strings:
| HTML File | `style.css` Version | `i18n.js` Version | `app.js` Version | Notes |
|-----------|--------------------|------------------|-----------------|-------|
| `admin.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `b2b-dashboard.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `catalog.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `checkout.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | `checkout.js` lacks `?v=30.0` |
| `contacts.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `delivery.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `faq.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `guides.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `index.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `returns.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |
| `service.html` | `?v=30.0` | `?v=30.0` | `?v=30.0` | Up-to-date |

**Action required on code edit**: Upon modifying `products.json`, `app.js`, `i18n.js`, or `style.css`, all 11 HTML files must be incremented to the next version string (e.g. `?v=31.0` or `?v=30.1`).

---

## 5. AGENTS.md B2B UI & Guidelines Compliance Audit

### Aesthetics Invariants (Emoji Violations)
`AGENTS.md` Rule 1 strictly prohibits emojis in category titles, sidebar filter items, buttons, and product badges, requiring monochromatic SVG icons (`stroke: currentColor`, `stroke-width: 1.8 - 2.0`).
The following violations were identified during inspection:
1. `app.js` line 566: `<a class="btn-call-request">📞 ${requestBtnLabel}</a>` (Contains 📞 emoji)
2. `app.js` line 610: `<span class="catalog-empty-icon">🔍</span>` (Contains 🔍 emoji)
3. `app.js` line 845: `<button class="cart-remove">🗑</button>` (Contains 🗑 emoji)
4. `app.js` line 854: `const freeText = '✅ Livrare gratuită!'` / `'✅ Бесплатная доставка!'` (Contains ✅ emoji)
5. `app.js` line 998: `alert('✅ Добро пожаловать...')` (Contains ✅ emoji)
6. `i18n.js` line 67: `login_partner_title: '🏢 Хотите стать партнёром?'` (Contains 🏢 emoji)
7. `catalog.html` line 287: `<span class="oil-selector-icon">🔧</span>` (Contains 🔧 emoji)
8. `catalog.html` line 298: `<span class="search-icon">🔍</span>` (Contains 🔍 emoji)

### OEM Approval Data Integrity
- Compliance: **100% Compliant**. OEM approval strings in `products.json` (e.g. `VW 504.00/507.00`, `MB 229.51, BMW Longlife-04`) are passed intact to `.approval-exact-text` without string manipulation or truncation.

### Product Card Surface & Drawers
- Compliance: **100% Compliant**. Cards show strictly Title, Description, Viscosity (`Вязкость`), and Class (`Класс`). Drawers contain no `×` close buttons or large headers, expanding/collapsing cleanly on click.

### Price on Request
- Compliance: **100% Compliant**. Industrial products and items with `price_on_request: true` hide numeric prices, display `"по запросу"` (`#D97706`), and link directly to `tel:+37368550595`.

---

## Summary of Proposed Implementation Updates
1. **i18n.js**: Add/verify `cat_motor_oils_pkw` and `cat_motor_oils_lkw` in `ru` and `ro` dictionaries; align `catalog.html` data-i18n attributes.
2. **app.js**:
   - Replace all identified emoji characters with clean SVG icons (`stroke: currentColor`, `stroke-width: 1.8 - 2.0`).
   - Implement dedicated Viscosity filter logic for motor oils in `renderSidebarFilters`.
   - Update volume filtering logic to cleanly render IBC tote volumes (`983 л`, `991 л`, `994 л` / `Еврокуб`).
3. **products.json**:
   - Add IBC tote volume packs (`983 л`, `991 л`, `994 л`) to selected heavy passenger, commercial, and industrial oil items.
4. **HTML Files**:
   - Increment cache-busting parameters `?v=30.0` -> `?v=31.0` (or `?v=30.1`) across all 11 HTML files.

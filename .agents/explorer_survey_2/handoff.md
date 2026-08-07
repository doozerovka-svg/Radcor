# HANDOFF REPORT — Explorer 2: Renaming, Volumes & UI Rendering Specialist

## 1. Observation

### A. Re-categorization of `MOL Arol 2T`
- **File**: `c:\Users\DenCrut\Documents\radcor.md\products.json` (lines 3599–3638)
- **Current State**: `MOL Arol 2T` (SKU `MOL-1042`) is currently configured with `"category": "motor-oils-pkw"`.
- **Requirement R2**: Move `MOL Arol 2T` to `"category": "moto-oils"`.

### B. Product Renaming Requirements (R2)
- **File**: `c:\Users\DenCrut\Documents\radcor.md\products.json`
- **Identified Items to Rename**:
  1. `MOL Dynamic Hybrid 0W-16` (line 19187) $\rightarrow$ `MOL Dynamic Gold NG 0W-16`
  2. `MOL Dynamic Star 0W-20` (line 6171) $\rightarrow$ `MOL Dynamic Gold NG 0W-20`
  3. `MOL Dynamic Essence 5W-30` (line 5693) $\rightarrow$ `MOL Essence 5W-30`
  4. `MOL Dynamic Essence C2 5W-30` (line 5770) $\rightarrow$ `MOL Essence DPF 5W-30`
  5. `Моторное масло MOL Dynamic Essence 5W-40` (line 5932) $\rightarrow$ `MOL Essence 5W-40`
  6. `MOL Dynamic Essence Diesel 5W-40` (line 5851) $\rightarrow$ `MOL Essence Diesel 5W-40`
  7. `MOL Dynamic Prima 5W-40` (line 4781) $\rightarrow$ `MOL Prima 5W-40`
  8. `Моторное масло YUKO Synetic 5W-40 (1 л)` (line 13466) $\rightarrow$ `Yuko Synthetic 5W-40`
  9. `MOL Dynamic Essence Diesel 10W-40` (line 6481) $\rightarrow$ `MOL Essence Diesel 10W-40`
  10. `Моторное масло YUKO CLASSIC 15W-40` (line 13302) $\rightarrow$ `Yuko Dynamic 15W-40`
  11. `MOL Dynamic Essence 15W-40` (line 6762) $\rightarrow$ `MOL Essence 15W-40`

### C. Addition of New Product Items (R2)
- **File**: `c:\Users\DenCrut\Documents\radcor.md\products.json`
- **New Items to Add under `motor-oils-pkw`**:
  1. `MOL Dynamic Star VL 0W-30`
     - Category: `motor-oils-pkw`
     - Brand: `MOL`
     - Volumes: `[1, 4]` (1L, 4L)
     - Specs: Viscosity `0W-30`, Approvals/Specs (Volvo VCC 95200377 / ACEA A5/B5 / A1/B1).
  2. `MOL Essence SL 10W-40`
     - Category: `motor-oils-pkw`
     - Brand: `MOL`
     - Volumes: `[4, 5, 20, 54, 196, 991]` (4L, 5L BiB, 20L BiB, 54L, 196L, 991L)
     - Specs: Viscosity `10W-40`, Class `API SL/CF, ACEA A3/B4`.

### D. Volume Array & Pack Label Rendering Mechanics in `app.js`
- **File**: `c:\Users\DenCrut\Documents\radcor.md\app.js`
- **Volume Label Formatting (`getVolumeLabel`, lines 205–212)**:
  ```javascript
  function getVolumeLabel(v, pack) {
      if (pack && pack.label) return pack.label;
      const numV = Number(v);
      if (numV === 983) return '983 л (Еврокуб)';
      if (numV === 991) return '991 л';
      if (numV === 994) return '994 л';
      return numV >= 1 ? `${numV} л` : `${numV * 1000} мл`;
  }
  ```
  - Observation: When `pack` object with `pack.label` exists, `getVolumeLabel` returns `pack.label` directly. For fallback (e.g. sidebar volume filter), `numV === 991` currently returns `'991 л'` without `(Еврокуб)`.
- **Product Card Volume Tags (`renderProductCard`, lines 737 & 754–760)**:
  - `const volumes = getProductPacks(product).map(pack => pack.volume_l);`
  - Volume tags display `label` returned from `getVolumeLabel(v, pack)`.
- **Cart Drawer Item Volume Label (`renderCart`, lines 1139–1140)**:
  - `const packMatch = prod && getProductPacks(prod).find(p => Number(p.volume_l) === Number(item.vol));`
  - `const volLabel = getVolumeLabel(item.vol, packMatch);`
  - Displays formatted volume label (e.g. `MOL-XXXX · 5 л BiB` or `MOL-XXXX · 991 л (Еврокуб)`).
- **Sidebar Volume Filtering (`renderSidebarFilters` & `applyFilters`, lines 407–411, 473–488, 695)**:
  - Aggregates unique volumes from `product.volumes` (array of numbers).
  - Filters products matching selected volumes in `catalogState.activeVolumes`.

### E. Price on Request & Call Request Rendering in `app.js`
- **File**: `c:\Users\DenCrut\Documents\radcor.md\app.js` (lines 859–875)
- **Code Logic**:
  ```javascript
  ${product.category === 'industrial-lubricants' || product.price_on_request ? `
      <div>
          <span class="product-price price-on-request">${requestPriceLabel}</span>
          <span class="product-price-unit">Tel: +373 685 50 595</span>
      </div>
      <a href="tel:+37368550595" class="btn-add-cart btn-call-request"><svg class="icon-phone" ...> ${requestBtnLabel}</a>
  ` : `...`}
  ```
- Observation: Renders `.price-on-request` ("по запросу") and phone call link `.btn-call-request` (`href="tel:+37368550595"`) compliant with AGENTS.md Rule 5.
- Observation: Clicking volume tags on cards with `price_on_request: true` does not crash or overwrite "по запросу" text because `priceEl` (`#price-${sku}`) is omitted in that branch.

### F. Drawer UI Mechanics in `app.js`
- **File**: `c:\Users\DenCrut\Documents\radcor.md\app.js` (lines 738–748, 795–805, 850–852, 938–983)
- **Code Logic**:
  - Surface specs filtered to strictly `Вязкость` and `Класс`.
  - Buttons `btn-toggle-approvals` (for OEM approvals) and `btn-toggle-details` (for phys-chem specs) render conditionally.
  - Single drawer element `#drawer-${sku}` toggles visibility. Clicking the active button again closes the drawer.
  - Approvals text is rendered verbatim via `.approval-exact-text`, preserving 100% OEM compliance without parsing.

---

## 2. Logic Chain

1. **Re-categorization Logic**: `MOL Arol 2T` is a 2-stroke motorcycle/scooter engine oil. In `products.json`, it was incorrectly assigned to `"category": "motor-oils-pkw"`. Moving it to `"category": "moto-oils"` fixes catalog classification as required in R2 and AGENTS.md.

2. **Renaming & Addition Logic**:
   - The 11 renaming specifications in R2 align product titles with Alexandr Radcor-prim SRL's official catalog nomenclature (stripping redundant `Dynamic` from the `Essence` product line, standardizing `NG` suffix for hybrid 0W-16 and 0W-20, and harmonizing Yuko names).
   - Adding `MOL Dynamic Star VL 0W-30` (1L, 4L) and `MOL Essence SL 10W-40` (4L, 5L BiB, 20L BiB, 54L, 196L, 991L) fills critical product gaps requested by the client.

3. **Volume Array & Pack Label Logic**:
   - `app.js` uses `product.volumes` (array of numbers) for sidebar filters and `product.packs` (array of objects) for product card volume tags and cart pricing.
   - For custom pack labels (such as Bag-in-Box `5 л BiB`, `20 л BiB` or IBC Eurocube `991 л (Еврокуб)`), `product.packs` must define `"label": "..."`.
   - `getVolumeLabel(v, pack)` prioritizes `pack.label`. When `pack.label` is present, product cards, volume unit labels, and cart items display the custom pack string cleanly.
   - Both `product.volumes` and `product.packs` must be kept strictly synchronized in `products.json`.

4. **UI Rendering Integrity**:
   - `price_on_request: true` correctly renders B2B phone links without displaying "0 MDL".
   - Viscosity sorting in `renderCatalog` automatically sorts motor oil products by viscosity grade (0W-16 to 20W-50) using `parseViscosityWeight`.

---

## 3. Caveats

1. **Fallback Volume Label**: If a product has volume `991` in `product.volumes` but `product.packs` is missing or lacks `label`, `getVolumeLabel(991)` in `app.js` line 209 currently returns `'991 л'` instead of `'991 л (Еврокуб)'`. Updating line 209 in `app.js` to `if (numV === 991) return '991 л (Еврокуб)';` provides a failsafe fallback.
2. **Read-Only Scope**: This report provides investigation findings and schema/code recommendations. Actual modifications to `products.json` and `app.js` will be performed by the designated implementer.

---

## 4. Conclusion

1. **`MOL Arol 2T`**: Re-categorize to `"category": "moto-oils"` in `products.json`.
2. **Renaming & New Positions**: Apply 11 title renames and insert 2 new product objects (`MOL Dynamic Star VL 0W-30` and `MOL Essence SL 10W-40`) into `products.json`.
3. **Volume Packs Schema**: For all retained products, structure `packs` with explicit `label` values (e.g. `"4 л BiB"`, `"5 л BiB"`, `"20 л BiB"`, `"991 л (Еврокуб)"`) and ensure `volumes` array matches `packs` volume values.
4. **`app.js` Recommendation**: Enhance fallback in `getVolumeLabel` (line 209) so `numV === 991` returns `'991 л (Еврокуб)'`.

---

## 5. Verification Method

1. **Data Inspection**:
   - Verify `MOL Arol 2T` has `"category": "moto-oils"` in `products.json`.
   - Verify product titles match R2 specifications (e.g., `MOL Dynamic Gold NG 0W-16`, `MOL Essence 5W-30`, `MOL Essence SL 10W-40`).
2. **Browser / UI Verification**:
   - Load catalog in browser and navigate to `Легковые моторные масла`.
   - Inspect product cards for `MOL Essence SL 10W-40` and verify volume tags (`4 л`, `5 л BiB`, `20 л BiB`, `54 л`, `196 л`, `991 л (Еврокуб)`).
   - Click volume tags and verify price unit text updates (`за 5 л BiB`, `за 991 л (Еврокуб)`).
   - Add item to cart and open cart drawer to verify item row shows `SKU · 5 л BiB`.
   - Verify `MOL Arol 2T` appears under `Мото масла` category and not under `Legkovie motornyye masla`.

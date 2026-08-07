# Original User Request

## 2026-08-06T19:03:13Z

Update the Passenger Car Motor Oils (`motor-oils-pkw`) catalog in `products.json` according to the 66-point specification provided by Alexandr Radcor-prim SRL. Clean up duplicates, remove discontinued/absent products, rename product titles (e.g., removing `Dynamic` from `Essence` line items), adjust volume packs (including BiB carton & Eurocube options), add new positions (`Mol Dynamic Star VL 0w-30`, `Mol Essence SL 10w40`), move `Mol Arol 2T` to `moto-oils`, and update descriptions, OEM approvals, and specifications for all MOL & YUKO passenger oils.

Working directory: c:\Users\DenCrut\Documents\radcor.md
Integrity mode: development

## Requirements

### R1. Passenger Motor Oils Catalog Cleanup & Removal (motor-oils-pkw)
- Remove discontinued / non-existent products from `products.json`:
  - `Yuko Super Hybrid 0W-16`, `Yuko Syntetic 0W-16`, `MOL Dynamic Gold Ultra 0W-16`
  - `Yuko Syntetic 0W-20`, `MOL Dynamic Gold 0W-20`, `MOL Dynamic Gold 0W-20 VAG`, `MOL Dynamic Synt RN17FE 0W-20`
  - `Yuko Syntetic 0W-30`, `MOL Dynamic Gold 0W-30`, `MOL Dynamic Star 0W-30`
  - `Yuko Syntetic 5W-20`, `MOL Dynamic Gold HUN 5W-30`, `MOL Dynamic Synt 5W-30`
  - `MOL Dynamic Gold 5W-40`, `Yuko Vega Synt 5W-40`, `MOL Dynamic Synt RN 5W-40`, `MOL Dynamic Essence DPF 5W-40`, `MOL Essence Multi Gaz 5W-40`
  - `Yuko Semisynt 10W-30`, `Yuko Synetic 10W-30`, `MOL Dynamic Synt 10W-30`, `MOL Dynamic Transit 10W-30`
  - `MOL 15W-40`, `Yuko Classic 20W-50`, `MOL Dynamic Race R5`
- Remove all duplicates (`MOL Dynamic Gold Longlife 0W-30`, `MOL Dynamic Gold Longlife 5W-30`, `MOL Essence 5W-30`, `MOL Dynamic Essence Diesel 5W-40`, `MOL Dynamic Prima 5W-40`, `MOL Essence 5W-40`, `MOL Essence Diesel 10W-40`).

### R2. Product Renaming, New Items & Re-categorization
- Rename items:
  - `MOL Dynamic Hybrid 0W-16` -> `MOL Dynamic Gold NG 0W-16`
  - `MOL Dynamic Star 0W-20` -> `MOL Dynamic Gold NG 0W-20`
  - `MOL Dynamic Essence 5W-30` -> `MOL Essence 5W-30`
  - `MOL Dynamic Essence C2 5W-30` -> `MOL Essence DPF 5W-30`
  - `MOL Dynamic Essence 5W-40` -> `MOL Essence 5W-40`
  - `MOL Dynamic Essence Diesel 5W-40` -> `MOL Essence Diesel 5W-40`
  - `MOL Dynamic Prima 5W-40` -> `MOL Prima 5W-40`
  - `Yuko Syntetic 5W-40 (1 л)` -> `Yuko Synthetic 5W-40`
  - `MOL Dynamic Essence Diesel 10W-40` -> `MOL Essence Diesel 10W-40`
  - `Yuko Classic 15W-40` -> `Yuko Dynamic 15W-40`
  - `MOL Dynamic Essence 15W-40` -> `MOL Essence 15W-40`
- Add new items:
  - `MOL Dynamic Star VL 0W-30` (Volumes: 1L, 4L)
  - `MOL Essence SL 10W-40` (Volumes: 4L, 5L BiB, 20L BiB, 54L, 196L, 991L)
- Re-categorize: Move `MOL Arol 2T` from passenger car oils to `moto-oils`.

### R3. Volume Packs & Specifications Integrity
- Update `volumes` array and pack labels (including `BiB carton` 4L, 5L, 20L and IBC Eurocubes `991L`) for all retained products.
- Ensure all retained MOL and YUKO products have complete, authentic Russian & Romanian descriptions, official OEM approvals, and physical-chemical properties (`specs`).

## Acceptance Criteria

### Data Integrity & Catalog Cleanliness
- [ ] Exactly 33 active, unique passenger motor oil models remain in `motor-oils-pkw` with zero duplicates.
- [ ] `MOL Arol 2T` is assigned to category `moto-oils`.
- [ ] All specified volume packs (e.g. `5L BiB carton`, `20L BiB carton`, `991L`) render cleanly on product cards and cart drawers.

### Specification & B2B Rules Compliance
- [ ] Every product has accurate specs (`Viscosity`, `Class`, `Approvals`, `Density`, `Flash point`, `Pour point`).
- [ ] No emojis in product titles, category labels, or badges (`AGENTS.md` compliance).
- [ ] Asset versions bumped (`?v=38.0`) and 0 JS console errors on catalog page.

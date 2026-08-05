# Original User Request

## 2026-08-05T19:15:25Z

Update the RADCOR web application catalog category names and sidebar filters for "Смазочные материалы" (Lubricants), implementing an Intercars-style filter panel for Passenger Car Motor Oils with expanded Viscosity options and IBC Tote volume packs (983L, 991L, 994L).

Working directory: c:\Users\DenCrut\Documents\radcor.md
Integrity mode: development

## Requirements

### R1. Category Naming Update
- Under "Смазочные материалы" (Lubricants), update subcategory labels:
  - motor-oils-pkw -> "Легковые моторные масла" (RO: "Uleiuri de motor autoturisme")
  - motor-oils-lkw -> "Грузовые моторные масла" (RO: "Uleiuri de motor camioane")
- Maintain all existing subcategories (moto-oils, transmission-oils, hydraulic-oils, greases, industrial-lubricants).
- Update both Russian (ru) and Romanian (ro) translations in i18n.js.

### R2. Intercars-Style Filtering for Passenger Car Motor Oils
- Enhance the sidebar filter panel when selecting "Легковые моторные масла":
  1. Производитель / Brand: MOL, YUKO, etc.
  2. Вязкость / Viscosity: Complete list of SAE viscosities (e.g. 0W-16, 0W-20, 0W-30, 5W-20, 5W-30, 5W-40, 10W-30, 10W-40, 15W-40, 20W-50).
  3. Ёмкость (Объем) / Capacity: Include standard volume tags plus new IBC tote container volumes: 983 л, 991 л, 994 л (Еврокуб / IBC tote).

### R3. Volume Packs & Product Data Update
- Add 983L, 991L, 994L pack size capabilities in products.json and app.js volume filtering logic.
- Ensure volume tags and prices render cleanly on product cards and cart drawers in both RU and RO languages.

## Acceptance Criteria

### Category & Translation Compliance
- [ ] Subcategory names in sidebar and breadcrumbs display "Легковые моторные масла" and "Грузовые моторные масла" (in RO: "Uleiuri de motor autoturisme", "Uleiuri de motor camioane").
- [ ] No broken category links or broken category counts.

### Filter Functionality
- [ ] Filtering by brand, viscosity (0W-16 through 20W-50), and volume (including 983L, 991L, 994L) updates the catalog grid accurately.
- [ ] Selection of 983L / 991L / 994L volume tags displays correct volume labels ("983 л (Еврокуб)", "991 л", "994 л").

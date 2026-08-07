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


## 2026-08-06T05:39:12Z

Orchestrate a comprehensive, end-to-end automated test suite and audit of the RADCOR web application across all 11 HTML pages (index.html, catalog.html, checkout.html, b2b-dashboard.html, admin.html, delivery.html, returns.html, service.html, faq.html, guides.html, contacts.html).

Key Requirements to test & audit:
R1. Catalog, Sorting & Filtering Audit:
- Test category switching (Lubricants accordion with all subcategories, Coolants, Brake Fluids, Auto Chemistry, Accessories, Auto Lamps).
- Verify dynamic sidebar filters (Brand, Viscosity 0W-16 to 20W-50, ACEA 34 items, API 52 items, OEM Standards, Volume Packs including 983L/991L/994L Eurocubes, Antifreeze Colors).
- Verify motor oil sorting logic (viscosity ascending starting from 0W-16).
- Test search bar filtering by SKU, name, brand, spec value.

R2. UI Components & Drawers Audit:
- Test product card interaction: Pack size selection, price updating, Price on Request ("по запросу" / "+373 685 50 595" button for industrial-lubricants / price_on_request), Approvals drawer toggle, Specs drawer toggle.
- Verify 100% compliance with B2B UI Invariants (AGENTS.md): Zero emojis in category names/buttons/badges, monochrome SVG icons, exact verbatim OEM approval strings.

R3. Cart & Localization (RU/RO) Audit:
- Test Add to Cart, quantity modification, item removal, persistent state, cart drawer totals.
- Test language switcher (ru <-> ro) across all 11 pages. Ensure all text nodes and placeholders translate dynamically.

R4. Page Integrity & Checkout Flow Audit:
- Validate form inputs and submission in checkout.html and contacts.html.
- Audit script tags, asset versioning (?v=36.0 across all 11 HTML pages), and console error logs across all 11 HTML pages.


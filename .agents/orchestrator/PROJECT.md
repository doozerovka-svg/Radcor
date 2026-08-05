# Project: RADCOR Catalog Category & Intercars-Style Filter Update

## Architecture
- RADCOR web application catalog (vanilla HTML/JS/CSS, `app.js`, `i18n.js`, `products.json`, `style.css`).
- Dual language support (Russian `ru`, Romanian `ro`) managed via `i18n.js`.
- Category hierarchy defined in `app.js` and `i18n.js`.
- Sidebar filters dynamically rendered for categories and subcategories in `app.js`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Codebase investigation, locating i18n strings, filter logic, products data structure | none | IN_PROGRESS |
| 2 | R1 Category Naming | Update subcategory labels `motor-oils-pkw` and `motor-oils-lkw` in RU and RO in `i18n.js` and `app.js` | M1 | PLANNED |
| 3 | R2 & R3 Filters & Packs | Implement Intercars-style sidebar filter for PKW motor oils (Brand, Viscosity, IBC Tote Volume 983L/991L/994L) & products.json updates | M2 | PLANNED |
| 4 | Verification & Audit | Multi-perspective Reviewer, Challenger, and Forensic Auditor verification | M3 | PLANNED |

## Interface Contracts & Layout
- `i18n.js`: Translation dictionary keys for subcategories (`motor-oils-pkw`, `motor-oils-lkw`, etc.) in `ru` and `ro`.
- `app.js`: Filter logic, subcategory rendering, viscosity tags, volume tags filtering (`983L`, `991L`, `994L`), volume tag text formatting.
- `products.json`: Product entries, `volume` or `volumes` array/options, `category` / `subcategory` keys, `price_on_request`.
- HTML files (`index.html`, etc.): `?v=XX.X` script/style cache busting updates.

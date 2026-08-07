# Project: Radcor-prim Motor Oils Catalog Update

## Architecture & Code Layout
- **Catalog Dataset**: `products.json`
- **Application Logic**: `app.js`
- **Localization**: `i18n.js`
- **Styles**: `style.css`
- **HTML Pages (11 files)**: `admin.html`, `b2b-dashboard.html`, `catalog.html`, `checkout.html`, `contacts.html`, `delivery.html`, `faq.html`, `guides.html`, `index.html`, `returns.html`, `service.html`

## Feature Inventory
| # | Feature / Requirement | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | R1 Catalog Cleanup | Remove 25 discontinued & 10 duplicate items from `motor-oils-pkw` in `products.json` | M1 | ORIGINAL_REQUEST § R1 |
| 2 | R2 Re-categorization | Move `MOL Arol 2T` (`MOL-1042`) from `motor-oils-pkw` to `moto-oils` | M1 | ORIGINAL_REQUEST § R2 |
| 3 | R2 Product Title Renaming | Rename 11 specified product titles (e.g. `MOL Dynamic Gold NG 0W-16`, `MOL Essence 5W-30`, etc.) | M2 | ORIGINAL_REQUEST § R2 |
| 4 | R2 New Product Additions | Add `MOL Dynamic Star VL 0W-30` (1L, 4L) and `MOL Essence SL 10W-40` (4L, 5L BiB, 20L BiB, 54L, 196L, 991L) | M2 | ORIGINAL_REQUEST § R2 |
| 5 | R3 Pack Labels & Volumes Sync | Synchronize `volumes` array & `packs` objects (BiB carton 4L/5L/20L, Eurocube 991L) in `products.json` | M2 | ORIGINAL_REQUEST § R3 |
| 6 | R3 App.js Volume Fallback | Update `getVolumeLabel(v)` fallback in `app.js` for 991L Eurocube | M2 | Explorer 2 Survey |
| 7 | R3 Specs & Localization | Enrich RU/RO descriptions, OEM approvals, and phys-chem specs (`Density`, `Flash point`, `Pour point`) for all active 33 PKW items | M3 | ORIGINAL_REQUEST § R3 |
| 8 | Asset Versioning | Bump `?v=37.0` to `?v=38.0` in all 11 HTML files | M4 | ORIGINAL_REQUEST § Acceptance Criteria |
| 9 | Verification & Integrity Audit | Verify 33 active PKW products, zero emojis, zero JS errors, clean UI rendering & Forensic Audit | M4 | ORIGINAL_REQUEST & AGENTS.md |

## Milestones Decomposition
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Catalog Cleanup & Re-categorization | Remove discontinued/duplicate products and move `MOL Arol 2T` to `moto-oils` in `products.json` | None | DONE |
| M2 | Titles, New Positions & Pack Volume Sync | Apply 11 title renames, add 2 new products, update volumes/packs arrays in `products.json`, and update `app.js` fallback | M1 | DONE |
| M3 | Specs, OEM Approvals & Localization | Enrich `description`, `description_ro`, OEM approvals, surface specs, and phys-chem properties for all 33 active PKW products | M2 | DONE |
| M4 | Asset Versioning & E2E Verification | Bump asset versions to `?v=38.0`, perform lint/verification, run Reviewers, Challengers, and Forensic Auditor | M3 | IN_PROGRESS |

## Interface Contracts & Data Schema
### `products.json` Schema Contract
- `category`: Must be valid key (`motor-oils-pkw`, `moto-oils`, etc.).
- `description`: Russian description string.
- `description_ro`: Romanian description string.
- `volumes`: Array of numbers (e.g. `[4, 5, 20, 54, 196, 991]`).
- `packs`: Array of pack objects `[{ "volume_l": 5, "label": "5 л BiB", "price": 0 }, ...]`.
- `specs`: Array of spec objects `[{ "label": "Допуски", "value": "<raw OEM string>" }, { "label": "Вязкость", "value": "..." }, { "label": "Класс", "value": "..." }, { "label": "Плотность при 15°C", "value": "..." }, { "label": "Температура вспышки (по Кливленду)", "value": "..." }, { "label": "Температура застывания", "value": "..." }]`.
- `price_on_request`: Boolean flag (`true` for price on request items).

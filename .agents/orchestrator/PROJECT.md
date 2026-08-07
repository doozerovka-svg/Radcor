# Project: RADCOR E2E Testing & Audit Project

## Architecture
- 11 HTML pages: `index.html`, `catalog.html`, `checkout.html`, `b2b-dashboard.html`, `admin.html`, `delivery.html`, `returns.html`, `service.html`, `faq.html`, `guides.html`, `contacts.html`.
- Core JS modules: `app.js`, `i18n.js`, data: `products.json`, styles: `style.css`.
- Dual language support: Russian (`ru`), Romanian (`ro`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Strategy | Codebase & HTML page structure inspection, test runner setup | none | IN_PROGRESS |
| 2 | R1 Catalog, Sorting & Filtering Audit | Test category switching, dynamic sidebar filters, viscosity sorting (0W-16 up), search filtering | M1 | PLANNED |
| 3 | R2 UI Components & Drawers Audit | Pack size selection, price updating, Price on Request, drawers, B2B UI compliance (no emojis, SVG icons, exact OEM approvals) | M1 | PLANNED |
| 4 | R3 Cart & Localization Audit | Add to cart, quantity, removal, totals, language switcher (ru<->ro across 11 pages) | M1 | PLANNED |
| 5 | R4 Page Integrity & Checkout Flow Audit | Form validation (checkout, contacts), script tags, asset versioning (?v=36.0 across all 11 pages), console errors | M1 | PLANNED |
| 6 | Verification & Forensic Audit | Challenger empirical testing & Forensic Auditor integrity verification | M2, M3, M4, M5 | PLANNED |

## Code Layout & Standards
- Root directory: `c:\Users\DenCrut\Documents\radcor.md\`
- 11 HTML pages: `index.html`, `catalog.html`, `checkout.html`, `b2b-dashboard.html`, `admin.html`, `delivery.html`, `returns.html`, `service.html`, `faq.html`, `guides.html`, `contacts.html`
- Core scripts: `app.js`, `i18n.js`
- Product database: `products.json`
- Stylesheet: `style.css`
- Rules: `AGENTS.md` (Strict B2B UI, zero emojis, SVG icons, exact OEM specs, price on request)

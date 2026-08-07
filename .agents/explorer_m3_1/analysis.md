# Comprehensive Audit Report: Motor-Oils-PKW Product Specifications & OEM Approvals

**Date**: 2026-08-06  
**Auditor**: Explorer M3_1 Subagent  
**Scope**: Category `motor-oils-pkw` in `c:\Users\DenCrut\Documents\radcor.md\products.json`  

---

## 1. Executive Summary

A comprehensive audit was performed on all **38 products** currently assigned to category `motor-oils-pkw` in `products.json`. The audit evaluated the presence, completeness, exact key labels, raw string formatting of OEM approvals (AGENTS.md Rule 2 compliance), and physical-chemical test parameters.

### Core Audit Metrics
- **Total `motor-oils-pkw` Products Audited**: 38 products
- **Products with ALL 6 Required Spec Keys**: **0 / 38 (0.0%)**
- **Products Missing 1+ Spec Keys**: **38 / 38 (100.0%)**
- **Products with Zero Specs**: **0 / 38 (0.0%)** (all products have at least 1 spec entry)
- **AGENTS.md Rule 2 (Raw OEM String Integrity)**: **100% Pass** for all 33 products containing `Допуски`. Zero automatic parsing, truncation, or splitting detected in raw data.

---

## 2. Required Spec Key Coverage Analysis

The specification requires 6 mandatory specification parameters for every passenger car motor oil:
1. `Вязкость` (Viscosity)
2. `Класс` (Class / API / ACEA)
3. `Допуски` (OEM Approvals)
4. `Плотность при 15°C` (Density at 15°C)
5. `Температура вспышки (по Кливленду)` (Flash point Cleveland)
6. `Температура застывания` (Pour point)

### Key Coverage Summary Table

| Spec Key Name | Present Count | Missing Count | Coverage % | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Допуски** | 33 | 5 | 86.8% | High coverage, missing in 5 items |
| **Вязкость** | 21 | 17 | 55.3% | Moderate coverage, missing in 17 items |
| **Температура вспышки (по Кливленду)** | 16 | 22 | 42.1% | Low coverage, missing in 22 items |
| **Температура застывания** | 16 | 22 | 42.1% | Low coverage, missing in 22 items |
| **Класс** | 15 | 23 | 39.5% | Low coverage, missing in 23 items |
| **Плотность при 15°C** | 15 | 23 | 39.5% | Low coverage, missing in 23 items |

---

## 3. Product Structural Patterns & Discrepancy Classification

All 38 products fall into 6 distinct structural completeness patterns:

### Pattern A: Phys-Chem Focus (Missing `Вязкость` & `Класс`) — 13 Products
These products have physical-chemical data (`Плотность`, `Температура вспышки`, `Температура застывания`) and `Допуски`, but lack `Вязкость` and `Класс` in their `specs` array (even though viscosity is typically present in the product name).
- **SKUs**: `MOL-1005`, `MOL-1018`, `MOL-1022`, `MOL-1023`, `MOL-1025`, `MOL-1031`, `MOL-1032`, `MOL-1038`, `MOL-1046`, `MOL-1047`, `MOL-1055`, `MOL-1061`, `MOL-1070`.

### Pattern B: Standard Commercial Focus (Missing Phys-Chem) — 14 Products
These products have `Вязкость`, `Класс`, and `Допуски`, but zero physical-chemical parameters (`Плотность`, `Температура вспышки`, `Температура застывания`).
- **SKUs**: `MOL-1004`, `MOL-1011`, `MOL-1019`, `MOL-1030`, `MOL-1040`, `MOL-1043`, `MOL-1050`, `MOL-1052`, `MOL-DYN-ESS-C2-5W30`, `MOL-DYN-ESS-DSL-5W40`, `MOL-DYN-STAR-0W20`, `MOL-DYN-ESS-DSL-10W40`, `MOL-DYN-STAR-VL-0W30`, `MOL-ESSENCE-SL-10W40`.

### Pattern C: Minimal MOL Focus (Missing `Класс` & Phys-Chem) — 5 Products
These products have `Вязкость` and `Допуски`, but lack `Класс` and all 3 physical-chemical parameters.
- **SKUs**: `MOL-1035`, `MOL-DYN-ESS-5W30`, `MOL-DYN-ESS-5W40`, `MOL-DYN-PRIMA-5W40`, `MOL-HYBRID-0W16`.

### Pattern D: Viscosity + Class Only (Missing `Допуски` & Phys-Chem) — 1 Product
Has `Вязкость` and `Класс`, but missing `Допуски` and all physical-chemical parameters.
- **SKU**: `MOL-DYN-ESS-15W40` (`MOL Essence 15W-40`).

### Pattern E: YUKO Bare Minimum (Viscosity Only) — 4 Products
These 4 YUKO products have only `Вязкость` in `specs`, missing all 5 other spec keys (`Класс`, `Допуски`, `Плотность`, `Температура вспышки`, `Температура застывания`).
- **SKUs**: `YUKO-CLASSIC-15W40`, `YUKO-VEGA-10W40`, `YUKO-SYNETIC-5W30`, `YUKO-SYNETIC-5W40`.

### Pattern F: Partial Phys-Chem — 1 Product
Has `Допуски`, `Температура вспышки`, `Температура застывания`, but missing `Плотность при 15°C`, `Вязкость`, and `Класс`.
- **SKU**: `MOL-1006` (`MOL Dynamic Gold HEV 0W-20`).

---

## 4. AGENTS.md Rule 2 Compliance Audit (OEM Approvals)

AGENTS.md Rule 2 mandates:
> **100% Сохранность оригинальных строк допусков**: Запрещено модифицировать, автоматически парсить, разделять по запятым или обрезать официальные наименования допусков и стандартов.

### Verification Results
1. **Raw Storage**: In all 33 products with `Допуски`, values are stored as single continuous string values. No arrays or parsed JSON objects were used.
2. **Preservation of OEM Formatting**: Complex strings such as `"ACEA C3, ACEA C2, Renault RN17, API SP, MB 229.51, MB 229.52, MB 229.31, Renault RN0700, Renault RN0710, Fiat 9.55535-S1, MB 226.52, ILSAC GF-6A"` (`MOL-1031`) are stored verbatim.
3. **No Truncation**: Strings retain all slashes and spaces (e.g. `VW 504 00/507 00`, `Opel OV 040 1547 - A20`).

---

## 5. Full Product Specification Inventory (38 Items)

Below is the item-by-item breakdown of spec availability for all 38 products:

| # | SKU | Product Title | Specs Count | Present Spec Keys | Missing Spec Keys | OEM Approval String Sample |
|---|---|---|:---:|---|---|---|
| 1 | `MOL-1004` | MOL Dynamic Max 10W-40 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | MB 229.3, VW 502.00/505.00 |
| 2 | `MOL-1005` | MOL Essence C3 5W-40 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA C3, ACEA C2, API SN/CF, VW 502 00/505 01, Renault RN0700, RN0710 |
| 3 | `MOL-1006` | MOL Dynamic Gold HEV 0W-20 | 3 | Допуски, Вспышка, Застывание | Вязкость, Класс, Плотность | API SP, API SP (RC), ILSAC GF-6A |
| 4 | `MOL-1011` | MOL Dynamic Gold Longlife 5W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | VW 504.00/507.00, MB 229.51 |
| 5 | `MOL-1018` | MOL Dynamic Gold Longlife 0W-20 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA C5, API SN Plus, VW 508 00/509 00 |
| 6 | `MOL-1019` | MOL Dynamic Star VL 0W-20 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | Volvo VCC RBS0-2AE |
| 7 | `MOL-1022` | MOL Dynamic Gold DX 0W-20 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | API SN, API SP, Opel OV 040 1547 - A20, ILSAC GF-5, ILSAC GF-6A |
| 8 | `MOL-1023` | MOL Dynamic Star PC 0W-30 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA C2, PSA B71 2312 |
| 9 | `MOL-1025` | MOL Botond 20W-50 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | API SF/CC, MIL-L-46152B |
| 10 | `MOL-1030` | MOL Essence 10W-40 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | VW 501.01/505.00 |
| 11 | `MOL-1031` | MOL Dynamic Synt RN17 5W-30 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA C3, C2, Renault RN17, API SP, MB 229.51/52/31... |
| 12 | `MOL-1032` | MOL Essence 15W-50 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | API SJ/CF |
| 13 | `MOL-1035` | MOL Dynamic Star PC 5W-30 | 2 | Вязкость, Допуски | Класс, Плотность, Вспышка, Застывание | PSA Peugeot Citroen B71 2290, Fiat 9.55535-S1 |
| 14 | `MOL-1038` | MOL Dynamic Gas Eco+ 15W-40 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA E7, API CI-4/SL |
| 15 | `MOL-1040` | MOL Dynamic Synt RN 5W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | Renault RN0720 |
| 16 | `MOL-1043` | MOL Dynamic Gold DX 5W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | GM dexos1 Gen2 |
| 17 | `MOL-1046` | MOL Essence Longlife 5W-30 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA C3, API SN, VW 504 00/507 00, BMW Longlife-04 |
| 18 | `MOL-1047` | MOL Dynamic Star F 0W-30 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | ACEA C2, Fiat 9.55535-DS1, Fiat 9.55535-GS1 |
| 19 | `MOL-1050` | MOL Dynamic Star 5W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | MB 229.51, BMW Longlife-04 |
| 20 | `MOL-1052` | MOL Dynamic Gold 5W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | MB 229.5, VW 502.00/505.00 |
| 21 | `MOL-1055` | MOL MSE 15W-40 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | API SF/CC, MIL-L-46152B |
| 22 | `MOL-1061` | MOL Dynamic Gold Longlife 0W-30 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | VW 504 00/507 00, ACEA C3, BMW Longlife-04 |
| 23 | `MOL-1070` | MOL Dynamic Gold DX 5W-20 | 4 | Допуски, Плотность, Вспышка, Застывание | Вязкость, Класс | API SP, Opel OV 040 1547 - A20, Ford WSS-M2C-960-A1... |
| 24 | `MOL-DYN-ESS-5W30` | MOL Essence 5W-30 | 2 | Вязкость, Допуски | Класс, Плотность, Вспышка, Застывание | ACEA A3/B4-04, API SL/CF, VW 502 00/505 00, BMW Longlife-01 |
| 25 | `MOL-DYN-ESS-C2-5W30` | MOL Essence DPF 5W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | VW 502.00/505.00, Renault RN0700 |
| 26 | `MOL-DYN-ESS-DSL-5W40` | MOL Essence Diesel 5W-40 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | VW 502.00/505.00 |
| 27 | `MOL-DYN-ESS-5W40` | MOL Essence 5W-40 | 2 | Вязкость, Допуски | Класс, Плотность, Вспышка, Застывание | API SN, ACEA A3/B4-08, VW 502 00/505 00... |
| 28 | `MOL-DYN-STAR-0W20` | MOL Dynamic Gold NG 0W-20 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | Ford WSS-M2C-948-B |
| 29 | `MOL-DYN-ESS-DSL-10W40` | MOL Essence Diesel 10W-40 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | VW 505.00 |
| 30 | `MOL-DYN-ESS-15W40` | MOL Essence 15W-40 | 2 | Вязкость, Класс | Допуски, Плотность, Вспышка, Застывание | MISSING |
| 31 | `YUKO-CLASSIC-15W40` | Yuko Dynamic 15W-40 | 1 | Вязкость | Класс, Допуски, Плотность, Вспышка, Застывание | MISSING |
| 32 | `YUKO-VEGA-10W40` | Моторное масло YUKO VEGA SYNT 10W-40 | 1 | Вязкость | Класс, Допуски, Плотность, Вспышка, Застывание | MISSING |
| 33 | `YUKO-SYNETIC-5W30` | Моторное масло YUKO Synetic 5W-30 (1 л) | 1 | Вязкость | Класс, Допуски, Плотность, Вспышка, Застывание | MISSING |
| 34 | `YUKO-SYNETIC-5W40` | Yuko Synthetic 5W-40 | 1 | Вязкость | Класс, Допуски, Плотность, Вспышка, Застывание | MISSING |
| 35 | `MOL-DYN-PRIMA-5W40` | MOL Prima 5W-40 | 2 | Вязкость, Допуски | Класс, Плотность, Вспышка, Застывание | DPF, API SM/CF, ACEA C3, VW 502 00/505 00/505 01, MB 229.51 |
| 36 | `MOL-HYBRID-0W16` | MOL Dynamic Gold NG 0W-16 | 2 | Вязкость, Допуски | Класс, Плотность, Вспышка, Застывание | API SP, ILSAC GF-6B |
| 37 | `MOL-DYN-STAR-VL-0W30` | MOL Dynamic Star VL 0W-30 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | Volvo VCC 95200377 |
| 38 | `MOL-ESSENCE-SL-10W40` | MOL Essence SL 10W-40 | 3 | Вязкость, Класс, Допуски | Плотность, Вспышка, Застывание | VW 501.01/505.00 |

---

## 6. Actionable Implementation Plan for Implementer Agent (M3 Task)

To achieve 100% specification completeness across all products, the Implementer agent must perform a targeted data enrichment pass in `products.json`:

1. **For Pattern A items (13 SKUs)**: Extract `Вязкость` from product title (e.g. `0W-20`, `5W-40`, `10W-40`) and add `Вязкость` and appropriate `Класс` (e.g. `API SN/CF` or `ACEA C3`) to the `specs` array.
2. **For Pattern B items (14 SKUs)**: Populate physical-chemical parameters (`Плотность при 15°C`, `Температура вспышки (по Кливленду)`, `Температура застывания`) using official MOL product data sheets.
3. **For Pattern C items (5 SKUs)**: Populate `Класс` and physical-chemical parameters.
4. **For Pattern D item (`MOL-DYN-ESS-15W40`)**: Add `Допуски` and physical-chemical parameters.
5. **For Pattern E YUKO items (4 SKUs)**: Enrich with `Класс`, `Допуски` (e.g. `API SL/CF`, `ACEA A3/B4`), and physical-chemical properties.
6. **For Pattern F item (`MOL-1006`)**: Add `Вязкость` (`0W-20`), `Класс` (`API SP`), and `Плотность при 15°C`.

---

## 7. Verification Method

To verify the audit findings independently:
```bash
node .agents/explorer_m3_1/generate_report.js
node .agents/explorer_m3_1/print_key_breakdown.js
```
Expected output: 38 PKW products evaluated, 0 complete specs (6/6 keys), 38 incomplete, 100% Rule 2 string formatting compliance for `Допуски`.

# Passenger Car Motor Oils (`motor-oils-pkw`) Localization & Description Quality Audit

## Executive Summary

- **Total products audited**: 38 items in category `motor-oils-pkw` in `products.json`.
- **Clean products**: 3 products (SKUs `MOL-HYBRID-0W16`, `MOL-DYN-STAR-VL-0W30`, `MOL-ESSENCE-SL-10W40`) have complete, professional Russian and Romanian descriptions.
- **Defective products**: 35 products require updates in Milestone 3 due to incomplete, untranslated, or pseudo-translated Romanian text, typos in Russian text, lower-case placeholders, or legacy product name references.
- **B2B Emoji Invariant**: 0 emojis found in product titles or descriptions across all 38 items (100% compliant with `AGENTS.md`).

---

## 1. Audit Scope & Methodology

- **Target File**: `c:\Users\DenCrut\Documents\radcor.md\products.json`
- **Category Filter**: `category === "motor-oils-pkw"`
- **Fields Evaluated**: `sku`, `name`, `description` (Russian), `description_ro` (Romanian).
- **Automated Verification**: Node.js AST/JSON parser script checking:
  1. Presence and non-emptiness of `description` and `description_ro`.
  2. Language purity of Romanian text (detecting Cyrillic/Russian word leaks).
  3. Grammatical accuracy and typos (e.g. `свысокими`, uncapitalized sentence starts).
  4. Consistency with product name renames from R2 (e.g., `MOL Essence`, `MOL Prima`, `Yuko Dynamic`).
  5. Emoji presence (forbidden per `AGENTS.md`) and HTML/Markdown artifacts.

---

## 2. Categorized Deficiency Findings

### Category A: 100% Untranslated Romanian Descriptions (2 Products)
The `description_ro` string is identical to the Russian `description`.
1. **SKU: MOL-1006** (`MOL Dynamic Gold HEV 0W-20`) — `description_ro`: `"моторное масло"`
2. **SKU: MOL-1038** (`MOL Dynamic Gas Eco+ 15W-40`) — `description_ro`: `"Масло высшего сорта для мобильных газовых двигателей автомобилей, работающих на газе."`

### Category B: Mixed Russian/Romanian Pseudo-Translations (33 Products)
`description_ro` contains 1–2 Romanian words (e.g. `Sintetic`, `Ulei de motor`) mixed with Russian Cyrillic sentences.
- **SKUs**: `MOL-1004`, `MOL-1005`, `MOL-1011`, `MOL-1018`, `MOL-1019`, `MOL-1022`, `MOL-1023`, `MOL-1025`, `MOL-1030`, `MOL-1031`, `MOL-1032`, `MOL-1035`, `MOL-1040`, `MOL-1043`, `MOL-1046`, `MOL-1047`, `MOL-1050`, `MOL-1052`, `MOL-1055`, `MOL-1061`, `MOL-1070`, `MOL-DYN-ESS-5W30`, `MOL-DYN-ESS-C2-5W30`, `MOL-DYN-ESS-DSL-5W40`, `MOL-DYN-ESS-5W40`, `MOL-DYN-STAR-0W20`, `MOL-DYN-ESS-DSL-10W40`, `MOL-DYN-ESS-15W40`, `YUKO-CLASSIC-15W40`, `YUKO-VEGA-10W40`, `YUKO-SYNETIC-5W30`, `YUKO-SYNETIC-5W40`, `MOL-DYN-PRIMA-5W40`.

### Category C: Typos & Lower-case Placeholders in Russian Descriptions (6 Products)
- **SKU: YUKO-VEGA-10W40**: Typo `"свысокими"` (missing space: `с высокими`).
- **SKUs: MOL-1005, MOL-1031, MOL-1046**: Uncapitalized lower-case descriptions (`"синтетическое моторное масло"`).
- **SKUs: YUKO-VEGA-10W40, YUKO-SYNETIC-5W30**: `name` field contains redundant prefix `"Моторное масло "` or pack size `(1 л)`.

### Category D: Legacy Product Names inside Description Text (4 Products)
- **SKU: MOL-DYN-ESS-5W30**: Refers to `"MOL Dynamic Essence 5W-30"` (should be `"MOL Essence 5W-30"`).
- **SKU: MOL-DYN-ESS-5W40**: Refers to `"MOL Dynamic Essence 5W-40"` (should be `"MOL Essence 5W-40"`).
- **SKU: MOL-DYN-PRIMA-5W40**: Refers to `"MOL Dynamic Prima 5W-40 DPF"` (should be `"MOL Prima 5W-40"`).
- **SKU: YUKO-CLASSIC-15W40**: Refers to `"YUKO CLASSIC 15W-40"` (should be `"Yuko Dynamic 15W-40"`).

---

## 3. Comprehensive Product Audit Table (38 Items)

| # | SKU | Product Name | RU Description Status | RO Description Status | Overall Status |
|---|---|---|---|---|---|
| 1 | MOL-1004 | MOL Dynamic Max 10W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 2 | MOL-1005 | MOL Essence C3 5W-40 | ⚠️ Uncapitalized | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 3 | MOL-1006 | MOL Dynamic Gold HEV 0W-20 | ⚠️ Generic | ❌ 100% Untranslated (RU) | Needs Update |
| 4 | MOL-1011 | MOL Dynamic Gold Longlife 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 5 | MOL-1018 | MOL Dynamic Gold Longlife 0W-20 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 6 | MOL-1019 | MOL Dynamic Star VL 0W-20 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 7 | MOL-1022 | MOL Dynamic Gold DX 0W-20 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 8 | MOL-1023 | MOL Dynamic Star PC 0W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 9 | MOL-1025 | MOL Botond 20W-50 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 10 | MOL-1030 | MOL Essence 10W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 11 | MOL-1031 | MOL Dynamic Synt RN17 5W-30 | ⚠️ Uncapitalized | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 12 | MOL-1032 | MOL Essence 15W-50 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 13 | MOL-1035 | MOL Dynamic Star PC 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 14 | MOL-1038 | MOL Dynamic Gas Eco+ 15W-40 | OK | ❌ 100% Untranslated (RU) | Needs Update |
| 15 | MOL-1040 | MOL Dynamic Synt RN 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 16 | MOL-1043 | MOL Dynamic Gold DX 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 17 | MOL-1046 | MOL Essence Longlife 5W-30 | ⚠️ Uncapitalized | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 18 | MOL-1047 | MOL Dynamic Star F 0W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 19 | MOL-1050 | MOL Dynamic Star 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 20 | MOL-1052 | MOL Dynamic Gold 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 21 | MOL-1055 | MOL MSE 15W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 22 | MOL-1061 | MOL Dynamic Gold Longlife 0W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 23 | MOL-1070 | MOL Dynamic Gold DX 5W-20 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 24 | MOL-DYN-ESS-5W30 | MOL Essence 5W-30 | ⚠️ Legacy Title | ❌ Surzhyk / Legacy Title | Needs Update |
| 25 | MOL-DYN-ESS-C2-5W30 | MOL Essence DPF 5W-30 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 26 | MOL-DYN-ESS-DSL-5W40 | MOL Essence Diesel 5W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 27 | MOL-DYN-ESS-5W40 | MOL Essence 5W-40 | ⚠️ Legacy Title | ❌ Surzhyk / Legacy Title | Needs Update |
| 28 | MOL-DYN-STAR-0W20 | MOL Dynamic Gold NG 0W-20 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 29 | MOL-DYN-ESS-DSL-10W40 | MOL Essence Diesel 10W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 30 | MOL-DYN-ESS-15W40 | MOL Essence 15W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 31 | YUKO-CLASSIC-15W40 | Yuko Dynamic 15W-40 | ⚠️ Legacy Title | ❌ Surzhyk / Legacy Title | Needs Update |
| 32 | YUKO-VEGA-10W40 | Моторное масло YUKO VEGA SYNT 10W-40 | ❌ Typo (`свысокими`) | ❌ Surzhyk / Typo | Needs Update |
| 33 | YUKO-SYNETIC-5W30 | Моторное масло YUKO Synetic 5W-30 (1 л) | ⚠️ Title artifacts | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 34 | YUKO-SYNETIC-5W40 | Yuko Synthetic 5W-40 | OK | ❌ Surzhyk / Mixed Cyrillic | Needs Update |
| 35 | MOL-DYN-PRIMA-5W40 | MOL Prima 5W-40 | ⚠️ Legacy Title | ❌ Surzhyk / Legacy Title | Needs Update |
| 36 | MOL-HYBRID-0W16 | MOL Dynamic Gold NG 0W-16 | OK | OK | ✅ Clean |
| 37 | MOL-DYN-STAR-VL-0W30 | MOL Dynamic Star VL 0W-30 | OK | OK | ✅ Clean |
| 38 | MOL-ESSENCE-SL-10W40 | MOL Essence SL 10W-40 | OK | OK | ✅ Clean |

---

## 4. Proposed Remediation Payload for M3 Implementation

Below are the exact recommended Russian & Romanian strings for all 35 defective products:

1. **MOL-1004** (`MOL Dynamic Max 10W-40`):
   - `description`: `"Полусинтетическое моторное масло высшего сорта для большинства современных транспортных средств."`
   - `description_ro`: `"Ulei de motor semisintetic de înaltă calitate pentru majoritatea vehiculelor moderne."`

2. **MOL-1005** (`MOL Essence C3 5W-40`):
   - `description`: `"Синтетическое моторное масло премиального качества для современных бензиновых и дизельных двигателей."`
   - `description_ro`: `"Ulei de motor sintetic de calitate superioară pentru motoare moderne pe benzină și diesel."`

3. **MOL-1006** (`MOL Dynamic Gold HEV 0W-20`):
   - `description`: `"Синтетическое энергосберегающее моторное масло для гибридных и высокоэффективных автомобилей."`
   - `description_ro`: `"Ulei de motor sintetic economizor de energie pentru vehicule hibride și de înaltă eficiență."`

4. **MOL-1011** (`MOL Dynamic Gold Longlife 5W-30`):
   - `description`: `"Синтетическое моторное масло высшего сорта с увеличенным интервалом замены."`
   - `description_ro`: `"Ulei de motor sintetic de calitate superioară cu interval extins de schimb."`

5. **MOL-1018** (`MOL Dynamic Gold Longlife 0W-20`):
   - `description`: `"Синтетическое моторное масло премиум-класса для самых современных автомобилей."`
   - `description_ro`: `"Ulei de motor sintetic de clasă premium pentru cele mai moderne autoturisme."`

6. **MOL-1019** (`MOL Dynamic Star VL 0W-20`):
   - `description`: `"Синтетическое моторное масло премиум-качества, специально разработанное для легковых автомобилей Volvo."`
   - `description_ro`: `"Ulei de motor sintetic de calitate premium, special conceput pentru autoturisme Volvo."`

7. **MOL-1022** (`MOL Dynamic Gold DX 0W-20`):
   - `description`: `"Синтетическое моторное масло премиум-качества для самых современных бензиновых двигателей."`
   - `description_ro`: `"Ulei de motor sintetic de calitate premium pentru cele mai moderne motoare pe benzină."`

8. **MOL-1023** (`MOL Dynamic Star PC 0W-30`):
   - `description`: `"Синтетическое моторное масло премиум-класса для автомобилей последнего поколения."`
   - `description_ro`: `"Ulei de motor sintetic de clasă premium pentru vehicule de ultimă generație."`

9. **MOL-1025** (`MOL Botond 20W-50`):
   - `description`: `"Всесезонное минеральное моторное масло для автомобилей предыдущих поколений с большим пробегом."`
   - `description_ro`: `"Ulei de motor mineral multigrad pentru vehicule din generații anterioare cu rulaj mare."`

10. **MOL-1030** (`MOL Essence 10W-40`):
    - `description`: `"Полусинтетическое моторное масло для защиты двигателя и увеличенного ресурса."`
    - `description_ro`: `"Ulei de motor semisintetic pentru protecția motorului și durată extinsă de viață."`

11. **MOL-1031** (`MOL Dynamic Synt RN17 5W-30`):
    - `description`: `"Синтетическое моторное масло со специальным допуском Renault RN17."`
    - `description_ro`: `"Ulei de motor sintetic cu aprobare specială Renault RN17."`

12. **MOL-1032** (`MOL Essence 15W-50`):
    - `description`: `"Всесезонное моторное масло высокой вязкости для увеличения срока службы двигателя."`
    - `description_ro`: `"Ulei de motor multigrad cu vâscozitate ridicată pentru prelungirea duratei de viață a motorului."`

13. **MOL-1035** (`MOL Dynamic Star PC 5W-30`):
    - `description`: `"Синтетическое моторное масло высшего сорта для автомобилей Peugeot и Citroën."`
    - `description_ro`: `"Ulei de motor sintetic de calitate superioară pentru vehicule Peugeot și Citroën."`

14. **MOL-1038** (`MOL Dynamic Gas Eco+ 15W-40`):
    - `description`: `"Моторное масло высшего сорта для автомобилей, работающих на сжиженном или природном газе."`
    - `description_ro`: `"Ulei de motor de calitate superioară pentru vehicule care funcționează pe gaz (GPL/GNC)."`

15. **MOL-1040** (`MOL Dynamic Synt RN 5W-30`):
    - `description`: `"Синтетическое энергосберегающее моторное масло для двигателей Renault и Dacia."`
    - `description_ro`: `"Ulei de motor sintetic economizor de energie pentru motoare Renault și Dacia."`

16. **MOL-1043** (`MOL Dynamic Gold DX 5W-30`):
    - `description`: `"Синтетическое моторное масло премиум-класса с допуском dexos1 Gen 2."`
    - `description_ro`: `"Ulei de motor sintetic de clasă premium cu aprobare dexos1 Gen 2."`

17. **MOL-1046** (`MOL Essence Longlife 5W-30`):
    - `description`: `"Синтетическое моторное масло для длительных интервалов замены."`
    - `description_ro`: `"Ulei de motor sintetic pentru intervale extinse de schimb."`

18. **MOL-1047** (`MOL Dynamic Star F 0W-30`):
    - `description`: `"Синтетическое премиальное моторное масло с допуском Ford WSS-M2C950-A."`
    - `description_ro`: `"Ulei de motor sintetic premium cu aprobare Ford WSS-M2C950-A."`

19. **MOL-1050** (`MOL Dynamic Star 5W-30`):
    - `description`: `"Синтетическое моторное масло высшего сорта для современных азиатских и американских автомобилей."`
    - `description_ro`: `"Ulei de motor sintetic de calitate superioară pentru vehicule moderne asiatice și americane."`

20. **MOL-1052** (`MOL Dynamic Gold 5W-30`):
    - `description`: `"Синтетическое малозольное моторное масло Low SAPS для автомобилей с DPF."`
    - `description_ro`: `"Ulei de motor sintetic Low SAPS pentru vehicule echipate cu filtru DPF."`

21. **MOL-1055** (`MOL MSE 15W-40`):
    - `description`: `"Минеральное моторное масло для легковых автомобилей предыдущих поколений."`
    - `description_ro`: `"Ulei de motor mineral pentru autoturisme din generații anterioare."`

22. **MOL-1061** (`MOL Dynamic Gold Longlife 0W-30`):
    - `description`: `"Синтетическое премиальное моторное масло с допуском VW 504.00/507.00."`
    - `description_ro`: `"Ulei de motor sintetic premium cu aprobare VW 504.00/507.00."`

23. **MOL-1070** (`MOL Dynamic Gold DX 5W-20`):
    - `description`: `"Синтетическое энергосберегающее моторное масло премиум-качества."`
    - `description_ro`: `"Ulei de motor sintetic economizor de energie de calitate premium."`

24. **MOL-DYN-ESS-5W30** (`MOL Essence 5W-30`):
    - `description`: `"Высокотехнологичное синтетическое масло MOL Essence 5W-30 для бензиновых и дизельных моторов."`
    - `description_ro`: `"Ulei sintetic de înaltă tehnologie MOL Essence 5W-30 pentru motoare pe benzină și diesel."`

25. **MOL-DYN-ESS-C2-5W30** (`MOL Essence DPF 5W-30`):
    - `description`: `"Синтетическое ресурсосберегающее масло для двигателей с требованиями ACEA C2."`
    - `description_ro`: `"Ulei sintetic economizor de resurse pentru motoare cu cerințe ACEA C2."`

26. **MOL-DYN-ESS-DSL-5W40** (`MOL Essence Diesel 5W-40`):
    - `description`: `"Синтетическое дизельное моторное масло повышенной надежности."`
    - `description_ro`: `"Ulei de motor sintetic pentru motoare diesel cu fiabilitate sporită."`

27. **MOL-DYN-ESS-5W40** (`MOL Essence 5W-40`):
    - `description`: `"Синтетическое моторное масло MOL Essence 5W-40 для бензиновых и дизельных двигателей легковых автомобилей."`
    - `description_ro`: `"Ulei de motor sintetic MOL Essence 5W-40 pentru motoare pe benzină și diesel ale autoturismelor."`

28. **MOL-DYN-STAR-0W20** (`MOL Dynamic Gold NG 0W-20`):
    - `description`: `"Сверхлегкое синтетическое масло с официальным допуском Ford EcoBoost."`
    - `description_ro`: `"Ulei sintetic ultra-ușor cu aprobare oficială Ford EcoBoost."`

29. **MOL-DYN-ESS-DSL-10W40** (`MOL Essence Diesel 10W-40`):
    - `description`: `"Полусинтетическое моторное масло для дизельных двигателей."`
    - `description_ro`: `"Ulei de motor semisintetic pentru motoare diesel."`

30. **MOL-DYN-ESS-15W40** (`MOL Essence 15W-40`):
    - `description`: `"Надежное минеральное масло для регулярного технического обслуживания."`
    - `description_ro`: `"Ulei mineral fiabil pentru întreținerea tehnică regulată."`

31. **YUKO-CLASSIC-15W40** (`Yuko Dynamic 15W-40`):
    - `description`: `"Минеральное моторное масло Yuko Dynamic 15W-40 для бензиновых и дизельных двигателей автомобилей."`
    - `description_ro`: `"Ulei de motor mineral Yuko Dynamic 15W-40 pentru motoare pe benzină și diesel ale autoturismelor."`

32. **YUKO-VEGA-10W40** (`YUKO VEGA SYNT 10W-40`):
    - `name`: `"YUKO VEGA SYNT 10W-40"`
    - `description`: `"Полусинтетическое моторное масло YUKO VEGA SYNT 10W-40 с высокими защитными и моющими свойствами."`
    - `description_ro`: `"Ulei de motor semisintetic YUKO VEGA SYNT 10W-40 cu proprietăți înalte de protecție și spălare."`

33. **YUKO-SYNETIC-5W30** (`YUKO Synetic 5W-30`):
    - `name`: `"YUKO Synetic 5W-30"`
    - `description`: `"Современное синтетическое моторное масло YUKO Synetic 5W-30 для легкого запуска и экономии топлива."`
    - `description_ro`: `"Ulei de motor sintetic modern YUKO Synetic 5W-30 pentru pornire ușoară și economie de combustibil."`

34. **YUKO-SYNETIC-5W40** (`Yuko Synthetic 5W-40`):
    - `description`: `"Синтетическое моторное масло YUKO Synthetic 5W-40 для максимальной защиты двигателя в широком диапазоне температур."`
    - `description_ro`: `"Ulei de motor sintetic YUKO Synthetic 5W-40 pentru protecția maximă a motorului într-un domeniu larg de temperaturi."`

35. **MOL-DYN-PRIMA-5W40** (`MOL Prima 5W-40`):
    - `description`: `"Синтетическое малозольное масло MOL Prima 5W-40 DPF для современных авто с фильтром сажи."`
    - `description_ro`: `"Ulei sintetic Low SAPS MOL Prima 5W-40 DPF pentru vehicule moderne cu filtru de particule."`

---

## 5. Verification Method

- **Inspection Command**: `node c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_m3_2\deep_audit_pkw.js`
- **Invalidation Condition**: Any Cyrillic words remaining in `description_ro`, uncapitalized Russian descriptions, or legacy title strings inside descriptions.

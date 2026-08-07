## 2026-08-06T19:15:03Z
You are a Worker subagent for Milestone 3 (Specs, OEM Approvals & Localization).
Working directory: c:\Users\DenCrut\Documents\radcor.md\.agents\worker_m3

MANDATORY READ:
- Read ORIGINAL_REQUEST: c:\Users\DenCrut\Documents\radcor.md\.agents\ORIGINAL_REQUEST.md
- Read B2B Rules: c:\Users\DenCrut\Documents\radcor.md\AGENTS.md
- Read PROJECT.md: c:\Users\DenCrut\Documents\radcor.md\PROJECT.md
- Read audit data: c:\Users\DenCrut\Documents\radcor.md\.agents\explorer_m3_1\audit_data.json
- Target file to update: c:\Users\DenCrut\Documents\radcor.md\products.json

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK:
1. Update `products.json` so that all products in category `motor-oils-pkw` (and all MOL & YUKO passenger motor oils) have complete, authentic data for:
   - `description` (Russian text, no emojis, professional B2B tone)
   - `description_ro` (Romanian text, non-empty, authentic translation, no emojis)
   - `specs` array containing exact labels:
     - "Вязкость" (Viscosity, e.g. "5W-30", "0W-20", "10W-40")
     - "Класс" (API / ACEA performance class)
     - "Допуски" (Raw OEM approvals string. STRICT COMPLIANCE: 100% preservation of original OEM approval strings. DO NOT split, trim, parse, or alter strings like "VW 504.00/507.00", "MB 229.51, BMW Longlife-04")
     - "Плотность при 15°C" (Density at 15°C, e.g. "0,854")
     - "Температура вспышки (по Кливленду)" (Flash point in °C, e.g. "230")
     - "Температура застывания" (Pour point in °C, e.g. "-39")
2. Ensure every single product in `motor-oils-pkw` has populated `description`, `description_ro`, "Вязкость", "Класс", "Допуски", "Плотность при 15°C", "Температура вспышки (по Кливленду)", and "Температура застывания".
3. Check for 0 emojis in all updated fields.
4. Validate that `products.json` remains perfectly formatted valid JSON.
5. Write your handoff report to `c:\Users\DenCrut\Documents\radcor.md\.agents\worker_m3\handoff.md`.
6. Send completion message back to parent orchestrator.

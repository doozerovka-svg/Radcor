# Implementation Plan - Radcor-prim Motor Oils Catalog Update

## Strategy & Topology
As DISPATCH-ONLY Project Orchestrator, I will follow the Project Pattern:
1. **Phase 0: Survey** - Spawn 3 parallel Explorers to analyze `products.json`, `app.js`, HTML files, and current schema against `ORIGINAL_REQUEST.md` and `AGENTS.md`.
2. **Decompose into PROJECT.md** - Build global Feature Inventory (R1, R2, R3, Acceptance Criteria) and define 4 sequential/parallel Milestones.
3. **Milestone Execution Loop** - For each milestone:
   - Explorer (recommends fix strategy)
   - Worker (implements changes & runs verification)
   - 2 Reviewers (objective code & requirements review)
   - 2 Challengers (adversarial/empirical verification)
   - Forensic Auditor (`teamwork_preview_auditor` - binary veto on integrity)
   - Gate Verdict (`GATE_STATUS.md`)
4. **Final Verification & Handoff** - Ensure all acceptance criteria pass cleanly and notify Sentinel.

## Milestones Overview
- **M1**: R1 Cleanup & Categorization (Remove discontinued/absent products & duplicates, re-categorize `MOL Arol 2T` to `moto-oils`).
- **M2**: R2 Product Renaming, New Items & Pack Labels (Rename titles, add `MOL Dynamic Star VL 0W-30` & `MOL Essence SL 10W-40`, update volumes/labels with BiB and IBC Eurocube 991L support).
- **M3**: R3 Data Enrichment (RU/RO descriptions, OEM approvals, physical-chemical specs for all active 33 PKW oils).
- **M4**: Acceptance Criteria & Asset Versioning (Bump assets to `?v=38.0`, check JS errors, zero emojis, confirm 33 active PKW products).

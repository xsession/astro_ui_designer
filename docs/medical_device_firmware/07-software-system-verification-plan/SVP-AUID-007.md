# Software System Verification Plan (SVP)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SVP-007 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.6 |
| **Safety Class** | Class A |

---

## 1. Introduction
System verification verifies the assembled software against every
requirement in AUID-SRS-002 (black-box). System verification case IDs:
SVC-<NNN>. Method: Test (T), Demonstration (D), Inspection (I), Analysis
(A). Traceability: AUID-RTM-011.

## 2. Verification Environment
- Node.js v22.20.0, Chrome/Chromium current stable.
- Launch: `node launch-designer.mjs` (http://127.0.0.1:8766).
- Regression harness: `npm test` (29 suites).
- Reference fixtures: examples/generated-astro (golden export), tests/
  fixtures (self-contained round-trip projects).

## 3. System Verification Cases
Each requirement in AUID-SRS-002 maps to at least one case:

| SVC | Requirement(s) | Case | Method | Pass criterion |
|-----|----------------|------|--------|----------------|
| SVC-001 | REQ-FUNC-001 | Load app; inspect artboard | T | 41 component types render; DOM structure matches registry |
| SVC-002 | REQ-FUNC-002 | Page create/duplicate/delete via UI + API | T | pages list consistent; current page safe on delete |
| SVC-003 | REQ-FUNC-003 | Drag/resize/rotate synthetic pointer events on freeform child | T | geometry changes live; snap lines; commit on release |
| SVC-004 | REQ-FUNC-004 | Multi-select + group move/resize | T | selection box correct; group transform consistent |
| SVC-005 | REQ-FUNC-005/006 | Import 11 fixture projects; detection | T | correct backend per fixture; override honored |
| SVC-006 | REQ-FUNC-007 | pwtk + qml multi-file import | T | neutral doc complete (blocks, timers, QML ids) |
| SVC-007 | REQ-FUNC-008 | Edit + patch plan review + apply | T | anchored patch applied; reviewable pre-apply |
| SVC-008 | REQ-FUNC-009 | Simulation twice with same seed | T | byte-identical state snapshots |
| SVC-009 | REQ-FUNC-010 | MCP tools over stdio | T | read/edit/export tools succeed |
| SVC-010 | REQ-FUNC-011 | Draw.io export/import cycle | T | structure preserved |
| SVC-011 | REQ-FUNC-012 | 41 dock tabs; move/float/reset | T | all tabs functional; layout persists/resets |
| SVC-012 | REQ-FUNC-013/014/015 | Workbenches, hotkeys, animation/lab | T | each workbench stateful; hotkey capture persists; story test runs |
| SVC-013 | REQ-FUNC-016 | npm run generate:example; exportAstro() | T | golden Astro project tree produced |
| SVC-014 | REQ-FUNC-017 | Plugin contribution | T | contribution visible in UI + registry |
| SVC-015 | REQ-SAFE-001 | Unmodified round-trip, all 11 backends | T | byte-identical output |
| SVC-016 | REQ-SAFE-002 | Patch with 0/2+ anchor occurrences | T | reported unapplicable; no edit |
| SVC-017 | REQ-SAFE-003 | Deterministic export | T | identical inputs -> byte-identical output |
| SVC-018 | REQ-SAFE-004 | Import contains executable code | T+I | import succeeds without executing imported code |
| SVC-019 | REQ-SAFE-005 | 90 mutations; undo 90 | T | no data loss; history capped 80 |
| SVC-020 | REQ-SAFE-006 | Workspace API traversal attempt | T | rejected; loopback binding confirmed |
| SVC-021 | REQ-PERF-001 | Shell load timing | D | interactive artboard within 3 s on reference workstation |
| SVC-022 | REQ-PERF-002 | 500-node page re-render | D | within 500 ms |
| SVC-023 | REQ-PERF-003 | Full suite timing | D | within 10 min |
| SVC-024 | REQ-PERF-004 | Drag frame timing | D | per-frame DOM update within 16 ms target |
| SVC-025 | REQ-INTF-001 | Standalone launch | T+I | serves on 127.0.0.1:8766; PORT override honored |
| SVC-026 | REQ-INTF-002 | Mirror cmp loop | T | byte-identical mirrors |
| SVC-027 | REQ-INTF-003 | Public API surface | T | every listed method callable with correct behavior |
| SVC-028 | REQ-INTF-004 | MCP server | T | MCP handshake + tool round-trip |
| SVC-029 | REQ-INTF-005 | Workspace API read/write | T | scoped to project root |
| SVC-030 | REQ-INTG-001 | Shell startup console cleanliness | T | zero console errors (CDP exception log empty) |
| SVC-031 | REQ-INTG-003 | VS Code .vsix packaging | T | embedded designer files byte-identical |
| SVC-032 | REQ-INTG-004 | Run core without optional parsers | T | core design surface functional |
| SVC-033 | REQ-CMPL-001/002 | Release manifest + changelog | I | SHA256SUMS.txt matches build; VERSION = package.json = extension version; CHANGELOG entry present |
| SVC-034 | REQ-CMPL-003/004 | Process + traceability | I | SDP followed; RTM complete, no TBD |
| SVC-035 | REQ-NFR-001..005 | Platform, persistence, autosave, locale, offline | T+I | save/load lossless; recovery checkpoint works; no network required for core |

## 4. Exit Criteria
All SVC cases pass; every SRS requirement traced to a passing case in
AUID-RTM-011.

## 5. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |

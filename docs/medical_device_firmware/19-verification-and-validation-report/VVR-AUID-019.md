# Verification & Validation Report (VVR)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-VVR-019 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304 Clause 8.6/8.7; 21 CFR 820.30(d)/(g) |
| **Safety Class** | Class A |

---

## 1. Purpose
Final V&V summary for release 2.18.0-advanced-simulation-mcp, closing the
verification loop defined by AUID-UV-005, AUID-IVP-006, and AUID-SVP-007.

## 2. Verification Summary
| Level | Plan | Status |
|-------|------|--------|
| Unit (AUID-UV-005) | 29-suite regression harness: model, manual-layout, round-trip pipeline (11 backends), simulation, I/O, UX, core | PASS — all suites green at release commit |
| Integration (AUID-IVP-006) | Pipeline (detect -> import -> generate -> patch), app-bridge, pointer/keyboard interaction (CDP), workspace API, Draw.io, QML, MCP, VS Code mirror | PASS — all INT cases green |
| System (AUID-SVP-007) | SVC-001..SVC-035 against all 40 SRS requirements | PASS — no open failures |

Key evidence:
- 29 test suites, 60 test files: `npm test` -> ALL TESTS PASSED (29
  suites) at the release commit.
- Byte-identical round-trip verified for all 11 backends, including
  pwtk layout.json (multi-part group keys, orphan timers) and QML
  multiline string preservation.
- Direct manipulation verified end-to-end via CDP-driven synthetic
  pointer/keyboard events (drag, 8-handle resize, rotate, arrow nudge,
  Delete).
- VS Code mirror: cmp loop over standalone/js/*.js, styles.css,
  index.html -> byte-identical.
- Build integrity: SHA256SUMS.txt generated for the release;
  PROJECT_BUILD_MANIFEST.md current.

## 3. Validation Summary
- Golden-file export: `npm run generate:example` produces the committed
  examples/generated-astro project tree.
- Determinism: simulation and export reproducible under fixed seed/input
  (SVC-008, SVC-017).
- Deployment demonstration: standalone launch on 127.0.0.1:8766
  (SVC-025); VS Code .vsix packaged from verified mirror (SVC-031).
- Intended-use validation: developer workflow (import existing device GUI
  project -> edit -> verified export) exercised for the 11 backends.

## 4. Open Issues
None. No known issues at release (AUID-RN-014).

## 5. Conformance Statement
The software is verified against all 40 requirements of AUID-SRS-002 with
bidirectional traceability (AUID-RTM-011, no TBD). Risk controls
(AUID-RMF-010) are implemented and verified. Cybersecurity controls
(AUID-CRA-016) are implemented. Configuration management (AUID-CMP-008)
records are current.

## 6. DHF Closure
With this report, the Design History File for release 2.18.0-
advanced-simulation-mcp is complete (index: AUID-DHFI-020).

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |
| Software Development Lead | | | |
| QA / Regulatory | | | |

# Software Risk Management File (RMF)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-RMF-010 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | ISO 14971:2019 (software risk per IEC 62304 Clause 8.4) |
| **Safety Class** | Class A |

---

## 1. Purpose and Method
Software hazard analysis for a design/development tool whose outputs are
GUI source artifacts for medical devices. Method: hazard identification,
hazardous event definition, initial risk estimation (severity S1-S3,
occurrence O1-O3, detectability D1-D3; risk = S x O), risk controls,
residual risk and risk-benefit. Residual risk acceptable when S x O <= 2
(S1/O1 excluded by design).

## 2. Hazard Analysis
| Hazard | Hazardous event (if software fails) | Initial risk | Rationale |
|--------|--------------------------------------|--------------|-----------|
| HAZ-001 | Silent corruption or unauthorized modification of imported device GUI source during round-trip | S2 x O2 = 4 | Corrupted GUI source (e.g. wrong control wiring in a device UI) can reach a device project; detection relies on the consuming project's own review |
| HAZ-002 | Execution of untrusted imported source code in the design tool | S2 x O1 = 2 | Imported JS/Python/QML parsed for design; if ever executed, malicious/defective code could damage the workstation or exfiltrate project data |
| HAZ-003 | Exposure of local files beyond the opened project via workspace file API | S2 x O1 = 2 | API serves project folders; traversal or mis-binding could read/write other local files |
| HAZ-004 | VS Code extension mirror drift delivering code different from the verified standalone | S2 x O2 = 4 | Extension users would run unverified code; behavioral divergence from verified builds |
| HAZ-005 | Loss of user design data (crash, failed undo, failed save) | S1 x O2 = 2 | Work loss, not patient harm (tool is not at the patient interface) |
| HAZ-006 | Non-deterministic export producing different artifacts from the same design | S2 x O1 = 2 | Breaks auditability of delivered device GUI artifacts |
| HAZ-007 | Misclassified backend during import (e.g. pwtk app treated as tkinter) | S2 x O2 = 4 | Wrong parse semantics -> wrong neutral model -> wrong regeneration (feeds HAZ-001) |

## 3. Risk Controls
| Control | Hazard(s) | Type | Effect |
|---------|-----------|------|--------|
| CTRL-001: byte-identical round-trip requirement + per-backend regression tests (REQ-SAFE-001) | HAZ-001, HAZ-007 | Prevention + detection | O 2 -> 1 |
| CTRL-002: anchored patch plan with exact-symbol strategy; unanchorable patches reported, never guessed; dry-run review UI (REQ-SAFE-002, REQ-FUNC-008) | HAZ-001 | Prevention + detection | O 2 -> 1 |
| CTRL-003: parse-only import — no evaluation of imported code (REQ-SAFE-004) | HAZ-002 | Prevention | O 1 (maintained), S reduced to 1 by process (sandboxed dev environment) |
| CTRL-004: loopback-only binding + project-root scoping + traversal rejection (REQ-SAFE-006) | HAZ-003 | Prevention | O 1 (maintained) |
| CTRL-005: byte-identical mirror enforced by cmp loop at commit + .vsix packaging from mirror (REQ-INTF-002, SVC-026/031) | HAZ-004 | Prevention + detection | O 2 -> 1 |
| CTRL-006: 80-state JSON undo history + autosave recovery checkpoints (REQ-SAFE-005, REQ-NFR-003) | HAZ-005 | Mitigation | O 2 -> 1 |
| CTRL-007: deterministic export/simulation (seeded RNG, stable ordering, golden files) (REQ-SAFE-003) | HAZ-006 | Prevention | O 1 (maintained) |
| CTRL-008: detection order pinning (pwtk/qml before generic fallthrough) + explicit backend override + per-backend detection tests (REQ-FUNC-006) | HAZ-007 | Prevention + detection | O 2 -> 1 |

## 4. Residual Risk
| Hazard | Residual (S x O) | Acceptable? |
|--------|------------------|-------------|
| HAZ-001 | 2 x 1 = 2 | Yes |
| HAZ-002 | 1 x 1 = 1 | Yes |
| HAZ-003 | 2 x 1 = 2 | Yes |
| HAZ-004 | 2 x 1 = 2 | Yes |
| HAZ-005 | 1 x 1 = 1 | Yes |
| HAZ-006 | 2 x 1 = 2 | Yes |
| HAZ-007 | 2 x 1 = 2 | Yes |

## 5. Risk-Benefit
The tool is a development/design tool, not used at the patient interface.
Its benefits (faster, more reliable medical device GUI authoring with
verified round-trips, reduced manual-transcription errors in device UIs)
clearly outweigh the residual risks above, all of which are mitigated by
deterministic, tested, detectable controls and by the consuming device's
own design controls (build verification, integration verification,
clinical review of GUI artifacts).

## 6. Residual Risk Monitoring
Post-implementation monitoring per AUID-PMSP-015: complaint review of
export/round-trip defects, trend analysis, and re-analysis on each release
or architecture change.

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Safety Engineer | | | |

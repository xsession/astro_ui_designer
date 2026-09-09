# Software Summary Description (SSD) — FDA 510(k)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SSD-012 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | FDA Guidance: "Premarket Submissions for Content for Device Software Functions" (Oct 2023); IEC 62304:2006+A1:2015 |

---

## 1. Software Description

### 1.1 Intended Use
Astro UI Designer Pro is a desktop visual IDE for designing, editing,
simulating, and exporting the graphical user interfaces of medical device
software. A developer uses it to (a) build device GUIs visually (41
component types, manual layout, animation, multi-selection), (b) import
existing device GUI source projects (Astro, React, Vue, Svelte, vanilla
JS/TS, Tkinter, NiceGUI, LVGL, pwtk, Qt/QML) and edit them with verified
source round-trips, (c) simulate page behavior deterministically, and
(d) drive it from AI agents via MCP. The tool is used to produce GUI
artifacts for medical devices; it is not used at the patient interface and
does not handle patient data.

### 1.2 Software Type
- Software in a Medical Device (SiMD) in the design sense: used to produce
  the user interface of a medical device (FDA 2023 software guidance).
- Not SaMD for patient care: no independent patient-facing function.
- Development/design tool per IEC 62304 Clause 6: verified per AUID-VVR-019;
  the consuming device project applies its own design controls to the
  generated artifacts.

### 1.3 Software Functions
| Function | Description | Safety classification |
|----------|-------------|-----------------------|
| Visual GUI design | Artboard rendering, direct manipulation (drag/resize/rotate/multi-select), 41 component types | Class A |
| Framework round-trip | Import + verified source generation for 11 backends with anchored, reviewed patches | Class A (artifact-integrity critical) |
| Deterministic simulation | Seeded, reproducible page/project simulation | Class A |
| Project management | Multi-page entities, components/stories, save/load | Class A |
| MCP integration | Semantic tools for AI-agent editing | Class A |
| Interchange | Draw.io XML import/export, VS Code extension | Class A |

## 2. Software Development Process
Developed under IEC 62304:2006+A1:2015 for software safety Class A
(design tool), documented in AUID-SDP-001. The full 20-document DHF set is
maintained (AUID-DHFI-020) including detailed design and unit verification
beyond the Class A minimum for auditability of the round-trip/export
functions. Risk management per ISO 14971:2019 (AUID-RMF-010). Verification:
29-suite regression harness (AUID-UV-005, AUID-IVP-006, AUID-SVP-007).
Configuration management per AUID-CMP-008 (Git, semantic versions,
SHA-256 build manifest).

## 3. Reused Software
No software is reused from other products. All functionality is developed
for this tool.

## 4. SOUP Components
| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | v22.20.0 (LTS) | Runtime: launcher, workspace API, test harness, MCP server |
| Chrome / Chromium (Blink) | current stable | Rendering engine for the IDE shell |
| Git | 2.x | Configuration management |
| @astrojs/compiler-rs (optional) | latest at build time | Astro source analysis on demand |
| @vue/compiler-sfc, @vue/compiler-dom (optional) | latest at build time | Vue SFC parsing on demand |
| svelte (optional) | latest at build time | Svelte source analysis on demand |
| typescript (optional) | latest at build time | TS source analysis on demand |
| tree-sitter, tree-sitter-c (optional) | latest at build time | Generic/C source parsing on demand |

No runtime npm dependencies; the optional packages may be absent and the
core design/export/round-trip surface remains functional (REQ-INTG-004).

## 5. Risk Management
Per ISO 14971:2019 (AUID-RMF-010): 7 hazards identified (source corruption,
untrusted-code execution, file exposure, mirror drift, data loss,
nondeterministic export, backend misclassification), all controlled to
acceptable residual risk by deterministic, tested, detectable controls
(byte-identical round-trip tests, anchored patch strategy, parse-only
import, loopback-scoped file API, mirror cmp enforcement, undo/recovery,
deterministic export, pinned detection order). Risk-benefit: acceptable —
the tool is not used at the patient interface and its outputs remain under
the consuming device's design controls.

## 6. Validation Approach
- Verification: unit (per software item), integration (pipeline +
  interfaces), system (35 cases against all 40 requirements; bidirectional
  traceability AUID-RTM-011).
- Artifact-integrity validation: unmodified round-trip byte-identical for
  all 11 backends, including multi-file pwtk (layout.json) and QML
  (multiline string preservation) projects; golden-file export comparison.
- UI validation: CDP-driven browser tests (synthetic pointer/keyboard
  events) verifying drag/resize/rotate/nudge, dock behavior, and
  workbenches.
- Final V&V summary: AUID-VVR-019.

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |
| Safety Engineer | | | |
| Regulatory Affairs | | | |

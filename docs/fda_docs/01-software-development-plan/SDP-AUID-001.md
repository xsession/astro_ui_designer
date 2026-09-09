# Software Development Plan (SDP)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SDP-001 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 5 & 7, FDA 21 CFR Part 820 (QMSR) |
| **Safety Class** | IEC 62304 Class A (design/development tool software) |

---

## 1. Purpose and Scope

This Software Development Plan (SDP) defines the process, roles, responsibilities,
and technical approach for developing, verifying, and maintaining Astro UI Designer Pro
(v2.18.0-advanced-simulation-mcp and successor versions). The software is a desktop visual IDE for
designing, editing, simulating, and exporting the graphical user interfaces
(GUIs) of medical device software and systems (SiMD GUI authoring).

**Software type (FDA 2023 Premarket Software Guidance):**
- Software in a Medical Device (SiMD) in the sense that it is used to produce
  the user interface of a medical device.
- The tool itself does not operate at the patient interface. Generated
  artifacts (Astro HTML/CSS, Qt/QML, React/Vue/Svelte, vanilla JS/TS,
  Tkinter, NiceGUI, LVGL, pwtk block apps) are the software artifacts that
  may be embedded in a medical device. The tool's outputs are therefore
  subject to the design controls of the consuming device project; this tool
  is verified as a **development/design tool** per IEC 62304 Clause 6 and
  documented here as an IEC 62304 Class A software item with tool-verification
  evidence.

**Safety class determination (IEC 62304 Clause 5.4):**
- A software failure of this tool cannot directly cause death or serious
  injury.
- The most severe realistic consequence is delivery of a defective GUI
  artifact to a device project, which is prevented by the consuming device's
  own design controls (build verification, integration verification, clinical
  review).
- Therefore the highest software safety class is **Class A** (no potential
  for harmful outcome), and the minimum IEC 62304 artifacts for Class A
  apply, plus the extended documentation set maintained for FDA 510(k)
  premarket submission of the consuming device's GUI design process.

## 2. Software Development Plan

### 2.1 Software development process
The process follows IEC 62304 Clause 8 adapted to Class A:
1. Software requirements (AUID-SRS-002) with unique IDs, verification method, rationale.
2. Software architecture (AUID-SAD-003) decomposing the application into software items.
3. Software detailed design (AUID-SDD-004) per software item (maintained beyond the Class A minimum for auditability of export/round-trip functions).
4. Unit verification (AUID-UV-005) per software item (maintained beyond the Class A minimum).
5. Integration verification (AUID-IVP-006).
6. System verification (AUID-SVP-007) against all SRS requirements.
7. Problem resolution (AUID-PR-009).
8. Configuration management (AUID-CMP-008).
9. Post-implementation activities (AUID-PMSP-015).

### 2.2 Toolchain
| Item | Version | Purpose |
|------|---------|---------|
| Node.js | v22.20.0 (LTS) | Runtime for launcher, workspace API, test harness, MCP server |
| Chrome (Blink) | current stable (Chromium-based) | Rendering engine for the standalone IDE shell |
| Git | 2.x | Configuration management |
| npm | 10.x (bundled with Node.js) | Script runner (`npm start`, `npm test`) |

No runtime npm production dependencies exist: `package.json` declares only
`optionalDependencies` (Astro/Vue/Svelte/TypeScript/tree-sitter compiler
packages) that are loaded on demand for source-analysis features; a full
function matrix operates with none of them installed.

### 2.3 Software items
Decomposition per AUID-SAD-003. Software item IDs SI-001 .. SI-011.

## 3. Technical Approach

### 3.1 Architecture overview
Single-page application (SPA) in ES modules, no build step, no transpile:
- Shell: `standalone/index.html` + `standalone/styles.css`.
- App module: `standalone/js/app.js` (state, rendering, interaction glue).
- Feature modules: 32 ES modules in `standalone/js/` (model, round-trip
  engine, simulation, manual layout, workbenches, MCP bridge, Draw.io I/O).
- Host: `launch-designer.mjs` — Node.js static file server + workspace file
  API at 127.0.0.1:8766 (loopback only).
- Distribution: standalone directory; VS Code extension reuses the same
  shell via a byte-identical mirror at `vscode-extension/designer/`
  (verified by `cmp` loop in the test suite and at commit time).

### 3.2 Key technical characteristics
- Deterministic neutral IR for framework round-trips (AUID-SAD-003 §5):
  import (source files → neutral nodes) → edit in designer → generate
  (neutral nodes → source files) → anchored patch with explicit strategy
  (`exact-symbol`) and dry-run review.
- Round-trip integrity: generated output for unmodified projects must be
  byte-identical (regression-tested per backend).
- Simulation: deterministic page/project simulation with a seeded RNG for
  reproducible previews.
- MCP integration: semantic tool server (`integrations/hermes/mcp/server.mjs`)
  exposing project state and edit operations over the Model Context Protocol.
- 11 round-trip backends: astro, react, vue, svelte, vanilla-js, vanilla-ts,
  tkinter, nicegui, lvgl, pwtk, qml.
- 29 test suites (60 `*.test.mjs` files) executed by `npm test`.

### 3.3 Verification technology
- Node.js `node:assert`-based unit/integration suites (29 suites).
- Chrome DevTools Protocol (CDP) browser harness for UI integration tests.
- Cross-document and cross-file consistency checks (mirror `cmp` loop,
  overlap geometry gate for diagrams).

## 4. Organizational Approach

### 4.1 Roles and responsibilities
| Role | Responsibility |
|------|----------------|
| Software Development Lead | SDP owner, release approval, architecture decisions |
| Safety Engineer | Risk management (AUID-RMF-010), safety class justification |
| QA / Regulatory | DHF completeness, DHFI maintenance (AUID-DHFI-020) |
| Software Developer | Requirements realization, unit verification |
| Test Lead | Verification plans execution (UV/IV/SV), VVR authoring |

### 4.2 Project schedule
Phases: Requirements (complete) → Architecture (complete) → Implementation
(iterative per release) → Verification (per release) → Post-implementation
(ongoing). Version-controlled changelog (CHANGELOG.md) records each phase
milestone.

## 5. Project Management Approach

### 5.1 Configuration management
Per AUID-CMP-008: Git repository `astro_ui_designer`, branch `main`,
semantic version tags, per-release manifest (PROJECT_BUILD_MANIFEST.md),
SHA-256 integrity records (SHA256SUMS.txt).

### 5.2 Problem resolution
Per AUID-PR-009: issue tracker entries carry requirement traceability;
defects affecting export/round-trip integrity are regression-tested before
closure.

### 5.3 Post-implementation
Per AUID-PMSP-015: complaint review, trend analysis, PSUR support,
vulnerability monitoring (AUID-CRA-016).

## 6. References
- AUID-SRS-002, AUID-SAD-003, AUID-SDD-004, AUID-UV-005, AUID-IVP-006,
  AUID-SVP-007, AUID-CMP-008, AUID-PR-009, AUID-RMF-010, AUID-RTM-011,
  AUID-SSD-012, AUID-SSD2-013, AUID-RN-014, AUID-PMSP-015, AUID-CRA-016,
  AUID-HSI-017, AUID-FUP-018, AUID-VVR-019, AUID-DHFI-020.

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |
| Safety Engineer | | | |
| QA / Regulatory | | | |

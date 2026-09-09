# Software Requirements Specification (SRS)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SRS-002 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.1 |
| **Safety Class** | Class A |

---

## 1. Introduction

This SRS specifies all software requirements for Astro UI Designer Pro v2.18.0-advanced-simulation-mcp. Each requirement
carries a unique ID (REQ-<CAT>-<NNN>), description with verifiable pass/fail
criterion, safety class, verification method, and rationale. Categories:
FUNC (functional), SAFE (safety/integrity of exported artifacts), PERF
(performance), INTF (interface), INTG (integration), CMPL (compliance),
NFR (non-functional).

## 2. Intended Use (basis for requirements)

The user is a developer/engineer designing and maintaining GUIs for medical
device software. The tool: (a) models pages/projects as a design tree;
(b) renders them on an artboard with direct manipulation (drag, resize,
rotate, multi-select, snap); (c) imports existing source projects
(Astro, React, Vue, Svelte, vanilla JS/TS, Tkinter, NiceGUI, LVGL, pwtk,
Qt/QML) into the design model; (d) exports back to source with round-trip
integrity; (e) simulates page behavior deterministically; (f) exposes the
project to AI agents via MCP.

## 3. Functional Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-FUNC-001 | The IDE shall present a design canvas (artboard) that renders the active page's component tree with correct DOM structure per the component registry (41 component types). | A | Test (tab-functionality, simulation-ui) | Core intended use |
| REQ-FUNC-002 | The IDE shall support creating, duplicating, and deleting pages via page entities with unique routes, filenames, and names. | A | Test (page-entities) | Multi-page projects |
| REQ-FUNC-003 | The IDE shall support direct manipulation: pointer drag to move, 8-handle resize, rotate handle, with grid/sibling/parent-border snapping and live geometry tooltip. | A | Test (manual-canvas-interaction) | Core editing capability |
| REQ-FUNC-004 | The IDE shall support multi-selection with bounding-box selection, group move, and aligned resizing (Penpot-cleanroom module). | A | Test (advanced-manual-edit) | Advanced editing |
| REQ-FUNC-005 | The IDE shall provide 11 round-trip backends: astro, react, vue, svelte, vanilla-js, vanilla-ts, tkinter, nicegui, lvgl, pwtk, qml, selectable in the round-trip workbench. | A | Test (roundtrip-engine, per-backend suites) | Intended use: existing-project editing |
| REQ-FUNC-006 | The IDE shall detect the backend of an imported project by extension and content sniffing, with explicit override capability. | A | Test (roundtrip-conversion) | Correct import behavior |
| REQ-FUNC-007 | The IDE shall import multi-file projects (e.g. pwtk: main.py + layout.json + web/index.html; QML: local .qml component graph) into the neutral design model. | A | Test (roundtrip-pwtk, roundtrip-qml, workspace-roundtrip-files) | Multi-file backends |
| REQ-FUNC-008 | The IDE shall export design changes back to source files with anchored edits (strategy `exact-symbol`) and a reviewable patch plan before application. | A | Test (roundtrip-engine patcher suites) | SAFE class rationale: no silent corruption |
| REQ-FUNC-009 | The IDE shall provide deterministic simulation of a page/project: seeded RNG, stable ordering, reproducible screenshots/state between runs with the same seed. | A | Test (simulation, simulation-ui) | Validation of dynamic behavior |
| REQ-FUNC-010 | The IDE shall expose semantic MCP tools (project state, selection, edit operations, export) over stdio per the Model Context Protocol. | A | Test (hermes-mcp) | AI-agent integration |
| REQ-FUNC-011 | The IDE shall export architecture diagrams to Draw.io XML and import Draw.io XML back (drawio-io). | A | Test (drawio-io, drawio-app-integration) | Documentation support |
| REQ-FUNC-012 | The IDE shall provide relocatable dockable panels (41 dock tabs) with persistent layout and reset. | A | Test (dock-layout, dock-ui-integration, tab-functionality) | Usability |
| REQ-FUNC-013 | The IDE shall provide functional workbenches (animation, color, CSS, layout, storybook, round-trip, hotkeys, simulation) with per-workbench state. | A | Test (functional-workbenches via dock suites) | Feature surface |
| REQ-FUNC-014 | The IDE shall support user-editable hotkeys with persistence, capture UI, and reset, and the default set documented in docs/HOTKEYS.md. | A | Test (hotkeys) | Usability |
| REQ-FUNC-015 | The IDE shall provide animation editing (keyframes, easing, playback) and the Component Lab (stories, controls, story test run) for reusable components. | A | Test (animation via advanced-manual-edit; storybook-cleanroom suites) | Design capability |
| REQ-FUNC-016 | The IDE shall export the full project as a framework project (e.g. Astro project tree) via `npm run generate:example` and the public API `exportAstro()`. | A | Test (generate-example, exportAstro API) | Primary output |
| REQ-FUNC-017 | The IDE shall provide a plugin SDK with contribution points and a contributions registry visible to the UI. | A | Test (roundtrip-plugin) | Extensibility |

## 4. Safety / Artifact-Integrity Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-SAFE-001 | Round-trip integrity: for an unchanged imported project, generated source output shall be byte-identical to the imported source for all 11 backends. | A (artifact integrity) | Test (per-backend roundtrip suites incl. roundtrip-pwtk layout.json byte-identical assertion, roundtrip-qml multiline preservation) | Prevents silent corruption of device GUI source (HAZ-001) |
| REQ-SAFE-002 | Source edits shall only be applied via the patch plan; every patch shall identify its target file, anchor symbol, and strategy; patches that cannot anchor shall be reported, never guessed. | A | Test (roundtrip-engine patch strategy tests) | No out-of-band source modification (HAZ-001) |
| REQ-SAFE-003 | Export shall be deterministic: identical project state and seed produce byte-identical export output. | A | Test (simulation determinism, generate-example golden file) | Auditability of delivered artifacts |
| REQ-SAFE-004 | The designer shall never execute imported source code at runtime; import is parse-only (no evaluation of imported JS/Python/QML). | A | Inspection + Test (import suites run without side effects) | Malicious/defective imported code cannot execute in the design tool (HAZ-002) |
| REQ-SAFE-005 | Undo/redo shall maintain a history of up to 80 project states and be lossless (JSON snapshot per mutation). | A | Test (roundtrip-history) | Prevents unrecoverable user data loss |
| REQ-SAFE-006 | The local workspace API shall bind to loopback (127.0.0.1) only and reject path traversal outside the opened project root. | A | Test (workspace-roundtrip-files, platform-io) | Local file exposure limit (HAZ-003) |

## 5. Performance Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-PERF-001 | Initial shell load (HTML + all ES modules, no optional parsers) shall complete with an interactive artboard within 3 s on a standard development workstation (Node.js v22.20.0, Chrome current). | A | Demonstration | Usability |
| REQ-PERF-002 | A full re-render of a page with 500 design-tree nodes shall complete within 500 ms. | A | Demonstration (simulation-ui seeded page) | Editing responsiveness |
| REQ-PERF-003 | The test suite (`npm test`, 29 suites) shall complete within 10 minutes on the reference workstation. | A | Demonstration | CI feasibility |
| REQ-PERF-004 | Direct-manipulation geometry updates (drag/resize) shall apply to the DOM live during pointer move without a full re-render, completing per frame (≤16 ms target at 60 fps). | A | Demonstration | Manipulation feel |

## 6. Interface Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-INTF-001 | The IDE shall run standalone via `node launch-designer.mjs` serving the app at http://127.0.0.1:8766 (port overridable by PORT env variable). | A | Test/Inspection | Primary deployment |
| REQ-INTF-002 | The VS Code extension shall reuse the standalone shell via a byte-identical mirror of every `standalone/js/*.js` file, `standalone/styles.css`, and `standalone/index.html`. | A | Test (tooltips-app-integration mirror assertions) + commit-time `cmp` loop | Single source of truth (HAZ-004) |
| REQ-INTF-003 | The public API `window.AstroUIDesigner` shall expose: version, getProject, loadProjectObject, validate, setMode, openBottomTab, openWorkspacePath, openSourceFile, saveProject, exportAstro, getSelected, selectNode, render, plugins, contributions, dockLayout, moveDockPanel, floatDockPanel, resetDockLayout, exportDrawioText, importDrawioText, importExistingProject, commands, executeCommand, hotkey management, page management (create/duplicate/delete). | A | Test (public API exercised by CDP integration suites) | Stable integration surface |
| REQ-INTF-004 | The MCP server (`npm run mcp`) shall speak MCP over stdio and expose tools for project read, node selection, property edit, export, and backend round-trip operations. | A | Test (hermes-mcp) | Agent integration |
| REQ-INTF-005 | The IDE shall expose a workspace file API over the local server for project-folder import/export (list, read, write) scoped to the opened project root. | A | Test (workspace-roundtrip-files) | Existing-project workflow |

## 7. Integration Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-INTG-001 | All 32 standalone ES modules shall load in the browser with zero console errors on shell startup (CDP `Runtime.exceptionThrown` + `window.onerror` both empty). | A | Test (CDP integration suites) | Module graph integrity |
| REQ-INTG-002 | The round-trip engine, neutral IR, conversion, and patcher layers shall operate as a pipeline: detect → import (source → neutral) → design → generate (neutral → source) → patch (source edits); each stage independently testable. | A | Test (roundtrip-engine, roundtrip-neutral-ir, roundtrip-conversion) | Architecture compliance (AUID-SAD-003 §5) |
| REQ-INTG-003 | The VS Code extension build (`npm run package:vscode`) shall produce a `.vsix` whose embedded designer files are byte-identical to the standalone sources. | A | Test (vscode package script + cmp) | Distribution integrity |
| REQ-INTG-004 | Optional parser packages (@astrojs/compiler-rs, @vue/compiler-sfc, svelte, typescript, tree-sitter, tree-sitter-c) shall be loadable on demand; their absence shall degrade source-analysis features gracefully without breaking the core design surface. | A | Test (functional matrix without optional deps) | Deployment flexibility |

## 8. Compliance Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-CMPL-001 | The software release shall carry a build manifest (PROJECT_BUILD_MANIFEST.md) listing every source file with size and SHA-256, and a version string in the `VERSION` file, `package.json`, and the VS Code extension manifest. | A | Inspection (SHA256SUMS.txt cross-check) | 21 CFR 820.30(i) design output traceability |
| REQ-CMPL-002 | Each release shall be recorded in CHANGELOG.md with date, version, and change summary, and the VS Code extension CHANGELOG.md shall mirror the version. | A | Inspection | Change control (21 CFR 820.30(i)) |
| REQ-CMPL-003 | The software shall be developed under a documented process (AUID-SDP-001) and maintain the Design History File index (AUID-DHFI-020). | A | Inspection | 21 CFR 820.30(a)/(i) |
| REQ-CMPL-004 | The documentation set shall maintain bidirectional traceability (AUID-RTM-011) with no unresolved "TBD" entries at release. | A | Inspection (RTM audit) | IEC 62304 Clause 8.5 |

## 9. Non-Functional Requirements

| ID | Requirement | Class | Verification | Rationale |
|----|-------------|-------|--------------|-----------|
| REQ-NFR-001 | The IDE shall run on Node.js v22.x LTS with Chrome/Chromium current stable on Windows 10/11, macOS, and Linux. | A | Demonstration | Platform support |
| REQ-NFR-002 | Project state shall be persistable to JSON (save) and restorable (load) with no data loss across save/load cycles. | A | Test (saveProject/loadProjectObject suites) | Data durability |
| REQ-NFR-003 | The IDE shall autosave recovery checkpoints (scheduleRecovery) so a crash loses at most the last mutation batch. | A | Test (roundtrip-history) | Data loss limit |
| REQ-NFR-004 | All user-facing strings shall be in English (current locale). | A | Inspection | Consistency |
| REQ-NFR-005 | The IDE shall not require network access for core design, export, or round-trip functions; the workspace API and MCP are local-only. | A | Inspection + Test | Deployment in air-gapped environments (cybersecurity, AUID-CRA-016) |

## 10. Requirements Not Addressed (out of scope)
- Patient data handling: the tool does not store, display, or process PHI.
- Clinical validation: out of scope for a design tool; applies to the
  consuming device.
- Mobile deployment.

## 11. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |
| Safety Engineer | | | |

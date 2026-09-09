# Software Architecture Description (SAD)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SAD-003 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.2 |
| **Safety Class** | Class A |

---

## 1. Introduction

This document describes the software architecture of Astro UI Designer Pro
v2.18.0-advanced-simulation-mcp: decomposition into software items, their
interfaces, dependencies, concurrency, and data flow. It is the
architectural basis for the detailed design (AUID-SDD-004), the verification
plans (AUID-UV-005, AUID-IVP-006, AUID-SVP-007), and the C4 model
(docs/c4/).

## 2. Architectural Viewpoint

The software is a browser-based single-page application (SPA) with a
loopback Node.js host. No server-side rendering, no database, no network
egress. All state lives in the browser process as a single in-memory project
object; persistence is explicit (save to JSON) or via the local workspace
file API.

Architecture style: layered, unidirectional data flow.
1. **Host layer** (Node.js): static file serving + workspace file API + launch.
2. **Shell layer** (HTML/CSS): document structure, dock layout, artboard.
3. **Application core** (app.js): state container, rendering, interaction
   glue, command/hotkey dispatch.
4. **Domain modules** (ES modules): model, round-trip pipeline, simulation,
   layout, workbenches, I/O adapters — pure functions where feasible.
5. **Integration layer**: MCP server (separate Node process), plugin SDK,
   public browser API.

## 3. Software Item Decomposition

| SI ID | Name | Module(s) | LOC | Responsibility |
|-------|------|-----------|-----|----------------|
| SI-001 | Application Core | js/app.js | 382 (dense, one-function-per-line) | Global state (project, doc, selection, zoom, history), rendering, direct-manipulation interaction (beginManualDrag/Resize/Rotate, nudgeSelected), command & hotkey dispatch, public API installation |
| SI-002 | Design Model | js/model.js | 125 | Node/page/project data structures, createNode, tree operations (find/insert/remove/duplicate/clone/walk), project migration (schemaVersion 8) |
| SI-003 | Component Registry | js/registry.js | 69 | 41 component type definitions (defaults, styles, freeform-children capability, breakpoints) |
| SI-004 | Manual Layout Engine | js/manual-layout.js | 30 | Snap math (snapPosition), resizeRect, constrainChildRect, applyRotation, sizing/position modes, layout guides |
| SI-005 | Advanced Manual Editing | js/advanced-manual-edit.js | 156 | Multi-selection, bounding-box ops, group move/resize, Penpot-cleanroom interactions |
| SI-006 | Round-trip Engine | js/roundtrip-engine.js | 458 | BACKEND_MATRIX (11 backends), detectRoundTripBackend, buildRoundTripPatchPlan, per-backend source patchers |
| SI-007 | Neutral IR | js/roundtrip-neutral-ir.js | 149 | parseXNeutral / generateXFromNeutral per backend, importFilesToNeutral, generateNeutralBackend, multi-file importers (pwtk, qml) |
| SI-008 | Round-trip Conversion/Plugin/Builtins/App-bridge/UI/History | js/roundtrip-conversion.js, roundtrip-plugin.js, roundtrip-builtins.js, roundtrip-app-bridge.js, roundtrip-ui.js | 25/9/18/47/22 | Design-source conversion orchestration, plugin contribution points, builtin auto-registration, app state bridge, workbench UI, edit history |
| SI-009 | Simulation | js/simulation.js | 192 | Deterministic page/project simulation, seeded RNG, simulation UI state |
| SI-010 | Workspace & Platform I/O | js/workspace-client.js, platform-io.js, zip.js, qml-io.js, drawio-io.js | 24/25/5/111/481 | Local workspace file API client, import/export file format handling, Draw.io XML import/export, QML file graph I/O |
| SI-011 | UX Subsystems | js/dock-layout.js, tooltips.js, hotkeys.js, functional-workbenches.js, animation.js, color-picker.js, css-tools.js, validator.js, project-pages.js, research-features.js, penpot-cleanroom.js, storybook-cleanroom.js, plasmic-cleanroom.js | 173/278/30/169/138/65/23/11/80/36/29/28/27 | Docks, tooltips, hotkeys, workbenches, animation, color, CSS utilities, validation, page entities, feature flags, cleanroom research integrations |

Total standalone JS: 3490 lines across 32 modules. The VS Code extension
mirror duplicates all of SI-001..SI-011 byte-identically
(vscode-extension/designer/js/).

## 4. Interfaces

### 4.1 External interfaces
| Interface | Protocol | Bound | Direction |
|-----------|----------|-------|-----------|
| Browser to host static server | HTTP over TCP | 127.0.0.1:8766 (PORT overridable) | app receives files from host |
| Browser to workspace file API | HTTP JSON over TCP | 127.0.0.1:8766 | app and host exchange project-folder read/write, scoped to project root |
| MCP server to agent host | MCP over stdio | local process pair | agent and MCP server exchange tool calls/results |
| VS Code extension to host API | VS Code webview messaging | local | extension and designer shell |

### 4.2 Internal interfaces
- **State access:** all modules receive explicit parameters; only SI-001
  owns `state`. Domain modules are pure where possible (model, manual-layout,
  neutral IR) — they take and return plain JSON, enabling direct unit
  verification (AUID-UV-005).
- **Round-trip pipeline contract:** `detectRoundTripBackend(files)` returns
  backendId; `importFilesToNeutral(backendId, files)` returns the neutral
  design document (IR); `generateNeutralBackend(backendId, neutralDoc)`
  returns a map of output-path to source content; `buildRoundTripPatchPlan`
  returns a list of patch records, each with file, anchor, strategy, before,
  after. Every patch carries an explicit anchor symbol and strategy
  (`exact-symbol`); unanchored edits are rejected.
- **Rendering contract:** SI-001 renders from state only; domain modules
  never touch the DOM (exception: direct-manipulation live updates in
  SI-001/SI-004 which mutate style properties of the selected node between
  full re-renders, per REQ-FUNC-003/REQ-PERF-004).

## 5. Data Flow (round-trip)

```
source files (project folder)
   |  detectRoundTripBackend (extension + content sniff; pwtk/qml before generic .py/.html fallthrough)
   v
backendId --> importFilesToNeutral --> neutral design document (IR)
   v                                                |
 designer editing (state.project)                   | generateNeutralBackend
   v                                                v
neutralDelta --> buildRoundTripPatchPlan --> anchored source patches (dry-run review) --> applied files
```
Invariants: unmodified round-trip is byte-identical (REQ-SAFE-001); import
never executes imported code (REQ-SAFE-004); export is deterministic
(REQ-SAFE-003).

## 6. Concurrency

Single-threaded browser event loop; no Web Workers. The only long-running
work is Draw.io import (SI-010) which is chunked via microtasks. The Node
host uses the standard event loop with synchronous file operations bounded
by project-folder size. No shared mutable state crosses threads.

## 7. Architectural Decisions and Rationale

| Decision | Rationale |
|----------|-----------|
| No build step / no transpile | Deterministic artifacts; source = shipped code; simplifies configuration management (SHA-256 per file is meaningful) |
| Single in-memory project object with JSON snapshots for history | Lossless undo/redo (REQ-SAFE-005), trivial serialization |
| Neutral IR for all backends | One design model, N source targets; per-backend testability (AUID-IVP-006) |
| Byte-identical VS Code mirror | Single source of truth; mirror drift is a defect (REQ-INTF-002, HAZ-004) |
| Loopback-only host API | Minimal local attack surface (REQ-SAFE-006, AUID-CRA-016) |
| Optional parser packages | Core function works air-gapped with zero npm installs (REQ-INTG-004) |

## 8. Dependencies and SOUP
See AUID-CRA-016 section 4 (SBOM). Node.js v22.20.0 runtime; Chrome/Blink
engine; optional npm parser packages. No runtime npm dependencies.

## 9. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

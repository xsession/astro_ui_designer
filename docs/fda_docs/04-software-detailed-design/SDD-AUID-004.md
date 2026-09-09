# Software Detailed Design (SDD)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SDD-004 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.3 |
| **Safety Class** | Class A (detailed design maintained beyond Class A minimum for auditability of export/round-trip functions) |

---

## 1. Introduction
Per-item detailed design for the safety-relevant and audit-critical software
items identified in AUID-SAD-003 section 3. Items SI-001..SI-011; this
document details SI-001 (application core), SI-004 (manual layout engine),
and SI-006/SI-007 (round-trip pipeline) in depth, and the remaining items at
module-function level.

## 2. SI-001 Application Core (app.js)

### 2.1 State container
Single object `state` holding: project, doc (kind + id), selectedId,
breakpoint, leftTab, rightTab, bottomTab, mode, zoom, history array, future
array, clipboard, dirty flag, issues array, logs array, editorView,
sourceFile, workspaceApi, livePreviewUrl, bottomExpanded. `project` follows
schemaVersion 8 (page entities with routes/filenames, component library,
editor settings, manualLayout settings).

### 2.2 Mutation discipline
All project mutations go through `mutate(fn, label)` — callback first,
label second — which pushes a JSON snapshot to `state.history` (capped at
80), clears `state.future`, marks dirty, schedules recovery, logs, and
re-renders. This invariant guarantees lossless undo/redo (REQ-SAFE-005).
Design rule enforced in review: no direct `state.project` field write
outside a `mutate` call.

### 2.3 Direct manipulation (REQ-FUNC-003/004, REQ-PERF-004)
- `beginManualDrag(e,node,el)`: pointerdown on a node; 3 px activation
  threshold; delta = (clientXY delta)/zoom; snap via
  `manualSnapFor(node, rawRect)` (grid/sibling/parent-border/geometry snap
  lines); live DOM update via `updateGeometryDom(node)` (style property
  writes only, no re-render); commit on pointerup (validate + renderAll).
- `beginManualResize(e,node,handle)`: handle in {n,s,e,w,ne,nw,se,sw};
  `resizeRect(start, handle, dx, dy, opts)` with minWidth 24 px, minHeight
  24 px, optional aspect lock; edge snapping per axis; children of
  freeform-container nodes rescaled via `constrainChildRect`.
- `beginManualRotate(e,node)`: rotation about node center; Shift snaps to
  15 degrees; `applyRotation(node, deg)`; live degree tooltip.
- `nudgeSelected(dx,dy,resize,step)`: keyboard nudge; step = bigNudge (8 px,
  manualLayout.settings) or 1 px (Alt, fine); Shift selects resize mode.
- Transient layer: smart-snap lines + geometry tooltip rendered into
  `.manual-transient-layer` over the artboard, cleared on release.
- Modifier semantics: Shift = axis lock (drag) / aspect lock (resize) /
  resize mode (nudge); Alt = fine step / measure; Ctrl/Cmd = snap bypass.

### 2.4 Command and hotkey dispatch
`handleGlobalKeydown` order: (1) hotkey-capture mode; (2) Escape clears
popovers; (3) design-mode arrows to nudgeSelected, Delete/Backspace to
deleteSelected; (4) `commandForEvent` against `commandDefinitions()` and
`ensureHotkeySettings()`, then `executeCommand`. Command definitions carry
id, label, default binding; user overrides persist in
`state.project.editor.hotkeys`.

### 2.5 Public API (REQ-INTF-003)
`window.AstroUIDesigner` installed by `installPublicApi()` — full surface
listed in AUID-SRS-002 REQ-INTF-003. Version string
`'2.18.0-advanced-simulation-mcp'` matches the VERSION file
(REQ-CMPL-001).

## 3. SI-004 Manual Layout Engine (manual-layout.js)
Pure math module. Exports: POSITION_MODES, SIZING_MODES, SNAP_KINDS,
ensureManualLayoutProject (merges defaults: rulers, snapGrid, snapGuides,
snapGeometry, snapDistance 6 px, bigNudge 8, fineNudge 1),
ensureManualLayoutNode, applySizingMode, setPositionMode, applyRotation,
snapPosition (candidate positions from grid/siblings/guides/parent border,
selects within snapDistance, returns snapped rect + snap lines),
resizeRect (min clamps, aspect ratio), constrainChildRect (percentage
constraints map parent resize to child rects), layoutGuideForBreakpoint,
smartSelectionMetrics, tidyRects, boxSpacing, buildLayoutGuideColumns.
No DOM, no state — fully unit-verifiable (AUID-UV-005, UV-ML-* cases).

## 4. SI-006 / SI-007 Round-trip Pipeline

### 4.1 Backend matrix (roundtrip-engine.js BACKEND_MATRIX)
11 entries: astro, react, vue, svelte, vanilla-js, vanilla-ts, tkinter,
nicegui, lvgl, pwtk, qml — each with id, label, family, extensions,
capabilities, preview command. pwtk: family python, extensions .py/.json/
.html. qml: family qt, extensions .qml/.qmltypes/.qrc/.qmldir plus
qmldir/qtquickcontrols2.conf/CMakeLists.txt workspace recognition.

### 4.2 Detection (detectRoundTripBackend)
Extension scan + content sniffing. Order is significant: pwtk and qml
sniffs run before generic .py/.html/.c fallthroughs to prevent
misclassification (e.g. a pwtk app sniffed as tkinter). Explicit backend
override wins over detection (REQ-FUNC-006).

### 4.3 Neutral IR (roundtrip-neutral-ir.js)
`parseXNeutral(source)` to nodes per backend; `importFilesToNeutral`
branches by backend for multi-file importers:
- `importPwtkFiles`: block classes from main.py (name, group_name, @pwtk.on
  events) + layout.json (pinned_blocks, block_containers, timer_vals keyed
  "Group, Name" — multi-part group names supported; name = last
  comma-separated segment) + web/index.html (container anchor). Full timer
  map preserved in metadata (rawTimers) so orphan timer entries survive
  round-trip.
- `importQmlFiles`: QML object graph with ids/properties; local .qml
  component graph traversal; type/id metadata preserved through conversion.
`generateXFromNeutral(nodes)` to source per backend;
`generateNeutralBackend` dispatch. pwtk/qml generators must reproduce
unmodified input byte-identically (REQ-SAFE-001).

### 4.4 Patching (buildRoundTripPatchPlan + patchers)
Delta (neutral doc changes) to patch plan: list of records with file,
anchor, strategy, before, after, rationale. Strategy `exact-symbol`: the
anchor symbol must occur exactly once in the target file; otherwise the
patch is reported as unapplicable (never guessed) — REQ-SAFE-002.
pwtk-style JSON-layout backends patch layout.json by the "Group, Name" key,
not the Python file. Dry-run review UI shows every patch before application
(REQ-FUNC-008).

## 5. SI-002 Design Model (model.js)
`createNode(type, overrides)` deep-clones registry defaults and merges
overrides (style per breakpoint, props, actions, bindings, meta, design
constraints, states, timeline). Tree ops: findNode, findParent, insertNode,
removeNode, duplicateNode, deepClone, walk, allNodes, migrateProject
(schemaVersion upgrades). Page entities (project-pages.js):
createPageEntity, duplicatePageEntity, deletePageEntity (returns nextPageId
for safe current-page replacement).

## 6. SI-009 Simulation (simulation.js)
Deterministic: seeded PRNG (seed from project/settings), stable iteration
order over the design tree, simulation of interactive behaviors (animation
playback, form interactions, repeater data), reproducible state snapshots
and screenshots. The simulation-ui integration verifies the determinism
contract (REQ-FUNC-009, REQ-SAFE-003).

## 7. Remaining items (module-function level)
- SI-003 registry.js: COMPONENTS map — 41 types; each spec: label,
  defaultStyle (base + breakpoints), defaultProps, freeformChildren flag,
  DOM tag mapping.
- SI-005 advanced-manual-edit.js: multi-selection set operations, bounding
  box, group transform, alignment/snap for selections.
- SI-008 round-trip support: conversion (design-to-source orchestration),
  plugin (contribution registration), builtins (auto-registration from
  BACKEND_MATRIX), app-bridge (designer state adapter), ui (workbench),
  history (edit provenance).
- SI-010 I/O: workspace-client (loopback file API), platform-io (OS-level
  project folder import/export), zip (project archive), qml-io (QML graph
  file traversal), drawio-io (Draw.io XML import/export, 481 LOC — the
  largest module).
- SI-011 UX: dock-layout (41 dock tabs, zones, float, persistence, reset),
  tooltips (41 tool panels), hotkeys (definitions, capture, persistence),
  functional-workbenches (animation/color/css/layout/storybook/round-trip/
  hotkeys/simulation workbenches), animation, color-picker, css-tools,
  validator (project + page-entity validation), project-pages,
  research-features (feature flags), penpot/storybook/plasmic cleanroom
  research integrations.

## 8. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

# C3 — Components

Component decomposition of the Browser IDE Shell container (the 32-module
ES module graph; grouping per AUID-SAD-003 section 3, SI-001..SI-011).

## Component groups

### Application Core
- **state + renderer (app.js)** — single in-memory project object
  (schemaVersion 8), lossless undo/redo (80 JSON snapshots via `mutate`),
  artboard rendering, command/hotkey dispatch, public API.
- **Design model (model.js)** — node/page/project structures, tree
  operations, schema migration.
- **Component registry (registry.js)** — 41 component type definitions.
- **Page entities (project-pages.js)** — page lifecycle (create/duplicate/
  delete with safe current-page replacement).

### Geometry & Interaction
- **Manual layout engine (manual-layout.js)** — pure snap/resize/rotate
  math (snapDistance 6 px, bigNudge 8 px, fineNudge 1 px, min size 24 px).
- **Advanced manual editing (advanced-manual-edit.js)** — multi-selection,
  bounding box, group transforms.
- **Direct manipulation glue (in app.js)** — drag/8-handle resize/rotate,
  transient snap lines + geometry tooltip, modifier semantics (Shift/Alt/
  Ctrl).

### Round-trip Pipeline
- **Round-trip engine (roundtrip-engine.js)** — BACKEND_MATRIX (11
  backends), detection (pwtk/qml before generic fallthrough), anchored
  patch plans (`exact-symbol`).
- **Neutral IR (roundtrip-neutral-ir.js)** — per-backend parsers/generators;
  multi-file importers (pwtk main.py + layout.json + web/index.html; QML
  component graph).
- **Support (conversion/plugin/builtins/app-bridge/ui/history)** —
  orchestration, contributions, auto-registration, state bridge,
  workbench UI, edit provenance.

### Dynamics & I/O
- **Simulation (simulation.js)** — deterministic seeded page/project
  simulation.
- **I/O (workspace-client, platform-io, zip, qml-io, drawio-io)** — loopback
  file API, project folder import/export, archive, QML graph, Draw.io XML.

### UX Subsystems
- **Docks (dock-layout.js)** — 41 dockable tabs, zones, float, persistence,
  reset.
- **Tooltips (tooltips.js)**, **hotkeys (hotkeys.js)**,
  **workbenches (functional-workbenches.js)**, animation, color-picker,
  css-tools, validator, feature flags, cleanroom research integrations
  (penpot/storybook/plasmic).

### Outside the shell
- **MCP server** (Node process) — bridges agents to the public API.
- **Local host** (Node process) — static files + workspace API.

![C3 components](diagrams/c3-component.png)

See also: AUID-SAD-003 section 3 (software item table), AUID-SDD-004.

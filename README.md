# Astro UI Designer Pro 2.18.0 — Advanced Editing + Simulation + MCP

A dense **Qt Creator / Qt Designer-style visual IDE for Astro and multi-framework UI work** with source round-trip, advanced direct manipulation, deterministic UI simulation, relocatable workbenches, and semantic MCP automation.

## 2.18 highlights

- **Penpot-like advanced manual editing:** multi-select, Shift/Ctrl/Cmd toggle selection, marquee selection, multi-object drag/resize/rotate, alignment, distribution, tidy spacing, group/ungroup, layer ordering, flip, lock, rulers, draggable guides, smart snapping and Alt measurement overlays.
- **Page / Project Simulation:** F7 Simulate mode plus a relocatable Simulation workbench. Run project routes, prototype flows, overlays, state, bindings, visibility conditions, form changes, delays and interaction event logs without executing arbitrary source code.
- **Expanded MCP:** semantic project summary/validation, page listing, node inspection, controlled geometry editing and arrangement, deterministic simulation sessions/events/state/reset, and contained Astro export.
- **Import Existing Project** from toolbar/menu/command palette (`Ctrl+Shift+I`) with native folder selection, adapter auto-detection and live/snapshot import review.
- **Qt Quick/QML round-trip** plus Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI, LVGL and hardened pwtk/eel adapters.
- **42 relocatable tool panels** with concrete built-in behavior, floating windows, draggable splitters, persisted layouts and editable hotkeys.
- **Safe page entities:** create/edit/duplicate/delete project pages with reference repair and last-page protection.
- Draw.io / diagrams.net import/export, Component Lab, animation, CSS tools, design tokens, Git, prototype/comments/inspect, multi-platform interchange and VS Code integration.

## Run

```bash
npm install
npm start
```

The standalone host defaults to `http://127.0.0.1:8766`.

## Test

```bash
npm test
npm run test:advanced
npm run test:simulation
npm run test:functional
npm run test:import
npm run test:roundtrip
npm run test:drawio
npm run test:tooltips
npm run test:visual
npm run test:vscode
npm run test:hermes
```

## Upstream baseline

The newest `xsession/astro_ui_designer` `main` verified for this release is:

`02b9fcd8b4807ab1de1f4f3fd991b16db5e2bbaa` — `Extend direct manipulation to all canvas components (2.17.2)`.

2.18 builds on that upstream direct-manipulation foundation and adds the advanced multi-selection editing, simulation and MCP systems described above. See `PROJECT_BUILD_MANIFEST.md` for provenance.

## Documentation

- `docs/ADVANCED_MANUAL_EDITING.md` — multi-selection, transforms, alignment, spacing, grouping, rulers/guides and measurements.
- `docs/DIRECT_MANIPULATION.md` — single-object drag/resize/rotate and responsive geometry behavior.
- `docs/SIMULATION.md` — page/project simulation semantics and limitations.
- `docs/MCP.md` — semantic MCP tools, mutation boundaries and simulation APIs.
- `docs/PROJECT_IMPORT.md` — existing-project browser and adapter review.
- `docs/QML_ROUNDTRIP.md` — Qt Quick/QML import/patch/export.
- `docs/FUNCTIONALITY_AUDIT.md` — built-in workbench audit.
- `docs/HOTKEYS.md` — editable shortcut architecture.
- `docs/PAGE_ENTITIES.md` — page lifecycle and deletion repair.
- `docs/RELOCATABLE_DOCKS.md` — docking/floating behavior.
- `docs/DRAWIO_INTERCHANGE.md` — diagrams.net interchange.
- `docs/LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md` — source round-trip architecture.
- `docs/PWTK_ROUNDTRIP_REVIEW.md` — pwtk adapter review/hardening.
- `docs/TOOLTIPS.md` — global tooltip system.

## Direct manipulation quick reference

In Design mode, any unlocked non-root component can be manipulated directly. Multi-select with Shift/Ctrl/Cmd-click or marquee-select from the root canvas. Selection handles operate on the group bounds; transforms use top-level selected nodes so selecting a parent and its descendant never double-applies geometry. A real move detaches normal flow items only when positional geometry is required.

## Simulation quick reference

Press **F7** or click **Simulate**. Choose page/project scope, flow, start page and viewport. The runtime inspector exposes state, overlays, hotspots and event history. Simulation interprets the designer model; it is deliberately not a replacement for the actual Astro/Vue/QML/Python/native runtime.

## MCP quick reference

```bash
ASTRO_UI_PROJECT_ROOT=/path/to/project npm run mcp
```

The MCP server reads `designer-project.json` or `.astro-ui.json` in that root. Semantic mutation tools modify only that project file, and Astro export is constrained to the configured root.

## Provenance

This source package is based on the verified upstream `main` head listed above. The GitHub connection was used to fetch/review the newest repository state; the 2.18 changes are applied in the local release tree. This package does not imply the 2.18 changes were pushed to upstream `main`.

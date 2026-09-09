# Astro UI Designer Pro 2.19.0 — Dense Clean UI + Advanced Editing + Simulation + MCP

A dense **Qt Creator / Qt Designer-style visual IDE for Astro and multi-framework UI work** with a cleaner progressive-disclosure shell, source round-trip, advanced direct manipulation, deterministic UI simulation, relocatable workbenches, and semantic MCP automation.

## 2.19 highlights

- **Dense Clean UI refactor:** lower-frequency toolbar commands are grouped into Edit/Arrange/Tools dropdowns, active tabs use quieter accent indicators, workbench cards are flatter, and panel/canvas contrast is reduced without removing functionality.
- **Persistent inspector disclosure:** secondary inspector sections default collapsed and each section remembers its open/collapsed state per workbench.
- **Clearer workflow grouping:** right/bottom dock strips keep all relocatable tabs but use subtle separators to make functional clusters easier to scan.

## 2.18 foundation

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

`803474319d39937026d254460c21f471e5103d4f` — `Add advanced manual editing, simulation, and MCP integration (2.18.0)`.

2.19 builds directly on the newest 2.18 advanced-editing/simulation/MCP upstream foundation and refactors the interaction shell for lower visual load while retaining dense engineering workflows. See `PROJECT_BUILD_MANIFEST.md` for provenance.

## Documentation

Start with **`docs/README.md`** for the advanced Diátaxis + arc42 documentation portal, or **`docs/ASTRO_UI_DESIGNER_HANDBOOK.md`** for the complete product handbook. Source-derived reference tables can be regenerated with `npm run docs:generate` and checked with `npm run docs:check`.

- `docs/features/UI_UX_REFACTOR_2_19.md` — dense-clean UI review, hierarchy changes and progressive disclosure.
- `docs/features/ADVANCED_MANUAL_EDITING.md` — multi-selection, transforms, alignment, spacing, grouping, rulers/guides and measurements.
- `docs/features/DIRECT_MANIPULATION.md` — single-object drag/resize/rotate and responsive geometry behavior.
- `docs/features/SIMULATION.md` — page/project simulation semantics and limitations.
- `docs/features/MCP.md` — semantic MCP tools, mutation boundaries and simulation APIs.
- `docs/features/PROJECT_IMPORT.md` — existing-project browser and adapter review.
- `docs/features/QML_ROUNDTRIP.md` — Qt Quick/QML import/patch/export.
- `docs/features/FUNCTIONALITY_AUDIT.md` — built-in workbench audit.
- `docs/features/HOTKEYS.md` — editable shortcut architecture.
- `docs/features/PAGE_ENTITIES.md` — page lifecycle and deletion repair.
- `docs/features/RELOCATABLE_DOCKS.md` — docking/floating behavior.
- `docs/features/DRAWIO_INTERCHANGE.md` — diagrams.net interchange.
- `docs/features/LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md` — source round-trip architecture.
- `docs/features/PWTK_ROUNDTRIP_REVIEW.md` — pwtk adapter review/hardening.
- `docs/features/TOOLTIPS.md` — global tooltip system.

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

This source package is based on the verified upstream `main` head listed above. The GitHub connection was used to fetch/review the newest repository state; the 2.19 changes are applied in the local release tree. This package does not imply the 2.19 changes were pushed to upstream `main`.

# Changelog

## 2.15.0-global-tooltips — 2026-09-08

- Added a global purpose-aware tooltip system across the full editor shell.
- Added explicit help for top menus, toolbar icons, alignment/layout controls, workspace/preview commands and round-trip/dock controls.
- Added semantic tooltips for all 40 relocatable dock tabs and floating-dock L/R/B/home controls.
- Added component-aware palette tooltips generated from the 42-component registry.
- Added automatic tooltip annotation for dynamically rendered menu/workbench controls using a MutationObserver.
- Added hover and keyboard-focus presentation, viewport-aware positioning, Escape dismissal and accessible `aria-description` metadata.
- Added tooltip coverage for selects, inputs, textareas, dock splitters, document tabs and relocatable section headings.
- Added standalone/VS Code parity and dedicated tooltip regression suites.

## 2.14.0-drawio-interchange — 2026-09-08

- Added first-class Draw.io / diagrams.net importer and exporter in the relocatable Interchange workbench.
- Added multi-page `mxfile` and raw `mxGraphModel` import.
- Added compressed Draw.io page decoding and Draw.io SVG embedded-document import.
- Added editable geometry, label, fill/stroke/font, rounded/ellipse/image, opacity, rotation and group mapping.
- Added connector identity/style/routing metadata preservation for loss-minimized re-export.
- Added standard uncompressed `.drawio` export with stable cell IDs and optional prototype-interaction arrows.
- Added public `exportDrawioText()` / `importDrawioText()` APIs and standalone/VS Code parity.
- Added Draw.io round-trip and UI integration regression suites.

## 2.13.0-relocatable-docks — 2026-09-08

- Added a Qt-style relocatable dock manager for all 40 tool tabs.
- Tabs can move/reorder between left, right, and bottom docks.
- Tabs can float into movable/resizable tool windows and dock back with L/R/B controls.
- Added right-click placement menu, double-click-to-float, drag-out-to-float, and a toolbar Docks helper/reset.
- Added persisted dock layout, floating geometry, dock sizes, and internal section order.
- Added reorderable document tabs and draggable property/workbench sections.
- Added pure dock-layout model tests plus integration coverage and VS Code parity.

## 2.12.0-roundtrip-full — 2026-09-07

- Completed the full Layout Synth-inspired round-trip roadmap.
- Added official/fallback syntax adapters for Astro, TypeScript/JSX, Vue, Svelte, Python and LVGL C.
- Added Round-trip Studio with property-level selection, source diff, confidence/stale badges, history and conversion.
- Added graph-aware recursive workspace watching and source-to-design mapped-node refresh.
- Added source checkpoints, audit events and reviewed rollback.
- Added neutral-IR import/export across Astro, React, Vue, Svelte, HTML, Tkinter, NiceGUI and LVGL.
- Added unified backend adapter SDK and Plugin SDK `backendAdapters` providers.
- Added standalone and VS Code runtime parity plus regression coverage.


## 2.10.0-color-pickers — 2026-08-31

- Added universal paired text + visual color controls.
- Added structured CSS Tools, manual canvas editing and direct alignment controls.
- Preserved Penpot, Storybook, Plasmic/composition, animation, source-aware workspace and VS Code capabilities.

## 2.7.0-hermes — 2026-08-30

- Added Hermes Agent MCP and project skill integration.

# Changelog

## 2.17.0-project-import-qml — 2026-09-08

- Added a visible **Import Project** toolbar button and **Import Existing Project…** commands in File, Project, Round-trip workbench and command palette.
- Added editable default hotkey `Ctrl+Shift+I` for existing-project import.
- Added native folder browsing to the standalone host and VS Code extension, plus browser directory-picker/snapshot fallback.
- Added adapter auto-detection review with adapter override, entry-file override, capability summary and live-vs-snapshot status.
- Added Qt Quick/QML as a built-in round-trip backend with QML object hierarchy/id/property inspection, neutral-IR import, common Qt Quick Controls/Layout mapping, reviewed literal source edits and Qt 6 project generation.
- Added QML workspace graph traversal for local QML component files and scanner support for `.qml`, `.qmltypes`, `.qrc`, `qmldir`, `qtquickcontrols2.conf` and `CMakeLists.txt`.
- Preserved imported QML type/id metadata through designer conversion and QML export.
- Added QML property round-trip for text, checked state, placeholder/source, geometry, color, radius, spacing, opacity and font size while leaving JavaScript handlers/C++ logic source-owned.
- Fixed workspace scan normalization when the standalone scanner returns filename strings.
- Hardened managed preview startup so missing runtime commands fail cleanly instead of producing an unhandled child-process error.
- Added `roundtrip-qml.test.mjs` and `project-import-ui.test.mjs`; aggregate suite now covers 25 suites.

## 2.16.1-pwtk-hardening — 2026-09-08

- Reviewed newest upstream `main` at `7863da396813093b592dba3c15cedc9dc65cdabf` (`Add pwtk blocks and GUI layout round-trip adapter (2.16.0)`).
- Hardened pwtk backend detection, import, generation and reviewed `layout.json` patching.
- Fixed BundleBlock classification and display-name/class-name mapping so pwtk blocks retain their source metadata and events.
- Fixed class-body parsing, `pwtk.App` discovery, multi-module block discovery and group names containing commas.
- Preserved original pwtk Python/HTML sources and the full `layout.json`; unchanged projects now retain exact `layout.json` text rather than being gratuitously reformatted.
- Added no-op and collision protection for timer, pin, move and rename patch operations.
- Preserved pin/timer metadata when moving or renaming pwtk blocks.
- Fixed workspace scanning to include Python, HTML, C/C++, headers and Sass/Less sources so pwtk, LVGL and vanilla adapters are actually reachable through the normal workspace flow.
- Added Python import graph traversal for pwtk/Tkinter/NiceGUI projects.
- Expanded pwtk and workspace-source regression coverage and synchronized the VS Code designer mirror.

## 2.16.0-functional-workbenches — 2026-09-08

- Reviewed current upstream `main` at `b4b0ded9a1ae9e014766a1180d2f238adb81e22a` (`Fix the menu functionality`).
- Replaced built-in generic/shallow dock content with functional inspectors/workbenches across all 41 registered tool panels.
- Added complete Project panel page lifecycle: create, edit, duplicate and safe delete.
- Added close/delete controls to page document tabs and repaired page-scoped flow/test references on deletion.
- Added `project-pages.js` with unique route/name handling, subtree-safe duplication and last-page protection.
- Added an editable hotkey system with capture, overrides, clear/reset, conflict detection, local/project persistence and command palette/menu integration.
- Exposed every relocatable panel as a command so users can assign shortcuts to any tab/workbench.
- Added real workbenches for CSS, layout, state, animation, tokens, libraries, content/locales, tests/story results, queries/templates/usages, audit/Git/prototype/comments/inspect and more.
- Fixed checkbox field rendering and hardened loading of malformed/legacy projects with no page array.
- Added dedicated hotkey, page-entity and built-in tab-functionality regression suites.
- Filled the previously empty Component Lab shell with component/story selection, responsive preview, generated controls, local checks/results and visual baselines.
- Added alternate hotkey bindings plus hotkey-profile import/export.
- Extended page deletion repair to prototype destinations, action targets, test targets and review comments tied to removed page nodes.
- Maintained standalone/VS Code source parity.

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

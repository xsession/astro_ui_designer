# Astro UI Designer Pro 2.17.2 — Direct Manipulation + Project Import + Qt Quick/QML

A dense **Qt Creator / Qt Designer-style visual IDE for Astro and multi-framework UI work**. This release keeps the reviewed 2.16 functional-workbench and hardened pwtk foundation, adds a visible existing-project browser/import workflow, and introduces Qt Quick/QML as a first-class round-trip backend.

## Highlights

- **Import Existing Project** from the top toolbar, File/Project menus, Round-trip workbench or `Ctrl+Shift+I`: browse a folder, auto-detect the adapter, review/override the backend and entry file, then import as a live workspace or browser snapshot.
- **Qt Quick/QML round-trip backend** with structural object/id/property inspection, common Qt Quick Controls/Layout mapping, reviewed literal source patches, local component graph discovery and Qt 6 project generation.
- **41 relocatable tool panels** across left, right and bottom docks; every built-in panel has a concrete renderer and useful actions.
- **Editable keyboard shortcut system** with capture, clear/reset, conflict detection, per-project persistence, local defaults and command-palette/menu integration. Every relocatable panel is addressable as a command, so any panel can receive a custom shortcut.
- **Safe page entity lifecycle:** create, edit, duplicate, reorder and delete project pages from the Project panel or document tabs. Deletion protects the last page and repairs page-scoped flow/test references.
- 42-component visual palette and responsive designer model.
- Properties, layout, actions, bindings, states/variants, data, effects, composition and Story inspectors.
- Layout Tools, CSS Tools, state variables, animation, tokens, libraries, content, locales, tests, story results, queries, templates, usages, audit, Git, prototype, comments and handoff/inspect workbenches.
- Global tooltips, Qt-style relocatable/floating docks and draggable document/workbench sections.
- Draw.io / diagrams.net import/export, multi-platform interchange and editable connector metadata.
- Syntax-aware source round-trip, history/rollback, neutral IR conversion and backend adapters for Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI, LVGL, pwtk/eel and Qt Quick/QML.
- Workspace discovery for web frameworks plus Python, HTML, LVGL C/C++, Qt/QML project sources, Sass/Less and related files.
- Local workspace/source editing, Git helpers, Astro preview, VS Code embedded designer and Hermes MCP/skill integration.

## Run

```bash
npm install
npm start
```

Then open `http://127.0.0.1:8766` if it is not opened automatically.

## Test

```bash
npm test
npm run test:functional
npm run test:import
npm run test:roundtrip
npm run test:drawio
npm run test:tooltips
npm run test:visual
npm run test:vscode
npm run test:hermes
```

## Upstream review baseline

The upstream branch was reviewed at:

`xsession/astro_ui_designer` `main` → `cef93ad7f5744e45c98876b0932ec4969691f78c` (`Restore manual drag, resize, and nudge geometry interaction (2.17.1)`, 2026-09-08).

The 2.17.1 change restored geometry interaction but limited it to Freeform Layer children. Version 2.17.2 keeps the 2.17 project-import/QML and 2.16.1 pwtk hardening work while extending direct drag/resize/rotate to ordinary flex/grid/section/card/form children. See `PROJECT_BUILD_MANIFEST.md` and `docs/DIRECT_MANIPULATION.md`.

## Documentation

- `docs/DIRECT_MANIPULATION.md` — canvas drag/resize/rotate, flow detachment, snapping, modifiers and breakpoint behavior.
- `docs/PROJECT_IMPORT.md` — existing-project browser, detection, review and live/snapshot import flow.
- `docs/QML_ROUNDTRIP.md` — Qt Quick/QML mapping, source patching, generation and limitations.
- `docs/FUNCTIONALITY_AUDIT.md` — whole-project tab/workbench review and implemented replacements.
- `docs/HOTKEYS.md` — editable command/hotkey architecture.
- `docs/PAGE_ENTITIES.md` — page lifecycle and deletion behavior.
- `docs/RELOCATABLE_DOCKS.md` — docking/floating behavior.
- `docs/DRAWIO_INTERCHANGE.md` — diagrams.net import/export mapping.
- `docs/LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md` — round-trip architecture.
- `docs/PWTK_ROUNDTRIP_REVIEW.md` — newest-upstream pwtk review, fixes, guarantees and limitations.
- `docs/TOOLTIPS.md` — global tooltip system.

## Direct manipulation

In Design mode, any unlocked non-root component can be manually moved, resized and rotated directly on the canvas, including ordinary flex/grid/section children. Select a component to show eight resize handles, a rotate handle and an explicit **MOVE** grip. A real move detaches a normal flow child to positioned geometry only when needed; breakpoint-specific edits remain in the active breakpoint override. Shift/Alt/Ctrl modifiers and keyboard nudge/resize are supported. See `docs/DIRECT_MANIPULATION.md`.


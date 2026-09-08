# Astro UI Designer Pro 2.16 — Functional Workbenches + Editable Hotkeys + Safe Pages

A dense **Qt Creator / Qt Designer-style visual IDE for Astro and multi-framework UI work**. This release is based on a review of the current `xsession/astro_ui_designer` `main` branch and replaces the remaining built-in placeholder/shallow tabs with useful editing workbenches.

## Highlights

- **41 relocatable tool panels** across left, right and bottom docks; every built-in panel has a concrete renderer and useful actions.
- **Editable keyboard shortcut system** with capture, clear/reset, conflict detection, per-project persistence, local defaults and command-palette/menu integration. Every relocatable panel is addressable as a command, so any panel can receive a custom shortcut.
- **Safe page entity lifecycle:** create, edit, duplicate, reorder and delete project pages from the Project panel or document tabs. Deletion protects the last page and repairs page-scoped flow/test references.
- 42-component visual palette and responsive designer model.
- Properties, layout, actions, bindings, states/variants, data, effects, composition and Story inspectors.
- Layout Tools, CSS Tools, state variables, animation, tokens, libraries, content, locales, tests, story results, queries, templates, usages, audit, Git, prototype, comments and handoff/inspect workbenches.
- Global tooltips, Qt-style relocatable/floating docks and draggable document/workbench sections.
- Draw.io / diagrams.net import/export, multi-platform interchange and editable connector metadata.
- Syntax-aware source round-trip, history/rollback, neutral IR conversion and backend adapters.
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
npm run test:roundtrip
npm run test:drawio
npm run test:tooltips
npm run test:visual
npm run test:vscode
npm run test:hermes
```

## Upstream review baseline

The upstream branch was reviewed at:

`xsession/astro_ui_designer` `main` → `b4b0ded9a1ae9e014766a1180d2f238adb81e22a` (`Fix the menu functionality`, 2026-09-08).

The existing local 2.15 full-project package was rebased logically against that current commit: the current menu/toolbar fixes were retained or superseded by the command/hotkey implementation, current workspace-tool behavior was verified, and the latest `.vscode/settings.json` was copied. See `PROJECT_BUILD_MANIFEST.md` and `docs/FUNCTIONALITY_AUDIT.md`.

## Documentation

- `docs/FUNCTIONALITY_AUDIT.md` — whole-project tab/workbench review and implemented replacements.
- `docs/HOTKEYS.md` — editable command/hotkey architecture.
- `docs/PAGE_ENTITIES.md` — page lifecycle and deletion behavior.
- `docs/RELOCATABLE_DOCKS.md` — docking/floating behavior.
- `docs/DRAWIO_INTERCHANGE.md` — diagrams.net import/export mapping.
- `docs/LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md` — round-trip architecture.
- `docs/TOOLTIPS.md` — global tooltip system.

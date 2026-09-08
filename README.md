# Astro UI Designer Pro — Global Tooltips + Relocatable Docks + Draw.io + Round-trip

A dense **Qt Creator / Qt Designer-style visual IDE for Astro and multi-framework UI work**, packaged as a complete local source project. This build combines the current Astro UI Designer architecture with the completed Layout Synth-inspired clean-room round-trip roadmap.

## Included

- 42-component visual palette and responsive designer model.
- **Global tooltip system:** purpose-aware hover/focus help for menus, toolbar icons, dock tabs, palette components, layout controls, source/preview controls, splitters, floating windows and dynamically generated workbench controls.
- Pages, reusable components, component instances, source ownership and source mappings.
- Dense canvas, inspectors, CSS/manual layout tools, color controls and animation model.
- **Qt-style relocatable workbench:** all 40 tool tabs can move between left/right/bottom docks, reorder, float, resize, and persist; document tabs and inspector/workbench sections are reorderable too.
- Penpot-inspired design/effects/prototype data, Storybook-inspired Component Lab, and Plasmic-inspired composition model.
- Astro project generation and neutral/multi-platform interchange.
- **Draw.io / diagrams.net interchange:** editable `.drawio`/`.xml` import and export, including multi-page diagrams, compressed pages, embedded Draw.io SVG, geometry/style mapping, nested groups and preserved connector metadata.
- Local workspace host with source read/write, Git helpers and preview process management.
- Plugin SDK with source/token/data/test/assistant/backend adapter contribution points.
- VS Code embedded designer source and workspace bridge.
- **Round-trip Studio** with AST-aware source patching, graph-aware watch, dirty/conflict state, source checkpoints/rollback, neutral IR conversion and backend adapters for Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI and LVGL.

## Run

```bash
npm install
npm start
```

Then open `http://127.0.0.1:8766` if the launcher does not open it automatically.

The core editor has no mandatory runtime npm dependencies. Optional parser packages improve structural source understanding; safe fallbacks remain available when they are not installed.

## Test

```bash
npm run test:roundtrip
npm run test:drawio
npm run test:tooltips
npm test
```

## Upstream baseline

This package is pinned to the public `xsession/astro_ui_designer` `main` baseline at commit:

`3dbd68ae47693268e244e20042c05ee665ffff8a` (`Add colorpicker, css editor`)

See `PROJECT_BUILD_MANIFEST.md` for packaging provenance, `docs/LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md` for the round-trip architecture, `docs/RELOCATABLE_DOCKS.md` for docking, `docs/DRAWIO_INTERCHANGE.md` for diagrams.net format mapping and round-trip behavior, and `docs/TOOLTIPS.md` for tooltip coverage and extension rules.

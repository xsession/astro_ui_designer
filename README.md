# Astro UI Designer Pro — Round-trip Full

A dense **Qt Creator / Qt Designer-style visual IDE for Astro and multi-framework UI work**, packaged as a complete local source project. This build combines the current Astro UI Designer architecture with the completed Layout Synth-inspired clean-room round-trip roadmap.

## Included

- 42-component visual palette and responsive designer model.
- Pages, reusable components, component instances, source ownership and source mappings.
- Dense canvas, inspectors, CSS/manual layout tools, color controls and animation model.
- Penpot-inspired design/effects/prototype data, Storybook-inspired Component Lab, and Plasmic-inspired composition model.
- Astro project generation and neutral/multi-platform interchange.
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
npm test
```

## Upstream baseline

This package is pinned to the public `xsession/astro_ui_designer` `main` baseline at commit:

`3dbd68ae47693268e244e20042c05ee665ffff8a` (`Add colorpicker, css editor`)

See `PROJECT_BUILD_MANIFEST.md` for packaging provenance and `docs/LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md` for the round-trip architecture.

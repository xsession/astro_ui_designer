# Architecture

The editor is intentionally layered:

1. `standalone/js/model.js` — neutral project/node model.
2. `registry.js` — component and action schemas.
3. clean-room capability modules — manual layout, CSS, animation, design effects, stories and composition.
4. `app.js` — visual workbench shell and public integration API.
5. `workspace-client.js` + `launch-designer.mjs` — browser/host boundary.
6. `plugin-api.js` — extensibility surface.
7. round-trip modules — source graph, AST bridge, history, neutral IR and adapters.
8. `vscode-extension/` — embedded designer host using the same browser source.

The project file remains JSON and generated output remains ordinary Astro/framework source rather than depending on a proprietary hosted runtime.


## Relocatable Dock Workbench

`standalone/js/dock-layout.js` is the pure layout model for the Qt-style workbench. It owns zone membership, active tabs, floating rectangles, normalization, move/reorder/float operations and section-order helpers. `app.js` binds that model to the three dock strips, floating windows, splitters, document tabs and section drag handles.

The renderer remains source-family aware: a panel keeps its original left/right/bottom renderer contract even after it is moved to a different physical zone or floated. This avoids duplicating panel implementations while allowing arbitrary workbench layout. The same source is mirrored into the VS Code embedded designer. See `RELOCATABLE_DOCKS.md` for gestures and API details.

## Draw.io interchange

`standalone/js/drawio-io.js` is a pure ESM Draw.io/diagrams.net adapter. It decodes `mxfile`/`mxGraphModel` pages, reconstructs freeform nodes, preserves edge metadata, and serializes the project back to editable mxGraph XML. `platform-io.js` registers it as a bidirectional platform adapter. The same modules are mirrored under `vscode-extension/designer/js/`.


## Global tooltip layer (2.15)

`standalone/js/tooltips.js` is a shared presentation/accessibility layer installed once by `app.js`. It combines explicit command metadata with semantic inference for generated controls. A MutationObserver annotates newly rendered workbench/menu nodes, so dynamic panels do not need one-off tooltip wiring. The same module and CSS are mirrored into the VS Code embedded designer.

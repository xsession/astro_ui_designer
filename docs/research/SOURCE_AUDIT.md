# Source audit for documentation coverage

This audit describes the packaged 2.19 source used to generate this documentation.

## Primary runtime modules

| Concern | Representative modules |
|---|---|
| Main workbench shell and public API | `standalone/js/app.js` |
| Project/node model | `standalone/js/model.js`, `project-pages.js` |
| Component registry | `standalone/js/registry.js` |
| Manual/direct editing | `manual-layout.js`, `advanced-manual-edit.js` |
| CSS and color editing | `css-tools.js`, `color-picker.js` |
| Animation | `animation.js` |
| Simulation | `simulation.js` |
| Round-trip core | `roundtrip-engine.js`, `roundtrip-neutral-ir.js`, `roundtrip-conversion.js` |
| Round-trip UI/bridge | `roundtrip-ui.js`, `roundtrip-app-bridge.js`, `roundtrip-adapter-sdk.js` |
| QML | `qml-io.js` |
| Draw.io | `drawio-io.js` |
| Component stories | `storybook-cleanroom.js` |
| Penpot/design metadata | `penpot-cleanroom.js` |
| Composition | `plasmic-cleanroom.js` |
| Plugins | `plugin-api.js`, `standalone/plugins/*` |
| Workspace host client | `workspace-client.js` |
| MCP | `integrations/hermes/mcp/server.mjs`, `project-service.mjs` |

## Coverage strategy

The documentation intentionally has three layers:

- generated reference for registries, backends, MCP tools, commands, workspace methods and package scripts;
- maintained feature documentation for specialist behavior and historical implementation notes;
- architectural/explanatory documentation for invariants and cross-cutting behavior.

The result avoids copying large source tables into hand-maintained Markdown where drift would be likely.

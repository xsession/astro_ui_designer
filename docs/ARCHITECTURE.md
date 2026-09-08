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

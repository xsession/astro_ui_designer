<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->

# Package scripts

Generated from root `package.json` (astro-ui-designer-pro 2.19.0).

| Script | Command |
|---|---|
| `start` | `node launch-designer.mjs` |
| `test` | `node tests/run-all.mjs` |
| `test:visual` | `node tests/visual-smoke.mjs` |
| `generate:example` | `node tests/generate-example.mjs` |
| `test:vscode` | `node vscode-extension/test/run-tests.mjs` |
| `package:vscode` | `node vscode-extension/scripts/package-vsix.mjs` |
| `mcp` | `node integrations/hermes/mcp/server.mjs` |
| `test:hermes` | `node tests/hermes-mcp.test.mjs && node tests/hermes-skill.test.mjs` |
| `hermes:install` | `node integrations/hermes/install.mjs` |
| `test:roundtrip` | `node tests/roundtrip-engine.test.mjs && node tests/roundtrip-adapter-sdk.test.mjs && node tests/roundtrip-neutral-ir.test.mjs && node tests/roundtrip-history.test.mjs && node tests/roundtrip-ui.test.mjs && node tests/roundtrip-node.test.mjs && node tests/roundtrip-conversion.test.mjs && node tests/roundtrip-plugin.test.mjs && node tests/roundtrip-app-bridge.test.mjs && node tests/roundtrip-pwtk.test.mjs && node tests/workspace-roundtrip-files.test.mjs && node tests/roundtrip-qml.test.mjs` |
| `test:drawio` | `node tests/drawio-io.test.mjs && node tests/drawio-app-integration.test.mjs` |
| `test:tooltips` | `node tests/tooltips.test.mjs && node tests/tooltips-app-integration.test.mjs` |
| `test:functional` | `node tests/hotkeys.test.mjs && node tests/page-entities.test.mjs && node tests/tab-functionality.test.mjs` |
| `test:import` | `node tests/project-import-ui.test.mjs && node tests/workspace-roundtrip-files.test.mjs` |
| `test:advanced` | `node tests/manual-canvas-interaction.test.mjs && node tests/advanced-manual-edit.test.mjs` |
| `test:simulation` | `node tests/simulation.test.mjs && node tests/simulation-ui.test.mjs` |
| `docs:generate` | `node docs/scripts/generate-reference.mjs` |
| `docs:diagrams` | `python3 docs/scripts/generate-diagrams.py` |
| `docs:check` | `node docs/scripts/check-docs.mjs` |
| `test:docs` | `npm run docs:generate && npm run docs:check` |

# Product documentation traceability matrix

This matrix connects major product capabilities to implementation, verification and documentation. It is deliberately subsystem-level rather than pretending that every requirement has a formal regulated trace ID.

| Capability / invariant | Primary implementation | Verification examples | Documentation |
|---|---|---|---|
| Project/page/node lifecycle | `model.js`, `project-pages.js` | `model.test.mjs`, `page-entities.test.mjs` | `reference/PROJECT_MODEL.md`, `how-to/manage-pages.md` |
| Dense relocatable workbench | `app.js`, `dock-layout.js`, `functional-workbenches.js` | `dock-layout.test.mjs`, `dock-ui-integration.test.mjs`, `tab-functionality.test.mjs` | `reference/DOCKS_AND_WORKBENCHES.generated.md`, `explanation/DENSE_WORKBENCH_MODEL.md` |
| Editable hotkeys/commands | `hotkeys.js`, `app.js` | `hotkeys.test.mjs` | `reference/COMMANDS_AND_HOTKEYS.generated.md`, `features/HOTKEYS.md` |
| Direct manipulation | `manual-layout.js`, `advanced-manual-edit.js`, `app.js` | `manual-canvas-interaction.test.mjs`, `advanced-manual-edit.test.mjs` | `features/DIRECT_MANIPULATION.md`, `explanation/DIRECT_MANIPULATION_MODEL.md` |
| CSS/color editing | `css-tools.js`, `color-picker.js` | CSS/color utility tests | feature notes + component registry/reference |
| Animation | `animation.js` | animation tests | feature implementation notes |
| Components/stories | `registry.js`, `storybook-cleanroom.js` | story/component-lab tests | `how-to/design-system.md`, generated component registry |
| Project import | `app.js`, `workspace-client.js`, round-trip bridge | `project-import-ui.test.mjs`, workspace round-trip tests | `tutorials/02-import-existing-project.md`, `features/PROJECT_IMPORT.md` |
| Framework detection and round-trip | `roundtrip-engine.js`, adapter modules | 12 round-trip specialist suites | `reference/ROUNDTRIP_BACKENDS.generated.md`, `explanation/ROUNDTRIP_ARCHITECTURE.md` |
| QML | `qml-io.js`, round-trip built-ins | `roundtrip-qml.test.mjs` | `tutorials/04-qml-roundtrip.md`, `features/QML_ROUNDTRIP.md` |
| pwtk | round-trip built-ins/engine | `roundtrip-pwtk.test.mjs` | `features/PWTK_ROUNDTRIP_REVIEW.md` |
| Draw.io interchange | `drawio-io.js` | two Draw.io suites | `how-to/drawio-interchange.md`, `features/DRAWIO_INTERCHANGE.md` |
| Simulation | `simulation.js`, `app.js`, workbench renderer | `simulation.test.mjs`, `simulation-ui.test.mjs` | `tutorials/05-project-simulation.md`, `explanation/SIMULATION_MODEL.md` |
| MCP | `integrations/hermes/mcp/*` | Hermes MCP/skill tests | `tutorials/06-first-mcp-session.md`, `reference/MCP_TOOLS.generated.md`, `explanation/MCP_SAFETY_MODEL.md` |
| Workspace host API | `launch-designer.mjs`, `workspace-tools.mjs`, `workspace-client.js` | workspace/client integration tests | `reference/WORKSPACE_API.generated.md`, `operations/STANDALONE_HOST.md` |
| VS Code host | `vscode-extension/*` | VS Code smoke/package tests | `operations/VSCODE_EXTENSION.md`, feature notes |
| Documentation freshness | `docs/scripts/*` | `npm run docs:check` | `contributor/DOCUMENTATION.md`, `research/DOCUMENTATION_RESEARCH.md` |

## How to use this matrix

When a subsystem changes, follow its row across: change the implementation, extend the relevant tests, update or regenerate the documentation, and modify an ADR if an architecture invariant changed. This is the minimum definition of a documentation-complete feature change.

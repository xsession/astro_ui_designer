# Project build manifest

- Upstream repository: `https://github.com/xsession/astro_ui_designer.git`
- Newest upstream `main` verified during this build: `803474319d39937026d254460c21f471e5103d4f`
- Upstream commit subject: `Add advanced manual editing, simulation, and MCP integration (2.18.0)`
- Integrated target version: `2.19.0-dense-clean-ui`
- Review / packaging date: 2026-09-09

## Provenance

The newest `main` head was fetched and reviewed through the connected GitHub integration. Upstream now contains the 2.18 advanced editing, simulation and MCP integration. The 2.19 release tree uses that complete 2.18 source as its functional baseline and applies the dense-clean UI refactor documented here. The 2.19 source package does not claim that these new local UI changes have been pushed to GitHub.

## Dense-clean UI refactor in 2.19

The UI review found command-bar overload, overly strong tab/card selection states, inspector groups reopening expanded after rerenders, weak visual grouping in long tab strips and canvas chrome competing with the designed content. The 2.19 refactor addresses those without removing features:

- progressive Edit / Arrange / Tools command-bar menus
- directly visible Import and Export paths
- quieter active dock/document tabs with accent-line selection
- subtle right/bottom workflow grouping separators
- flatter workbench cards and lower-contrast panel chrome
- persistent inspector open/collapsed state
- collapsed secondary inspector groups by default
- slightly tighter dock/chrome dimensions while preserving usable hit targets

See `docs/UI_UX_REFACTOR_2_19.md`.

## 2.18 foundation review findings

During integration of advanced editing and simulation, review/testing exposed several concrete defects and gaps:

1. The new Simulation dock was registered in the shell but initially lacked a functional-workbench renderer and tooltip entry.
2. An interrupted Simulation event-log renderer contained a JavaScript syntax error.
3. Multiple delayed prototype interactions on one node could all execute when the earliest timer fired because dispatch was filtered only by trigger, not interaction ID.
4. Simulation attached hover/focus listeners to every node, causing avoidable event/rerender churn; handlers are now attached only when the node models those events.
5. Leaving/re-entering simulation could leave delay scheduling inactive.
6. Plain internal Link components did not navigate matching project routes unless a separate explicit action existed.
7. A marquee selection containing both a parent and descendant could pass both nodes into group transforms, causing double transformations. Multi-object transforms now operate on top-level selected nodes.
8. The previous Hermes MCP server exposed only summary/validation/export. It now exposes controlled semantic editing and deterministic simulation, with finite-number validation and atomic model writes.

## Advanced manual editing

New `advanced-manual-edit.js` contains framework-neutral geometry primitives for selection normalization, marquee hit testing, selection bounds, alignment, distribution, tidy spacing, group scaling/rotation, equal-spacing hints and layer ordering. `app.js` integrates those primitives with the live artboard:

- toggle-click and marquee multi-selection
- multi-object drag/resize/rotate
- group/ungroup
- align/distribute/tidy
- front/back/forward/backward layer ordering
- flip and lock
- ruler-created/draggable guides
- smart snap overlays and Alt measurements
- command-palette/hotkey integration

## Page/project simulation

New `simulation.js` is a deterministic interpreter for the designer's declarative model. It supports project/page scope, prototype flows, route navigation, overlays, state/bindings, visibility conditions, show/hide, text/class/component-state mutations, input/change, hover/focus/submit intent, independent delay interactions and event logging. It explicitly does not execute arbitrary framework source code.

The standalone/VS Code shell adds an F7 Simulation mode and a relocatable Simulation workbench.

## MCP

`integrations/hermes/mcp/server.mjs` now provides:

- `project_summary`
- `validate_project`
- `list_pages`
- `inspect_node`
- `set_node_geometry`
- `arrange_nodes`
- `simulation_start`
- `simulation_event`
- `simulation_state`
- `simulation_reset`
- `export_astro`

Project mutations are restricted to the designer project JSON in `ASTRO_UI_PROJECT_ROOT`. Export paths cannot escape that root.

## Main 2.18 modules

- `standalone/js/advanced-manual-edit.js`
- `standalone/js/simulation.js`
- `standalone/js/app.js`
- `standalone/js/model.js`
- `standalone/js/functional-workbenches.js`
- `standalone/js/tooltips.js`
- `standalone/index.html`
- `standalone/styles.css`
- mirrored VS Code designer sources
- `integrations/hermes/mcp/server.mjs`
- `integrations/hermes/skill-src/astro-ui-designer/skill.md`
- new/expanded tests and documentation

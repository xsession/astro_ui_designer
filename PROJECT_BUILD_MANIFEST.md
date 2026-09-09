# Project build manifest

- Upstream repository: `https://github.com/xsession/astro_ui_designer.git`
- Newest upstream `main` verified during this build: `02b9fcd8b4807ab1de1f4f3fd991b16db5e2bbaa`
- Upstream commit subject: `Extend direct manipulation to all canvas components (2.17.2)`
- Integrated target version: `2.18.0-advanced-simulation-mcp`
- Review / packaging date: 2026-09-09

## Provenance

The newest `main` head was fetched and reviewed through the connected GitHub integration. The 2.18 release tree starts from the complete 2.17.2 direct-manipulation source package corresponding to that upstream head, then applies the changes documented here. The 2.18 source package does not claim that those new local changes have been pushed to GitHub.

## Review findings fixed in 2.18

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

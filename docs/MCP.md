# Astro UI Designer MCP

The project ships a stdio MCP server at `integrations/hermes/mcp/server.mjs` and can be started with:

```sh
npm run mcp
```

Set `ASTRO_UI_PROJECT_ROOT` to the folder containing `designer-project.json` or `.astro-ui.json`.

## Semantic tools

### Read and validate

- `project_summary` — project/model counts and simulation configuration.
- `validate_project` — run designer validation.
- `list_pages` — page IDs, names, routes, filenames, root IDs.
- `inspect_node` — compact semantic node inspection including geometry, actions, bindings, and prototype interactions.

### Controlled project mutation

- `set_node_geometry` — set position, size, rotation, or positioning mode at a responsive breakpoint.
- `arrange_nodes` — align, distribute, tidy spacing, or reorder sibling layers.

Mutation is restricted to the designer project JSON. Spatial arrangement intentionally requires explicit pixel geometry; the MCP server does not guess browser layout that is absent from the serialized model.

### Simulation

- `simulation_start`
- `simulation_event`
- `simulation_state`
- `simulation_reset`

MCP simulation uses the same deterministic action/prototype interpreter as the editor's Simulation mode. Sessions are kept in memory and do not execute arbitrary user code.

### Export

- `export_astro` — generate ordinary Astro files into an output directory contained inside `ASTRO_UI_PROJECT_ROOT`.

## Guardrails

The server resolves a project only from the configured root, writes model mutations atomically to the selected project JSON, and prevents Astro output paths from escaping the root. Source-backed visual changes should still use Round-trip Studio so fingerprints and review plans remain in force.

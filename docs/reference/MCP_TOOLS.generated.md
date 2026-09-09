<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->

# MCP tool reference

Generated from `integrations/hermes/mcp/server.mjs`. Input schemas remain authoritative in source.

| Tool | Purpose |
|---|---|
| `project_summary` | Summarize the Astro UI Designer project model and simulation configuration. |
| `validate_project` | Validate the designer project model and return issues. |
| `list_pages` | List project page entities, routes, filenames, and root node IDs. |
| `inspect_node` | Inspect one designer node semantically, including geometry, actions, bindings, and prototype interactions. |
| `set_node_geometry` | Set explicit node geometry in the designer model at a breakpoint. This mutates only the designer project JSON. |
| `arrange_nodes` | Apply semantic alignment, distribution, tidy spacing, or layer ordering to selected sibling nodes. Spatial operations require explicit pixel geometry. |
| `simulation_start` | Start an in-memory deterministic page/project simulation session. No arbitrary user code is executed. |
| `simulation_event` | Dispatch a declarative event to a node in an MCP simulation session and return updated state/navigation. |
| `simulation_state` | Read current route, state, history, overlays, hotspots, and recent events from a simulation session. |
| `simulation_reset` | Reset an MCP simulation session to a clean deterministic state. |
| `export_astro` | Generate ordinary Astro source files into a contained output directory. |

Total: **11** semantic tools.

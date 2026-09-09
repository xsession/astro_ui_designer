# Astro UI Designer project skill

Use the project-scoped MCP tools to inspect, validate, arrange, simulate, and export Astro UI Designer projects. Prefer semantic project operations over arbitrary filesystem mutation. For source round-trip work, preserve source fingerprints, review patch plans, and reject stale writes.

## Recommended workflow
1. Run `project_summary` and `list_pages` before a large change.
2. Use `inspect_node` to resolve the exact target and its current geometry/actions/bindings.
3. For deterministic designer-model geometry edits, use `set_node_geometry` or `arrange_nodes`. Spatial arrange operations intentionally require explicit pixel geometry; do not guess DOM layout that is not represented in the model.
4. Use `simulation_start`, `simulation_event`, and `simulation_state` to exercise declarative page/project behavior before exporting. The simulator interprets known designer actions and prototype interactions; it does not execute arbitrary project JavaScript or Python.
5. Run `validate_project` after model edits.
6. Use `export_astro` only to a contained output directory.
7. For source-backed visual changes, use the Round-trip Studio review flow rather than bypassing source ownership or fingerprint checks.

## Safety and mutation scope
- MCP geometry/arrangement writes modify only `designer-project.json` or `.astro-ui.json` inside the configured project root.
- Astro export paths are constrained to that root.
- Do not use MCP simulation results as proof that arbitrary source code, network calls, native Qt code, or backend services executed.

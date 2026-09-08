# Astro UI Designer project skill

Use the project-scoped MCP tools to inspect and validate Astro UI Designer project files. Prefer semantic project operations over arbitrary filesystem mutation. For source round-trip work, preserve source fingerprints, review patch plans, and reject stale writes.

## Workflow
1. Run `project_summary` before large changes.
2. Run `validate_project` after project-model edits.
3. Use `export_astro` only to a contained output directory.
4. For source-backed visual changes, use the Round-trip Studio review flow.

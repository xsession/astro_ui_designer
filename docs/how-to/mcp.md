# How to use MCP safely

- Scope the server with `ASTRO_UI_PROJECT_ROOT`.
- Keep project JSON under version control or take a checkpoint before mutations.
- Inspect target IDs before geometry/arrangement writes.
- Validate after mutations.
- Keep exports inside the project root.
- Treat simulation sessions as ephemeral in-memory state.
- Do not add generic shell/filesystem tools to this server merely for convenience; create a narrow semantic tool with explicit validation instead.

# Tutorial: first MCP session

## Prerequisites

A project root containing `designer-project.json` or `.astro-ui.json` and a client capable of stdio MCP.

## Flow

1. Set `ASTRO_UI_PROJECT_ROOT` to the project directory.
2. Start `npm run mcp` through your MCP client configuration; do not wrap the stdio protocol in a shell that injects logging into stdout.
3. Call `project_summary`, then `validate_project`.
4. Call `list_pages` and choose a page/root node.
5. Use `inspect_node` to read semantic geometry/actions/bindings/interactions.
6. Use `set_node_geometry` or `arrange_nodes` only after confirming the target IDs and breakpoint.
7. Start a simulation session, dispatch an event and inspect session state.
8. Export Astro to a contained output directory if required.

MCP intentionally does not expose arbitrary shell execution. See [MCP safety model](../explanation/MCP_SAFETY_MODEL.md).

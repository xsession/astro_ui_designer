# MCP tool reference

## Read/discovery tools

| Tool | Purpose |
| --- | --- |
| `project_summary` | Project revision, paths, mode and high-level counts. |
| `list_pages` | Page IDs, routes, filenames and page-root IDs. |
| `list_components` | Reusable component IDs, props, slots and stories. |
| `list_component_types` | Insertable visual node types and defaults. |
| `get_node` | Full semantic node by stable ID. |
| `search_design` | Search names, IDs, props/text, DOM IDs and CSS classes. |
| `validate_project` | Structural/project diagnostics. |
| `audit_project` | Accessibility, contrast, responsive, SEO and performance audits. |
| `find_usages` | References to shared components/assets/mixins/tokens/variants/queries/contexts. |
| `list_platforms` | Import/export adapter capabilities and fidelity notes. |
| `generated_source` | Inspect generated project source without writing files. |

## Mutation tools

All mutations save `designer-project.json` atomically. Prefer the most recent `expectedRevision`.

| Tool | Purpose |
| --- | --- |
| `create_page` | Create route/page/root. |
| `add_node` | Insert a typed visual node beneath a parent. |
| `update_node` | Patch name, props, styles, metadata, variant/state or visibility. |
| `delete_node` | Delete a non-root node. |
| `add_action` | Add a web interaction/action. |
| `add_animation` | Add a preset or simple property animation. |
| `add_story` | Add a Component Lab story. |
| `create_query` | Add static/collection/HTTP/GraphQL/expression query metadata. |
| `apply_template` | Instantiate a saved Composition template. |
| `export_project` | Write Astro or interchange output inside the workspace. |

## Revision conflicts

A mutation may fail with a revision conflict when the UI, VS Code extension, or another agent has changed the project since the last read. Call `project_summary` again, re-read affected nodes, reconcile intent, and retry with the new revision.

## MCP tool names in Hermes

Hermes prefixes server tools. If the server key is `astro-ui-designer`, a tool such as `project_summary` appears as a name equivalent to `mcp_astro_ui_designer_project_summary`. Let Hermes select tools naturally; do not hard-code the prefixed form unless debugging.

---
name: astro-ui-designer
description: Operate Astro UI Designer projects through its project-scoped MCP server. Use when creating or reviewing Astro pages, components, responsive layouts, interactions, animations, Component Lab stories, data queries, design-system composition, audits, or multi-platform exports in an Astro UI Designer `designer-project.json` workspace. Prefer this skill when Hermes has the `astro-ui-designer` MCP server connected and the user wants visual-design model changes rather than ad-hoc edits to generated files.
---

# Astro UI Designer

Use the Astro UI Designer MCP server as the semantic editing surface for designer-managed UI work.

## Core workflow

1. Call `project_summary` before making changes. Keep its `revision` for optimistic concurrency.
2. Discover existing structure with `list_pages`, `list_components`, `search_design`, and `get_node`.
3. Call `list_component_types` before inserting unfamiliar node types.
4. Reuse existing components/templates before creating duplicate structures.
5. For edits, pass `expectedRevision` from the most recent read whenever practical.
6. Make small semantic changes with `create_page`, `add_node`, `update_node`, `delete_node`, `add_action`, `add_animation`, `add_story`, `create_query`, or `apply_template`.
7. Re-read project state after any revision conflict. Never retry a stale mutation blindly.
8. Run `validate_project` after structural changes and `audit_project` before declaring UI work complete.
9. Resolve validator errors first; then address relevant accessibility, contrast, responsive, SEO, and performance findings.
10. Use `generated_source` to inspect generated code without writing it. Use `export_project` only when the design model is valid.

## Editing rules

- Treat stable node IDs as authoritative. Do not identify nodes only by display text when an ID is available.
- Prefer model edits over directly editing generated Astro output. Generated output is a product of the semantic project model.
- Respect `sourceOwnership` metadata. Avoid structural rewrites of code-owned nodes; make only changes explicitly permitted by the project workflow.
- Keep responsive styling in breakpoint maps such as `style.base`, `style.tablet`, and `style.mobile` rather than duplicating nodes for each viewport.
- Prefer CSS animation export for declarative load/hover/focus/scroll motion and WAAPI for runtime-controlled click/manual/in-view motion.
- Use Component Lab stories for reusable components that have meaningful variants, states, or interactions.
- Keep queries local to the generated application. Do not put secrets in query definitions or designer JSON.
- Use project-wide `find_usages` before replacing or deleting shared components, mixins, tokens, variants, queries, contexts, or assets.
- Export only inside the project workspace; the MCP server intentionally rejects path traversal.

## Common tasks

### Build a new page

Call `project_summary` → `list_component_types` → `create_page`. Use the returned root ID with `add_node` to build Section/Container/Flex/Grid hierarchy. Add actions/bindings only after the structure is stable. Finish with validation and audits.

### Improve an existing page

Search by visible text or node name, inspect the exact node, patch only the required props/styles, then validate. Use `find_usages` before changing shared design-system references.

### Add behavior or motion

Attach semantic actions with `add_action`. Use `add_animation` for motion and choose `engine:auto` unless the user explicitly wants CSS or WAAPI. Re-run accessibility/reduced-motion review afterward.

### Prepare reusable components

Use `list_components`, inspect component roots, and add Component Lab stories with `add_story`. Ensure representative default/variant/state stories exist before export.

### Export

Use `generated_source` for review. Use `export_project(target="astro")` for the native full-fidelity result. Treat React/Vue/Svelte/HTML/SVG/Penpot/Figma bridge outputs as interchange outputs with possible fidelity loss.

## References

Read `references/mcp-tools.md` when choosing tools or interpreting arguments.
Read `references/workflows.md` for page, review, component, animation, and export workflows.
Read `references/hermes-setup.md` when configuring Hermes MCP or installing this skill.

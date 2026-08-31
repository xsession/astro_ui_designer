# Hermes Agent integration

Astro UI Designer 2.8.0 includes a local MCP server and a reusable `astro-ui-designer` skill for Hermes Agent.

## Goals

The integration gives Hermes semantic control of a single Astro UI Designer project without exposing a generic shell or unrestricted filesystem surface. It is intended for tasks such as:

- inspect and review a visual Astro project;
- build pages from existing design-system primitives;
- patch node properties/styles with stable IDs;
- add interactions and CSS/WAAPI animations;
- add Component Lab stories;
- add app-local query descriptors;
- run structural and UI audits;
- find usages before refactors;
- inspect generated source;
- export native Astro or supported interchange targets.

## Hermes compatibility

Hermes Agent has a native MCP client. It discovers server tools at startup and prefixes them with the configured server name. With a server key of `astro-ui-designer`, `project_summary` is exposed internally as a name equivalent to `mcp_astro_ui_designer_project_summary`.

Hermes skills are progressively loaded from `~/.hermes/skills/`. The included skill therefore contains concise operating rules and separate references for tools, workflows, and setup.

## MCP server

Entry point:

```text
integrations/hermes/mcp/server.mjs
```

Transport: stdio JSON-RPC, one JSON message per line.

Protocol compatibility:

- current MCP discovery: `server/discover`, revision `2026-07-28`;
- legacy initialization: `initialize`, including 2025 protocol revisions used by existing clients.

The server exposes tools, resources, and prompts.

### Read/discovery tools

- `project_summary`
- `list_pages`
- `list_components`
- `list_component_types`
- `get_node`
- `search_design`
- `validate_project`
- `audit_project`
- `find_usages`
- `list_platforms`
- `generated_source`

### Mutation tools

- `create_page`
- `add_node`
- `update_node`
- `delete_node`
- `add_action`
- `add_animation`
- `add_story`
- `create_query`
- `apply_template`
- `export_project`

### Resources

- `aui://project/summary`
- `aui://project/validation`
- `aui://component-registry`
- `aui://platform-adapters`

### Prompts

- `build-page`
- `review-ui`
- `component-quality`

## Safety model

### One project per server

Start the server with one explicit `designer-project.json`. It does not expose arbitrary filesystem browsing.

### Atomic writes

Every mutation loads the current project, applies one semantic operation, writes a temporary file, then atomically replaces the project file.

### Revision checks

Read tools return a short SHA-256 revision. Mutation tools accept optional `expectedRevision`. A stale revision returns a tool error instead of overwriting concurrent UI/VS Code changes.

### Read-only mode

Append `--read-only` to the server arguments to keep all analysis tools but reject mutations.

### Export containment

`export_project` only accepts relative output paths and rejects any path that escapes the directory containing `designer-project.json`.

### No generic shell

The server intentionally does not provide shell execution, arbitrary file reads, or arbitrary file writes. Hermes can use its own separately configured tools when such access is actually required and approved.

## Install with the helper

```bash
node integrations/hermes/install.mjs \
  --project /absolute/path/to/my-project/designer-project.json
```

This copies the skill into:

```text
~/.hermes/skills/astro-ui-designer/
```

and prints the MCP registration command.

To perform the registration automatically:

```bash
node integrations/hermes/install.mjs \
  --project /absolute/path/to/my-project/designer-project.json \
  --apply
```

If a server entry already exists and should be replaced:

```bash
node integrations/hermes/install.mjs \
  --project /absolute/path/to/my-project/designer-project.json \
  --apply --replace
```

## Manual Hermes MCP registration

```bash
hermes mcp add astro-ui-designer \
  --command node \
  --connect-timeout 30 \
  --args /absolute/path/to/astro-ui-designer/integrations/hermes/mcp/server.mjs \
         --project /absolute/path/to/my-project/designer-project.json

hermes mcp test astro-ui-designer
```

`--args` must be the final Hermes option because all following values belong to the stdio server command.

Equivalent `~/.hermes/config.yaml` fragment:

```yaml
mcp_servers:
  astro-ui-designer:
    command: "node"
    args:
      - "/absolute/path/to/astro-ui-designer/integrations/hermes/mcp/server.mjs"
      - "--project"
      - "/absolute/path/to/my-project/designer-project.json"
    timeout: 120
    connect_timeout: 30
    supports_parallel_tool_calls: false
```

## Recommended Hermes workflow

1. Read `project_summary`.
2. Inspect pages/components and search the design.
3. Use stable node IDs for edits.
4. Pass the latest `expectedRevision` for mutations when practical.
5. Validate after structural changes.
6. Run accessibility/contrast/responsive/SEO/performance audits before completion.
7. Inspect generated source.
8. Export Astro only after validator errors are resolved.

## Skill source and package

Skill source:

```text
integrations/hermes/skill-src/astro-ui-designer/
```

The release process validates and packages this directory as `skill.zip`.

## CSS editing through MCP

`update_node` can patch normal responsive `style`, pseudo-state maps through `cssStates`, and node-scoped custom properties through `cssVariables`. This keeps Hermes on the semantic project model without exposing arbitrary stylesheet or filesystem mutation.

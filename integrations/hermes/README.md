# Hermes Agent integration

Astro UI Designer provides two complementary Hermes integrations:

1. a project-scoped MCP server (`mcp/server.mjs`), and
2. an `astro-ui-designer` skill that teaches Hermes the safe workflow for using those tools.

The MCP server is dependency-free Node.js and speaks newline-delimited JSON-RPC over stdio. It supports the current MCP `2026-07-28` discovery handshake plus the 2025 initialize handshake used by legacy clients. It exposes UI/project semantics, not a generic shell or filesystem API.

## Quick setup

```bash
node integrations/hermes/install.mjs --project /absolute/path/to/designer-project.json
```

This copies the skill to `~/.hermes/skills/astro-ui-designer` and prints the exact MCP command. Add `--apply` to run `hermes mcp add` and `hermes mcp test` automatically when the Hermes CLI is installed.

To replace an existing MCP entry:

```bash
node integrations/hermes/install.mjs \
  --project /absolute/path/to/designer-project.json \
  --apply --replace
```

For inspection-only use, configure the server with an additional `--read-only` argument.

## Manual Hermes MCP setup

```bash
hermes mcp add astro-ui-designer \
  --command node \
  --connect-timeout 30 \
  --args /absolute/path/to/integrations/hermes/mcp/server.mjs \
         --project /absolute/path/to/designer-project.json

hermes mcp test astro-ui-designer
```

Hermes prefixes discovered tools with the server name, e.g. `project_summary` becomes `mcp_astro_ui_designer_project_summary` internally.

## Safety model

- One `designer-project.json` per MCP server process.
- Atomic project writes.
- Optional optimistic `expectedRevision` on mutations.
- Optional `--read-only` mode.
- Export paths must remain inside the project workspace.
- No arbitrary shell command tool.
- No arbitrary file read/write tool.
- Generated files are reviewed with `generated_source`; semantic project changes should use MCP model tools.

## Skill

Source: `skill-src/astro-ui-designer/`

The release build also includes a separately validated `skill.zip`, packaged using the skill validator/packager.

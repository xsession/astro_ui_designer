# Hermes Agent setup

Hermes Agent loads skills from `~/.hermes/skills/` and can connect local stdio MCP servers from `~/.hermes/config.yaml`.

## MCP configuration

Use the Hermes CLI when available:

```bash
hermes mcp add astro-ui-designer --command node --args /ABS/PATH/integrations/hermes/mcp/server.mjs --project /ABS/PATH/TO/designer-project.json
hermes mcp test astro-ui-designer
```

`--args` must be the final Hermes option because subsequent values are arguments for the stdio server.

Equivalent configuration:

```yaml
mcp_servers:
  astro-ui-designer:
    command: "node"
    args:
      - "/ABS/PATH/integrations/hermes/mcp/server.mjs"
      - "--project"
      - "/ABS/PATH/TO/designer-project.json"
    timeout: 120
    connect_timeout: 30
    supports_parallel_tool_calls: false
```

Use `--read-only` after the project path when the agent should inspect but never mutate.

## Skill installation

Copy this `astro-ui-designer` skill directory to:

```text
~/.hermes/skills/astro-ui-designer/
```

Start a new Hermes session after installing, or use the Hermes mechanism that refreshes skill discovery for the current session.

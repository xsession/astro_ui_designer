# C2 — Containers

Runtime decomposition of Astro UI Designer Pro. Four containers:

| Container | Technology | Responsibility |
|-----------|------------|----------------|
| **Browser IDE Shell** | Chrome/Chromium + HTML/CSS/ES modules | The entire user-facing application: state, rendering, direct manipulation, workbenches, public API (`window.AstroUIDesigner`) |
| **Local Host** | Node.js v22.20.0 (`launch-designer.mjs`) | Static file server + workspace file API (list/read/write project folders, loopback-only, project-root scoped) at 127.0.0.1:8766 |
| **MCP Server** | Node.js (`integrations/hermes/mcp/server.mjs`) | Semantic MCP tools (project read, selection, property edit, export, round-trip ops) over stdio for AI agents |
| **VS Code Extension** | VS Code webview | Hosts the byte-identical browser shell inside VS Code (mirror of `standalone/`) |

## Container relationships
- Browser IDE Shell <--> Local Host: HTTP over loopback (files, workspace
  API). The shell is unusable without the host (modules are served from it).
- AI Agent --> MCP Server: MCP over stdio.
- MCP Server --> Local Host: drives the same designer state via the public
  API / workspace endpoints.
- VS Code Extension: self-contained copy of the Browser IDE Shell
  (byte-identical mirror, enforced by cmp gate + test SVC-026).
- Browser IDE Shell <--> File System (via Local Host): project folders,
  export targets.

![C2 containers](diagrams/c2-container.png)

See also: AUID-SAD-003 sections 4 (interfaces).

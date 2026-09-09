# 7. Deployment view

## Standalone

Browser designer ↔ local Node host over localhost HTTP. The host serves static designer files and scoped `/api/*` workspace/Git/preview/round-trip operations. Target preview servers are separate child processes when explicitly started.

## VS Code

Designer webview ↔ extension host message bridge ↔ VS Code workspace/Git/tasks/diagnostics/test APIs. Workspace trust gates privileged operations.

## MCP

Local agent client ↔ stdio MCP server process ↔ project JSON and contained export directory. MCP simulation sessions remain process-memory state.

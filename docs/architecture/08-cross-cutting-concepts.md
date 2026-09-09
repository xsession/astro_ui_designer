# 8. Cross-cutting concepts

## Identity
Stable IDs connect model, source mappings, tests, comments, simulation and MCP.

## Mutation discipline
Use project snapshots/history in the UI; use fingerprint/checkpoint review for source writes; use atomic file replacement for MCP project mutations.

## Responsive styling
Base style plus breakpoint overrides; visual tools must target the active layer.

## Capability honesty
Backends expose supported/partial/unsupported operations. Documentation uses a controlled status vocabulary.

## Security
Privilege lives in hosts, not arbitrary webview code. Paths are contained, imported code is not executed by simulation, and MCP authority is semantic.

## Extensibility
Plugins and backend/source/test/token/provider contribution points keep vendor-specific logic out of core behavior.

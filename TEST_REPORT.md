# Astro UI Designer 2.18.0 — test report

**Release:** `2.18.0-advanced-simulation-mcp`  
**Upstream reviewed:** `02b9fcd8b4807ab1de1f4f3fd991b16db5e2bbaa` (`Extend direct manipulation to all canvas components (2.17.2)`)  
**Date:** 2026-09-09

## Aggregate regression

`npm test` passes **29/29 suites**:

- model/schema migration
- round-trip engine, adapter SDK, neutral IR, history, UI, node runtime, conversion, plugin, app bridge
- pwtk and Qt/QML round-trip
- workspace round-trip files and project-import UI
- Draw.io IO + app integration
- runtime modules
- dock model + dock UI integration
- tooltip core + app integration
- Component Lab integration
- hotkeys
- page entities
- 42-tab functionality audit
- direct canvas interaction
- advanced manual-editing geometry primitives
- deterministic simulation model
- simulation UI integration

## Specialized suites

| Command | Result |
| --- | --- |
| `npm run test:advanced` | PASS — 2/2 |
| `npm run test:simulation` | PASS — 2/2 |
| `npm run test:hermes` | PASS — MCP + skill |
| `npm run test:vscode` | PASS |
| `npm run test:visual` | PASS |
| `npm run test:roundtrip` | PASS — 12/12 |
| `npm run test:drawio` | PASS — 2/2 |
| `npm run test:tooltips` | PASS — 2/2 |
| `npm run package:vscode` | PASS — VSIX 2.18.0 |
| `npm run generate:example` | PASS — 8 Astro files |

## Advanced-editing regression points

- all unlocked non-root components remain directly manipulable
- top-level selection normalization prevents nested parent/child double transforms
- multi-object geometry math covers selection bounds, alignment, distribution, tidy spacing, scaling, rotation and layer ordering
- active-breakpoint geometry and flow-to-absolute behavior remain covered by direct-manipulation tests
- 42 registered dock/workbench tabs all have functional renderer paths

## Simulation regression points

- project/page scope
- route navigation and page-scope navigation blocking
- state bindings and two-way input updates
- visibility conditions
- independent delayed interactions by interaction ID
- navigation history/back
- plain internal Link route behavior
- Simulation shell/workbench/command/F7 integration

## MCP regression points

The stdio MCP regression starts a real child process and verifies:

- initialize + version 2.18.0
- semantic tool inventory
- project summary and node inspection
- persisted geometry mutation
- sibling alignment
- deterministic simulation start/event/state/reset
- project JSON remains readable after mutation

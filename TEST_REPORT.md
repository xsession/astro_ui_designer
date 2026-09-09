# Astro UI Designer 2.19.0 — test report

**Release:** `2.19.0-dense-clean-ui`  
**Upstream reviewed:** `803474319d39937026d254460c21f471e5103d4f` (`Add advanced manual editing, simulation, and MCP integration (2.18.0)`)  
**Date:** 2026-09-09

## Aggregate regression

`npm test` passes **30/30 suites**:

- model/schema migration
- round-trip engine, adapter SDK, neutral IR, history, UI, node runtime, conversion, plugin and app bridge
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
- advanced manual editing
- deterministic simulation model
- simulation UI integration
- **dense-clean UI structure/disclosure/parity regression**

## Specialized suites

| Command | Result |
| --- | --- |
| `npm test` | PASS — 30/30 |
| `node tests/ui-density.test.mjs` | PASS |
| `npm run test:advanced` | PASS — 2/2 |
| `npm run test:simulation` | PASS — 2/2 |
| `npm run test:hermes` | PASS — MCP + skill |
| `npm run test:vscode` | PASS |
| `npm run test:visual` | PASS |
| `npm run test:roundtrip` | PASS — 12/12 |
| `npm run test:drawio` | PASS — 2/2 |
| `npm run test:tooltips` | PASS — 2/2 |
| `npm run package:vscode` | PASS — VSIX 2.19.0 |
| `npm run generate:example` | PASS — 8 Astro files |

## Dense-clean UI regression points

- Edit / Arrange / Tools progressive-disclosure menus exist
- low-frequency command buttons remain in the DOM with their original IDs and handlers
- Import remains a directly visible top-level action
- mode switch remains directly available
- dock/document tabs use a restrained active indicator
- right/bottom tab strips retain all relocatable tabs and add only visual grouping
- inspector secondary sections are collapsed by default
- disclosure state persists under `astro-ui-designer-section-disclosure-v1`
- standalone and VS Code embedded UI sources remain byte-identical for HTML, CSS, app and workbench renderer

## Static checks

- **121** JS/MJS files syntax checked, **0 failures**
- **84** runtime source files scanned for relative imports
- **173** runtime relative import references checked, **0 missing**

## Documentation regression

- `npm run test:docs`: PASS
- `docs/scripts/check-drawio.py`: PASS (14 pages, 0 issues)
- Aggregate product suite after documentation refactor: PASS (30/30)
- Hermes MCP/skill: PASS
- VS Code source smoke/package: PASS

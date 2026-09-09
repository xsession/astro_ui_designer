# Astro UI Designer 2.18.0 — validation

**Integrated version:** `2.18.0-advanced-simulation-mcp`  
**Newest upstream head verified:** `02b9fcd8b4807ab1de1f4f3fd991b16db5e2bbaa` (`Extend direct manipulation to all canvas components (2.17.2)`)  
**Validation date:** 2026-09-09

## Source review

The connected GitHub integration was queried before continuing the release. The latest `main` head is the 2.17.2 direct-manipulation commit above. No newer remote delta needed merging before the 2.18 work.

The 2.18 review/fix pass resolved the simulation renderer/tooltip wiring gaps, the interrupted JavaScript syntax defect, delayed-interaction over-dispatch, unnecessary simulation event listeners, stale delay scheduling on mode re-entry, missing native internal-link navigation, nested multi-selection double transforms, and the very limited previous MCP surface.

## Functional validation

- aggregate regression: **29/29 PASS**
- advanced manual editing: **PASS**
- page/project simulation model/UI: **PASS**
- Hermes MCP + skill: **PASS**
- round-trip backends: **12/12 PASS**
- Draw.io: **2/2 PASS**
- tooltips: **2/2 PASS**
- functional workbenches / 42 relocatable tabs: **PASS**
- VS Code source smoke: **PASS**
- structural visual smoke: **PASS**
- VSIX 2.18.0 packaging: **PASS**
- Astro example generation: **PASS**

## Static validation

- JavaScript/MJS syntax checked: **120 files, 0 syntax failures**
- runtime relative import references checked: **215, 0 missing**
- standalone/VS Code designer source parity: **PASS**

## Host smoke

The standalone launcher started successfully on a temporary local port and returned:

- editor HTML: **HTTP PASS**
- workspace info API: **PASS**
- 2.18 launcher banner: **PASS**

The environment's managed Chromium policy blocks navigation to `127.0.0.1` with an organization-policy interstitial, so a fresh headless-browser interaction run could not be used as a release gate in this pass. Browser-level direct-manipulation behavior had already been validated for the 2.17.2 upstream baseline; 2.18's new geometry/simulation behavior is covered by deterministic module and UI integration regressions instead.

## Security/scope checks

- MCP project model mutations are constrained to `designer-project.json` / `.astro-ui.json` in `ASTRO_UI_PROJECT_ROOT`.
- MCP geometry input rejects non-finite numbers.
- MCP model writes use a temporary file + rename.
- MCP Astro export rejects paths that escape the configured root.
- Simulation does not execute arbitrary project JavaScript, Python, QML/C++, network calls or backend code.
- Source-backed write-back remains routed through Round-trip Studio review/fingerprint checks.

## Release gate

**PASS**, subject to the explicit native/browser-runtime limitations above. The release is ready to package as the complete 2.18 source archive.

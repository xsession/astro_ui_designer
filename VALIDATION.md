# Astro UI Designer 2.12.0 Round-trip Full — validation

**Upstream baseline:** `xsession/astro_ui_designer` commit `3dbd68ae47693268e244e20042c05ee665ffff8a`  
**Integrated version:** `2.12.0-roundtrip-full`  
**Validation date:** 2026-09-08

## Passed checks

- Dedicated Layout Synth-inspired round-trip suite: **9 / 9 PASS**
- Aggregate source test runner: **11 / 11 suites PASS**
- Browser/host syntax check: **84 JS/MJS files PASS**
- Relative import resolution across standalone + VS Code mirror: **PASS**
- Local designer HTTP launcher + workspace info API: **PASS**
- Generated Astro example: **PASS**
- Visual shell structural smoke: **PASS**
- VS Code embedded source smoke: **PASS**
- VSIX source package build: **PASS**
- Hermes MCP protocol smoke: **PASS**
- Hermes skill smoke: **PASS**

## Round-trip coverage

- Astro, React/TSX, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI and LVGL backend descriptors/adapters.
- Official-parser hooks for Astro, TypeScript/JSX, Vue, Svelte, Python AST and tree-sitter C with conservative fallbacks.
- Stable source identity, source fingerprints and stale-write rejection.
- Project graph, recursive watcher, source/design dirty state and conflict handling.
- Property-level reviewed patch plans and source diff UI.
- Source checkpoints, audit history and reviewed rollback.
- Neutral IR import/export and cross-framework conversion.
- Standalone and VS Code workspace runtime parity.

## Packaging note

This is the complete runnable source package. Historical generated binaries/screenshots from earlier upstream releases are not required for execution and were regenerated or omitted rather than treated as source-of-truth files.

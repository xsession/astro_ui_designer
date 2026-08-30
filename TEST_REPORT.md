# Astro UI Designer Pro — verification report

**Version:** 2.7.0-hermes  
**Date:** 2026-08-30

## Final result

```text
ALL TESTS PASSED (27 designer suites)
VS Code extension tests: 8 / 8 passed
Hermes MCP protocol/integration: PASS
Hermes skill validator/package: PASS
Rendered visual checkpoints: 14
VSIX archive integrity: PASS
skill.zip archive integrity: PASS
```

## Designer regression suites

```text
model.test                    PASS
hermes-mcp.test               PASS
hermes-skill.test             PASS
plasmic-cleanroom.test        PASS
storybook-cleanroom.test      PASS
penpot-cleanroom.test         PASS
platform-io.test              PASS
animation.test                PASS
validator.test                PASS
exporter.test                 PASS
research-features.test        PASS
workspace-tools.test          PASS
plugin-api.test               PASS
export-research.test          PASS
gui-elements.test             PASS
shell-controls.test           PASS
ux-regression.test            PASS
editor-panels.test            PASS
interaction-parity.test       PASS
gui-browser.test              PASS
plasmic-browser.test          PASS
storybook-browser.test        PASS
research-browser.test         PASS
penpot-browser.test           PASS
animation-browser.test        PASS
visual-smoke                  PASS
generate-example              PASS
```

## Hermes Agent / MCP verification

`hermes-mcp.test.mjs` launches the real dependency-free stdio server against a temporary copy of `designer-project.json` and verifies:

```text
MCP 2026-07-28 server/discover         PASS
2025 initialize compatibility          PASS
tools/list                              PASS
resources/list + resources/read         PASS
prompts/list + prompts/get               PASS
project_summary                          PASS
semantic add_node mutation               PASS
validate_project                         PASS
Astro export to contained workspace      PASS
stale expectedRevision rejection         PASS
workspace path traversal rejection       PASS
--read-only mutation rejection           PASS
```

The MCP server exposes project semantics only. It does not expose a generic shell or arbitrary filesystem read/write surface.

The skill source at `integrations/hermes/skill-src/astro-ui-designer/` passes the skill validator and is packaged as `integrations/hermes/dist/skill.zip`. The release also returns the same validated package separately as `skill.zip` for direct installation/distribution.

## Current GUI coverage summary

```text
42 component types
39 browser-tested palette widgets
56 common style/layout fields
24 action types
47 persistent shell controls
8 application menus
5 left-dock destinations
10 right-inspector destinations
22 bottom-workbench destinations
14 rendered visual checkpoints
```

The Plasmic clean-room coverage remains green for rich code-component contracts, global variants, mixins, contexts/actions, app-local queries, templates, usage/refactor tools and Composition/Queries/Templates/Usages GUI paths.

The Storybook-inspired Component Lab, Penpot-derived design/prototype/interchange layer, CSS/WAAPI animation workbench, UI/UX regression suite, source-aware Astro workspace and multi-platform import/export suites all remain green.

## VS Code extension

The extension's offline verification covers:

```text
manifest contributions
JavaScript parse without build step
Astro/React/Vue/Svelte workspace discovery
workspace path/traversal safety
CSP/webview bridge generation
VS Code workspace request bridge
public designer integration API
packaged module resolution
```

The same 2.7.0 designer core is embedded in `vscode-extension/designer/`, so browser/desktop and VS Code editions do not diverge.

A real Extension Development Host launch is not executed in this build environment because a VS Code executable is not installed. The locally packaged VSIX is nevertheless archive-validated and its extension-side offline tests pass.

## Generated Astro project

The example generator emits 23 files and includes composition artifacts alongside the existing Component Lab/animation/project output:

```text
src/data/ui-queries.ts
src/composition/ui-composition.json
src/composition/ui-contexts.json
component-lab/portable-stories.json
component-lab/component-manifest.json
```

No visual-builder runtime service is required by ordinary generated pages.

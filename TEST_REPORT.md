# Test Report — Research + Animation + UX Edition

**Version:** 2.3.0-ux  
**Date:** 2026-08-25

## Current automated suite

`npm test` executes 18 independent suites:

1. `model.test.mjs` — schema v4, project editing and migration.
2. `animation.test.mjs` — animation model, presets, arbitrary keyframes, CSS/WAAPI code generation and export.
3. `validator.test.mjs` — structural/action/binding validation.
4. `exporter.test.mjs` — baseline Astro generation and ZIP behavior.
5. `research-features.test.mjs` — source maps, ownership, states, variants, container rules, DTCG, content/data/locales/audits and restricted expressions.
6. `workspace-tools.test.mjs` — safe workspace scanning plus Astro/React/Vue/Svelte component introspection.
7. `plugin-api.test.mjs` — contribution kinds and bundled research providers.
8. `export-research.test.mjs` — research feature artifacts and Astro output.
9. `gui-elements.test.mjs` — complete registered component/style/action model matrix.
10. `shell-controls.test.mjs` — permanent shell/menu/dock controls.
11. `ux-regression.test.mjs` — compact shell geometry, discoverable tabs, first-use actions, dock collapse/restore, Focus mode and animation progressive disclosure.
12. `editor-panels.test.mjs` — project/component/assets/state/token/object/action workflows.
13. `interaction-parity.test.mjs` — freeform alignment/distribution/resize/z-order/keyboard/context interactions.
14. `gui-browser.test.mjs` — rendered palette/property/action interaction matrix.
15. `research-browser.test.mjs` — Sources/Variants/Data/Content/Locales/Tests/Audit/Git/Integrations rendered workflows.
16. `animation-browser.test.mjs` — rendered animation timeline, keyframes, transport, CSS/JS backend, scroll controls and export.
17. `visual-smoke.mjs` — rendered geometry and screenshot checkpoints.
18. `generate-example.mjs` — reference Astro project ZIP generation.

## Current UI matrix

The automated GUI matrix covers:

- 36 registered component types;
- 54 shared style/layout fields;
- 18 action types;
- 44 static/persistent shell controls;
- 8 menus;
- 5 left dock tabs;
- 7 right inspector tabs;
- 13 bottom workbench tabs.

The browser suite performs real DOM interaction through the included Chromium DevTools Protocol harness instead of only calling model functions.

## Visual checkpoints

Generated under `tests/screenshots/`:

1. `01-desktop-1920x1080.png`
2. `02-compact-1366x768.png`
3. `03-freeform-multiselect-1600x900.png`
4. `04-preview-1600x900.png`
5. `05-split-source-1600x900.png`
6. `06-research-workbench-1600x900.png`
7. `07-animation-editor-1600x900.png`
8. `08-animation-compact-1366x768.png`
9. `09-focus-mode-1366x768.png`

Baseline review images are retained in `tests/screenshots/before/`.

The geometry assertions verify:

- no horizontal/vertical shell overflow;
- left/right docks stay inside the viewport;
- dock/canvas/bottom regions do not overlap;
- the minimized bottom dock and status bar own separate rows;
- toolbar min-content does not force hidden application width;
- Preview does not retain designer-only resize/selection artifacts;
- compact animation source controls remain above the status bar;
- Focus mode gives the complete viewport width to the canvas;
- no uncaught browser errors.

## Defects found by the expanded testing

The regression system has caught multiple real defects, including:

- a syntax defect in reusable-component creation;
- designer badges leaking into Preview DOM;
- stale responsive breakpoint state surviving New Project;
- localStorage dock persistence errors in restricted browser environments;
- compact-width toolbar wrapping/overflow;
- an unsafe first expression-evaluator implementation that could escape a superficial allowlist;
- active tab scrolling moving the whole application horizontally;
- toolbar min-content forcing the right inspector off-screen at 1600 px;
- animation unit labels forcing a 2190 px intrinsic document width;
- animation normalization replacing track objects and breaking live keyframe edits;
- side-dock `display:none` triggering CSS Grid auto-placement and collapsing the canvas to zero width;
- the minimized bottom splitter causing the bottom workbench and status bar to share a grid row;
- generated animation-code controls extending behind the status bar at compact width.

The final UX-specific fixes are documented in `docs/UI_UX_AUDIT_AND_FIXES.md`.

## Final result

```text
ALL TESTS PASSED (18 suites)
```

The final ZIP integrity check is performed separately after packaging.

## External build boundary

The designer and its generated source/ZIP are tested locally. A real target project's `astro dev`/`astro build` still depends on that project's installed dependencies and package environment. The editor does not silently install packages.

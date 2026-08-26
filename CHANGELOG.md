# Changelog

## 2.3.0-ux — 2026-08-25

### Canvas-first shell refinement

- Changed the default bottom workbench from a permanently open 170 px panel to a 30 px tabs-only strip.
- Added open-on-tab, re-click-to-collapse and dedicated expand/collapse behavior.
- Added independent left/right panel toggles and reversible F11 Focus Canvas mode.
- Added explicit overflow menus for left, right and bottom dock destinations.
- Added horizontal mouse-wheel navigation for compact tab strips.
- Made toolbar actions contextual and state-aware rather than permanently presenting invalid tools.

### Palette, canvas and inspector

- Replaced the clipped two-column palette with a one-column list and collapsible counted categories.
- Added `/` keyboard focus for Palette search.
- Added root quick-start actions for Section, Container and Freeform/HMI authoring.
- Improved nested empty-container insertion guidance.
- Strengthened inspector hierarchy, field borders, focus states and saved/modified status communication.

### Animation UX

- Added generated-code progressive disclosure with explicit collapsed/expanded state.
- Balanced animation settings/timeline/detail rows for 1366×768.
- Kept five animation-settings columns on normal laptop widths.
- Prevented generated CSS/JavaScript controls from extending behind the status bar.

### Critical layout fixes found during review

- Assigned stable workspace grid columns so hiding a side dock cannot auto-place the inspector into the canvas column.
- Assigned stable application grid rows so removing the minimized splitter cannot overlap the bottom dock and status bar.
- Preserved deterministic restoration of all panels after Focus mode.

### Verification

- Added `ux-regression.test.mjs`.
- Expanded the complete suite to 18 passing suites.
- Expanded visual regression to nine checkpoints, including compact animation and Focus mode.
- Added `docs/UI_UX_AUDIT_AND_FIXES.md` with measured findings and remediation evidence.
## 2.2.0-animation — 2026-08-25

### Animation editor

- Replaced the minimal timeline editor with a full bottom-dock animation workbench.
- Added multi-track, arbitrary keyframes, keyframe dragging, scrubbing and transport controls.
- Added CSS and Web Animations API export backends with Auto backend selection.
- Added triggers for manual/action, load, hover, focus, click, viewport entry and scroll/view progress.
- Added scroll-driven CSS timeline/range controls.
- Added animation presets and multi-selection staggering.
- Added play, pause, stop, reverse and seek Actions.
- Added reduced-motion policies and generated `prefers-reduced-motion` handling.
- Added readable `src/scripts/ui-animation-definitions.ts` output for WAAPI-backed animations.
- Preserved legacy Start/Stop Timeline action compatibility.

### Fine tuning / QA

- Fixed timeline normalization so editing does not invalidate references to existing tracks/keyframes.
- Fixed animation settings intrinsic-width overflow found by visual regression.
- Reworked animation workbench sizing so tracks, details and generated code remain visible simultaneously.
- Expanded the regression suite to 17 suites and added a seventh visual checkpoint for the animation workbench.
## 2.1.0-research — 2026-08-25

Research-driven Astro-native IDE expansion.

### Source-aware workspace

- Existing Astro project workspace scanner and safe file API.
- Source snapshots/mappings and controlled `data-ui-id` synchronization.
- Designer/Hybrid/Code source ownership policies.
- Design/Code/Split/Preview/Live editor modes.
- Real target Astro/Vite dev-process launch/stop path.
- Git status/diff/stage/commit workspace UI.
- Astro/React/TSX/Vue/Svelte reusable component discovery with conservative prop/slot inference.

### Web-native design systems

- component variants and named states;
- timeline/keyframe model and generated CSS animations;
- CSS container-query authoring/export;
- DTCG token import/export;
- deterministic freeform-to-responsive layout advisor;
- optional Astro ClientRouter/view-transition output.

### Content and data

- Astro Content Collections visual model/export;
- live-collection integration foundation;
- REST/GraphQL/JSON data-source descriptors/preview;
- repeater/data context and conditional bindings;
- localization model/export;
- Designer/Content/Client exposure modes.

### Tests and audits

- component stories and recorded interaction tests;
- responsive, accessibility, contrast, SEO and asset/performance audits;
- expanded Chromium browser suite and six visual checkpoints;
- expression evaluator hardened after security regression test.

### Integrations

- provider contribution API for assistants, importers, deployers, data sources, test adapters, source adapters and token adapters;
- bundled research providers for responsive layout advice, DTCG/Penpot token boundary, controlled source synchronization, data and browser testing.

### Visual fixes found through regression testing

- prevented active dock-tab scroll from shifting the whole application;
- prevented toolbar min-content from pushing the right inspector outside 1600 px viewports;
- expanded viewport assertions to require both docks to remain on-screen.
## 1.0.0-parity

Qt Designer/Qt Creator Design-mode parity baseline with dense docks, responsive web canvas, reusable components, Astro export, interactions, multi-selection, geometry tools and rendered browser tests.

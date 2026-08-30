# Changelog

## 2.7.0-hermes — 2026-08-30

### Hermes Agent / MCP

- Added a dependency-free, project-scoped Astro UI Designer MCP stdio server.
- Added MCP 2026-07-28 `server/discover` support plus 2025 initialize compatibility.
- Added semantic read/search/validate/audit/find-usage tools and guarded mutation/export tools.
- Added atomic project writes, optimistic `expectedRevision` conflicts, read-only mode, and workspace export path containment.
- Added MCP resources and prompts for project summary, validation, component registry, platform adapters, page building, UI review and component quality.
- Added a validated `astro-ui-designer` Hermes/agent skill with setup and workflow references.
- Added a cross-platform Hermes installer helper and example `config.yaml` entry.
- Added dedicated protocol and skill regression suites.

## 2.6.0-plasmic-cleanroom — 2026-08-30

### Codebase composition layer

- Added framework-neutral rich code-component contracts with typed props, slots, states, events, provided data, global actions and style-scope metadata.
- Added project-level global variants and node-specific global-variant style overrides.
- Added reusable style mixins integrated into live rendering and generated CSS.
- Added global context/action descriptors plus node context/query bindings and an `Invoke global action` action type.
- Added app-local query descriptors for collection/static/HTTP/GraphQL/expression workflows and generated `src/data/ui-queries.ts`.
- Added insertable subtree templates with fresh-ID cloning.
- Added project-wide Usages search for components/assets/mixins/tokens/global variants/queries/contexts.
- Added global component replacement preserving instance prop values and refactor history.
- Added dedicated Composition inspector plus Queries, Templates and Usages workbenches.
- Added composition validation and normal Astro export artifacts under `src/composition/`.

### Clean-room / verification

- Added `PLASMIC_CLEANROOM_RESEARCH.md` and `COMPOSITION_WORKBENCH.md`.
- Added dedicated model/browser regression suites and a new rendered visual checkpoint.
- Updated the VS Code embedded designer to the same 2.6.0 core.
- Legacy Plasmic server-proxied query/auth behavior is intentionally not reproduced.

## 2.5.1-vscode

- Added a first-class VS Code extension that embeds the complete Astro UI Designer.
- Added optional `.astro` custom editor, Activity Bar project explorer, status-bar entry and command-palette workflow.
- Added VS Code-native workspace read/write integration, preserving open-document edit/save semantics.
- Added Git, Astro dev-server, diagnostics, Test Explorer and Task Provider integration.
- Added VSIX packaging and offline extension tests.
- Added source synchronization and direct Component Lab / Animation / Interchange commands.

## 2.5.0-storybook-cleanroom — 2026-08-30

### Component Lab

- Added a dedicated isolated component-development workspace with story hierarchy, search, tags, status and focused workspace restoration.
- Added typed Args/Controls inferred from visual component props.
- Added viewport, theme, locale, background, direction and centered/padded/fullscreen layout globals plus grid/outline/measure overlays.
- Added story matrices across theme/viewport/locale combinations.
- Added recorded interaction steps and assertions with rendered-browser execution.
- Added per-story accessibility policy (`off`, `todo`, `error`) and deterministic local structural checks.
- Added local visual baselines based on relative DOM geometry and computed styles; baseline capture now samples the settled preview at click time.
- Added render/interaction/a11y/visual/coverage test selection, Watch mode, warning status and consolidated Story Results.
- Added Markdown Autodocs, portable stories, component manifest and React/Vue/Svelte CSF bridge generation with `play`/`userEvent`/`expect` output.
- Added compact-width two-row global controls so every Lab global remains discoverable at 1366x768.

### Verification

- Added `storybook-cleanroom.test.mjs` and `storybook-browser.test.mjs`.
- Expanded visual regression to 13 checkpoints including desktop and compact Component Lab views.
- Added clean-room Storybook research and Component Lab user documentation.


## 2.4.0-penpot-cleanroom — 2026-08-30

### Penpot 2.17 clean-room design layer

- Added structured fills, strokes, shadows, layer/background blur and blend modes.
- Added dashed-stroke dash/gap controls inspired by observable Penpot 2.17 behavior.
- Added horizontal/vertical constraints, fixed-on-scroll, clip-content and selection size feedback.
- Added rectangle, ellipse, SVG path, raw SVG, group and mask visual primitives.
- Added design guides, prototype flows, searchable destinations, overlays, previous-screen and URL interactions.
- Added anchored comments/replies/resolution, Inspect handoff, export-preset metadata and local shared-library snapshots.
- Preserved DTCG design-token interoperability and existing component/variant/state systems.

### Multi-platform interchange

- Added Penpot v3 `.penpot` ZIP/JSON clean-room import/export adapter.
- Added Figma REST-style JSON bridge import/export; native closed `.fig` is explicitly not fabricated.
- Added neutral Designer JSON, HTML and SVG import/export.
- Added readable React/JSX, Vue SFC and Svelte exporters.
- Added portable `.aui-library.json` design-library import/export.
- Added a visual Interchange workbench showing supported platform capabilities and fidelity notes.

### Verification

- Added dedicated Penpot design-model, platform-interchange and rendered-browser suites.
- Added visual checkpoints for the Penpot-derived Effects/Prototype workflow and Interchange matrix.
- Added `docs/PENPOT_CLEANROOM_RESEARCH.md` and `docs/PLATFORM_INTERCHANGE.md`.

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

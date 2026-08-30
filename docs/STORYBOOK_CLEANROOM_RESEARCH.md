# Storybook Clean-Room Research and Implementation Map

**Astro UI Designer Pro 2.5.0-storybook-cleanroom; retained in 2.6.0-plasmic-cleanroom**  
**Research date:** 2026-08-30  
**Reference project:** https://github.com/storybookjs/storybook

## Clean-room boundary

Storybook is used here as a behavioral and workflow reference only. Astro UI Designer does not embed, translate, or mirror Storybook source code, manager/preview internals, addon internals, or proprietary hosted services. The implementation below was designed independently from public documentation, observable UI/workflows, public release notes, and normal web-platform APIs.

The goal is not to turn Astro UI Designer into a fork of Storybook. The goal is to incorporate the component-development loop that is useful inside a visual Astro IDE while keeping Astro UI Designer's own semantic model, Qt-style workbench, code generation, Penpot clean-room design layer, and multi-platform interchange.

## Reference version

At the research date the GitHub release list shows **v10.5.10** as the newest stable 10.5 release and **v10.6.0-beta.0** as a pre-release published on 2026-08-27. Storybook documentation is currently presented as **10.5**.

Reference URLs:

- https://github.com/storybookjs/storybook/releases
- https://storybook.js.org/docs/essentials/controls
- https://storybook.js.org/docs/essentials/toolbars-and-globals
- https://storybook.js.org/docs/essentials/viewport
- https://storybook.js.org/docs/writing-tests/interaction-testing
- https://storybook.js.org/docs/writing-tests/accessibility-testing
- https://storybook.js.org/docs/writing-tests/test-coverage
- https://storybook.js.org/docs/ai
- https://storybook.js.org/docs/ai/mcp/overview
- https://storybook.js.org/docs/api/main-config/main-config

## Important Storybook behaviors used as product references

### Stories as named component scenarios

A component is most useful when it has reproducible named states rather than only one design-time appearance. Storybook organizes these as stories, supports hierarchy and tags, and lets the same scenario be reused for documentation and testing.

**Astro UI Designer implementation:** every reusable component can own multiple stories with title, name, tags, args, globals, component state, notes, interaction steps, assertions, test parameters and result status. The Component Lab presents them in a hierarchical browser.

### Args and Controls

Storybook Controls edits story args graphically and can infer controls from component metadata.

**Implementation:** Astro UI Designer infers controls from its typed component props. Supported inferred controls include text, boolean, numeric, select/enum, color, date and structured/object values. Changes update the Component Lab preview immediately. Controls are editor-native and do not require Storybook to be installed.

### Globals, backgrounds and viewports

Storybook separates story-specific args from global rendering context such as viewport/background and toolbar globals.

**Implementation:** the Component Lab exposes viewport, theme, locale, background, direction and layout as globals. Grid, outline and measurement overlays can be enabled independently. Compact-width UI wraps these controls rather than hiding them behind horizontal scrolling.

### Interaction tests

Storybook interaction tests associate a play function with a story, simulate user behavior, and assert the resulting state.

**Implementation:** the Component Lab records portable interaction steps and assertions. Supported steps include click, type, select, toggle, hover, focus, keyboard input and wait. Assertions include visibility, hidden state, text, value, attributes, count and enabled/disabled state. The rendered browser harness executes the same model. CSF bridge export converts supported steps/assertions into readable `play`/`userEvent`/`expect` code.

### Render testing

Storybook treats rendering a story successfully as a useful baseline test.

**Implementation:** each Component Lab test run includes a render result and records failures without destroying the story.

### Accessibility testing

Storybook's official accessibility addon uses axe-core and supports accessibility as part of component testing.

**Implementation:** the zero-dependency local editor performs deterministic structural checks for missing image alternatives, accessible names, duplicate IDs and unlabeled form controls. Each story supports an accessibility policy of `off`, `todo`, or `error`. `todo` records warnings; `error` fails the story. The plugin/test-adapter boundary is intentionally available for axe-core or CI providers.

**Boundary:** the local structural checker is **not claimed to be axe-core parity** and does not claim full WCAG coverage.

### Visual testing

Storybook supports visual regression testing through integrations.

**Implementation:** Astro UI Designer can save a local visual fingerprint composed from DOM geometry and important computed styles, then compare later renders against it. This provides deterministic offline regression checks and integrates with the existing Chromium/CDP visual harness.

**Boundary:** this is not claimed to be a pixel-diff cloud service or cross-browser Chromatic equivalent. The test-adapter API remains the integration point for such providers.

### Test selection, test status and watch behavior

Modern Storybook integrates component testing into the UI and supports selecting test types. Coverage is tied to the Vitest-based testing workflow; Storybook documents that coverage is not calculated while watch mode is enabled.

**Implementation:** the Component Lab has a test selector for render, interaction, accessibility, visual and coverage checks, a Watch control, per-story pass/warn/fail/skip state, consolidated Story Results, and a summary badge. Coverage is explicitly skipped in watch mode.

**Coverage boundary:** the built-in local coverage result measures story-node/interaction reachability. It is not V8/Istanbul line/branch source coverage. A coverage/test provider can supply that deeper metric when the target project enables instrumentation.

### Autodocs and component documentation

Storybook can derive documentation from component metadata, args and stories.

**Implementation:** Astro UI Designer generates Markdown Autodocs for each visual component and emits them in `component-lab/docs/`. The Docs addon panel can copy generated Markdown.

### Portable stories

Stories are useful outside the immediate preview UI for testing, documentation and agent tooling.

**Implementation:** `component-lab/portable-stories.json` contains the normalized visual-component stories and `component-lab/component-manifest.json` contains agent/tool-readable component metadata.

### CSF bridge

Storybook's Component Story Format is a useful interoperability surface.

**Implementation:** Astro UI Designer exports readable Storybook bridge files for React, Vue and Svelte-style targets, including args, tags, globals, parameters, and supported `play`/`expect` interaction code. It is a bridge/export artifact, not the editor's persistence model.

### AI / MCP direction

Current Storybook documentation marks its AI/manifests/MCP work as preview and currently React-only.

**Implementation:** Astro UI Designer exports an agent-readable component manifest and keeps its existing provider/integration API for external AI/MCP adapters.

**Boundary:** Astro UI Designer does **not** claim Storybook MCP protocol compatibility and does not bundle vendor credentials. A provider can map the generated manifest and story/test services into MCP or another agent protocol later.

## Feature-to-implementation matrix

| Storybook-inspired behavior | Astro UI Designer status | Implementation / boundary |
|---|---|---|
| Story hierarchy | Implemented | Component Lab left browser |
| Story naming/titles | Implemented | Component story metadata |
| Story tags/filtering | Implemented | Includes dev/test/autodocs/manifest-style tags plus custom tags |
| Args | Implemented | Story args bind to component props |
| ArgTypes/Controls | Implemented | Inferred typed controls + editable metadata |
| Viewport | Implemented | Responsive Lab viewport globals |
| Background | Implemented | Story background global |
| Globals | Implemented | theme/locale/direction/layout + UI overlays |
| Centered/padded/fullscreen layouts | Implemented | Story layout parameter |
| Grid | Implemented | Preview overlay |
| Outline | Implemented | Preview overlay |
| Measure | Implemented | Preview overlay and node geometry metadata |
| Interaction steps | Implemented | Recorded portable step model |
| Assertions | Implemented | DOM assertions + CSF bridge output |
| Render tests | Implemented | Per-story result |
| Accessibility policy | Implemented | off/todo/error |
| axe-core parity | Adapter boundary | local structural checker intentionally narrower |
| Visual baseline | Implemented | local geometry/computed-style fingerprint |
| Cross-browser/pixel cloud diff | Adapter boundary | test-provider integration |
| Test selection | Implemented | render/interaction/a11y/visual/coverage |
| Watch mode | Implemented | UI state and repeated-run semantics |
| Coverage summary | Implemented foundation | node/interaction coverage; instrumented source coverage via provider |
| Autodocs | Implemented | Markdown output + editor panel |
| Portable stories | Implemented | JSON artifact |
| Component manifest | Implemented | agent/tool-readable JSON |
| CSF bridge | Implemented | React/Vue/Svelte exports |
| Play-function code generation | Implemented | userEvent/expect generation |
| Story Results panel | Implemented | consolidated per-story results |
| Component Lab status badges | Implemented | pass/warn/fail/idle |
| Visual story matrix | Implemented | generate theme/viewport/locale combinations |
| AI/MCP manifest concept | Implemented foundation | manifest + provider boundary; not Storybook MCP protocol |
| Vitest addon | External/provider boundary | target project may install/use Vitest; editor itself stays zero-dependency |
| Storybook manager/addon runtime | Not embedded | independent Component Lab UI |
| Chromatic hosted service | Not bundled | external provider integration |

## Why this is useful for Astro UI Designer

The editor already had a visual page designer, reusable components, source-aware Astro workspace, animations, responsive design, design tokens and multi-platform interchange. The missing development loop was a reliable way to answer these questions for every reusable component:

1. What named states should this component support?
2. Which inputs/props change those states?
3. How does it behave across viewport/theme/locale combinations?
4. Does it render and interact correctly?
5. Does it have obvious accessibility problems?
6. Has its rendered appearance changed unexpectedly?
7. Can these scenarios be documented/exported/tested outside the editor?

The Component Lab adds that loop while staying integrated with the same component model that eventually generates Astro source.

## Clean-room implementation files

- `standalone/js/storybook-cleanroom.js` — story semantics, Controls inference, test result model, docs/portable/CSF/component-manifest exporters
- `standalone/js/app.js` — Component Lab workbench/UI/interaction integration
- `standalone/styles.css` — Component Lab layout and compact responsive behavior
- `standalone/js/model.js` — schema migration and storybook project settings
- `standalone/js/astro-exporter.js` — component-lab artifacts in generated Astro projects
- `tests/storybook-cleanroom.test.mjs` — semantic/unit coverage
- `tests/storybook-browser.test.mjs` — rendered Component Lab behavior
- `tests/visual-smoke.mjs` — desktop and compact visual checkpoints

## Future adapters that should remain optional

- axe-core accessibility provider
- Vitest/browser-mode provider
- V8/Istanbul source coverage provider
- Playwright multi-browser provider
- pixel/image-diff provider
- Chromatic-like hosted visual provider
- Storybook-native importer for existing `*.stories.*`/CSF projects
- MCP provider built from the component manifest and story/test API

These should remain plugins/adapters rather than becoming dependencies of the editor core.

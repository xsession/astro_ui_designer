# Web Research and Implementation Roadmap

**Project:** Astro UI Designer Pro — Research + Animation + UX Edition  
**Research date:** 2026-08-25  
**Purpose:** Record the external product/standards research that shaped the editor and map each finding to a concrete implementation decision.

## Executive conclusion

The editor should not compete primarily as another drag-and-drop page builder. The strongest product direction is an **Astro-native visual development environment**: a Qt Creator/Qt Designer-style engineering UI that works with a real source-controlled Astro repository, shows the real running application, understands reusable code components, exposes structured data/content/design systems visually, and leaves ordinary readable Astro source behind.

The product therefore follows five principles:

1. **Code ownership remains with the developer.** Visual editing must not require a proprietary runtime.
2. **The real Astro application is the truth.** The desktop workspace can start the target project's Astro/Vite dev server rather than relying only on a designer approximation.
3. **Visual structure and source structure are linked, not conflated.** Stable `data-ui-id` mappings and ownership policies allow guarded synchronization without rewriting arbitrary handwritten code blindly.
4. **Web-native layout wins over desktop absolute positioning.** Flexbox, Grid, media queries and container queries are first-class; freeform positioning remains available for HMI/dashboard use cases.
5. **Vendor integrations stay optional.** Data providers, design importers, deployment providers, AI assistants, test adapters, source adapters and token adapters use a plugin contribution API.

---

## Research sources

### Astro compiler and source tooling

- Astro compiler (current Go implementation): https://github.com/withastro/compiler
- Astro compiler-rs project / ESTree-compatible AST direction: https://github.com/withastro/compiler-rs
- Astro editor/tooling documentation: https://docs.astro.build/en/editor-setup/

**Finding:** Astro source can be parsed into structured syntax trees and walked by tooling. A visual editor should therefore be source-aware rather than relying only on one-way template generation.

### Astro routing, transitions and content

- Astro View Transitions / ClientRouter: https://docs.astro.build/en/guides/view-transitions/
- Astro content collections: https://docs.astro.build/en/guides/content-collections/
- Astro content API reference: https://docs.astro.build/en/reference/modules/astro-content/

**Finding:** Astro already provides strong primitives for page navigation, structured content and live/request-time content. The editor should expose these rather than inventing incompatible runtime concepts.

### Vite development integration

- Vite HMR API: https://vite.dev/guide/api-hmr
- Vite plugin API: https://vite.dev/guide/api-plugin

**Finding:** A designer bridge can coordinate the editor and the real running application using Vite development hooks and HMR/custom events. The visual IDE should keep the target project's own dev server intact.

### Webflow

- Components overview: https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview
- Component variants: https://help.webflow.com/hc/en-us/articles/33961322573203-Component-variants
- Code components: https://help.webflow.com/hc/en-us/articles/33961330349331-Code-components
- Variables: https://help.webflow.com/hc/en-us/articles/33961268146323-Variables
- Localization: https://help.webflow.com/hc/en-us/articles/53682971927571-Manage-your-site-s-locales

**Finding:** Props, slots, variants, reusable variables/tokens, code components and localization have become expected capabilities in professional visual builders.

### Plasmic

- Developer-focused visual builder: https://www.plasmic.app/for-developers
- Feature overview: https://www.plasmic.app/features

**Finding:** Important differentiators are bring-your-own-code components, integration with an existing stack, data sources, variants/slots, design tokens, freeform-to-structured-layout workflows and a no-lock-in/ejectable result.

### Penpot

- Flex/Grid layouts: https://help.penpot.app/user-guide/designing/flexible-layouts/
- Design tokens: https://help.penpot.app/user-guide/design-tokens/

**Finding:** Visual layout controls should map directly to production CSS concepts. Token interchange should use a standard format rather than a proprietary token model.

### Design Tokens Community Group (DTCG)

- Design Tokens Format Module 2025.10: https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/
- W3C Design Tokens Community Group: https://www.w3.org/community/design-tokens/

**Finding:** DTCG now provides a stable vendor-neutral JSON interchange format. The editor should import/export DTCG and generate CSS custom properties from it.

### CSS responsive component design

- MDN Container Queries: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
- MDN `container` property: https://developer.mozilla.org/en-US/docs/Web/CSS/container

**Finding:** Reusable components need container-relative responsiveness in addition to viewport breakpoints.

### Storybook

- Component testing: https://storybook.js.org/docs/writing-tests
- Accessibility testing: https://storybook.js.org/docs/writing-tests/accessibility-testing

**Finding:** Component stories, interaction tests, accessibility checks and visual snapshots belong in the component-authoring workflow, not only in a separate QA tool.

### Qt Design Studio / Qt Creator design workflows

- Qt Design Studio views: https://doc.qt.io/qtdesignstudio/qtquick-designer-views.html
- States: https://doc.qt.io/qtcreator/quick-states.html
- Timeline/keyframes: https://doc.qt.io/qtdesignstudio/qtquick-timeline.html
- Transitions: https://doc.qt.io/qtdesignstudio/qtquick-transitions.html

**Finding:** States, transitions, timelines, Navigator/Object Inspector, Properties, Design Tokens and dense multi-panel design workflows are powerful patterns worth translating to web semantics.

---

## Feature-by-feature research mapping

| Research finding | Implementation in this build | Status / boundary |
|---|---|---|
| Existing Astro repository as primary workspace | Desktop workspace scanner, safe file API, source snapshots, source pane | **Implemented** |
| Source-aware visual editing | Stable `data-ui-id` source maps, node ownership policies, guarded source patching | **Controlled implementation** — arbitrary structural rewriting is intentionally not claimed |
| Astro compiler AST integration | Workspace detects optional compiler-rs availability; source scanner has independent fallback | **Adapter-ready**; full arbitrary AST rewrite remains a deeper source-adapter task |
| Real Astro/Vite preview | Desktop launcher can start/stop target project's own dev process and load it in Live mode | **Implemented when target dependencies are installed** |
| Design / Code / Split / Preview | Four editor modes with source pane and live iframe | **Implemented** |
| Bring-your-own code components | Workspace discovers Astro, React/TSX, Vue and Svelte files; common props/slots inferred and registered in palette | **Implemented** |
| Component props / slots | Typed props/defaults/instance values and named/default slots | **Implemented** |
| Component variants | Variant metadata, instance selection and generated `variant` prop/data attributes | **Implemented** |
| Qt-style component states | Per-node named state property overrides and action-driven state switching | **Implemented** |
| Timeline/keyframes | Timeline definition, state/action controls, generated CSS `@keyframes` | **Implemented foundation** |
| View transitions | Export can include Astro `ClientRouter` support | **Implemented foundation** |
| Viewport breakpoints | User-editable breakpoints and per-breakpoint overrides | **Implemented** |
| Container-query responsiveness | `containerType`, `containerName`, node container rules and generated `@container` CSS | **Implemented** |
| CSS-native Flex/Grid | Inspector controls emit normal CSS Flexbox/Grid | **Implemented** |
| Freeform → responsive conversion | Geometry analysis suggests Row/Grid/structured layout candidates | **Implemented deterministic advisor** |
| Astro Content Collections | Visual collection/schema/entries model; generated `src/content.config.ts` and entry files | **Implemented** |
| Astro live collections | Live source metadata and generated `src/live.config.ts` stubs | **Implemented integration foundation** |
| Visual data sources | REST/GraphQL/JSON/content/live data descriptors, preview, node data context | **Implemented** |
| Data binding | `state.*`, `props.*`, `data.*` and locale-aware binding/visibility model | **Implemented** |
| Conditional logic | Visual condition builder plus restricted expression evaluation | **Implemented** |
| Client/content editing modes | Node exposure policy and Designer/Content/Client mode controls | **Implemented** |
| Git-native workflow | Workspace Git status, diff, stage and commit endpoints/panel | **Implemented** |
| DTCG tokens | Import/export DTCG 2025.10-style data and CSS variable generation | **Implemented** |
| Penpot token interoperability | DTCG token adapter/importer contribution | **Implemented at standard token boundary** |
| Full Penpot/Figma canvas import | Generic design-importer contribution API | **Provider hook**; no fake vendor parser is bundled |
| Storybook-like component workbench | Component stories, story state, recorded interaction tests, browser test adapter | **Implemented foundation** |
| Visual test recording | Recorder model and test artifact export | **Implemented** |
| Accessibility audit | Structural a11y + explicit color contrast audit | **Implemented** |
| Responsive audit | Multi-width audit model with direct navigation targets | **Implemented** |
| SEO audit | Title/description/canonical warnings | **Implemented** |
| Performance/asset audit | Oversized asset, eager-image and autoplay-video checks | **Implemented** |
| Localization | Locales/translations model and export artifact | **Implemented** |
| Design import / deployment / AI providers | General integration contribution API with `importers`, `deployers`, `assistants`, etc. | **Implemented plugin boundary** |
| AI layout assistance | Built-in deterministic responsive layout advisor plus assistant-provider hook | **Implemented offline advisor; remote AI optional** |
| Deployment previews | Deployer-provider API | **Provider hook**; credentials/vendor APIs are intentionally external |
| Dual freeform/flow philosophy | Normal responsive flow containers + scoped Freeform Layer | **Implemented** |

---

## Source-aware editing architecture

The editor deliberately distinguishes three source ownership modes.

### Designer-owned

The visual editor may update structure, attributes and content represented by the designer model.

### Hybrid

The editor may update designer-owned attributes/content around stable mapped elements, but it preserves handwritten code and does not perform broad structural rewriting.

### Code-owned

The editor can display/select the element and expose safe metadata, but source changes are not automatically applied.

A controlled source synchronization path operates on elements carrying stable mappings such as:

```astro
<section data-ui-id="hero-01" class="hero">
  ...
</section>
```

The patcher can update selected managed attributes/text for that mapped element while preserving unrelated frontmatter and surrounding source. This is safer than pretending arbitrary Astro/TypeScript expressions can always be round-tripped losslessly.

The architecture leaves a `sourceAdapter` contribution point for deeper AST implementations. An adapter may use Astro compiler APIs where installed and may expand structural transformations without changing the core designer.

---

## Live preview architecture

Desktop mode can open a real project directory and start the project's own development command. The editor then uses the resulting local URL as the Live canvas.

Conceptually:

```text
Astro repository
      │
      ├── source scanner / source map
      ├── Git workspace
      └── Astro/Vite dev process
                  │
                  ▼
             Live iframe
                  │
          designer selection bridge
```

Browser-only mode still supports generated preview and imported source snapshots, but filesystem, Git and child-process operations are intentionally provided only through the local desktop-style launcher.

---

## External component discovery

The workspace scanner currently recognizes:

- `.astro`
- React `.tsx` / `.jsx`
- Vue `.vue`
- Svelte `.svelte`

It infers common prop declarations and slots using conservative syntax recognition. Discovered components are registered in the same visual palette as built-in widgets and retain their real import/source paths.

This scanner is intentionally conservative: unusual metaprogrammed prop definitions remain code-owned rather than guessed incorrectly.

---

## Data/content architecture

The visual data layer does not replace Astro. It maps visual concepts onto Astro-native outputs:

- structured content → Astro Content Collections
- live/request-time content → live-collection integration stub/provider
- REST/GraphQL/JSON → data-source descriptors and plugin providers
- repeaters → `getCollection(...)` where appropriate
- node bindings → state/props/data expression descriptors

The editor includes a restricted expression evaluator for preview/authoring. It **does not execute arbitrary JavaScript**. Only approved roots (`state`, `props`, `data`, `locale`) and safe literal/operator expressions are accepted; prototype/constructor access and unknown identifiers are rejected.

This restriction was added after automated security testing demonstrated that a generic JavaScript `Function()`-based evaluator was unsafe even with a superficial character allowlist.

---

## Design-token strategy

The internal token model can be converted to/from DTCG format and to CSS custom properties. This provides a clean interoperability boundary with Penpot and other tools that support the DTCG standard.

Vendor-specific design-file import should therefore be optional:

1. Prefer DTCG for tokens.
2. Prefer normal SVG/image/assets for static graphics.
3. Use a design-importer plugin for richer Figma/Penpot document semantics.
4. Never make a vendor API credential a dependency of the core editor.

---

## Testing strategy derived from the research

The editor uses both model-level and rendered-browser verification:

- model/schema migration tests
- validation tests
- exporter tests
- research-feature tests
- workspace/source scanner tests
- plugin/contribution API tests
- generated Astro artifact tests
- GUI-element/property/action matrix tests
- shell/panel tests
- interaction parity tests
- browser workflow tests
- research workflow browser tests
- visual regression/geometry checkpoints

Visual checkpoints cover desktop, compact workstation, freeform multi-selection, Preview, Design/Source split mode, the research workbench/Integrations surface, desktop and compact animation workbenches, and Focus Canvas mode.

The visual tests assert that docks remain inside the viewport, toolbar content does not force hidden shell width, panels do not overlap, preview does not leak designer handles, and the browser reports no uncaught errors.

Two examples of defects caught by visual regression rather than source inspection were:

- active tab scrolling shifting the entire application horizontally instead of only the dock tab strip;
- toolbar min-content width forcing the right inspector beyond a 1600 px viewport.

---

## Product boundaries and non-goals

### Intentionally not claimed as complete

- lossless arbitrary bidirectional rewriting of any handwritten Astro/TypeScript program;
- full vendor-specific Figma or Penpot canvas-document import without a provider;
- cloud deployment to arbitrary vendors without the user's provider plugin/credentials;
- remote generative-AI calls without an explicitly configured provider;
- replacement of Astro/Vite's own compiler/dev server;
- replacement of Git with a proprietary history format.

### Why these boundaries matter

A visual IDE is more useful when unsupported code remains visible and intact than when it guesses and corrupts a project. The design therefore prefers **explicit ownership, conservative parsing and plugin boundaries** over optimistic destructive transformation.

---

## Recommended next deepening work

The current research edition implements the broad architecture and usable feature paths. The most valuable deeper work from here is quality rather than another long widget list:

1. source adapters using Astro compiler AST ranges for richer structural patches;
2. Vite development plugin for DOM↔source selection synchronization inside arbitrary running projects;
3. richer TypeScript Language Service integration for inferred props and expression diagnostics;
4. full component-story browser with real target-project rendering;
5. provider packages for Penpot/Figma import and selected deployment platforms;
6. production-grade Git visual diff including before/after rendered snapshots;
7. accessibility/performance integration with browser APIs or Lighthouse-style adapters;
8. CRDT/collaboration as a separate optional layer once source ownership semantics are mature.

The architectural objective remains the same: **a dense engineering visual IDE for real Astro source, not a proprietary page-builder runtime.**

---

# Motion / Animation Research Update — 2.2

The editor now includes a dedicated Animation workbench rather than the earlier minimal two-point timeline foundation.

## Current web-platform findings

Modern web motion can be split cleanly into two backends:

1. **CSS Animations / CSS scroll-driven animations** for declarative motion, hover/focus/load behavior and scroll/view-progress timelines.
2. **Web Animations API (WAAPI)** for event-driven motion and explicit runtime transport such as play, pause, reverse and seek.

MDN documents WAAPI as the browser API combining timing and animation models, with `Animation` playback controls and `KeyframeEffect` keyframe representation. Current CSS scroll-driven animation documentation explicitly recommends scroll/view timelines instead of JavaScript scroll handlers where possible because the CSS path avoids main-thread scroll-event work.

Useful references:

- https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-duration
- https://docs.astro.build/en/guides/view-transitions/

## Implemented consequences

- full multi-track/multi-keyframe animation editor;
- timeline playhead and scrubbing;
- keyframe drag editing;
- per-keyframe easing;
- CSS and JavaScript code preview;
- Auto/CSS/WAAPI backend selection;
- load/hover/focus/click/in-view/manual/scroll triggers;
- native `animation-timeline` / `animation-range` generation;
- WAAPI definitions plus reusable Astro runtime;
- play/pause/stop/reverse/seek actions;
- presets and multi-selection staggering;
- `prefers-reduced-motion` policy;
- browser tests plus a dedicated rendered animation-editor screenshot.

For scroll-driven CSS the exporter uses a `1ms` animation duration while progress is controlled by the scroll/view timeline, matching current interoperability guidance documented by MDN.

Astro page/view transitions remain a separate higher-level navigation feature. The node Animation Editor handles component/element motion, while Astro `ClientRouter` / View Transitions handle page-to-page continuity.

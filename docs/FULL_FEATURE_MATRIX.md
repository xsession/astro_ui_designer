# Full Feature Matrix — Research + Animation + UX Edition

Legend: **Implemented** = usable in this build. **Controlled** = intentionally guarded rather than arbitrary. **Provider hook** = core integration API exists; vendor-specific service is external.

| Area | Status | Notes |
|---|---|---|
| Dense Qt-style workbench | Implemented | Palette, project/source/component/assets, canvas, inspectors and on-demand bottom workbenches |
| Canvas-first default shell | Implemented | Bottom workbench starts as a 30 px tabs-only strip; specialist workbenches open on demand |
| Dock destination discovery | Implemented | Explicit `…` menus expose every overflowing left/right/bottom tab |
| Focus Canvas mode | Implemented | F11 hides both side docks and minimizes the bottom workbench, then restores the prior layout |
| First-use layout guidance | Implemented | Root quick actions for Section, Container and Freeform/HMI |
| Design / Code / Split / Preview modes | Implemented | Source pane and live preview surface included |
| Existing Astro workspace | Implemented | Safe local filesystem scanner through desktop launcher |
| Source snapshots/maps | Implemented | Stable file/node mappings and `data-ui-id` discovery |
| Controlled source sync | Controlled | Mapped element attributes/text can patch source; arbitrary structural rewrite is not guessed |
| Optional Astro AST adapter path | Implemented boundary | Source-adapter API; compiler-rs availability detected when installed |
| Real Astro/Vite live preview | Implemented | Starts/stops target dev process from desktop workspace when dependencies exist |
| Astro component discovery | Implemented | Props/slots/source path inferred conservatively |
| React/TSX component discovery | Implemented | Common Props/children patterns |
| Vue component discovery | Implemented | Common `defineProps` and slots |
| Svelte component discovery | Implemented | Common `export let`/`$props()` and slot patterns |
| Bring-your-own code components | Implemented | Discovered components appear in visual palette |
| Multi-page Astro routes | Implemented | Nested route filenames supported |
| Responsive breakpoints | Implemented | Editable viewport breakpoints + per-breakpoint styles |
| CSS container queries | Implemented | `container-name/type` and generated `@container` rules |
| Flexbox editor | Implemented | Direct CSS-native property controls + quick layout actions |
| CSS Grid editor | Implemented | Grid template/placement fields |
| Freeform/HMI layer | Implemented | Scoped absolute positioning, multi-select/align/distribute/resize |
| Freeform → responsive inference | Implemented | Deterministic Row/Grid/layout advisor |
| Design tokens | Implemented | CSS variables + token picker |
| DTCG token interchange | Implemented | DTCG import/export adapter |
| Penpot token interoperability | Implemented | DTCG boundary; richer design import through provider |
| Multiple themes | Implemented | Active theme + duplication workflow |
| Reusable components | Implemented | Definitions, instances, extract-from-selection |
| Astro slots | Implemented | Default and named slot assignment |
| Component props | Implemented | Typed declarations, defaults, instance values |
| Component variants | Implemented | Variant definitions/instance value/export metadata |
| Component states | Implemented | Named state overrides + state actions |
| Animation timeline/keyframes | Implemented | Multi-track arbitrary keyframes, drag editing, playhead scrub, presets, per-keyframe easing |
| CSS animation export | Implemented | @keyframes, load/hover/focus/manual rules, native scroll/view timelines |
| JavaScript animation export | Implemented | WAAPI definitions/runtime with play/pause/stop/reverse/seek |
| Reduced motion | Implemented | Disable/shorten/allow policies for CSS and WAAPI |
| Animation staggering | Implemented | Incremental delay across multi-selection |
| View transitions | Implemented foundation | Optional Astro `ClientRouter` generation |
| Assets | Implemented | Binary import, preview, drag/drop, public export |
| Forms | Implemented | Native attributes/validation + submit actions |
| State variables | Implemented | string/number/boolean |
| Bindings | Implemented | `state.*`, `props.*`, `data.*`, locale-aware visibility/context |
| Restricted condition evaluator | Implemented | Safe roots/operators; arbitrary JavaScript is not executed |
| Signals/actions | Implemented | Declarative web-native actions including component states and animation play/pause/stop/reverse/seek |
| Content Collections CMS | Implemented | schema/entries UI + Astro config/content export |
| Live content collections | Implemented foundation | live config/source provider path |
| REST/GraphQL/JSON data sources | Implemented | descriptors, preview and data context |
| Repeater/data-driven node | Implemented | Astro collection repetition path |
| Localization | Implemented | locales/translations model + export artifact |
| Designer/Content/Client modes | Implemented | per-node exposure policy |
| Git UI | Implemented | status/diff/stage/commit through workspace API |
| Component stories/tests | Implemented foundation | stories + recorded test model/export + browser test adapter |
| Visual test recording | Implemented | recorded interaction metadata/artifact |
| Responsive audit | Implemented | multi-width diagnostics |
| Accessibility audit | Implemented | semantics + explicit color contrast checks |
| SEO audit | Implemented | title/description/canonical diagnostics |
| Performance/asset audit | Implemented | asset weight/eager image/autoplay checks |
| Validation/problems | Implemented | structural, source, action, binding, content and accessibility checks |
| Command palette | Implemented | keyboard-searchable commands |
| Undo/redo | Implemented | project-level snapshots |
| Clipboard | Implemented | nested subtree copy/paste |
| Object ordering/z-order | Implemented | sibling and freeform z-order controls |
| Accessibility/tab order | Implemented | ARIA label, role, title, tabindex exported |
| Resizable IDE docks | Implemented | left/right/bottom splitters, collapse/restore, Focus mode and persisted shell state |
| Plugin SDK | Implemented | components/actions/validators/export transforms |
| Integration contribution API | Implemented | assistants/importers/deployers/data/test/source/token adapters |
| Offline AI-style layout advisor | Implemented | deterministic geometry-based assistant |
| Remote AI provider | Provider hook | no bundled credentials/vendor dependency |
| Figma/Penpot full canvas import | Provider hook | token interchange works now; full document import is adapter-specific |
| Deployment preview providers | Provider hook | deployment credentials remain external |
| Astro code browser | Implemented | generated/workspace source viewing/editing |
| Astro ZIP export | Implemented | zero-dependency ZIP writer |
| Astro folder export | Implemented | File System Access API when available |
| Framework islands | Implemented foundation | imports + Astro hydration directives/dependency metadata |
| Rendered browser regression tests | Implemented | CDP harness + component/shell/panel/research/UX regression tests |
| Visual checkpoints | Implemented | nine views: desktop, compact, freeform, preview, split/source, research, desktop/compact animation and Focus mode |
| Desktop-style launcher | Implemented | zero-dependency Node server, workspace/Git/dev-process APIs |
| Collaboration/CRDT | Not bundled | stable IDs/operations preserve a future integration path |

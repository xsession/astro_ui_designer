# Full Feature Matrix — Storybook + Penpot Clean-Room Edition

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
| Flexbox editor | Implemented | Direct CSS-native property controls + quick layout actions + X/Y content alignment buttons |
| CSS Grid editor | Implemented | Grid template/placement fields + direct `justify-items`/`align-items` content alignment |
| Freeform/HMI layer | Implemented | Scoped absolute positioning, multi-select/align/distribute/resize |
| Freeform → responsive inference | Implemented | Deterministic Row/Grid/layout advisor |
| Design tokens | Implemented | CSS variables + token picker |
| DTCG token interchange | Implemented | DTCG import/export adapter |
| Penpot token interoperability | Implemented | DTCG token boundary plus Penpot v3 document adapter |
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
| Component stories/tests | Implemented | Dedicated Component Lab with hierarchy, tags and status |
| Args / Controls | Implemented | Typed controls inferred from component props |
| Story globals | Implemented | Viewport, theme, locale, background, direction and layout |
| Story viewport matrix | Implemented | Generate theme/viewport/locale combinations |
| Interaction play steps | Implemented | click/type/select/toggle/hover/focus/key/wait |
| Story assertions | Implemented | visibility/text/value/attribute/count/enabled state |
| Per-story a11y policy | Implemented | off/todo/error with local structural checker |
| axe-core parity | Adapter boundary | local zero-dependency checks are intentionally narrower |
| Local visual baselines | Implemented | relative DOM geometry + computed-style fingerprint |
| Pixel/cross-browser visual service | Adapter boundary | provider hook; no hosted service bundled |
| Story test selection/watch | Implemented | render/interaction/a11y/visual/coverage, watch-aware |
| Instrumented source coverage | Provider boundary | built-in result is component-node/interaction reachability |
| Autodocs | Implemented | Markdown docs generated per component |
| Portable stories | Implemented | generated JSON artifact |
| CSF bridge export | Implemented | React/Vue/Svelte with args/tags/globals/play/expect |
| Component manifest | Implemented | agent/tool-readable component metadata |
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
| Penpot v3 document import/export | Implemented clean-room | ZIP+JSON adapter based on public v3 format; self round-trip tested |
| Figma document bridge | Implemented | REST-style JSON import/export; not closed native `.fig` |
| HTML/SVG/Neutral JSON interchange | Implemented | Bidirectional, loss-aware adapters |
| React/Vue/Svelte code export | Implemented | Readable framework source exporters |
| Structured fills/strokes/shadows/blur/blend | Implemented | Dedicated Effects inspector and semantic design model |
| Stroke dash/gap controls | Implemented | Preserved in vector/Penpot interchange; HTML border is closest approximation |
| Constraints/fixed-scroll/clip | Implemented | Design metadata + CSS/Astro projection |
| Guides | Implemented | Horizontal/vertical model + canvas overlay |
| Prototype flows/overlays | Implemented | searchable destinations, navigation/overlay/back/URL actions |
| Comments/review | Implemented | Anchored comments, replies, resolve/reopen |
| Inspect handoff | Implemented | geometry + generated CSS/HTML |
| Local shared design libraries | Implemented | publish/import/apply/export snapshot workflow |
| Exact Penpot server collaboration / CRDT | Not bundled | independent future collaboration layer |
| Exact vector boolean geometry | Not bundled | requires dedicated robust geometry kernel |
| Layer PNG/JPEG/WebP/PDF renderer | Foundation | export presets modeled; dedicated renderer still required |
| Deployment preview providers | Provider hook | deployment credentials remain external |
| Astro code browser | Implemented | generated/workspace source viewing/editing |
| Astro ZIP export | Implemented | zero-dependency ZIP writer |
| Astro folder export | Implemented | File System Access API when available |
| Framework islands | Implemented foundation | imports + Astro hydration directives/dependency metadata |
| Rendered browser regression tests | Implemented | CDP harness + component/shell/panel/research/UX regression tests |
| Visual checkpoints | Implemented | fourteen views including Penpot/interchange, desktop/compact Component Lab and Composition/Usages |
| Desktop-style launcher | Implemented | zero-dependency Node server, workspace/Git/dev-process APIs |
| Collaboration/CRDT | Not bundled | stable IDs/operations preserve a future integration path |

## VS Code integration

| Capability | Status |
|---|---|
| Full designer embedded in VS Code webview | Implemented |
| Optional `.astro` custom editor (`Reopen With`) | Implemented |
| `.astro-ui.json` / `designer-project.json` custom editor | Implemented |
| Activity Bar page/component explorer | Implemented |
| Astro/React/Vue/Svelte discovery | Implemented |
| Active `.astro` synchronization | Implemented |
| VS Code native file edit/save bridge | Implemented |
| Git bridge | Implemented |
| Astro dev-server lifecycle | Implemented |
| Live preview inside designer webview | Implemented |
| Diagnostics / Problems integration | Implemented |
| Test Explorer discovery | Implemented |
| VS Code Task Provider | Implemented |
| Status bar integration | Implemented |
| Native folder export from Astro generator | Implemented |
| Untrusted-workspace lockout | Implemented |
| Local VSIX packaging | Implemented |
| VS Code Extension Host E2E in this build environment | Not executed; environment has no VS Code executable and package download is blocked |

## Codebase composition / Plasmic clean-room additions

| Capability | Status | Notes |
|---|---|---|
| Rich code-component contracts | Implemented | typed props/slots/states/events/provided data/global actions/style scope |
| Global variants | Implemented | project-level groups, active values, node style overrides |
| Reusable style mixins | Implemented | shared style references participate in canvas/export effective style |
| Global contexts/actions | Implemented | generic descriptors, bindings and action invocation |
| App-local data queries | Implemented | collection/static/HTTP/GraphQL/expression descriptors |
| Generated query source | Implemented | `src/data/ui-queries.ts`; application owns execution |
| Query/context node bindings | Implemented | stored by stable IDs and validated |
| Insertable section/templates | Implemented | cloned subtrees receive fresh IDs |
| Project-wide find usages | Implemented | components/assets/mixins/tokens/global variants/queries/contexts |
| Global component replace | Implemented | preserves compatible instance prop values |
| Composition refactor history | Implemented | replacement operations are recorded |
| Legacy builder-server query proxy | Intentionally not implemented | source-first application execution is preferred |
| Plasmic proprietary project/runtime parity | Not claimed | independent clean-room schema and exporter |

## Hermes Agent integration

| Capability | Status |
| --- | --- |
| Project-scoped stdio MCP server | Implemented |
| MCP 2026-07-28 discovery | Implemented |
| 2025 initialize compatibility | Implemented |
| Semantic project read/search tools | Implemented |
| Validation + responsive/a11y/SEO/performance audits | Implemented |
| Guarded page/node/action/animation/story/query mutation | Implemented |
| Project-wide usage lookup | Implemented |
| Native Astro + interchange export | Implemented |
| Atomic writes + optimistic revision conflicts | Implemented |
| Read-only mode | Implemented |
| Workspace export path containment | Implemented |
| MCP resources/prompts | Implemented |
| Hermes-compatible progressive skill | Implemented |
| Skill validator/package (`skill.zip`) | Implemented |
| Cross-platform Hermes setup helper | Implemented |
| Generic shell/filesystem tool exposure | Intentionally not implemented |

## Manual canvas / layout editing clean-room additions

| Capability | Status | Notes |
|---|---|---|
| Eight-direction resize | Implemented | N/NE/E/SE/S/SW/W/NW handles |
| Rotation handle | Implemented | Shift quantizes to 15° |
| Aspect-ratio resize | Implemented | Shift modifier / persisted option |
| Center resize | Implemented | Alt modifier |
| Nested freeform coordinates | Implemented | parent-local persistence, canvas-global overlays |
| Smart grid/guide/geometry snapping | Implemented | configurable independently |
| Rulers | Implemented | top/left canvas rulers |
| Persistent guides | Implemented | add/drag/lock/delete, breakpoint-aware |
| Responsive column guides | Implemented | columns/gap/margin/max-width per breakpoint |
| Alt distance measurement | Implemented | selected-to-hovered geometry overlay |
| Margin/padding overlay | Implemented | box-model visualization |
| X-ray layout view | Implemented | layout geometry outlines |
| Smart freeform spacing handles | Implemented | recognizable row/column selections |
| Tidy / exact gap | Implemented | horizontal/vertical normalization |
| Proportional freeform scaling | Implemented | multi-selection percentage scaling |
| Direct Flex/Stack gap drag | Implemented | edits real CSS `gap` |
| Direct Grid cell placement | Implemented | clickable cell targets for selected child |
| Direct text alignment buttons | Implemented | Left / Center / Right / Justify, breakpoint + multi-selection aware |
| Direct content X/Y alignment | Implemented | Start / Center / End with Flex direction-aware mapping and Grid item alignment |
| Grid row/column track controls | Implemented | +/- direct controls |
| Fixed/fill/hug sizing | Implemented | width/height independently |
| Flow/relative/absolute/fixed/sticky | Implemented | web-native position modes |
| Ignore flow / Return to flow | Implemented | absolute escape and re-entry |
| Parent-resize constraints | Implemented | pin/center/scale semantics |
| Apply Row/Column/Grid | Implemented | CSS-native layout |
| Break layout | Implemented | preserves visible child geometry |
| Infer layout | Implemented | converts recognizable manual arrangements |
| Keyboard precision workflow | Implemented | arrows, Alt+Arrow, Shift+Arrow, shortcuts |
| Lost-pointer gesture recovery | Implemented | defensive end when pointer buttons become zero |
| Manual-layout browser regression | Implemented | direct drag/resize/rotate/guides/measure/gap/grid |
| Dedicated visual checkpoint | Implemented | manual-layout workspace at 1600×900 |

## Structured CSS editing utilities (2.9.0)

| Capability | Status |
| --- | --- |
| Box-model four-side editor | Implemented |
| Border width/style/color editor | Implemented |
| Independent corner-radius editor | Implemented |
| Linear/radial/conic gradient builder | Implemented |
| Structured box-shadow builder + presets | Implemented |
| Filter builder | Implemented |
| Typography utility group | Implemented |
| Transform builder | Implemented |
| Transition builder + presets | Implemented |
| Overflow/cursor/pointer/user-select/object-fit utilities | Implemented |
| Base/Hover/Focus/Focus-visible/Active/Disabled layers | Implemented |
| Element-scoped CSS custom properties | Implemented |
| Generated CSS preview/copy | Implemented |
| Native pseudo-selector Astro export | Implemented |
| Public API CSS-state/local-variable editing | Implemented |
| Hermes `update_node` CSS-state/local-variable editing | Implemented |
| Chromium rendered regression | Implemented |
| Dedicated visual checkpoint | Implemented |

## Universal color-code picker coverage (2.10.0)

- Paired editable CSS value + visual picker in every structured color-bearing GUI surface.
- Compound-safe replacement for borders, backgrounds/gradients, outlines, box shadows and text shadows.
- Design-token-aware swatch resolution, including compound shadow tokens.
- Penpot-style fill/stroke/shadow colors, design-token values and ruler/layout-guide colors.
- Color-aware animation keyframe values, Component Lab/Storybook controls, reusable component props and code-component props.
- Raw CSS values remain editable; no proprietary color representation is introduced.

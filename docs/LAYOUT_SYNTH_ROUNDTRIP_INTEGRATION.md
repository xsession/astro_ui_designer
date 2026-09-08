# Layout Synth → Astro UI Designer: complete round-trip architecture

## Goal

Turn the useful architectural lessons from the supplied Layout Synth project into a general source-first subsystem for Astro UI Designer without replacing its richer visual editor or copying Layout Synth implementation details.

This edition completes all six phases proposed by the first integration.

## Architecture

The implementation is split into intentionally small layers:

- `roundtrip-engine.js` — identities, graph, dirtiness, reviewed patch plans, stale protection, watcher state, source checkpoints and reconciliation.
- `roundtrip-adapter-sdk.js` — one backend contract for detect / inspect / import / generate / patch / preview / validate.
- `roundtrip-neutral-ir.js` — framework-neutral UI tree and portable parsers/generators.
- `roundtrip-conversion.js` — neutral IR ↔ Astro UI Designer project model.
- `roundtrip-builtins.js` — built-in Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI and LVGL adapters.
- `roundtrip-ui.js` — visual property review, line diff, history and conversion studio.
- `roundtrip-app-bridge.js` — live watcher, AST refresh, visual/source reconciliation, history and conversion orchestration.
- `roundtrip-node.mjs` — official-parser bridge, recursive filesystem watcher, atomic stale-safe apply and managed preview processes.

## Phase 1 — syntax/AST adapters: complete

The Node bridge attempts the appropriate syntax implementation and falls back conservatively when an optional parser is unavailable.

| Backend | Primary syntax layer | Portable fallback |
| --- | --- | --- |
| Astro | `@astrojs/compiler-rs` or `@astrojs/compiler` | anchored markup scanner |
| React / TSX / JSX | TypeScript compiler API | anchored markup scanner |
| Vue | `@vue/compiler-sfc` + `@vue/compiler-dom` | SFC/template markup scanner |
| Svelte | `svelte/compiler` | markup scanner |
| Tkinter / NiceGUI | Python standard-library `ast` | literal/symbol scanner |
| LVGL C/C++ | `tree-sitter` + `tree-sitter-c` | LVGL symbol/setter scanner |
| Vanilla HTML/JS | portable markup parser | same parser |

Parser packages are installed as optional dependencies. Missing optional parsers therefore reduce confidence and capability instead of making Astro UI Designer fail to start.

AST inspection produces a common node index containing source ranges, stable UI IDs, selector paths, symbol paths, literal attributes, plain text, style values, parser identity and confidence. The Node bridge now also builds range-constrained patch plans directly from validated syntax nodes. Attribute/text edits are limited to the mapped AST element range; style edits use the exact mapped selector range and reparse before a second-range edit. Python edits use AST statement ranges, and LVGL setter edits require tree-sitter validation. The older anchored patcher is retained only as a conservative fallback when an official parser is unavailable or declines a construct.

## Phase 2 — unified visual diff UI: complete

`Round-trip Studio` provides:

- status and dirty-state badges;
- parser/backend/confidence information;
- per-property checkboxes;
- old/new source line diff;
- safe / warning / blocked patch classification;
- stale-source protection;
- selected-node → source review;
- source history and rollback;
- cross-framework import/export;
- backend/adapter capability inventory.

Deselected properties are re-planned from the original source rather than merely hidden from the diff.

## Phase 3 — file watcher bridge: complete

The local Node runtime recursively watches relevant source directories while excluding dependency/build/cache folders. Watch events are exposed through the same workspace API used by the standalone designer.

The application bridge:

1. filters changes through the current project import graph;
2. populates `sourceDirtyFiles`;
3. honors the selected sync mode;
4. reparses only graph-relevant files;
5. updates the AST cache;
6. reconciles stable mapped nodes only when automatic source → design refresh is permitted.

The bridge also fingerprints the visual model, so normal visual edits automatically set `designDirty` without invasive changes to every editor mutation path.

## Phase 4 — node-level source history: complete

Before every source write or rollback, the current source is checkpointed in the designer project. A checkpoint records:

- timestamp;
- node ID;
- relative file path;
- backend;
- source fingerprint;
- source text;
- reason;
- property changes.

The default project-local history keeps the most recent 100 checkpoints. Audit events keep the latest 250 synchronization operations. Rollback itself is a reviewed, stale-safe patch and creates another checkpoint before writing.

## Phase 5 — cross-framework conversion: complete

A versioned neutral UI IR is now the interchange layer for source-backed projects. It preserves:

- semantic element type and tag;
- text;
- literal attributes;
- base styles;
- layout metadata;
- source file/node/symbol/selector identity;
- opaque/expression metadata where exact conversion is unsafe;
- child hierarchy.

Built-in importers cover Astro, React/JSX, Vue, Svelte, HTML, Tkinter, NiceGUI and LVGL. Built-in generators cover Astro, React, Vue, Svelte, plain HTML, Tkinter, NiceGUI and LVGL.

The conversion layer intentionally preserves unsupported expressions as metadata rather than evaluating them. Complex application logic remains code-owned.

## Phase 6 — backend adapter SDK: complete

Every backend now implements one contract:

```text
id / label / family / extensions
capabilities
preview
detect(files)
inspect(context)
importNeutral(context)
generate(context)
buildPatch(context)
applyPatch(context)
validate(context)
```

Adapters can be registered or replaced at runtime. The designer plugin SDK gains a `backendAdapters` provider category so third-party backends can advertise the same contract through the Integrations workbench.

## Safety invariants

- No arbitrary source expression is evaluated for round-trip parsing.
- Writes are constrained to the selected workspace root.
- Every apply checks the baseline fingerprint again immediately before the atomic write.
- Unsafely mapped edits remain review-only or blocked.
- Source history is created before write, not after.
- Code-owned/expression-heavy constructs are preserved rather than guessed.
- Optional parser failure degrades to a lower-confidence fallback instead of deleting source constructs.
- Managed preview uses fixed backend profiles; the round-trip API does not accept arbitrary shell commands.

## Sync modes

### `source-to-design`

Graph-relevant watcher changes are reparsed and stable mapped nodes are refreshed automatically.

### `design-to-source`

Watcher events are recorded but never overwrite visual edits automatically. Visual changes flow through reviewed patch plans.

### `bidirectional-reviewed`

Default. Source changes refresh automatically only while the design is clean. If both sides are dirty, the system holds refresh and surfaces a conflict state.

## Optional parser dependencies

The installer adds these as optional dependencies:

```text
@astrojs/compiler-rs
@astrojs/compiler
@vue/compiler-sfc
@vue/compiler-dom
svelte
typescript
tree-sitter
tree-sitter-c
```

Python uses the interpreter already available on the host. If Python is unavailable, Tkinter/NiceGUI use their conservative source scanner.

## Extension parity

The installer mirrors all browser modules into `vscode-extension/designer/` and installs the same Node syntax/watcher runtime under `vscode-extension/lib/`. VS Code workspace requests support the same inspect, apply, watcher, preview and health routes. Source apply is blocked by fingerprint mismatch and goes through the VS Code workspace edit path when possible.

## Remaining intentional boundaries

All roadmap phases are implemented, but not every language construct is declared safely editable. Examples that remain intentionally code-owned include arbitrary JSX/Vue/Svelte expressions, Python control flow and callbacks, complex LVGL callback logic, macro-generated C UI structures, and framework-specific runtime state. The adapter SDK is the supported place to add increasingly specialized transforms without weakening the safe default behavior.

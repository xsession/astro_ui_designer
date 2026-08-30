# Architecture — Astro UI Designer Storybook + Penpot Clean-Room Edition

## 1. Objective

Build a dense visual engineering IDE that treats **real Astro source** as a first-class project artifact while retaining a framework-independent visual document model.

The core rule remains:

> The canvas, renderer, source model, Astro exporter and running application are separate layers.

This makes the UI useful both for generated projects and existing repositories without binding the document model to one rendering library or compiler implementation.

## 2. Major layers

```text
┌───────────────────────────────────────────────────────────────┐
│ Qt-style Workbench UI                                         │
│ Palette · Project · Sources · Canvas · Inspector · Bottom UI  │
├───────────────────────────────────────────────────────────────┤
│ Editor Services                                               │
│ Commands · Selection · Validation · Stories · Audit · Data    │
├───────────────────────────────────────────────────────────────┤
│ Visual Semantic Model (schema v6)                             │
│ Pages · Nodes · Components · State · Content · Locales        │
│ Workspace · Source Ownership · Tests · Tokens                 │
├───────────────┬────────────────┬──────────────────────────────┤
│ Astro Export  │ Source Adapter │ Integration/Plugin API       │
├───────────────┴────────────────┴──────────────────────────────┤
│ Local Workspace Host (desktop launcher)                       │
│ Safe FS · Git · Project scanner · Astro/Vite child process    │
└───────────────────────────────────────────────────────────────┘
```

## 3. Schema v6 domains

The project model now includes:

- pages/routes and reusable visual components;
- nodes, props, breakpoint styles, freeform geometry and actions;
- design tokens/themes;
- project state variables;
- assets;
- `workspace` source snapshots/mappings/external components/live-preview metadata;
- `content` collections and data sources;
- `locales` and translations;
- component stories/tests and recorded tests;
- editor permission mode/locale/source defaults;
- DTCG token-format metadata.

Research-specific node metadata includes:

- source ownership (`designer`, `hybrid`, `code`);
- client/content exposure policy;
- component variant;
- component state definitions/current state;
- container-query rules;
- full animation definitions: backend, trigger, timing, scroll/view timeline configuration, multi-track arbitrary keyframes and reduced-motion policy;
- visibility condition;
- data context.

## 4. Source-aware workspace

### 4.1 Workspace host

`launch-designer.mjs` is a local host boundary. It is intentionally the only place allowed to perform operating-system functions.

Available local capabilities include:

- workspace open/rescan;
- safe file read/write constrained under the opened root;
- Git status/diff/stage/commit;
- target development-process start/stop;
- project metadata/scanner results.

Paths are normalized and constrained to the selected workspace root. Large generated/dependency directories such as `node_modules`, `.git`, `dist`, `.astro`, `.vercel` and `.netlify` are excluded from scans.

### 4.2 Source scanner

`workspace-tools.mjs` recognizes:

- Astro files;
- TypeScript/JavaScript and React JSX/TSX;
- Vue SFCs;
- Svelte components;
- JSON/Markdown/MDX/CSS support files.

The scanner conservatively infers common prop/slot syntax for Astro, React, Vue and Svelte. Unknown/metaprogrammed declarations are left code-owned rather than fabricated.

### 4.3 Source ownership

Source synchronization uses explicit ownership:

```text
Designer → visual model may manage represented structure.
Hybrid   → safe mapped changes only; preserve handwritten surroundings.
Code     → source remains authoritative.
```

Stable `data-ui-id` attributes form the current conservative mapping surface. `patchAstroNodeByUiId()` changes only a specifically mapped element and rejects a missing/ambiguous target.

A `sourceAdapter` plugin contribution exists for deeper compiler-AST implementations.

## 5. Real preview

The desktop launcher can start the target project's own development command and return the local preview URL. Live mode renders that application in a dedicated iframe.

The architecture deliberately does not proxy or replace Astro/Vite's compiler. A future source/preview bridge can use Vite custom HMR events for bidirectional source/DOM selection synchronization.

## 6. Layout architecture

Normal web authoring uses flow layout:

- Block/Section/Container
- Flexbox Row/Column/Stack
- CSS Grid
- viewport breakpoints
- CSS container queries

The `Freeform Layer` is a scoped exception for dashboard/HMI/overlay workflows. Geometry tools operate only where absolute positioning is intentional.

A deterministic layout advisor can inspect freeform geometry and suggest structured Row/Grid conversion without requiring a remote AI service.

## 7. Components, variants, states and timelines

The component model supports:

- reusable visual component definitions;
- project/external code component descriptors;
- typed props and defaults;
- named/default slots;
- instance prop values;
- component variants;
- named state property overrides;
- timeline/keyframe tracks.

Export maps these concepts onto normal Astro props/slots, data attributes, state selectors and CSS keyframes rather than a proprietary component runtime.

## 8. Data/content

`content` separates authoring data from visual nodes:

```text
Content Collections
Data Sources
  ├─ REST
  ├─ GraphQL
  ├─ JSON
  ├─ Astro Content
  └─ Astro Live Collection
```

Node data context and binding expressions can refer to:

- `state.*`
- `props.*`
- `data.*`
- `locale`

Preview conditions use a restricted evaluator. Arbitrary JavaScript and prototype/constructor access are rejected.

Astro export emits content collection configuration/entries, live-collection stubs and data-driven repeater code where applicable.

## 9. Tokens and design systems

Themes use semantic token records and can convert to/from DTCG-style JSON. CSS custom properties are generated for runtime use.

DTCG is the preferred interoperability boundary for Penpot and other standards-compliant design tools. Rich vendor design-file import remains an `importer` plugin contribution.

## 10. Testing and audits

Testing is a product subsystem, not only repository infrastructure.

Model-level features:

- component stories;
- recorded interaction-test steps;
- browser test adapter;
- exported test descriptors.

Audit services:

- structural accessibility;
- explicit color contrast;
- responsive multi-width issues;
- SEO metadata;
- asset/performance heuristics.

Repository regression testing additionally uses a Chromium DevTools Protocol harness for rendered UI workflows and visual geometry checkpoints.

## 11. Plugin/integration boundaries

The plugin API supports classic editor contributions:

- components;
- actions;
- validators;
- Astro-file transforms.

Research Edition adds provider contributions:

- `assistants`
- `importers`
- `deployers`
- `dataSources`
- `testAdapters`
- `sourceAdapters`
- `tokenAdapters`

The core can therefore remain credential-free while projects install vendor-specific deployment/design/AI adapters separately.

## 12. Astro exporter

The exporter operates on the semantic model and produces ordinary source files. It understands:

- nested Astro routes;
- reusable components/props/slots/variants;
- responsive media/container rules;
- state selectors and timelines;
- design tokens;
- content collections/live config;
- locale/test/source-map artifacts;
- assets;
- framework islands/hydration metadata;
- optional ClientRouter;
- optional lightweight runtime only when interactions require it;
- preserved BYO component source snapshots.

Renderer-specific objects are never persisted as the project format.

## 13. Security boundaries

- Filesystem operations are workspace-root constrained.
- Generated/dependency directories are ignored during scanning.
- Visual conditions are restricted expressions, not `eval`/`Function` execution.
- Unknown source syntax is preserved instead of guessed.
- Vendor credentials are never embedded in the core project.
- Live preview starts a project command only through the explicit local workspace host.

## 14. Deliberate remaining depth

Broad functional paths are now present, but a production IDE can deepen them through independent adapters:

- Astro compiler AST-range structural source patches;
- Vite DOM↔source bridge;
- TypeScript Language Service diagnostics;
- richer real-project component-story rendering;
- vendor design/deployment providers;
- Lighthouse-class performance adapters;
- CRDT collaboration.

These can be added without replacing the visual model or workbench.


## UX shell invariants (2.3.0-ux)

The shell treats layout visibility as explicit session state rather than as incidental DOM layout.

```text
Shell state
├── left dock hidden
├── right dock hidden
├── bottom workbench expanded
├── active bottom destination
└── focus-mode restore snapshot
```

Workspace regions own fixed grid columns and top-level application regions own fixed grid rows. This prevents CSS Grid auto-placement from reordering the canvas, inspector, bottom dock or status bar when a splitter/dock is hidden.

The default hierarchy is canvas-first:

```text
menu + toolbar
workspace
workbench tabs (30 px)
status (23 px)
```

A bottom destination expands the workbench transactionally; selecting the active destination again collapses it. Animation requests a 420 px preferred height, while other workbenches retain the persisted user height.

All compact tab strips provide an explicit destination menu. Horizontal scrolling is an enhancement, not the only way to reach hidden tabs. Toolbar visibility is derived from selection/mode capability, so invalid layout and alignment operations are not presented as continuously active commands.

The corresponding geometry and behavior contracts are enforced by `tests/ux-regression.test.mjs` and `tests/visual-smoke.mjs`.


## 15. Clean-room design/interchange layer (2.4)

Penpot-derived capabilities live behind an independent semantic design layer rather than being mixed into the renderer or Astro exporter.

```text
Canvas / Inspectors / Prototype / Comments
                │
                ▼
      Clean-room Design Semantics
 effects · constraints · guides · flows
 comments · vectors · export presets
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
      CSS      SVG    Prototype runtime
       │        │        │
       └────────┴────────┘
                │
                ▼
        Platform Adapter Layer
 Astro · Penpot v3 · Figma bridge
 HTML · SVG · Neutral JSON
 React · Vue · Svelte
```

`penpot-cleanroom.js` contains the independent design semantics. `platform-io.js` is the interchange boundary. Neither module is the project persistence format and neither is allowed to make Penpot-specific identifiers/classes the primary domain model.

Penpot v3 is handled as the publicly documented ZIP+JSON interchange format. The adapter is version-aware and loss-aware; unsupported future migrations/features must be surfaced rather than guessed. Figma interoperability is deliberately REST-style JSON rather than the closed native `.fig` format.

Shared design libraries are portable local snapshots of components, themes and token metadata. They do not implement Penpot's remote team/library synchronization protocol.

See `docs/PENPOT_CLEANROOM_RESEARCH.md` and `docs/PLATFORM_INTERCHANGE.md`.


## 16. Component Lab / Storybook clean-room layer (2.5)

The Component Lab is a first-class editor service, not an embedded Storybook manager. It uses the same reusable-component definitions that Astro export and multi-platform interchange use.

```text
Reusable component definition
           │
           ├── typed props/slots/states
           │
           ▼
        Stories
 args · globals · tags · steps · assertions · parameters
           │
     ┌─────┼──────────────┐
     ▼     ▼              ▼
 Controls Preview       Docs
     │     │              │
     └─────┴──────┬───────┘
                  ▼
           Test Result Store
 render · interaction · a11y · visual · coverage
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
 Portable JSON  CSF bridge  Agent manifest
```

`storybook-cleanroom.js` owns story semantics, control inference, portable output and test-result helpers. `app.js` owns the Component Lab UI and browser execution. The Lab does not make Storybook source/runtime classes part of the project model.

Component Lab mode is transactional with respect to workspace layout: entering records the previous left/right/bottom dock state, switches the right dock to Story and the bottom destination to Story Results, then restores the previous workspace exactly on exit. This gives isolated-component work sufficient canvas width without permanently changing the user's main design layout.

The built-in accessibility and visual checks are deliberately offline and deterministic. axe-core, Playwright, Vitest/V8/Istanbul, hosted pixel-diff services and MCP are provider/integration boundaries rather than mandatory editor dependencies. See `docs/STORYBOOK_CLEANROOM_RESEARCH.md` and `docs/COMPONENT_LAB.md`.

## VS Code extension architecture (2.5.1)

The VS Code extension is an adapter around the same browser/desktop designer, not a fork of the editor.

```text
VS Code workbench
├── Activity Bar Astro workspace tree
├── commands / status bar
├── optional CustomTextEditorProvider
├── TaskProvider
├── DiagnosticCollection
├── Testing API controller
└── webview host
      │ request/response bridge
      ▼
standalone designer
├── app/model/validator
├── Astro exporter
├── Component Lab
├── animation editor
├── Penpot/interchange
└── workspace-client
```

`workspace-client.js` first checks for the VS Code request bridge. If it is absent, it falls back to the standalone launcher's local HTTP workspace API. This keeps all editor/domain modules host-independent.

The VS Code host owns privileged operations: filesystem access, Git, npm/Astro process execution and native VS Code diagnostics/tasks/testing. The webview owns visual state and calls these operations through structured messages.

Writes to files that already have a VS Code `TextDocument` use `WorkspaceEdit` plus `document.save()`; unopened files use `workspace.fs.writeFile`. This avoids bypassing VS Code's normal buffer lifecycle.

See [VSCODE_EXTENSION.md](VSCODE_EXTENSION.md).


## Codebase composition layer (2.6.0)

The composition layer is framework- and vendor-neutral and sits above the core document model:

```text
Astro/React/Vue/Svelte discovery
             │
             ▼
    Code Component Contract
             │
      ┌──────┼────────┐
      ▼      ▼        ▼
   Mixins  Global   Queries/Contexts
           Variants
      └──────┼────────┘
             ▼
     Effective UI model
             │
       ┌─────┴─────┐
       ▼           ▼
    Canvas      Astro exporter
```

`standalone/js/plasmic-cleanroom.js` contains the independent composition services. The filename records the clean-room research lineage; the persisted schema itself is `project.composition` and is not a Plasmic data model.

### Source-first data execution

Query descriptors are authored visually, but generated requests execute in the target application. `generateQueryModule()` emits `src/data/ui-queries.ts`. The editor only evaluates deterministic local previews and mock network results. This prevents production credentials and request traffic from becoming coupled to a builder service.

### Style order

Effective visual style is resolved in this order:

```text
base node style
→ breakpoint overrides
→ component state overrides
→ applied mixins
→ active global-variant overrides
```

The exporter follows the same semantic pipeline and emits normal CSS. Global variant values are represented using `data-ui-global-*` attributes on the document root.

### Refactorability

References are stable IDs. `findUsages()` can locate component, asset, mixin, token, global-variant, query and context references. Component replacement preserves instance prop values by name and records a refactor event rather than silently discarding configuration.

## Hermes Agent / MCP integration (2.7.0)

The Hermes integration is a host-side automation layer and does not become part of the browser renderer or project schema.

```text
Hermes Agent
    │
    ├── progressive skill instructions
    │
    └── native MCP client
            │ stdio JSON-RPC
            ▼
integrations/hermes/mcp/server.mjs
            │
            ▼
      ProjectService
            │
      ┌─────┼──────────┐
      ▼     ▼          ▼
   model  validator   exporters/audits
      │
      ▼
designer-project.json
```

Important boundaries:

- one project file per server process;
- no generic shell tool;
- no unrestricted filesystem tools;
- atomic writes and optional optimistic revision checks;
- read-only mode for review-only agents;
- export output constrained to the project workspace;
- model/validator/exporter modules are reused directly instead of reimplementing designer semantics for Hermes.

See `docs/HERMES_AGENT.md` for setup and tool details.

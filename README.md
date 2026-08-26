# Astro UI Designer Pro — Research + Animation + UX Edition

A clean-room, **Qt Creator / Qt Designer-style visual IDE for real Astro projects**. The editor combines a dense engineering workbench with source-aware editing, live Astro/Vite preview, reusable code components, responsive CSS authoring, structured content/data, design tokens, Git, visual tests, a CSS/WAAPI animation timeline, and normal readable Astro output.

The `2.3.0-ux` build also refines the shell around a canvas-first hierarchy: collapsible docks, a tabs-only default workbench, focus mode, explicit hidden-tab menus, contextual toolbar actions, first-use layout guidance, and compact-safe animation controls.

The project is intentionally **not** a proprietary page-builder runtime. The generated project remains an ordinary Astro source tree, and existing project code can stay code-owned or hybrid-owned when the visual editor cannot safely restructure it.

## Run

Desktop-style launcher (recommended):

Windows:

```bat
run-designer.bat
```

Linux/macOS:

```bash
./run-designer.sh
```

or:

```bash
npm start
```

The launcher serves the IDE at `http://127.0.0.1:8766` and exposes local-only workspace/Git/dev-server APIs. The editor UI itself remains zero-runtime-dependency HTML/CSS/ES modules.

## The primary workflow

```text
Existing Astro repository
        │
        ├── source scanner / source snapshots
        ├── external Astro/React/Vue/Svelte components
        ├── Git workspace
        └── target Astro/Vite dev server
                    │
                    ▼
             Astro UI Designer
       ┌───────────┼────────────┐
       │           │            │
     Design       Code         Split
       │           │            │
       └───────────┴────────────┘
                    │
                 Preview
                    │
              normal source
```

Use **Workspace** to open an existing Astro project. Source-aware files appear in Sources, reusable code components are discovered into the palette, Git status/diff becomes available, and **Live** can launch the target project's own development server when its dependencies are already installed.

## Animation workbench

Open **Animation** in the bottom dock to author motion with multiple property tracks and keyframes, scrub/play/reverse the timeline, apply presets, configure scroll/view progress, and choose **Auto**, **CSS**, or **JavaScript / Web Animations API** output. Auto prefers CSS for declarative and scroll-driven motion and WAAPI for event/manual playback. The Astro export emits normal @keyframes for CSS animations and a readable `src/scripts/ui-animation-definitions.ts` registry for JavaScript-backed animations. See [docs/ANIMATION_EDITOR.md](docs/ANIMATION_EDITOR.md).

## UI/UX refinement

The default shell now keeps the canvas primary without losing the dense Qt Creator-style workflow:

- the bottom workbench starts as a 30 px tabs-only strip;
- re-clicking an active workbench tab collapses it;
- left/right docks can be toggled independently;
- F11 enters a reversible canvas Focus mode;
- every overflowing dock strip has an explicit `…` destination menu;
- the Palette is a readable one-column list with collapsible categories;
- root pages have quick-start Section, Container and Freeform/HMI actions;
- invalid toolbar actions disable or disappear contextually;
- generated animation code uses progressive disclosure and remains visible above the status bar at 1366×768.

Keyboard shortcuts include `Ctrl/Cmd+Shift+1/2/3` for the left/right/bottom panels and `/` for Palette search. The complete findings, measured regressions and fixes are documented in [docs/UI_UX_AUDIT_AND_FIXES.md](docs/UI_UX_AUDIT_AND_FIXES.md).

## Source ownership and guarded round trip

Each visual node has an ownership policy:

- **Designer** — visual editor may manage represented structure/properties.
- **Hybrid** — visual editor may synchronize selected mapped attributes/content while preserving surrounding handwritten source.
- **Code-owned** — source remains authoritative; the node is visible/selectable but not broadly rewritten.

Controlled synchronization uses stable `data-ui-id` mappings. This build deliberately does **not** claim that arbitrary handwritten Astro/TypeScript can always be restructured losslessly. A `sourceAdapter` plugin boundary is available for deeper compiler-AST transformations.

## Research-derived feature set

### Source / IDE

- Design, Code, Split, Preview and Live modes.
- Existing Astro workspace scanner.
- Safe local file read/write through the desktop launcher.
- Controlled `data-ui-id` source patching.
- Optional Astro compiler adapter path.
- Project source browser/editor.
- Astro/React/TSX/Vue/Svelte component discovery.
- Common prop/slot inference and visual insertion.
- Git status, diff, stage and commit.
- Real target Astro/Vite dev-process start/stop.

### Qt-style design workflow

- Dense docked component palette, project/source/component/asset browsers.
- Multiple document tabs.
- Object tree and Property/Layout/Actions/Bindings/Code/Variants/Data inspectors.
- Resizable left/right/bottom docks.
- Multi-selection, alignment/distribution, z-order and context menu.
- Freeform/HMI layer with drag/resize/grid snapping.
- Flow-mode Flexbox/Grid/Section/Container/Row/Column/Stack authoring.
- Undo/redo, clipboard, duplicate/delete, wrap/move operations.
- Keyboard nudge/resize and command palette.

### Modern responsive web layout

- User-editable viewport breakpoints.
- Per-breakpoint CSS overrides.
- CSS container names/types and visual container rules.
- Generated `@container` queries.
- Flex/Grid fields mapped directly to CSS concepts.
- Deterministic freeform → responsive Row/Grid layout advisor.
- Design/Preview zoom and responsive audits.

### Design systems

- CSS-variable tokens and themes.
- DTCG 2025.10-style token import/export.
- Token picker/application.
- Component props, slots, variants and named states.
- Full multi-track animation editor with arbitrary keyframes, CSS/WAAPI export, transport controls, scroll/view timelines, presets and reduced-motion policies.
- Optional Astro ClientRouter/view-transition generation.
- Plugin token/design importer contributions.

### Content / data / application behavior

- Astro Content Collections model/editor/export.
- Collection schemas and local entries.
- Live-collection provider foundation.
- REST, GraphQL and JSON data-source descriptors + preview.
- Repeater/data-driven component.
- State, props, data and locale bindings.
- Restricted visual condition evaluator (no arbitrary JavaScript execution).
- Signals/actions including navigation, visibility, state, component-state and timeline actions.
- Forms and native validation fields.

### Client handoff / localization

- Designer / Content / Client permission modes.
- Per-node exposure policy.
- Locales and translations.
- Per-page SEO metadata.

### Testing / audits

- Component stories.
- Recorded visual interaction tests.
- Browser test adapter.
- Structural accessibility checks.
- Explicit color contrast checks.
- Responsive multi-width audit.
- SEO audit.
- Asset/performance audit.
- Problems navigation.
- Rendered Chromium regression suite, a dedicated UX regression suite and nine visual checkpoints.

### Integrations

The plugin contribution API supports:

- assistants
- design/token importers
- deployers
- data providers
- test adapters
- source adapters
- token adapters

A built-in offline responsive-layout advisor, DTCG/Penpot token adapter, Astro controlled-source adapter, data providers and browser-test adapter demonstrate the contract. Vendor credentials for remote AI, cloud deployment and proprietary design-file APIs are intentionally external.

## Astro output

A generated project can contain:

```text
package.json
astro.config.mjs
tsconfig.json
designer-project.json
designer-source-map.json
tokens/
  design-tokens.json
public/
  assets/
src/
  components/
  content/
  layouts/
    BaseLayout.astro
  pages/
  scripts/
    ui-runtime.ts
  styles/
    global.css
  i18n/
    ui-translations.json
  content.config.ts
  live.config.ts
tests/
  ui-designer.tests.json
```

Existing discovered component source snapshots under `src/` are preserved in export when they are not replaced by a generated designer file.

## Tests

Run everything:

```bash
npm test
```

Visual checkpoints only:

```bash
npm run test:visual
```

Regenerate the reference Astro output:

```bash
npm run generate:example
```

The current Research + Animation + UX Edition has **18 automated suites**. They cover schema/migration, validation, Astro export, research features, workspace/source scanning, plugin contributions, every registered GUI element/property/action class, shell/panel workflows, compact/focus-mode UX regressions, freeform interaction parity, rendered browser behavior, the full animation workbench, and nine visual checkpoints.

See:

- `TEST_REPORT.md`
- `docs/WEB_RESEARCH_AND_IMPLEMENTATION.md`
- `docs/ANIMATION_EDITOR.md`
- `docs/UI_UX_AUDIT_AND_FIXES.md`
- `docs/FULL_FEATURE_MATRIX.md`
- `docs/ARCHITECTURE.md`
- `docs/PLUGIN_SDK.md`

## Important boundaries

- The core avoids destructive guesses for arbitrary handwritten Astro/TypeScript.
- Live target preview requires the target project's dependencies and usable `dev` command.
- Full Figma/Penpot document import, vendor deployment and remote AI are provider integrations; the core includes their extension points but no external credentials.
- Browser-only mode cannot provide local process/Git/filesystem capabilities without the desktop launcher.

These boundaries are intentional: preserving source ownership is more important than pretending unsupported transformations are safe.

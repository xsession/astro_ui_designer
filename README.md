# Astro UI Designer Pro — Color Picker Edition

A clean-room, **Qt Creator / Qt Designer-style visual IDE for real Astro projects**. The editor combines a dense engineering workbench with source-aware editing, live Astro/Vite preview, reusable code components, responsive CSS authoring, structured content/data, design tokens, Git, visual tests, a CSS/WAAPI animation timeline, and normal readable Astro output.

The `2.10.0-color-pickers` build keeps the complete CSS Tools/manual-layout system and adds paired visual color pickers everywhere the GUI edits color-bearing values. Raw CSS text stays editable, including variables, gradients, borders, shadows and modern color functions.

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

## VS Code extension

The repository now includes a first-class extension under [`vscode-extension/`](vscode-extension/) and a prebuilt VSIX in `vscode-extension/dist/`. It embeds the same full designer rather than maintaining a second UI implementation.

Install the packaged extension from VS Code with **Extensions → … → Install from VSIX…**, or from a shell with:

```bash
code --install-extension vscode-extension/dist/astro-ui-designer-vscode-2.10.0.vsix
```

The extension adds:

- an **Astro UI Designer** Activity Bar workspace explorer;
- optional **Reopen With → Astro UI Designer** support for `.astro`, `.astro-ui.json`, and `designer-project.json`;
- commands for Design, Component Lab, Animation, Interchange, Live Preview, validation, tests, and export;
- VS Code filesystem/edit integration, Git bridge, Astro dev-server lifecycle, diagnostics, Test Explorer discovery, and task contribution;
- active `.astro` source synchronization between the code editor and visual designer.

See [docs/VSCODE_EXTENSION.md](docs/VSCODE_EXTENSION.md) for architecture, commands, security boundaries, and development instructions.

## Hermes Agent integration

The repository now ships a **project-scoped MCP server** plus a validated **Astro UI Designer skill** for Hermes Agent under [`integrations/hermes/`](integrations/hermes/). Hermes can inspect the semantic design graph, search nodes, validate/audit, find usages, create pages/nodes/actions/animations/stories/queries, apply templates, inspect generated source, and export Astro/interchange output without receiving a generic shell or unrestricted filesystem tool.

Quick setup:

```bash
node integrations/hermes/install.mjs --project /absolute/path/to/designer-project.json
```

Add `--apply` when the `hermes` CLI is installed and you want the installer to run `hermes mcp add` + `hermes mcp test` automatically. Add `--read-only` to the MCP server arguments for inspection-only operation.

The server supports current MCP 2026-07-28 discovery and the 2025 initialize handshake for compatibility. Mutations are atomic and accept `expectedRevision` for optimistic concurrency. See [docs/HERMES_AGENT.md](docs/HERMES_AGENT.md).

## Direct text and content alignment

Open the **Layout** inspector for the selected object. The alignment block provides:

- **Text:** Left, Center, Right, Justify.
- **Content X:** Start, Center, End.
- **Content Y:** Start, Center, End.

For Flex containers, X/Y are mapped to the correct `justify-content` / `align-items` axis according to `flex-direction`, so a column still aligns horizontally with **Content X**. For Grid containers, X uses `justify-items` and Y uses `align-items`. Content controls disable themselves for non-Flex/Grid objects rather than silently changing the object's display mode. Multi-selection applies text alignment to every selected object in one undoable operation.

## Universal color pickers

Every structured field that edits a color-bearing value now shows the raw CSS value and a visual swatch side by side. The shared control is used by Layout appearance, CSS Tools, fills/strokes/shadows, design tokens, manual/prototype guides, animation color keyframes, component/code-component props, Component Lab controls and color-valued local CSS variables.

The text value stays authoritative: `var(...)`, `rgba(...)`, `hsl(...)`, gradients, borders and shadows remain directly editable. Picking a color changes only the color token inside a compound value where possible; it does not discard border widths, gradient structure or shadow geometry.

## Structured CSS Tools

Open **CSS Tools** from the bottom workbench or from **Layout → CSS tools…**. The workbench includes box-model side controls, border/radius, gradients, shadows, filters, typography, transforms, transitions, behavior utilities, local CSS custom properties, generated CSS preview, and Base/Hover/Focus/Focus-visible/Active/Disabled style layers.

See [docs/CSS_EDITING_UTILITIES.md](docs/CSS_EDITING_UTILITIES.md) for the full workflow and export rules.

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

## Component Lab

Open **Lab** to work on reusable components in isolation. The editor temporarily dedicates the left side to story hierarchy, the center to the live component scenario and globals, the addon area to Controls/Interactions/A11y/Visual/Docs, the right inspector to Story metadata, and the bottom workbench to consolidated Story Results. Leaving Lab restores the previous workspace.

The Lab supports inferred Controls from typed props, named stories/tags, viewport/theme/locale/background/direction/layout globals, story matrices, interaction steps/assertions, per-story accessibility policy, local geometry/style visual baselines, render/interaction/a11y/visual test selection, Watch mode, foundation coverage, Markdown Autodocs, portable-story JSON, React/Vue/Svelte CSF bridge generation and an agent-readable component manifest. The compact 1366 px layout wraps globals so none are hidden behind horizontal scrolling. See [docs/COMPONENT_LAB.md](docs/COMPONENT_LAB.md) and [docs/STORYBOOK_CLEANROOM_RESEARCH.md](docs/STORYBOOK_CLEANROOM_RESEARCH.md).

## Composition workbench

Open **Composition** for rich framework-neutral code-component contracts, reusable style mixins, global variants, contexts/actions and node data bindings. The bottom **Queries**, **Templates**, and **Usages** workbenches support app-local server/client query descriptors, insertable project patterns, project-wide reference search and component replacement while preserving prop values. Astro export emits normal source modules under `src/data/` and `src/composition/`; the generated application owns query execution rather than proxying data through the editor. See [docs/COMPOSITION_WORKBENCH.md](docs/COMPOSITION_WORKBENCH.md) and [docs/PLASMIC_CLEANROOM_RESEARCH.md](docs/PLASMIC_CLEANROOM_RESEARCH.md).

## Manual canvas & layout editing

Open **Layout Tools** for precision/manual geometry work. The canvas supports eight-direction resize, rotation, nested freeform dragging, smart snapping, persistent rulers/guides, Alt distance measurement, spacing/x-ray overlays, smart spacing handles, Tidy, proportional selection scaling, direct Flex-gap dragging, click-to-place Grid cells, fixed/fill/hug sizing, flow/relative/absolute/fixed/sticky positioning, constraints and layout apply/break/inference commands. Editor-only guides and measurements never become Astro runtime dependencies. See [docs/MANUAL_LAYOUT_CLEANROOM_RESEARCH.md](docs/MANUAL_LAYOUT_CLEANROOM_RESEARCH.md).

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
- Rendered Chromium regression suite, dedicated UX/composition regression suites and fourteen visual checkpoints.

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

The current Codebase Composition Clean-Room Edition has **25 automated designer suites** plus **8 VS Code extension tests**. They cover schema/migration, composition contracts, validation, Astro export, Storybook/Penpot clean-room features, workspace/source scanning, platform interchange, plugin contributions, every registered GUI element/property/action class, shell/panel workflows, compact/focus-mode UX regressions, freeform interaction parity, rendered browser behavior, the animation workbench, Composition/Queries/Templates/Usages, and fourteen visual checkpoints.

See:

- `TEST_REPORT.md`
- `docs/WEB_RESEARCH_AND_IMPLEMENTATION.md`
- `docs/ANIMATION_EDITOR.md`
- `docs/UI_UX_AUDIT_AND_FIXES.md`
- `docs/PENPOT_CLEANROOM_RESEARCH.md`
- `docs/PLATFORM_INTERCHANGE.md`
- `docs/STORYBOOK_CLEANROOM_RESEARCH.md`
- `docs/COMPONENT_LAB.md`
- `docs/FULL_FEATURE_MATRIX.md`
- `docs/ARCHITECTURE.md`
- `docs/PLUGIN_SDK.md`

## Important boundaries

- The core avoids destructive guesses for arbitrary handwritten Astro/TypeScript.
- Live target preview requires the target project's dependencies and usable `dev` command.
- Penpot v3 ZIP/JSON import/export and a Figma REST-style JSON bridge are implemented; native closed Figma `.fig`, exact Penpot server collaboration, and vendor credentials are intentionally not fabricated.
- Browser-only mode cannot provide local process/Git/filesystem capabilities without the desktop launcher.

These boundaries are intentional: preserving source ownership is more important than pretending unsupported transformations are safe.

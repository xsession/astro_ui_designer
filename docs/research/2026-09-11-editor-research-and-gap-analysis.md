# Editor research and gap analysis — 2026-09-11

**Scope.** Deep research of five reference editors — draw.io (diagrams.net),
Penpot, Plasmic, Storybook, and EEZ Studio — focused on the *editor* surface:
canvas model, direct manipulation, inspector/formatting model, shortcuts,
workbench/panel architecture, and UI/UX micro-interactions. The goal is a
prioritized gap list for Astro UI Designer Pro (v2.20) and a concrete
implementation plan for the highest-value, in-scope features.

Method: official docs, GitHub repos/release notes, and community writeups
(URLs at the end). Prior clean-room research docs in `docs/features/`
(PENPOT_CLEANROOM_RESEARCH.md, PLASMIC_CLEANROOM_RESEARCH.md,
STORYBOOK_CLEANROOM_RESEARCH.md, MANUAL_LAYOUT_CLEANROOM_RESEARCH.md) already
record what was adopted in 2.4–2.10; this document covers what is **still**
missing, plus editor-UX patterns none of those passed addressed.

## 1. Per-project findings (editor-focused)

### 1.1 draw.io (diagrams.net)

Canvas model: infinite canvas, multiple pages, **layers**, grid + guides,
zoom/pan, mini-map. Objects split into **vertices** (shapes) and **edges**
(connectors with waypoints, orthogonal routing, arrow markers, labels,
exit/entry points).

Editor features:
- **Right-click context menu** on every object and on the canvas — the primary
  power-user affordance (draw, insert, copy format, change style, group,
  order, align).
- **Format panel** with tabs: Text (font family/size/style/color/align/spacing),
  Shape (fill, stroke, shadow, 3D, rounding), Arrange (x/y/w/h, rotation,
  opacity, flip, align, distribute), Page (size, orientation, background).
- **Multi-edit:** formatting several selected objects at once.
- **Copy format / Paste format** (`Ctrl+Shift+C` / `Ctrl+Shift+V`) — copies only
  visual style between objects, independent of subtree clipboard.
- **Zoom:** `Ctrl/Alt + wheel`; on-canvas zoom cluster in the bottom-left
  (−, %, +, fit, reset); `Ctrl+0` reset, `Ctrl+Shift+H` fit window.
- **Pan:** `Space + drag` or middle/right-drag; `Alt+Ctrl+Shift + drag`
  moves an *area* of the diagram; `Ctrl+Shift + drag` rubber-bands a region.
- **Grid + snapping:** configurable grid size, snap toggle; `Shift+cursor`
  moves by grid cell; `Ctrl+Shift+cursor` resizes by grid cell.
- Selection: `Ctrl/Shift+click` toggle, marquee, `Alt+Shift` deselection
  marquee; `Ctrl+Shift+I` select all vertices, `Ctrl+Shift+E` select all
  edges.
- Insert: image, diagram, HTML shape, equation (LaTeX/AsciiMath), table,
  shapes from swim-lane/flowchart/UML/ER libraries; **double-click on empty
  canvas opens a shape selector** to insert at cursor.
- Auto-layouts (orthogonal, flowchart, tree, radial, organic, hierarchy)
  applied to selected subgraph.
- Export: PNG/SVG/HTML/PDF/MXGraph XML; import: HTML, SVG, PlantUML, Mermaid,
  CSV, .drawio.
- Status bar: nothing prominent, but the **bottom-left zoom control** and
  on-hover edge/vertex handles carry the state.

Key UX patterns: context menu as the universal command surface; format-copy as
a first-class operation; wheel zoom anchored at cursor; grid-cell keyboard
nudging; double-click-to-insert.

### 1.2 Penpot (open-source design platform)

Canvas model: files → pages → **boards/frames** → shapes; groups, z-order,
sections (2.x). Vectors with **pen tool** and boolean operations; text with
auto width/height.

Editor features:
- **Auto-layout** (Flex + CSS Grid): direction, gap, padding, align/justify,
  child sizing `hug / fill / fixed`. This is the core layout engine and it is
  *first-class on the canvas*, not just CSS fields.
- Right inspector ordered **Layout → Position → Appearance (fills/strokes/
  shadows/blend/opacity) → Typography → More**, each section collapsible.
- Left toolbar: select, frame, shapes, pen, text, image, comment, connector,
  grid, ruler.
- **Design tokens** (W3C DTCG): token sets, **modes/themes**, typography and
  spacing tokens; switching a theme re-styles the whole canvas.
- Components: **variants**, instance overrides, nested instances, library
  sync.
- Canvas feedback: **selection shows W×H and X/Y in an on-canvas badge**;
  rulers + guides + smart snap lines; **Alt-measurement** to hovered object;
  hover outline; on-canvas type name badge.
- **Ctrl+wheel zoom**, Space-drag pan, `Ctrl+Shift+H`/`1:1` resets; on-canvas
  zoom indicator.
- Prototyping: triggers (on click / mouse enter/leave / after delay) → actions
  (navigate / open-overlay / toggle / back / open URL), overlays, conditions,
  variables, code action.
- Export per-layer PNG/SVG/PDF; `.penpot` v3 (ZIP+JSON) open format.

Key UX patterns: the **on-canvas W×H/X×Y selection badge** (already partially
done via Alt-measure in this repo), auto-layout as canvas semantics,
token-mode theming, right-inspector section order.

### 1.3 Plasmic (visual builder)

Editor chrome: left panel (components / assets / data), center canvas, right
panel (style / props / events / actions), device/breakpoint switcher.

- Canvas: drag from palette, hover quick-actions, **inline text editing**,
  breakpoint switching, device preview.
- **Style editing grouped by category** (spacing, size, layout, background,
  border, radius, shadow, typography, opacity, transform, transition) with
  **state variants** (hover/focus/active/disabled) and **breakpoint
  overrides** — i.e. the same property editable per state and per breakpoint
  from one control.
- Data: data queries (collections / static / HTTP / GraphQL / custom),
  **repeat/map over arrays**, **conditional rendering**, content collections
  CMS (schema + entries + publish).
- Actions/events with built-in actions (navigate, show/hide, set variable,
  open modal, submit form) or code snippets; local/global state variables.
- Navigation: routes, pages, **layouts with slots**.
- Codebase integration: create project from codebase, sync components, publish
  to repo.

Key UX patterns: category-grouped style inspector; state × breakpoint matrix
for one property; map/conditional as first-class canvas node semantics.

### 1.4 Storybook (component-driven workflow)

Manager UI: sidebar tree (components → stories), search/filter, tags,
settings. Preview/toolbar: viewport selector, globals toolbar, right addon
panel, story navigation, **URL-encodable selection state**.

- **Controls** inferred from `argTypes` (text, number, boolean, select, radio,
  object, array, date, color, function, range); inline vs collapsed.
- **Autodocs**: per-component Markdown generated from CSF meta + stories
  (args table with types/defaults, source, embedded controls).
- **Test runner UI in the manager**: run story tests (play functions),
  filter, per-story pass/fail, a11y via axe, visual regression.
- **Storybook 10**: Vite-based, docs-first, test runner GA, `componentsManifest`
  default-on.
- **AI/MCP**: `@storybook/addon-mcp` exposes 6 tools across 3 toolsets (dev,
  docs, testing): `list-all-documentation` / `get-documentation` (component
  discovery), `preview-stories`, `run-story-tests` (with `a11y:true`).

Key UX patterns: component **manifest** consumed by agents; docs generated from
metadata; test results surfaced in the manager UI, not just CI.

### 1.5 EEZ Studio (EEZ HMI / hardware design suite)

This is the most architecturally relevant reference for a *dense engineering
IDE*:

- **Workspace/panel architecture.** The project editor splits into three
  groups: *toolbars*, *panel windows*, and *page editors/viewers*. Panels and
  editors can be grouped into **tabsets**, and tabsets are **dockable** — into
  the free workspace *or* along the borders (left/right/bottom). A **border
  tabset** shows one panel at a time (click to open, click again to close); a
  **workspace tabset** can split space with a neighbor. Panels can be
  *maximized/restore*d per tabset. The whole arrangement **is the workspace**,
  and workspaces are **saved as files** — you can have several named
  workspaces (e.g. "edit", "review", "debug") and switch between them.
- **Right-click menus** on panel items (Find all references, Lock All,
  Show All, Maximize/Restore).
- **Search & Replace** panel with project-wide criteria.
- Page editing: **drag & drop widgets** from a palette; multi-select in the
  canvas *or* the Page Structure tree (Shift = range, Ctrl = toggle);
  multi-select exposes an extra **Align + Distribute** subsection in the
  Properties panel.
- Page view: `Ctrl + wheel` zoom, `Shift + wheel` horizontal scroll, wheel
  vertical scroll, middle/right-drag to move, **double-click resets zoom +
  centers**.
- **User Widgets / User Actions** = reusable, nestable components created
  from a selection ("Create User Widget" in the right-click menu).
- Project = a JSON file (`project.json`) + panels; CLI (`eez-studio-cli`)
  exports/generates (Gerber, 3D, BOM).

Key UX patterns: **workspaces-as-files** (named, switchable, persisted
panel layouts), border tabsets that single-open, per-tabset maximize,
"Create reusable from selection", and a project-wide Search & Replace.

## 2. Gap analysis vs Astro UI Designer Pro 2.20

What the repo already has (verified in code): multi-select/marquee/drag/
resize/rotate/align/distribute/group/flip/lock; rulers, guides, snapping,
Alt-measure; design/code/split/preview/simulate/lab modes; CSS editors;
components/variants/states/props/slots; style mixins, global variants, design
tokens (DTCG + Penpot boundary), themes; animation timeline; prototype
flows; 42 relocatable dock panels + floating windows + persisted layout;
command palette; editable hotkeys; tooltips; Draw.io import/export; Penpot /
Figma / HTML / SVG interchange; round-trip backends; Git; simulation; MCP;
Component Lab (Storybook-style) with stories/controls/tests/autodocs/
portable-stories/component-manifest/CSF-bridge; a status bar (selection /
middle / doc) and a zoom label in the canvas head.

**Still missing (editor-UX gaps), ranked by value/effort:**

| # | Feature | Source pattern | Effort | Value |
|---|---------|----------------|--------|-------|
| G1 | **Canvas right-click context menu** (on node + on empty canvas) | draw.io / Penpot / EEZ | M | Very high — the universal power-user surface; currently the only canvas context menu is on dock tabs |
| G2 | **Copy format / Paste format** (Ctrl+Shift+C / V) | draw.io | M | High — restyle multiple objects at once without moving them |
| G3 | **Ctrl + wheel zoom** anchored at cursor, plus on-canvas zoom cluster & percent presets | draw.io / Penpot / EEZ | S | High — zoom is currently keyboard/button only |
| G4 | **Status bar: zoom %, cursor X/Y (artboard px), page node count** | Penpot / EEZ | S | High — constant spatial feedback |
| G5 | **Selection W×H dimension badge on canvas** | Penpot | S | High — complements existing Alt-measure |
| G6 | **Grid show/hide toggle + snap to grid control** in View | draw.io | S | Med-High — gridSize exists in settings but no visible toggle |
| G7 | **Canvas pan** (Space+drag and middle-drag), double-click empty = reset view | draw.io / Penpot / EEZ | S-M | Med — large artboards currently require scrollbars |
| G8 | **Workspaces (layouts-as-files)**: named saved panel arrangements, apply/save/delete, switch | EEZ | M | Med-High — powerful for multi-task engineering, directly matches the dock system already present |
| G9 | **Double-click empty canvas → quick-insert shape picker** | draw.io | S | Med |
| G10 | **Project-wide Search & Replace** panel (node names/props/text) | EEZ | M | Med |
| G11 | **Create reusable component from selection** surfaced on canvas | EEZ / Plasmic | S | Med — "extract from selection" exists in components; expose in context menu |
| G12 | On-canvas hover quick-actions (move-to-front, lock, duplicate) | Plasmic | M | Med |
| G13 | Per-property state × breakpoint matrix in one control | Plasmic | L | Med |
| G14 | Mini-map | draw.io / Penpot | L | Low-Med (large artboards) |
| G15 | Layer system (above z-order groups) | draw.io | L | Low for a UI designer |
| G16 | MCP toolset expansion mirroring Storybook `addon-mcp` (docs/testing toolsets) | Storybook | M | Med — MCP server already exists; add story-preview + run-story-tests + get-documentation tools |

**Chosen for this pass (2.21):** G1, G2, G3, G4, G5, G6, G7, G8, G9 —
all high-value, in-scope, zero new dependencies, and they collectively
transform the canvas into a draw.io/Penpot-grade direct-manipulation surface
plus an EEZ-grade workspace system. G10–G16 are recorded as follow-ups.

## 3. Implementation plan (2.21)

1. **Canvas context menu** (`app.js`): bind `contextmenu` on designer nodes and
   on the empty canvas. Node menu: Cut/Copy/Copy Format/Paste/Paste Format/
   Duplicate/Delete, Group/Ungroup, Bring to Front/Send to Back, Flip H/V,
   Lock/Unlock, Extract as Component, and (multi-select) Align/Distribute
   submenu. Empty-canvas menu: Paste, Add at cursor (shape picker),
   Select All, Reset View, Toggle Grid. Reuses `.dock-context-menu` styling.
2. **Copy format** (`app.js`): `state.formatClipboard` captures the union of
   `style` (all breakpoints) + `design.effects` from top-level selection;
   paste applies to current selection without touching structure/props.
   Commands `edit.copyFormat` / `edit.pasteFormat`, hotkeys `Ctrl+Shift+C/V`.
3. **Wheel zoom** (`app.js`): on `#artboard-shell`, `Ctrl/⌘+wheel` (and plain
   wheel while over the canvas with Ctrl) zooms centered on the pointer by
   adjusting the shell scroll offset before/after the scale change; clamped
   0.25–4. Canvas-head zoom cluster gains a percent **dropdown** with presets
   (25/50/75/100/150/200/300) and Fit; `Ctrl+wheel` and the dropdown stay in
   sync via the existing `#zoom-label`.
4. **Status bar** (`app.js` `renderStatus` + a `pointermove` handler):
   selection span gains W×H when dimensions exist; middle span gains
   `zoom% · x,y px · N nodes`; cursor coords computed from the artboard
   bounding rect divided by zoom.
5. **Selection W×H badge** (`app.js` `renderSelectionOverlay`): a small
   `#selection-dim-badge` pinned under the selection overlay showing
   `W × H` (and `X, Y` for freeform).
6. **Grid toggle + snap** (`app.js` + `index.html`): View menu command
   `view.toggleGrid` flips a `state.gridVisible` (persisted) that toggles the
   `.artboard-shell` grid background; `view.toggleSnap` flips
   `project.manualLayout.settings.snapEnabled`. Toolbar quick buttons added.
7. **Canvas pan** (`app.js`): Space held or middle-button drag on the shell
   scrolls it; double-click on empty canvas = `fitCanvas()`. Prevents the
   drag from starting a marquee while panning.
8. **Workspaces / layouts-as-files** (`app.js` + new `workspaces.js` module):
   a `project.workspaces` array of named layouts capturing `dockLayout`,
   dock widths/heights, and current breakpoint. UI in the **Docks** toolbar
   dropdown (or a dedicated bottom tab) lists workspaces with Apply / Save /
   Delete, plus "Save Current As…". Applying restores dock state through the
   existing `dockState`/`persistDockLayout` machinery.
9. **Double-click empty canvas → insert picker** (`app.js`): a small popover
   listing the palette shape components (Rectangle, Ellipse, Text, Button,
   Container) that inserts one at the cursor position in the current
   freeform/section parent.

Tests: extend `dock-ui-integration.test.mjs` / add `canvas-context-menu.test.mjs`,
`copy-format.test.mjs`, `canvas-viewport.test.mjs` (wheel zoom/pan/grid/badge),
`workspaces.test.mjs`; register in `run-all.mjs`. Then sync the VS Code
mirror, `npm run test`, and run the CDP visual + dynamic workflow gate.

## 4. References

- draw.io: https://www.drawio.com/docs/reference/shortcuts ·
  https://www.drawio.com/docs/manual/editor/menus/arrange-insert-menu ·
  https://www.drawio.com/docs/manual/layouts ·
  https://www2.drawio.com/blog/new-keyboard-shortcuts
- Penpot: https://help.penpot.app · https://penpot.app/design/layout ·
  https://penpot.app/collaboration/design-tokens ·
  https://github.com/penpot/penpot/releases
- Plasmic: https://github.com/plasmicapp/plasmic ·
  https://www.plasmic.app/blog/data-queries-evolved ·
  https://docs.plasmic.app
- Storybook: https://storybook.js.org/docs/essentials/controls ·
  https://storybook.js.org/docs/writing-tests · https://storybook.js.org/docs/ai ·
  https://github.com/storybookjs/storybook/releases (v10: Vite, docs-first,
  test runner GA, `componentsManifest` default-on, `@storybook/addon-mcp`)
- EEZ Studio: https://github.com/eez-open/studio ·
  https://www.envox.eu/eez-studio-docs/9-projects-editor ·
  https://www.envox.eu/eez-studio-docs/11-projects-editor-panels ·
  https://www.envox.eu/eez-studio-docs/14-project-editing

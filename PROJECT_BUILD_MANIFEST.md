# Project build manifest

- Upstream repository: `https://github.com/xsession/astro_ui_designer.git`
- Newest upstream `main` verified during this build: `cef93ad7f5744e45c98876b0932ec4969691f78c`
- Upstream commit subject: `Restore manual drag, resize, and nudge geometry interaction (2.17.1)`
- Previous upstream foundation: `92588079f9652d9919dda275941adcfb84d6b37f` (`Add project import flow and QML round-trip backend (2.17.0)`)
- Integrated target version: `2.17.2-direct-manipulation`
- Review / packaging date: 2026-09-08

## Provenance

The newest `main` head was fetched and reviewed through the connected GitHub API because the build container cannot resolve github.com for a direct `git clone`/`git pull`. The 2.17.0 full-project package already represented the immediately preceding upstream project-import/QML tree. GitHub comparison showed that upstream 2.17.1 changed only the standalone/VS Code `app.js` and `styles.css` interaction surfaces. Those changes were reviewed and superseded locally by the broader 2.17.2 implementation described below.

The GitHub head was checked again immediately before final packaging and was still `cef93ad7f5744e45c98876b0932ec4969691f78c`.

This archive is the complete runnable modified source project. It does not claim that the local 2.17.2 changes were pushed back to GitHub.

## Upstream 2.17.1 review finding

The 2.17.1 commit restored pointer drag/resize/rotate and keyboard nudge after those handlers were lost in earlier editor rewrites. However, its direct manipulation remained limited to children whose immediate model parent was `freeform`:

- `manualMovable(node)` returned true only for a Freeform Layer child.
- resize/rotate handles were rendered only when the selected node's parent was `freeform`.
- keyboard nudge/resize also returned early for every non-freeform child.

That left the common page/section/row/column/grid/card/form cases effectively read-only for manual geometry editing even though the editor exposed resize/move semantics.

## 2.17.2 direct-manipulation fix

The editor now treats every unlocked non-root designer node as directly manipulable.

### Selection overlay

Geometry handles are rendered in an artboard-level overlay rather than appended as children of the selected HTML element. This makes them reliable for:

- `input`, `img` and other void elements
- clipped/overflow-hidden containers
- buttons and interactive controls in Design mode
- imported nodes with arbitrary rendered tags
- component instances without leaking selection into cloned preview internals

The overlay provides eight resize handles, a rotate handle, a MOVE grip and a live geometry label.

### Flow-layout relocation

Normal block/flex/grid children can be dragged. The first actual move—not a simple click—captures the rendered rectangle and converts the node to positioned geometry while preserving its visible position and dimensions. Its containing block is given a positioning context when required. Freeform children retain their existing absolute-position behavior.

### Resize

All unlocked non-root nodes can be resized directly. East/south resizing can remain in normal flow. West/north or Alt/center resizing detaches a flow node when changing the origin is required. Resizing switches affected sizing axes to fixed and neutralizes conflicting flex growth where necessary.

### Breakpoint-local edits

Manual geometry is written to the active breakpoint style object. Base edits update `style.base`; non-base edits update only that breakpoint override. The Layout Tools exact-geometry fields now read/write the active breakpoint for x/y/width/height as well.

### Interaction modifiers

- Shift + drag: axis lock
- Ctrl/Cmd + drag/resize: bypass snap
- Shift + resize: aspect ratio lock
- Alt + resize: resize from center
- Shift + rotate: 15-degree snap
- Arrow: nudge
- Alt + Arrow: 1 px nudge
- Shift + Arrow: resize
- Alt + Shift + Arrow: 1 px resize

### Coordinate correctness

- pointer deltas are divided by current canvas zoom
- handle sizes remain screen-usable across canvas zoom levels
- nested coordinates account for parent borders before writing CSS positioned offsets
- selection/snap overlays use artboard world coordinates
- smart snapping uses current parent, sibling and guide geometry

### Component instances

The internal cloned component preview is now rendered non-interactively in a page instance. Selection and direct manipulation target the instance wrapper rather than cloned definition IDs.

## Existing 2.17 systems retained

- visible existing-project browse/import workflow
- automatic adapter detection/review and live/snapshot import
- Qt Quick/QML round-trip backend
- hardened pwtk/eel backend
- Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI and LVGL round-trip
- 41 functional relocatable/floating workbenches
- editable hotkeys and command palette
- safe page lifecycle
- Component Lab
- Draw.io interchange
- tooltips, Git helpers, source history/rollback and Hermes MCP/skill

## Main 2.17.2 changed modules

- `standalone/js/app.js`
- `standalone/styles.css`
- `standalone/js/functional-workbenches.js`
- mirrored VS Code designer sources
- `tests/manual-canvas-interaction.test.mjs`
- `tests/tooltips-app-integration.test.mjs` version expectation
- `tests/run-all.mjs`
- `docs/DIRECT_MANIPULATION.md`
- release/version/readme/validation metadata

See `docs/DIRECT_MANIPULATION.md`, `docs/PROJECT_IMPORT.md`, `docs/QML_ROUNDTRIP.md`, `docs/PWTK_ROUNDTRIP_REVIEW.md` and `docs/FUNCTIONALITY_AUDIT.md`.

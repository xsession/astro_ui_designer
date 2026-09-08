# Astro UI Designer 2.17.2 — validation

**Validation date:** 2026-09-08  
**Integrated version:** `2.17.2-direct-manipulation`  
**Newest upstream head verified:** `cef93ad7f5744e45c98876b0932ec4969691f78c` (`Restore manual drag, resize, and nudge geometry interaction (2.17.1)`)

## Upstream verification

The connected GitHub API was queried at the start of the task and again immediately before packaging. The newest `main` commit remained `cef93ad7f5744e45c98876b0932ec4969691f78c`.

The upstream 2.17.1 commit correctly identified that geometry interaction had been lost, but its implementation still gated drag/resize/nudge on an immediate `freeform` parent. The 2.17.2 local fix removes that practical limitation.

## Direct canvas manipulation

- Any unlocked non-root designer node can expose the selection geometry overlay: **PASS**.
- Ordinary page/section/nav/row/column/grid/card/form children are no longer excluded by parent type: **PASS**.
- Freeform children retain direct absolute geometry behavior: **PASS**.
- Eight artboard-level resize handles: **PASS**.
- MOVE handle: **PASS**.
- Rotate handle: **PASS**.
- Handles are external to target DOM elements, including void/clipped elements: **PASS structural + browser hit test**.
- Normal flow child can be resized without first becoming absolute: **PASS real Chromium pointer test**.
- Normal flow child can be dragged and converts to positioned geometry only after real movement begins: **PASS real Chromium pointer test**.
- Flow move preserves measured width/height and visible starting rectangle: **PASS**.
- East/south normal-flow resize: **PASS**.
- West/north resize detaches when origin must move: **PASS structural/regression**.
- Alt centered resize detaches when origin must move: **PASS structural/regression**.
- Shift drag axis lock: **PASS integration contract**.
- Shift resize aspect lock: **PASS**.
- Ctrl/Cmd snapping bypass: **PASS**.
- Shift rotate 15-degree snapping: **PASS**.
- Arrow nudge and Shift+Arrow resize: **PASS**.
- Alt fine nudge/resize: **PASS**.
- Smart grid/guide/sibling snapping: **PASS**.
- Zoom-correct pointer delta conversion: **PASS**.
- Parent-border offset correction for nested positioned coordinates: **PASS**.
- Active-breakpoint style writes: **PASS**.
- Layout Tools x/y/width/height read/write active breakpoint geometry: **PASS**.
- Locked node manipulation blocked while selection remains visible: **PASS**.
- Component-instance preview internals do not steal page-instance selection: **PASS**.
- Undo checkpoint on actual interaction rather than simple selection click: **PASS**.

See `docs/DIRECT_MANIPULATION.md` and `TEST_REPORT.md`.

## Existing-project import / adapters

The 2.17 import workflow and adapter system remain intact:

- toolbar/menu/command/hotkey project import entry points: **PASS**
- project-folder adapter auto-detection/review: **PASS**
- Qt Quick/QML backend: **PASS regression**
- pwtk/eel hardening: **PASS regression**
- Astro/React/Vanilla/Vue/Svelte/Tkinter/NiceGUI/LVGL round-trip: **PASS regression**
- Draw.io interchange: **PASS**

## Existing editor systems

- Built-in relocatable workbenches: **41/41 PASS**
- Editable hotkeys: **PASS**
- Safe page create/edit/duplicate/delete lifecycle: **PASS**
- Component Lab: **PASS**
- Global tooltips: **PASS**
- Hermes MCP/skill: **PASS**
- Visual structural smoke: **PASS**
- VS Code source smoke: **PASS**

## Automated suite totals

- Aggregate runner: **26/26 suites PASS**
- Round-trip script: **12/12 PASS**
- Functional suites: **3/3 PASS**
- Project-import suites: **2/2 PASS**
- Draw.io suites: **2/2 PASS**
- Tooltip suites: **2/2 PASS**
- Manual canvas regression: **PASS**

## Source/build consistency

- JavaScript/MJS syntax validation: **113 files PASS**
- Runtime files in relative-import audit: **81**
- Runtime relative imports checked: **161**
- Missing runtime relative imports: **0**
- Standalone app vs VS Code app mirror: **PASS byte-identical**
- Standalone CSS vs VS Code CSS mirror: **PASS byte-identical**
- Functional workbench mirror: **PASS byte-identical**
- Current VSIX: `astro-ui-designer-vscode-2.17.2.vsix`: **PASS**

## Live host / browser verification

Live host:

- standalone root HTTP response: **200 PASS**
- workspace-info API: **PASS**
- served app version marker: **PASS**
- 2.17.2 launcher banner: **PASS**

Actual Chromium direct-manipulation smoke:

- ordinary `heading` child under `nav`, not Freeform: **PASS**
- MOVE pointer drag: **PASS**, resulting in `left:96px; top:48px; position:absolute`
- SE resize after move: **PASS**, ~154×21 → 216×56
- direct E resize while still in flow: **PASS**, ~153.9 px → 208 px without adding `position`
- browser errors: **0**

Direct Chromium navigation to localhost is blocked by this execution environment's browser policy, so the full app/module graph was loaded unchanged as data modules through `page.set_content` for the pointer-event verification. This bypass changes transport only; the tested application modules and interaction functions are the packaged source.

## Deliberate behavior

Dragging a normal flow-layout item is an explicit request for free positioning. On the first actual move the editor therefore detaches that item into positioned geometry while preserving its current rectangle. A simple selection click does not detach it. Resizing from east/south can stay in normal flow. Users can choose **Position → flow** in Layout/Layout Tools to return a detached item to flex/grid/block flow.

Source write-back still follows each round-trip adapter's reviewed patch capabilities. Direct manipulation does not silently bypass source ownership safeguards.

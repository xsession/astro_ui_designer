# Manual Canvas & Layout Editing — Clean-Room Research and Implementation

**Project:** Astro UI Designer Pro  
**Research date:** 2026-08-31  
**Implementation target:** 2.8.1-alignment-controls  
**Scope:** Direct/manual canvas editing only: selection geometry, drag/resize/rotate, snapping, rulers/guides, measurement, spacing, Flex/Grid manipulation, sizing modes, constraints, absolute/freeform editing and layout conversion.

## 1. Clean-room boundary

This work uses public product documentation and observable interaction patterns as behavioral references. It does **not** copy source code, private algorithms, icons, assets, CSS, internal component/class structure, persistence formats, or proprietary naming from the reference applications.

Astro UI Designer keeps an independent model and vocabulary:

- `manualLayout.settings` for editor-only interaction preferences.
- `manualLayout.layoutGuides` for responsive column overlays.
- `design.manualLayout.sizingX/sizingY` for `fixed`, `fill`, and `hug` sizing.
- `design.constraints` for parent-resize pinning/scaling behavior.
- ordinary CSS style fields for position, geometry, Flex and Grid.
- editor-only rulers/guides/measurements are not emitted into the generated Astro application.

The output remains normal Astro/HTML/CSS. Competitor-specific object models are not persisted.

## 2. Reference applications and useful public behaviors

### Figma

Public references:

- Smart Selection / Tidy Up: https://help.figma.com/hc/en-us/articles/360040450233-Arrange-layers-with-Smart-selection
- Measuring distances: https://help.figma.com/hc/en-us/articles/360039956974-Measure-distances-between-layers
- Guides: https://help.figma.com/hc/en-us/articles/360040449713-Add-guides-to-the-canvas-or-frames
- Auto Layout: https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout

Useful clean-room behaviors:

1. Multi-selection can become a smart selection when objects have a recognizable row/column arrangement.
2. Equal spacing can be edited directly between objects rather than only through a numeric sidebar.
3. Tidy-up can normalize position and spacing without requiring a permanent layout container.
4. Holding Alt/Option exposes distance measurements between the active object and nearby geometry.
5. Rulers/guides provide persistent alignment references independent of layout containers.
6. Resize supports corner/edge handles and center/aspect modifiers.
7. Absolute/freeform children can coexist with structured layout content.

Astro UI Designer adaptation:

- Smart spacing handles and `Tidy` operate on selected freeform siblings.
- `Alt` measurement overlay uses actual rendered geometry.
- eight resize handles + rotate handle are independent implementations.
- `Shift` keeps aspect ratio during resize; `Alt` resizes from center; `Shift` snaps rotation to 15°.
- persistent guides and transient snap lines are separate concepts.

### Penpot

Public reference:

- Flex and Grid layouts: https://help.penpot.app/user-guide/designing/flexible-layouts/

Useful clean-room behaviors:

1. Visual layout controls correspond directly to CSS Flexbox/Grid instead of a proprietary runtime layout engine.
2. Children can be reordered/manipulated while retaining real layout semantics.
3. Grid editing benefits from visible tracks/cells and direct placement.

Astro UI Designer adaptation:

- Flow layout is represented by real `display:flex` / `display:grid` style properties.
- selected Flex/Stack containers expose direct gap handles on the canvas.
- selected grid children expose clickable grid-cell placement targets.
- grid rows/columns are still editable numerically and through direct cells.

### Webflow

Public references:

- Grid: https://help.webflow.com/hc/en-us/articles/33961365794451-Grid
- Canvas settings: https://help.webflow.com/hc/en-us/articles/33961230930579-Canvas-settings

Useful clean-room behaviors:

1. CSS Grid placement should be editable visually, not only through raw CSS values.
2. Canvas overlays such as rulers, guides, box/spacing visualizations and x-ray views are useful for dense web layout debugging.
3. Manual placement should remain tied to real CSS behavior.

Astro UI Designer adaptation:

- grid tracks and grid-cell targets are rendered as editor overlays.
- optional X-ray mode outlines layout boxes.
- spacing mode visualizes margin/padding around the selected object.
- rulers/guides are editor metadata; grid/flex geometry maps to ordinary CSS.

### Framer

Public references:

- Fill/Fit sizing: https://www.framer.com/academy/lessons/framer-fundamentals-sizing-to-fill-and-fit-content
- Fixed and absolute positioning: https://www.framer.com/updates/fixed-and-absolute-positioning

Useful clean-room behaviors:

1. Web layout is easier to reason about when sizing intent is expressed as **fixed**, **fill available space**, or **fit/hug content**.
2. A child may deliberately escape normal flow using absolute positioning while its siblings remain layout-managed.
3. Fixed positioning is a distinct interaction intent from normal flow and absolute positioning.

Astro UI Designer adaptation:

- width/height sizing modes: `fixed`, `fill`, `hug`.
- position modes: `flow`, `relative`, `absolute`, `fixed`, `sticky`.
- `Ignore flow` converts the selected node to an absolute placement while retaining its current visual position.
- `Return to flow` clears absolute geometry and returns the node to parent layout behavior.

### Qt Designer / Qt Design Studio

Public reference:

- Qt Designer layout management: https://doc.qt.io/qt-6/designer-layouts.html

Useful clean-room behaviors:

1. Users should be able to apply a layout to selected/container content explicitly.
2. Users should be able to **break** a layout and return to manual placement.
3. Alignment, geometry and layout operations should be directly available in a dense professional editor rather than hidden behind generated code.

Astro UI Designer adaptation:

- `Row`, `Column`, and `Grid` commands apply CSS-native layout semantics.
- `Break layout` converts arranged children to freeform geometry while preserving their visible positions.
- `Infer layout` analyzes a manual selection and proposes/converts recognizable rows/columns/grids.

## 3. Implemented manual editing feature map

| Capability | Status | Astro UI Designer behavior |
|---|---|---|
| Direct drag | Implemented | Parent-local geometry with canvas-global snap/measure overlays |
| Eight-direction resize | Implemented | N/NE/E/SE/S/SW/W/NW handles |
| Aspect lock | Implemented | Shift while resizing, plus persisted aspect option |
| Resize from center | Implemented | Alt while resizing |
| Rotation | Implemented | dedicated rotate handle; Shift snaps to 15° |
| Multi-selection | Implemented | geometry tools work on selected sibling set |
| Smart spacing handles | Implemented | direct gap editing for recognizable freeform rows/columns |
| Tidy up | Implemented | normalizes selected geometry and spacing |
| Exact horizontal/vertical gap | Implemented | direct workbench actions |
| Proportional selection scale | Implemented | scale selected freeform siblings by percentage |
| Alignment/distribution | Existing + retained | left/center/right/top/middle/bottom and distribution |
| Grid snapping | Implemented | independently toggleable |
| Geometry snapping | Implemented | nearby object edges/centers |
| Guide snapping | Implemented | persistent guide references |
| Smart snap feedback | Implemented | transient lines/geometry tooltip |
| Rulers | Implemented | top/left canvas rulers |
| Persistent guides | Implemented | add/drag/lock/delete, breakpoint-aware |
| Responsive column guides | Implemented | columns/gap/margin/max-width per breakpoint |
| Alt distance measurement | Implemented | hover distance overlays for selected vs nearby object |
| Margin/padding overlay | Implemented | optional box-model visualization |
| X-ray layout view | Implemented | outlines layout geometry |
| Fixed/fill/hug sizing | Implemented | width and height independently |
| Flow/relative/absolute/fixed/sticky | Implemented | position intent exposed in Layout Tools |
| Absolute escape | Implemented | Ignore flow retains visual position |
| Return to flow | Implemented | clears freeform geometry when returning to parent layout |
| Constraints | Implemented | left/right/top/bottom/center/scale semantics during freeform parent resize |
| Direct Flex gap editing | Implemented | draggable gap handles on selected flow container |
| Direct Grid cell placement | Implemented | clickable grid cells for selected grid child |
| Grid row/column editing | Implemented | +/- track controls plus normal style controls |
| Apply Row/Column/Grid | Implemented | CSS-native layout commands |
| Break layout | Implemented | converts structured container children to freeform placement |
| Infer layout | Implemented | geometry analysis of manual selection |
| Keyboard nudge | Implemented | arrows use configurable large nudge; Alt+Arrow 1px |
| Keyboard resize | Implemented | Shift+Arrow |
| Lost pointer-up recovery | Implemented | gestures terminate defensively when pointer buttons are no longer pressed |
| Nested-coordinate editing | Implemented | local edit geometry vs global overlays are kept separate |

## 4. Manual Layout Tools workbench

Open **Layout Tools** from the canvas toolbar or bottom workbench.

### Canvas precision

- Rulers
- Snap globally on/off
- Snap to grid
- Snap to guides
- Snap to nearby geometry
- Spacing overlay
- X-ray mode
- Snap distance
- Grid size
- Big keyboard nudge

### Responsive layout guides

For every breakpoint:

- enabled/disabled
- column count
- column gap
- outer margin
- optional max content width
- arbitrary horizontal/vertical guides
- guide lock/delete

### Selected object geometry

- X / Y / width / height
- rotation
- aspect lock
- width mode: fixed/fill/hug
- height mode: fixed/fill/hug
- flow/relative/absolute/fixed/sticky positioning
- Ignore flow / Return to flow

### Layout conversion

- Row
- Column
- Grid
- Break layout
- add/remove Grid rows/columns
- Fit artboard
- Tidy
- set exact H/V gap
- Infer layout
- proportional Scale

## 5. Direct-canvas interactions

### Move

Drag a selected freeform object. The object snaps according to enabled grid/guide/geometry settings.

### Resize

Use any edge/corner handle.

- `Shift`: preserve aspect ratio.
- `Alt`: resize around center.
- normal drag: resize from dragged side/corner.

### Rotate

Drag the rotation handle.

- `Shift`: quantize to 15° increments.

### Measure

Select one object, hold `Alt`, and hover another object to see edge-distance feedback.

### Guides

Create/edit guides in Layout Tools. Guides are draggable on canvas unless locked.

### Smart spacing

Multi-select sibling freeform objects arranged approximately in a row/column. Gap handles appear between them. Drag a handle to adjust equal spacing, or use `Tidy` to normalize the sequence.

### Flex/Stack gap

Select a Flex/Stack container. Drag the rendered gap handles between children to update the real CSS `gap` property.

### Grid placement

Select a child inside a Grid container. The grid cells become selectable targets; click a cell to update `grid-column-start` and `grid-row-start`.

## 5.1 Direct text/content alignment controls

The Layout inspector exposes direct button groups instead of requiring dropdown edits for common alignment operations.

**Text**
- Left
- Center
- Right
- Justify

**Content X / Content Y**
- Start
- Center
- End

Content alignment is intentionally defined in **canvas X/Y coordinates**, not CSS main/cross-axis terminology. For a row Flex container, X maps to `justify-content` and Y maps to `align-items`; for a column Flex container the mapping is reversed. Grid uses `justify-items` for X and `align-items` for Y. This keeps the manual editing interaction spatially predictable while still writing normal CSS.

The content buttons remain disabled on non-Flex/Grid objects instead of implicitly changing `display`. Text alignment supports multi-selection and remains breakpoint-specific.

## 6. Keyboard precision workflow

- `Arrow`: configurable normal nudge.
- `Alt+Arrow`: 1 px nudge.
- `Shift+Arrow`: resize.
- `Ctrl/Cmd+Shift+L`: open Layout Tools.
- `Ctrl/Cmd+Shift+R`: toggle rulers.
- `Alt` while hovering another object: measure distance.
- `Shift` while resizing: aspect ratio.
- `Alt` while resizing: resize from center.
- `Shift` while rotating: 15° rotation increments.

## 7. Web-native export rules

Manual editor metadata is separated from generated application semantics:

### Exported to Astro/CSS

- width/height/min/max sizing
- fixed/fill/hug projection
- position mode and geometry
- transform/rotation
- Flex direction/gap/alignment
- Grid tracks/gaps/placement
- constraints where they map to responsive CSS rules
- sticky/fixed/absolute positioning

### Editor-only

- rulers
- persistent guide visuals
- transient snap lines
- distance measurement overlays
- smart-selection handles
- box-model overlays
- X-ray view
- geometry tooltip

This prevents editor conveniences from becoming runtime dependencies.

## 8. Deliberate boundaries

The clean-room implementation does not claim pixel-identical parity with any reference application. In particular:

- no proprietary Figma auto-layout or smart-selection algorithm is copied;
- no Penpot/Webflow internal grid editor implementation is used;
- no Framer sizing/runtime is embedded;
- no Qt layout classes are translated;
- no competitor file format is used for the native project model.

Astro UI Designer uses deterministic, testable geometry rules designed around browser CSS semantics.

## 9. Regression requirements

Every future change to manual layout editing should preserve these invariants:

1. Stored coordinates of nested freeform nodes remain parent-local.
2. Rulers, guides and measurements use canvas-global coordinates.
3. Resizing does not create negative dimensions.
4. Lost pointer-up cannot leave a drag/resize listener active.
5. Normal flow nodes are not silently converted to absolute positioning by a simple selection or style edit.
6. Break-layout operations preserve the current visible geometry as closely as possible.
7. Snap feedback does not become persisted project geometry.
8. Editor-only guide/measurement data does not leak into generated Astro output.
9. Direct Flex/Grid editing changes real CSS semantics rather than storing visual-only pseudo-layout data.
10. All new interactions remain usable at 1366×768 and in nested containers.


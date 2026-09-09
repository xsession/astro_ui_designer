# Direct canvas manipulation

Astro UI Designer 2.17.2 restores and extends direct geometry editing on the design canvas.

## What can be manipulated

Any visible, unlocked, non-root node can be selected and resized. This includes ordinary children of sections, rows, columns, grids, cards and forms as well as children of Freeform Layer containers. Imported adapter content that materializes as designer nodes uses the same interaction layer.

The earlier 2.17.1 interaction path only exposed drag/resize handles when the selected node was already inside a `freeform` parent. 2.17.2 removes that restriction.

## Move

Select a component, then either drag its body or drag the **MOVE** handle in the selection overlay.

For a component that is still participating in normal flex/grid/block flow, the first real move converts that component to positioned geometry while preserving its current on-screen rectangle. The containing node is given a positioning context when necessary. A click without movement does not alter layout mode.

- **Shift + drag** locks movement to the dominant axis.
- **Ctrl/Cmd + drag** temporarily bypasses snapping.
- Grid, guide and sibling-edge/center snapping use the existing Manual Layout settings.
- The move is stored as a single undo checkpoint.

## Resize

A selected component shows eight artboard-level handles: north, south, east, west and all four corners. The handles are not inserted inside the component itself, so they also work on `input`, `img`, clipped containers and other elements where child-based handles are unreliable.

- **Shift + resize** preserves the current aspect ratio.
- **Alt + resize** resizes from the center. A flow-layout node is detached first when centered resizing requires its x/y origin to change.
- **Ctrl/Cmd + resize** bypasses snapping.
- Resizing switches the affected sizing axis to `fixed` and neutralizes conflicting flex growth when needed.
- Resizing a Freeform Layer continues to update constrained freeform children.

## Rotate

Use the circular handle above the selection.

- **Shift + rotate** snaps to 15-degree increments.
- Rotation is written to the active breakpoint style while retaining the Manual Layout rotation metadata.

## Keyboard geometry editing

When Design mode is active and focus is not inside a form field or modal:

- **Arrow keys** move the selected component using the configured big-nudge value.
- **Alt + Arrow** moves by 1 px.
- **Shift + Arrow** resizes the selection.
- **Alt + Shift + Arrow** resizes by 1 px.
- **Delete / Backspace** deletes the selected node.

Moving a flow-layout node with the keyboard uses the same flow-to-positioned conversion as pointer dragging.

## Breakpoints

Geometry changes are written to the active breakpoint style object. Editing the base breakpoint modifies `style.base`; editing another breakpoint modifies only that breakpoint override. The visual rectangle calculation always uses the merged active style.

## Locked nodes

Nodes with `meta.locked` remain selectable and show a dashed amber selection rectangle, but move, resize, rotate and nudge operations are disabled.

## Returning a component to layout flow

Use **Layout / Layout Tools → Position → flow**. This removes explicit positioning fields using the existing Manual Layout `setPositionMode()` behavior. You can then use flex/grid sizing and alignment normally again.

## Component instances

The rendered preview inside a component instance is non-interactive in the page canvas. Pointer selection belongs to the component-instance wrapper rather than to cloned internal preview nodes, avoiding ambiguous or stale IDs during direct manipulation.

## Source round-trip

Direct manipulation edits the same project style model as the inspectors. Round-trip adapters therefore see geometry changes through the normal reviewed design-to-source flow. Whether a specific geometry property can be written back depends on the selected adapter's patch capabilities.

# Advanced manual editing

Astro UI Designer 2.18 extends direct manipulation beyond single-object drag/resize. The implementation is clean-room and uses the editor's existing CSS/neutral model rather than copying Penpot source code.

## Selection model

- Click selects one canvas node.
- Shift/Ctrl/Cmd-click toggles nodes in the selection.
- Dragging the page/root canvas creates a marquee selection.
- Alt while marquee-selecting requires full containment instead of intersection.
- Parent + descendant selections are normalized to top-level nodes for transforms so descendants are not translated twice.

## Multi-object transforms

The artboard overlay provides a group bounding box for multiple selected objects. The group can be moved, resized, and rotated while retaining each object's relative placement.

- Drag moves the group.
- Eight resize handles scale the selected geometry.
- Rotation uses the group center.
- Shift constrains move direction and preserves aspect ratio during resize; Shift rotation snaps to 15 degrees.
- Ctrl/Cmd bypasses snapping for the current drag.
- Geometry writes target the active responsive breakpoint.

Flow children are detached to positioned geometry only when a transform actually needs an x/y origin. A plain width/height resize can therefore stay in normal Flex/Grid flow.

## Alignment and spacing

The selection toolbar and command system provide:

- align left / horizontal center / right
- align top / vertical center / bottom
- distribute horizontally / vertically
- tidy horizontal / vertical spacing
- layer front / back / one-step forward / one-step backward
- group / ungroup
- horizontal / vertical flip
- lock / unlock

Commands are exposed through the command palette and editable Hotkeys workbench.

## Guides, rulers, snapping, and measurement

The canvas has editor-only rulers and guides. Drag from a ruler to create a guide; drag an unlocked guide to move it. Smart snapping combines grid, project guides, parent edges/center, and sibling edges/centers. Ctrl/Cmd temporarily disables snapping.

Holding Alt in Design mode shows distance labels from the primary selection to its parent bounds. Snap guides and geometry labels are transient editor overlays and are not exported.

## Source ownership

Manual geometry edits modify the same project style model used by Astro/QML and other round-trip adapters. They do not bypass source ownership. For source-backed projects, use Round-trip Studio to review design-to-source patches before writing external source files.

# Direct manipulation model

The canvas must reconcile DOM geometry, responsive CSS and persistent designer geometry. Pointer deltas are converted from screen pixels by the current zoom. The selected element's DOM box provides a fallback when explicit model geometry is absent. Parent-local coordinates are corrected for parent borders and nested positioning.

Move operations may transition a flow child into positioned geometry; resize can remain a normal flow edit when no origin change is required. Geometry writes target the active breakpoint style layer. Snapping combines configurable grid, persistent guides and sibling/parent geometry. Transient overlays show handles, geometry and snap lines without becoming part of the exported node tree.

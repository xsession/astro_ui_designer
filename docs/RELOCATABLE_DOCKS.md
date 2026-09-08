# Relocatable Dock and Section System

Astro UI Designer 2.13 adds a Qt-style relocatable workbench. The editor no longer assumes that a tool belongs permanently to the left, right, or bottom region.

## What can be moved

All 40 editor tool tabs are registered as dock panels, including Palette, Project, Components, Assets, Sources, Properties, Layout, Actions, Bindings, Code, States, Data, Effects, Composition, Story, Problems, Object Tree, Layout Tools, CSS Tools, State, Animation, Design Tokens, Libraries, Connections, Content, Locales, Tests, Story Results, Queries, Templates, Usages, Audit, Git, Prototype, Comments, Inspect, Interchange, Integrations, Round-trip, and Console.

Document tabs such as Home, Contact, and reusable component documents can also be reordered in the central document strip.

Inside a panel, recognizable property/workbench sections are reorderable by dragging their section heading. This currently covers `details.property-section` inspectors and workbench cards.

## Gestures

- **Drag a dock tab** onto the left, right, or bottom tab strip to move it there.
- **Drag within the same strip** to reorder tabs.
- **Drop a dock tab outside a dock** to turn it into a floating tool window.
- **Double-click a dock tab** to float it immediately.
- **Right-click a dock tab** for exact `Dock Left`, `Dock Right`, `Dock Bottom`, `Float`, and `Reset all docks` commands.
- **Drag a floating window title bar** to move it.
- **Resize a floating window** from its native resize edge/corner.
- Use the floating title-bar **L / R / B** buttons to dock it directly.
- **Drag a property/workbench section heading** to reorder sections inside that panel.
- **Drag document tabs** to reorder the page/component document strip.
- **Drag the dock splitters** to resize left, right, and bottom areas. Double-click a splitter to restore its default size.

The toolbar **Docks** button contains a short gesture reminder and a one-click reset.

## Persistence

Dock positions and floating rectangles are normalized through `standalone/js/dock-layout.js` and stored in `localStorage` under `astro-ui-designer-dock-layout-v1`. A snapshot is also kept under `project.editor.dockLayout` so exported designer projects can carry the workbench layout.

Dock sizes are stored independently under `astro-ui-designer-dock-sizes-v1`. Reordered internal panel sections use `astro-ui-designer-section-layout-v1`.

The layout normalizer removes stale/unknown panel ids, deduplicates panels, restores newly added panels to their native dock, validates active tabs, and clamps floating sizes.

## Plugin and API use

The public API exposes:

```js
AstroUIDesigner.dockLayout()
AstroUIDesigner.moveDockPanel('bottom:objects', 'right', 0)
AstroUIDesigner.floatDockPanel('left:palette', { x: 80, y: 60, width: 420, height: 320 })
AstroUIDesigner.activateDockPanel('bottom:roundtrip')
AstroUIDesigner.resetDockLayout()
```

Panel keys are namespaced by their original renderer (`left:`, `right:`, `bottom:`), so names that occur in more than one tool family remain unambiguous—for example `right:actions` and `bottom:actions`.

## VS Code parity

The same dock module, application code, styles, and HTML are mirrored into `vscode-extension/designer`, so the embedded VS Code designer has the same movable/floating workbench behavior as the standalone browser edition.

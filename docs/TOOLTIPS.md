# Global tooltips

Astro UI Designer 2.15 adds a single tooltip layer for the complete layout/menu workbench.

## Covered surfaces

- File/Edit/Form/Layout/View/Project/Build/Help menus.
- Main toolbar commands, including compact alignment icons such as `L`, `HC`, `VC`, `DH`, and `DV`.
- All 40 relocatable dock tabs.
- Palette components generated from the component registry.
- Floating-dock L/R/B/home controls and dock context-menu commands.
- Dock splitters, document tabs, and draggable/reorderable workbench sections.
- Source editor, live-preview, Component Lab and responsive breakpoint controls.
- Dynamically generated buttons/selects and labelled inspector fields.

## Behavior

Hovering an eligible control displays the tooltip after a short delay. Keyboard focus displays it immediately. The tooltip is positioned inside the viewport, follows resize/scroll, and closes on pointer exit, focus loss, or Escape. Disabled controls retain a native `title` fallback.

## Architecture

`standalone/js/tooltips.js` exports explicit metadata plus semantic fallback rules. `installTooltipSystem()` is called once after docking is initialized. A `MutationObserver` annotates newly created menu and workbench controls so feature modules do not need manual tooltip setup.

To add special help for a new static command, add its element ID to `STATIC_CONTROL_TOOLTIPS`. New dock panels should add a description to `DOCK_PANEL_TOOLTIPS`. Generic buttons, labelled inputs/selects, palette items, dock actions and layout/style action datasets are handled automatically.

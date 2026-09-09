# 2.19 Dense Clean UI review and refactor

## Goal

Keep Astro UI Designer information-dense like Qt Creator/Qt Designer, but reduce simultaneous visual competition. The refactor intentionally does **not** remove workbenches, direct-manipulation controls, simulation, project import, round-trip tooling, or MCP features.

## Review findings

1. **Primary command bar overload** — clipboard, object, wrapping, ordering, eight alignment/distribution controls, modes, workspace controls and export all competed at the same visual level.
2. **Too many active surfaces** — selected tabs, workbench cards, inspectors and toolbars all used strong filled backgrounds and borders, making hierarchy difficult to scan.
3. **Inspector overload** — several right-side inspectors opened every property group by default; rerendering also discarded the user's open/collapsed choices.
4. **Bottom/right tab strips lacked grouping** — all tool tabs looked equally related, even though they form natural workflow clusters.
5. **Canvas chrome competed with content** — grid, artboard shadow and selection chrome were stronger than necessary.
6. **Long product/version labels consumed horizontal attention** without helping the current editing task.

## Implemented changes

### Progressive command bar

The top toolbar now keeps only high-frequency actions visible. Lower-frequency commands remain immediately reachable through compact native dropdowns:

- **Edit**: Cut, Copy, Paste, Duplicate, Delete.
- **Arrange**: Wrap Row/Column, ordering, alignment and distribution.
- **Tools**: Workspace, Live Preview and Dock Layout.

Import remains a visible top-level command because existing-project discovery is an important workflow. Round-trip and Export also remain directly available on normal desktop widths.

### Quieter hierarchy

- Dock tabs use a thin accent indicator instead of a filled active block.
- Right and bottom tab strips receive subtle workflow separators rather than additional headers.
- Workbench cards are flatter, with a restrained left accent rather than a full border box.
- Inspector headers, property rows, status bar and panel separators use fewer contrast levels.
- The canvas grid and artboard shadow are reduced so the designed UI remains the visual focus.

### Inspector progressive disclosure

Secondary inspector groups now default collapsed. The primary task group remains open for each inspector. Examples:

- Properties: `Content / props` open, `Identity & access` collapsed.
- Layout: `Display & sizing` open, Flex/Grid and Position collapsed.
- Code: Node HTML open, Node CSS collapsed.
- Data: Visibility/data context open, available sources collapsed.
- Story: Story settings open, args/controls collapsed.

More importantly, open/collapsed state is now persisted per dock panel and section in local storage under `astro-ui-designer-section-disclosure-v1`. Rerendering the inspector no longer forces the user back to the defaults.

### Dense dimensions

The refactor slightly reduces chrome height and default dock widths while preserving hit targets and content density:

- menubar: 24 px
- command bar: 32 px
- dock/document tabs: 26–27 px
- status bar: 20 px
- left dock default: 228 px
- right dock default: 318 px
- bottom dock default: 210 px

### Responsive behavior

At narrower desktop widths the long product title and lower-priority Round-trip toolbar shortcut can disappear, while Import, editor modes and the underlying menu/command-palette access remain available.

## Non-goals

- No workbench or editor capability was deleted.
- Dock relocation/floating semantics are unchanged.
- Hotkeys and command palette behavior are unchanged.
- Direct canvas manipulation and simulation semantics are unchanged.
- The UI is still deliberately dense; this is not a consumer-style large-spacing redesign.

## Regression coverage

`tests/ui-density.test.mjs` verifies the progressive toolbar structure, retained command IDs, direct Import discoverability, quieter dock-tab styling, persistent section disclosure, collapsed secondary inspector defaults and standalone/VS Code UI parity.

# Editable Hotkey System

Astro UI Designer 2.16 treats keyboard shortcuts as command bindings rather than hard-coded `keydown` branches.

## Open the editor

Use **Ctrl+Alt+K** by default, select **Hotkeys** from the relocatable bottom workbench, or run **Hotkey Editor** from the command palette.

## Editing

For each command you can:

- **Change** — enter capture mode and press a new key combination.
- **Clear** — leave the command unassigned.
- **Reset** — remove the custom override and return to the command's default binding.
- **Reset all** — return every command to defaults.

Escape cancels capture. Backspace/Delete during capture clears the selected command.

## Conflict handling

Bindings are normalized before comparison. Assigning a shortcut already owned by another command prompts before moving the binding. The Hotkeys workbench also marks any remaining conflicts and shows all command owners.

## Persistence

Overrides are stored in two places:

1. `project.editor.hotkeys` — travels with the designer project JSON.
2. `localStorage['astro-ui-designer-hotkeys-v1']` — supplies local defaults for projects without their own map.

A project-specific value wins after it exists.

## Command coverage

The registry includes project/page/edit/layout/view/workspace/build commands and commands for every relocatable panel. Examples:

- `page.new`, `page.edit`, `page.duplicate`, `page.delete`
- `project.settings`, `project.breakpoints`
- `layout.wrapRow`, `layout.infer`
- `panel.left.project`
- `panel.right.effects`
- `panel.bottom.css`
- `panel.bottom.queries`
- `panel.bottom.git`
- `panel.bottom.roundtrip`

Panel commands have no default shortcut by design, so users can assign only the panels they use frequently.

## Public API

```js
AstroUIDesigner.commands();
AstroUIDesigner.executeCommand('panel.bottom.css');
AstroUIDesigner.setHotkey('panel.bottom.css', 'Ctrl+Alt+1');
AstroUIDesigner.resetHotkey('panel.bottom.css');
```

## Editable controls

Most commands are suppressed while focus is inside an input, textarea, select or contenteditable element so typing cannot accidentally manipulate the design. Commands explicitly marked `allowInEditable`, such as Save, remain available. When the source editor owns focus, Save writes the active workspace source instead of downloading the designer JSON.

## Alternate bindings and profiles

Use **+ Alt** beside a command to add another shortcut without replacing its existing binding. The workbench can also **Export** the current override map as `astro-ui-designer-hotkeys.json` and **Import** that profile into another project. Unknown command IDs are ignored on import and all imported bindings are normalized/deduplicated.

The public API also exposes `AstroUIDesigner.addHotkey(commandId, binding)` for alternate bindings.

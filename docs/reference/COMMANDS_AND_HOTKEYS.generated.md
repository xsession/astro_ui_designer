<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->

# Commands and default hotkeys

Generated from `commandDefinitions()` in `standalone/js/app.js`. User overrides are project/local preferences and are not listed here.

## Core commands (61)

| Command ID | Category | Label | Default bindings | Description |
|---|---|---|---|---|
| `project.new` | Project | New Project | `Ctrl+N` | Create a new sample designer project. |
| `project.open` | Project | Open Project JSON | `Ctrl+O` | — |
| `project.save` | Project | Save Designer Project | `Ctrl+S` | — |
| `project.exportAstro` | Project | Export Astro ZIP | `Ctrl+Shift+E` | — |
| `project.settings` | Project | Project Settings | — | — |
| `project.breakpoints` | Project | Manage Breakpoints | — | — |
| `page.new` | Page | Create Page | `Ctrl+Alt+N` | — |
| `page.edit` | Page | Edit Active Page | — | — |
| `page.duplicate` | Page | Duplicate Active Page | — | — |
| `page.delete` | Page | Delete Active Page | `Ctrl+Shift+Delete` | — |
| `edit.undo` | Edit | Undo | `Ctrl+Z` | — |
| `edit.redo` | Edit | Redo | `Ctrl+Y`, `Ctrl+Shift+Z` | — |
| `edit.cut` | Edit | Cut Node | `Ctrl+X` | — |
| `edit.copy` | Edit | Copy Node | `Ctrl+C` | — |
| `edit.paste` | Edit | Paste Node | `Ctrl+V` | — |
| `edit.duplicate` | Edit | Duplicate Node | `Ctrl+D` | — |
| `edit.delete` | Edit | Delete Node | `Delete` | — |
| `layout.wrapRow` | Layout | Wrap in Row | `Ctrl+Alt+R` | — |
| `layout.wrapColumn` | Layout | Wrap in Column | `Ctrl+Alt+C` | — |
| `layout.moveUp` | Layout | Move Node Up | `Alt+ArrowUp` | — |
| `layout.moveDown` | Layout | Move Node Down | `Alt+ArrowDown` | — |
| `layout.infer` | Layout | Infer Selected Layout | — | — |
| `selection.all` | Selection | Select All Canvas Objects | `Ctrl+A` | — |
| `selection.group` | Selection | Group Selection | `Ctrl+G` | — |
| `selection.ungroup` | Selection | Ungroup Selection | `Ctrl+Shift+G` | — |
| `selection.front` | Selection | Bring to Front | `Ctrl+Shift+BracketRight` | — |
| `selection.back` | Selection | Send to Back | `Ctrl+Shift+BracketLeft` | — |
| `selection.forward` | Selection | Bring Forward | `Ctrl+BracketRight` | — |
| `selection.backward` | Selection | Send Backward | `Ctrl+BracketLeft` | — |
| `selection.flipH` | Selection | Flip Horizontal | — | — |
| `selection.flipV` | Selection | Flip Vertical | — | — |
| `selection.lock` | Selection | Toggle Selection Lock | `Ctrl+Shift+L` | — |
| `layout.alignLeft` | Layout | Align Left | — | — |
| `layout.alignHCenter` | Layout | Align Horizontal Centers | — | — |
| `layout.alignRight` | Layout | Align Right | — | — |
| `layout.alignTop` | Layout | Align Top | — | — |
| `layout.alignVCenter` | Layout | Align Vertical Centers | — | — |
| `layout.alignBottom` | Layout | Align Bottom | — | — |
| `layout.distributeH` | Layout | Distribute Horizontally | — | — |
| `layout.distributeV` | Layout | Distribute Vertically | — | — |
| `layout.tidyH` | Layout | Tidy Horizontal Spacing | — | — |
| `layout.tidyV` | Layout | Tidy Vertical Spacing | — | — |
| `view.design` | View | Design Mode | `F2` | — |
| `view.split` | View | Split Design / Code | `F3` | — |
| `view.code` | View | Code Mode | `F4` | — |
| `view.preview` | View | Preview Mode | `F5` | — |
| `view.lab` | View | Component Lab | `F6` | — |
| `view.simulate` | View | Page / Project Simulation | `F7` | — |
| `view.zoomIn` | View | Zoom In | `Ctrl+Equal` | — |
| `view.zoomOut` | View | Zoom Out | `Ctrl+Minus` | — |
| `view.zoomReset` | View | Reset Zoom | `Ctrl+0` | — |
| `view.fit` | View | Fit Artboard | `Ctrl+Shift+0` | — |
| `view.commandPalette` | View | Command Palette | `Ctrl+Shift+P` | — |
| `view.hotkeys` | View | Hotkey Editor | `Ctrl+Alt+K` | — |
| `view.toggleBottom` | View | Toggle Bottom Dock | `Ctrl+J` | — |
| `view.docks` | View | Dock Layout Menu | `Ctrl+Shift+D` | — |
| `workspace.importExisting` | Workspace | Import Existing Project… | `Ctrl+Shift+I` | Browse a project folder, auto-detect an installed round-trip adapter, and import its UI. |
| `workspace.open` | Workspace | Open Workspace | `Ctrl+Alt+O` | — |
| `workspace.rescan` | Workspace | Rescan Workspace | — | — |
| `workspace.roundtrip` | Workspace | Open Round-trip Studio | `Ctrl+Alt+T` | — |
| `build.validate` | Build | Validate Project | `Ctrl+Shift+V` | — |

## Panel commands (42)

Every relocatable panel is also a command and can receive a custom hotkey.

| Command ID | Category | Panel | Binding |
|---|---|---|---|
| `panel.left.palette` | Panels | Palette | user-assignable |
| `panel.left.project` | Panels | Project | user-assignable |
| `panel.left.components` | Panels | Components | user-assignable |
| `panel.left.assets` | Panels | Assets | user-assignable |
| `panel.left.sources` | Panels | Sources | user-assignable |
| `panel.right.properties` | Inspectors | Properties | user-assignable |
| `panel.right.layout` | Inspectors | Layout | user-assignable |
| `panel.right.actions` | Inspectors | Actions | user-assignable |
| `panel.right.bindings` | Inspectors | Bindings | user-assignable |
| `panel.right.code` | Inspectors | Code | user-assignable |
| `panel.right.variants` | Inspectors | States / Variants | user-assignable |
| `panel.right.data` | Inspectors | Data | user-assignable |
| `panel.right.effects` | Inspectors | Effects | user-assignable |
| `panel.right.composition` | Inspectors | Composition | user-assignable |
| `panel.right.story` | Inspectors | Story | user-assignable |
| `panel.bottom.problems` | Workbenches | Problems | user-assignable |
| `panel.bottom.objects` | Workbenches | Object Tree | user-assignable |
| `panel.bottom.manual` | Workbenches | Layout Tools | user-assignable |
| `panel.bottom.css` | Workbenches | CSS Tools | user-assignable |
| `panel.bottom.state` | Workbenches | State | user-assignable |
| `panel.bottom.animation` | Workbenches | Animation | user-assignable |
| `panel.bottom.tokens` | Workbenches | Design Tokens | user-assignable |
| `panel.bottom.libraries` | Workbenches | Libraries | user-assignable |
| `panel.bottom.actions` | Workbenches | Connections | user-assignable |
| `panel.bottom.content` | Workbenches | Content | user-assignable |
| `panel.bottom.locales` | Workbenches | Locales | user-assignable |
| `panel.bottom.tests` | Workbenches | Tests | user-assignable |
| `panel.bottom.storybook` | Workbenches | Story Results | user-assignable |
| `panel.bottom.queries` | Workbenches | Queries | user-assignable |
| `panel.bottom.templates` | Workbenches | Templates | user-assignable |
| `panel.bottom.usages` | Workbenches | Usages | user-assignable |
| `panel.bottom.audit` | Workbenches | Audit | user-assignable |
| `panel.bottom.git` | Workbenches | Git | user-assignable |
| `panel.bottom.simulation` | Workbenches | Simulation | user-assignable |
| `panel.bottom.prototype` | Workbenches | Prototype | user-assignable |
| `panel.bottom.comments` | Workbenches | Comments | user-assignable |
| `panel.bottom.inspect` | Workbenches | Inspect | user-assignable |
| `panel.bottom.interchange` | Workbenches | Interchange | user-assignable |
| `panel.bottom.integrations` | Workbenches | Integrations | user-assignable |
| `panel.bottom.roundtrip` | Workbenches | Round-trip | user-assignable |
| `panel.bottom.hotkeys` | Workbenches | Hotkeys | user-assignable |
| `panel.bottom.console` | Workbenches | Console | user-assignable |

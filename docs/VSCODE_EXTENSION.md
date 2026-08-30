# VS Code Extension

## Purpose

The VS Code extension turns Astro UI Designer into a native part of a normal Astro coding workspace without replacing the text editor or requiring a separate application architecture.

The extension deliberately embeds the same `standalone/` designer modules used by the desktop/browser launcher. VS Code-specific behavior is provided by a thin bridge layer.

## User workflow

### Open the designer

Use the Command Palette:

- `Astro UI Designer: Open Designer`
- `Astro UI Designer: Open Designer to Side`
- `Astro UI Designer: Open Active Astro File Visually`

For an `.astro` file, **Reopen With → Astro UI Designer** is available as an optional custom editor. The normal text editor remains the default.

### Activity Bar

The **Astro UI Designer** Activity Bar container discovers:

- Astro pages;
- Astro components;
- React/TSX components;
- Vue components;
- Svelte components;
- common designer commands.

Selecting a page/component opens the same file in the visual designer.

### Source synchronization

When `astroUIDesigner.syncActiveAstro` is enabled, changing the active `.astro` text editor moves an already-open designer to the same source snapshot in Split mode.

When the visual source editor writes a file that is already open in VS Code, the extension uses `WorkspaceEdit` and the active `TextDocument` instead of overwriting the file through raw filesystem APIs. This keeps VS Code dirty-buffer/file-watcher behavior coherent.

## Architecture

```text
VS Code Extension Host
├── commands
├── Activity Bar TreeDataProvider
├── CustomTextEditorProvider
├── TaskProvider
├── DiagnosticCollection
├── Testing API controller
├── Git / npm / Astro preview process manager
└── Webview bridge
        │
        ▼
Designer Webview
├── existing app.js
├── existing model / exporter / validator
├── existing Component Lab
├── existing Penpot/interchange layer
└── workspace-client.js
        │
        ├── VS Code request bridge (extension)
        └── standalone HTTP API (fallback)
```

No VS Code-specific logic is required in the domain model, exporter, animation system, Component Lab, or Penpot clean-room layer.

## Workspace bridge

Inside VS Code, `workspace-client.js` detects `window.__ASTRO_UI_VSCODE__` and sends request/response messages to the extension host.

Supported operations:

- workspace open/rescan/info;
- safe file read/write;
- Git status/diff/stage/commit;
- Astro/Vite preview start/stop.

File access is restricted to folders already opened in the VS Code workspace. Path traversal outside those roots is rejected.

## Custom editor

The extension registers `astroUIDesigner.visualEditor` as an **optional** custom editor for:

```text
*.astro
*.astro-ui.json
designer-project.json
```

The optional priority is intentional. Source code remains first-class and users choose when they want the visual surface.

## Commands

The extension contributes commands for:

- Design mode;
- visual open-to-side;
- active Astro file;
- Component Lab;
- live preview;
- Astro dev-server start/stop;
- Animation editor;
- Platform Interchange;
- validation;
- UI tests;
- Astro project export;
- workspace explorer refresh;
- output channel.

## Tasks

A Task Provider detects matching `package.json` scripts and contributes:

```text
Astro UI: dev
Astro UI: build
Astro UI: test
Astro UI: preview
```

This keeps build/test/dev workflows visible through the normal VS Code Tasks UI.

## Diagnostics

The designer validator can be invoked from the extension. Problems are published through a VS Code `DiagnosticCollection` and the status bar reports the current issue count.

Where a designer issue cannot be mapped to a precise source range yet, it is attached to `designer-project.json` at the project level rather than inventing a false source location.

A future source-map enhancement can use the existing `data-ui-id` / source-mapping infrastructure to place diagnostics on exact Astro AST ranges.

## Test Explorer

The extension discovers Component Lab stories and recorded UI tests from:

```text
designer-project.json
tests/ui-designer.tests.json
```

The initial run profile delegates to the workspace's `npm test` script or the editor's `tests/run-all.mjs` when available. This integrates with VS Code's Test Explorer without duplicating the Component Lab test model.

## Live preview

The designer can launch the workspace's Astro dev server through the extension bridge. By default:

```text
npm run dev -- --host 127.0.0.1
```

If `astroUIDesigner.previewCommand` is configured, that command is used instead.

The preview process is terminated when explicitly stopped or when the extension is deactivated.

## Export

`Astro UI Designer: Export Astro Project` calls the designer's real Astro exporter through the webview API and writes the generated files into a folder selected using VS Code's native folder picker.

The VS Code extension therefore does not maintain a separate code generator.

## Security

The extension declares that untrusted workspaces are unsupported because it can:

- write source files;
- execute Git commands;
- run npm scripts;
- launch Astro/Vite processes.

The webview has an explicit Content Security Policy and may only load local resources from the packaged designer directory. Workspace access is mediated by the extension host rather than exposing arbitrary filesystem APIs to webview JavaScript.

## Settings

```text
astroUIDesigner.autoOpenWorkspace
astroUIDesigner.autoLoadDesignerProject
astroUIDesigner.syncActiveAstro
astroUIDesigner.diagnosticsOnSave
astroUIDesigner.previewCommand
```

## Development

The extension is prebuilt CommonJS JavaScript so no compilation step is required.

```bash
cd vscode-extension
npm test
```

Press **F5** with the `vscode-extension` directory opened in VS Code to launch an Extension Development Host.

Package the local VSIX:

```bash
npm run package:vsix
```

The output is written under:

```text
vscode-extension/dist/
```

The repository's local packager exists so the extension can still be packaged in offline environments. For marketplace publication, using the official `@vscode/vsce` packaging/publishing tool is recommended.

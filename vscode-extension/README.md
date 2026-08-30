# Astro UI Designer for VS Code

This extension embeds the full Astro UI Designer into VS Code while keeping normal text editing available.

## Features

- Open the complete visual designer in a VS Code editor panel.
- Use **Reopen With → Astro UI Designer** for `.astro` files without replacing the text editor by default.
- Keep the active `.astro` file synchronized with the visual designer.
- Discover Astro pages and Astro/React/Vue/Svelte components in an Activity Bar view.
- Open Component Lab, Animation, Interchange and Live Preview directly from the Command Palette.
- Read/write the active VS Code workspace through a message bridge instead of the standalone HTTP workspace API.
- Use integrated Git status/diff/stage/commit from the designer.
- Start/stop the workspace Astro dev server from VS Code.
- Publish visual-project validation issues through VS Code Diagnostics.
- Discover designer story/test artifacts in VS Code Test Explorer.
- Contribute `dev`, `build`, `test`, and `preview` tasks when matching package scripts exist.
- Export the generated Astro project into a folder selected with the VS Code file picker.

## Development

Open the `vscode-extension` directory in VS Code and press **F5** to launch an Extension Development Host.

The extension is intentionally prebuilt JavaScript. No compilation step is needed to debug it.

```bash
npm test
```

The optional official VS Code integration-test dependencies are declared as dev dependencies. If installed, they can be used to add Extension Development Host tests following the standard VS Code testing workflow.

## Security

The extension is disabled in untrusted workspaces because it can:

- write project files;
- execute Git commands;
- run npm scripts;
- launch the Astro dev server.

Workspace file access is restricted to folders already open in the current VS Code workspace.

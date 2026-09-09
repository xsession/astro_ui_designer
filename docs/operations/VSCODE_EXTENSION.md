# VS Code extension host

The extension embeds the same designer under a VS Code webview and bridges workspace operations into the extension host. Workspace trust is mandatory for privileged writes/process behavior. Keep the mirrored designer assets synchronized with standalone. Build with `npm run package:vscode` and smoke with `npm run test:vscode`.

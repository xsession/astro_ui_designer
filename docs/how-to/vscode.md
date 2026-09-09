# How to use the VS Code extension

Install the generated VSIX, open a trusted workspace, then launch Astro UI Designer from the extension command/activity surface. The webview uses VS Code bridges for file access, Git, diagnostics, tests and dev-server lifecycle. Reopen `.astro`, `.astro-ui.json` or `designer-project.json` with the designer where registered. Untrusted-workspace restrictions are part of the security boundary; do not bypass them in a plugin.

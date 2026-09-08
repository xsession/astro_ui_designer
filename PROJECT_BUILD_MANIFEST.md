# Project build manifest

- Upstream repository: `https://github.com/xsession/astro_ui_designer.git`
- Upstream `main` reviewed: `b4b0ded9a1ae9e014766a1180d2f238adb81e22a`
- Upstream commit subject: `Fix the menu functionality`
- Upstream version at review: `2.15.0-global-tooltips`
- Integrated target version: `2.16.0-functional-workbenches`
- Review / packaging date: 2026-09-08

## Provenance

The current public GitHub `main` head was inspected through the connected GitHub API because direct `git clone`/GitHub network access is not available inside the build container. The working source started from the previously assembled 2.15 full source package and was reconciled against the current `b4b0ded9…` delta before the 2.16 implementation was applied.

The current upstream commit mainly repairs menu/toolbar behavior and updates `.vscode/settings.json`; the 2.16 command/hotkey layer retains or supersedes those menu fixes. The current workspace-tool behavior was reviewed against upstream and the current `.vscode/settings.json` was carried into this package.

This archive is a complete runnable source package for the modified application. It is not intended to be a byte-for-byte archive of historical upstream screenshots, old VSIX files, or other generated release artifacts.

## 2.16 implementation scope

### Functional workbenches

- All **41 built-in relocatable panels** have explicit functional renderers.
- Placeholder/shallow panels were replaced with working editors for actions, bindings, variants/states, data, effects, composition, Story, layout, CSS, state variables, animation, tokens, libraries, content/locales, tests/results, queries/templates/usages, audit, Git, prototype, comments and inspect/handoff.
- Unknown third-party/plugin panel IDs retain a diagnostic fallback instead of silently pretending to be implemented.
- The top-level Component Lab shell now has component/story selection, controls, responsive preview, local checks/results and visual baseline handling.

### Editable hotkeys

- New `standalone/js/hotkeys.js` + VS Code mirror.
- Command-based shortcut registry with normalization and keyboard event matching.
- Per-project overrides plus local defaults.
- Capture/change, clear, reset, reset-all and conflict handling.
- Alternate bindings and hotkey profile JSON import/export.
- Every relocatable panel is exposed as a command and can receive a custom shortcut.

### Page entities

- New `standalone/js/project-pages.js` + VS Code mirror.
- Create/edit/duplicate/reorder/delete page entities.
- Last-page deletion protection.
- Safe subtree ID regeneration on duplicate.
- Delete repairs flows, tests, prototype destinations, action/test node targets, review comments and document-tab order.
- Page deletion removes the designer page entity only; it does not silently delete an opened-workspace source file.

### Existing systems preserved

- relocatable/floating docks and section ordering
- global tooltips
- Draw.io / diagrams.net interchange
- source-aware round-trip editing and neutral IR conversion
- Astro export and workspace/source editing
- VS Code embedded designer
- Hermes MCP / skill integration

## Main 2.16 modules

- `standalone/js/app.js`
- `standalone/js/functional-workbenches.js`
- `standalone/js/hotkeys.js`
- `standalone/js/project-pages.js`
- `standalone/js/dock-layout.js`
- `standalone/js/drawio-io.js`
- `standalone/js/tooltips.js`
- mirrored runtime under `vscode-extension/designer/`

See `docs/FUNCTIONALITY_AUDIT.md`, `docs/HOTKEYS.md`, and `docs/PAGE_ENTITIES.md`.

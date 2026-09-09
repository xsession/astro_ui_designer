# Public browser API

The designer installs `window.AstroUIDesigner`. The current packaged API exposes these groups:

| Group | Methods |
|---|---|
| Project | `getProject`, `loadProjectObject`, `validate`, `saveProject`, `exportAstro` |
| Mode/workspace | `setMode`, `openBottomTab`, `openWorkspacePath`, `openSourceFile`, `importExistingProject` |
| Selection | `getSelected`, `getSelection`, `selectNode`, `selectNodes`, `selectionGeometry` |
| Manual arrangement | `alignSelection`, `distributeSelection`, `tidySelection`, `groupSelection`, `ungroupSelection`, `reorderSelection`, `flipSelection`, `lockSelection`, `nudgeSelection` |
| Docking | `dockLayout`, `moveDockPanel`, `floatDockPanel`, `activateDockPanel`, `resetDockLayout` |
| Interchange | `exportDrawioText`, `importDrawioText` |
| Simulation | `startSimulation`, `simulationState`, `simulationEvent`, `resetSimulation` |
| Commands/hotkeys | `commands`, `executeCommand`, `setHotkey`, `addHotkey`, `resetHotkey` |
| Pages | `createPage`, `duplicatePage`, `deletePage` |
| Plugins | `plugins`, `contributions` |
| Rendering | `render` |

This API is an application integration surface, not a formal semver-stable external SDK unless a release explicitly says otherwise. Prefer plugin/MCP contribution boundaries for long-lived integrations.

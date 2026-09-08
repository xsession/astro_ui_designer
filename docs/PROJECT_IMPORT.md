# Existing project import

Astro UI Designer 2.17 adds a visible project-folder import workflow for the round-trip adapters.

## Entry points

The same command is available from several places:

- top toolbar: **Import Project**
- **File > Import Existing Project…**
- **Project > Import Existing Project…**
- **Round-trip** workbench: **Import Existing Project…**
- command palette: `Import Existing Project…`
- default keyboard shortcut: `Ctrl+Shift+I` (editable in the Hotkeys workbench)

## Import flow

1. Choose a project folder.
2. Astro UI Designer scans supported source files while excluding generated/vendor directories such as `node_modules`, `.git`, `dist`, `build`, virtual environments and framework build caches.
3. The round-trip adapter registry detects the best matching language/framework.
4. A review dialog shows:
   - detected adapter and adapter family
   - project name
   - entry file
   - source and reachable file counts
   - adapter capabilities
   - live-workspace or snapshot mode
5. The adapter can be overridden before import if detection is ambiguous.
6. Import builds the neutral UI IR, converts it to the designer model, creates source identities, and opens the Round-trip workbench.

## Native live workspace mode

When the standalone Node host is running, **Import Project** invokes an OS-native folder chooser through `/api/workspace/browse`:

- Windows: FolderBrowserDialog through PowerShell
- macOS: Finder folder chooser through AppleScript
- Linux: `zenity` or `kdialog` when installed

The VS Code extension uses VS Code's native `showOpenDialog` folder chooser.

A live workspace keeps the selected root connected to the workspace API. Source reads, file watching, AST/structural inspection, reviewed patch application, checkpoints and rollback can therefore operate on the real project.

## Browser snapshot fallback

If no native host picker is available, the browser uses `showDirectoryPicker()` where supported and falls back to `webkitdirectory` file selection.

Snapshot import deliberately has limits:

- maximum 2 MB per source file
- maximum 24 MB total source text
- maximum 3000 supported source files
- generated/vendor directories are skipped

Snapshot mode supports visual editing and cross-framework generation. Direct source write-back is disabled until the folder is opened through a live workspace host.

## Adapter detection

Detection is supplied by the unified round-trip adapter SDK. Current built-in targets include Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI, LVGL, pwtk and Qt Quick/QML.

The import review always exposes an adapter override so a project with mixed technologies can be opened with the intended UI backend.

## Safety

Project-folder import does not immediately rewrite source. Design-to-source changes are still dry-run/reviewed operations with baseline fingerprints, source checkpoints and stale-source rejection.

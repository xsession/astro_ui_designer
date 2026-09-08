# Project build manifest

- Upstream repository: `https://github.com/xsession/astro_ui_designer.git`
- Newest upstream `main` verified during this build: `7863da396813093b592dba3c15cedc9dc65cdabf`
- Upstream commit subject: `Add pwtk blocks and GUI layout round-trip adapter (2.16.0)`
- Upstream version marker at review: `2.16.0-functional-workbenches`
- Integrated target version: `2.17.0-project-import-qml`
- Review / packaging date: 2026-09-08

## Provenance

The newest public `main` head was verified through the connected GitHub API. The 2.17 working tree builds on the previously validated full 2.16.1 hardening package, which itself reconciled the 2.16 functional-workbench tree against upstream commit `7863da396813093b592dba3c15cedc9dc65cdabf` and hardened the newly added pwtk adapter.

No newer upstream commit appeared during the final 2.17 verification pass. This archive contains the complete runnable modified source project; it does not claim that these local 2.17 changes were pushed back to GitHub.

## 2.17 scope

### Existing-project browse/import workflow

A formerly missing user-facing path to the adapter import system is now present in the actual editor UI:

- top toolbar **Import Project** button
- File and Project menus
- Round-trip workbench
- command palette
- editable `Ctrl+Shift+I` command

Standalone and VS Code hosts provide native folder browsing. When host browsing is unavailable, the browser can import a source snapshot through the File System Access API / directory-file fallback. The review modal exposes detected adapter, adapter override, entry-file override, source counts, capability summary, project name, and live-vs-snapshot state.

The live path feeds the existing workspace API, source watcher, reviewed patch planner, checkpoints, rollback and stale-source safeguards. Browser snapshots are intentionally non-writing until opened through a live host.

### Qt Quick / QML backend

Added first-class `qml` round-trip support:

- QML/Qt Quick detection and entry-point discovery.
- Project scanning for `.qml`, `.qmltypes`, `.qmlproject`, `.qrc`, `qmldir`, `qtquickcontrols2.conf`, `CMakeLists.txt` and support sources.
- Local QML component graph resolution, including quoted import directories and `qmldir` module imports.
- Structural QML object/property inspection with source ranges and stable `id`/symbol identities.
- Common Qt Quick / Controls / Layout mapping into the neutral IR and designer model.
- Visual approximation for geometry, Layout/anchor fill, spacing/margins, color/border, font size, opacity, rotation and z-order.
- Reviewed literal source patches for text, checked state, placeholder/image source, geometry, color, radius, spacing, opacity and font size.
- Preservation of untouched expression bindings, property-object blocks and signal-handler bodies as opaque source during QML regeneration where structurally recoverable.
- Qt 6 generation of `Main.qml`, `main.cpp` and modern CMake `qt_add_qml_module` scaffolding.
- Managed-preview runtime probing for `qml`, `qml6`, `qmlscene` and `qmlscene6`.

Arbitrary QML JavaScript semantics and C++ business logic remain source-owned rather than being blindly transformed.

### Additional integration fixes

- Fixed workspace-file normalization when the standalone scanner returns filename strings while VS Code returns file records.
- Expanded normal workspace discovery to all source families needed by advertised round-trip adapters.
- Native project-browser cancellation no longer falls through into a second browser picker.
- Hardened preview startup so missing runtime executables produce an explicit setup error instead of an unhandled child-process error.
- Standalone and VS Code embedded designer trees are byte-identical after the 2.17 integration.

## Existing systems retained

- 41 functional relocatable/floating workbenches
- editable hotkeys and command palette
- safe page create/edit/duplicate/delete lifecycle
- Component Lab
- global tooltips
- Draw.io / diagrams.net interchange
- Astro/React/Vanilla/Vue/Svelte/Tkinter/NiceGUI/LVGL/pwtk round-trip support
- round-trip source history, rollback, watcher and neutral IR conversion
- Astro export, source editor and Git helpers
- Hermes MCP / skill integration

## Main 2.17 changed modules

- `standalone/index.html`
- `standalone/styles.css`
- `standalone/js/app.js`
- `standalone/js/workspace-client.js`
- `standalone/js/roundtrip-app-bridge.js`
- `standalone/js/roundtrip-engine.js`
- `standalone/js/roundtrip-neutral-ir.js`
- `standalone/js/roundtrip-conversion.js`
- `standalone/js/qml-io.js` (new)
- `workspace-tools.mjs`
- `launch-designer.mjs`
- `roundtrip-node.mjs`
- mirrored VS Code designer/runtime sources
- `tests/roundtrip-qml.test.mjs` (new)
- `tests/project-import-ui.test.mjs` (new)
- `tests/workspace-roundtrip-files.test.mjs`
- `tests/run-all.mjs`

See `docs/PROJECT_IMPORT.md`, `docs/QML_ROUNDTRIP.md`, `docs/PWTK_ROUNDTRIP_REVIEW.md`, `docs/FUNCTIONALITY_AUDIT.md`, `docs/HOTKEYS.md`, and `docs/PAGE_ENTITIES.md`.

# Astro UI Designer 2.17.0 — validation

**Validation date:** 2026-09-08  
**Integrated version:** `2.17.0-project-import-qml`  
**Newest upstream head verified:** `7863da396813093b592dba3c15cedc9dc65cdabf` (`Add pwtk blocks and GUI layout round-trip adapter (2.16.0)`)

## Upstream verification

The GitHub connector was checked again immediately before final packaging. No commit newer than `7863da396813093b592dba3c15cedc9dc65cdabf` was present on `main` during this build.

Version 2.17 is layered on the previously validated 2.16.1 hardening tree, which already reconciled that upstream commit and fixed its pwtk/workspace integration problems.

## Existing-project import

- Top toolbar **Import Project** entry: **PASS**.
- File menu **Import Existing Project…**: **PASS**.
- Project menu **Import Existing Project…**: **PASS**.
- Round-trip workbench import entry: **PASS**.
- Command-palette registration: **PASS**.
- Editable default `Ctrl+Shift+I` hotkey: **PASS**.
- Native standalone host folder-browse API: **PASS structural/integration test**.
- Native VS Code folder chooser route: **PASS structural/source test**.
- Browser `showDirectoryPicker` / `webkitdirectory` fallback: **PASS structural test**.
- Adapter auto-detection and adapter override review: **PASS**.
- Entry-file override and live/snapshot mode review: **PASS**.
- Workspace filename-string normalization: **PASS**.
- Native browse cancellation avoids second fallback picker: **PASS**.

## Qt Quick / QML backend

- Backend/adapter registration: **PASS**.
- `.qml` / `.qmlproject` detection: **PASS**.
- QML structural hierarchy/id/property inspection: **PASS**.
- Stable source mapping by `id` / structural symbol path: **PASS**.
- Same-directory QML component discovery: **PASS**.
- Quoted local import-directory discovery: **PASS**.
- `qmldir` module component discovery: **PASS**.
- Common Qt Quick Controls/Layout neutral mapping: **PASS**.
- Layout/anchor visual approximation: **PASS**.
- QML type/id preservation through designer conversion/export: **PASS**.
- Reviewed literal text/checked/placeholder/source/geometry/style patching: **PASS**.
- Multiline JS handler and property-object/array opaque preservation: **PASS**.
- Property-owned QML object exclusion from ordinary visual child hierarchy: **PASS**.
- Generated `Main.qml`: **PASS structural re-parse**.
- Generated `main.cpp`: **PASS contract regression**.
- Generated Qt 6 CMake / `qt_add_qml_module`: **PASS contract regression**.
- Managed preview runtime probing / missing-command error handling: **PASS**.

The build environment has no Qt 6 SDK/runtime. Native QML execution/compilation is therefore recorded as **NOT AVAILABLE IN VALIDATION ENVIRONMENT**, not as a pass. A CMake configure test failed only at `find_package(Qt6 6.5)` because `Qt6Config.cmake` is absent.

## Existing systems regression

- Built-in relocatable panels: **41/41 functional routing PASS**.
- Editable hotkeys: **PASS**.
- Safe page create/edit/duplicate/delete lifecycle: **PASS**.
- Component Lab: **PASS**.
- pwtk hardened round-trip: **PASS**.
- Draw.io interchange: **2/2 PASS**.
- Global tooltips: **2/2 PASS**.
- Hermes MCP/skill: **2/2 PASS**.
- Visual structural smoke: **PASS**.
- VS Code source smoke: **PASS**.

## Automated suite totals

- Aggregate runner: **25/25 suites PASS**.
- Round-trip script: **12/12 PASS**.
- Functional suites: **3/3 PASS**.
- Project import script: **2/2 PASS**.
- Draw.io suites: **2/2 PASS**.
- Tooltip suites: **2/2 PASS**.

## Source consistency

- JavaScript/MJS syntax validation: **112 files PASS**.
- Runtime JS/MJS files in relative-import audit: **111**.
- Runtime relative imports checked: **240**.
- Missing runtime relative imports: **0**.
- Entire `standalone/` vs `vscode-extension/designer/` tree parity: **PASS**.
- Current VSIX: `astro-ui-designer-vscode-2.17.0.vsix`: **PASS**.

## Live host smoke

A real local `launch-designer.mjs --no-browser` process was started and exercised:

- `/` served the 2.17 designer with `#import-project-btn`: **PASS**.
- `/api/workspace/open` scanned a real temporary QML project and returned both `Main.qml` and `CMakeLists.txt`: **PASS**.
- `/api/roundtrip/inspect` inspected `Main.qml` with `parser=qml-structural` and `astValidated=true`: **PASS**.
- QML `actionButton` stable symbol was present: **PASS**.
- `/api/roundtrip/health` returned `qmlStructural=true`: **PASS**.
- Launcher identified itself as `Astro UI Designer Pro 2.17.0 Project Import + Qt/QML`: **PASS**.

## Generated outputs

- Astro example regeneration: **PASS**.
- Qt/QML example generation (`Main.qml`, `main.cpp`, `CMakeLists.txt`): **PASS**.
- Generated QML structural re-parse: **PASS** (34 nodes).
- VS Code extension packaging: **PASS**.
- Final archive and internal SHA-256 manifest are regenerated after this report.

## Deliberate limits

Project import does not silently rewrite source. Source mutation remains reviewed and fingerprint-guarded. Browser-only snapshot imports cannot write back until opened as a live workspace.

The QML adapter is structural and conservative. Arbitrary JavaScript semantics, runtime object factories, complex state-machine semantics and C++ business logic remain source-owned. See `docs/QML_ROUNDTRIP.md`.

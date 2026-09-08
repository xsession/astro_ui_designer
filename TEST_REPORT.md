# Astro UI Designer 2.17.0 — test report

Validation completed on 2026-09-08 against the newest verified upstream head `7863da396813093b592dba3c15cedc9dc65cdabf`.

| Area | Result |
|---|---|
| Aggregate suite | **25/25 PASS** |
| Existing-project import regression | **PASS** |
| Functional hotkey/page/tab suites | **3/3 PASS** |
| Built-in relocatable dock routing | **41/41 PASS** |
| Component Lab integration | **PASS** |
| Round-trip script | **12/12 PASS** |
| Qt Quick/QML round-trip regression | **PASS** |
| pwtk round-trip regression | **PASS** |
| Workspace source-family regression | **PASS** |
| Draw.io | **2/2 PASS** |
| Tooltips | **2/2 PASS** |
| Dock layout | **PASS** |
| Runtime module loading | **PASS** |
| Visual structural smoke | **PASS** |
| VS Code source package | **PASS** |
| VSIX 2.17.0 package generation | **PASS** |
| Hermes MCP + skill | **2/2 PASS** |
| JavaScript/MJS syntax | **112 files PASS** |
| Runtime relative imports | **240 checked, 0 missing** |
| Standalone/VS Code embedded designer parity | **PASS** |
| Local HTTP/workspace API smoke | **PASS** |
| Live QML workspace inspect smoke | **PASS** |
| Generated QML structural validation | **PASS** |

## New regression coverage in 2.17

`tests/project-import-ui.test.mjs` verifies the user-visible **Import Project** toolbar command, File/Project command registration, editable hotkey, browser directory fallback, native standalone browse route, VS Code native browse route, adapter override UI and round-trip bridge import APIs.

`tests/roundtrip-qml.test.mjs` covers:

- QML backend discovery and adapter-SDK exposure
- `Main.qml` entry detection
- same-directory, quoted-directory and `qmldir` module component graph resolution
- QML structural object/id/property source ranges
- Qt Quick Controls/Layout neutral-IR mapping
- anchors/Layout visual approximations
- QML type/id preservation through designer conversion
- checked/text/geometry source review changes
- generated `Main.qml`, `main.cpp` and modern Qt 6 `CMakeLists.txt`
- runtime structural inspection and syntax patch planning
- signal-handler preservation
- multiline handler/property-object/property-array preservation
- exclusion of property-owned QML objects from ordinary visual-child hierarchy

`tests/workspace-roundtrip-files.test.mjs` now also verifies `.qml`, `.qmlproject`, `qmldir` and `CMakeLists.txt` discovery in addition to the Python/HTML/LVGL/Sass families added in 2.16.1.

## Qt build-environment note

The validation container does not have a Qt 6 SDK/runtime installed. `qmlRuntime` correctly reports `false`, and a CMake configure attempt reaches `find_package(Qt6 6.5 ...)` but cannot locate `Qt6Config.cmake`. Therefore this report does **not** claim a native Qt compile/run test. Generated QML was re-parsed by the structural QML adapter successfully (34 nodes in the generated sample), and the generated CMake/main.cpp contracts are covered by regression assertions.

See `VALIDATION.md`, `docs/PROJECT_IMPORT.md`, and `docs/QML_ROUNDTRIP.md` for scope and limitations.

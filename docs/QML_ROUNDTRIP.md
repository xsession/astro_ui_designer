# Qt Quick / QML round-trip adapter

Astro UI Designer 2.17 includes a first-class `qml` round-trip backend for Qt Quick and Qt Quick Controls projects.

## Detection

The adapter recognizes projects containing `.qml` files and common QML/Qt Quick import signatures. `Main.qml`/`main.qml` is preferred as the entry point when present. The source graph also recognizes local QML component usage (`DeviceCard { ... }` -> `DeviceCard.qml`) and the workspace scanner includes QML-related project files such as:

- `*.qml`
- `*.qmltypes`
- `*.qmlproject`
- `*.qrc`
- `qmldir`
- `qtquickcontrols2.conf`
- `CMakeLists.txt`
- C/C++ support files

## Import mapping

The structural QML reader preserves object hierarchy, stable `id` identities, direct property bindings and source ranges. Common types map to editable designer nodes:

| QML | Designer |
| --- | --- |
| `ApplicationWindow`, `Window`, `Item`, `Rectangle` | page/container/group |
| `Row`, `RowLayout` | row/container |
| `Column`, `ColumnLayout` | column/container |
| `Grid`, `GridLayout`, `Flow` | grid/container |
| `Text`, `Label` | text |
| `Button`, `ToolButton`, `RoundButton`, `DelayButton` | button |
| `TextField`, `TextInput`, `TextArea` | input/textarea |
| `Image` | image |
| `CheckBox`, `Switch` | checkbox |
| `RadioButton` | radio |
| `Repeater`, `ListView`, `GridView`, `TableView` | repeater/container |

Unknown QML object types are retained as generic designer containers/groups and keep their original QML type metadata.

## Editable properties

Reviewed visual-to-source patches are anchored by QML `id` when available, otherwise by a structural symbol path. Supported literal edits include:

- `text`
- `checked`
- `placeholderText`
- image `source`
- `x`, `y`, `width`, `height`
- `color`
- `radius`
- `spacing`
- `font.pixelSize`
- `opacity`

Designer aliases such as `left`/`top`, `backgroundColor`, `borderRadius`, `gap` and `fontSize` are translated to their QML property names.

JavaScript signal handlers and expression bindings are treated as opaque source. The adapter does not blindly rewrite handler bodies or C++ application logic.

## Export

QML export produces an editable Qt 6 project containing:

- `Main.qml`
- `main.cpp` using `QGuiApplication` and `QQmlApplicationEngine`
- `CMakeLists.txt` using Qt's modern CMake QML module workflow

Imported QML type and `id` metadata are preserved when possible, so a QML -> designer -> QML conversion does not intentionally collapse controls into generic HTML-like types.

## Preview

The built-in preview profile prefers `qml Main.qml`. The Node host checks `qml`, `qml6`, `qmlscene` and `qmlscene6` in that order and fails with an explicit setup error when no Qt QML runtime is on `PATH`, rather than spawning an invalid process. Generated full applications can instead be configured and built with CMake/Qt and started through a project-specific preview command.

## Parser scope

The QML reader is intentionally structural and conservative. It is designed for visual hierarchy, direct property bindings and stable source anchoring. It is not a replacement for Qt's complete QML/JavaScript compiler, and arbitrary JavaScript/C++ semantic transformations remain out of scope for automatic source edits.

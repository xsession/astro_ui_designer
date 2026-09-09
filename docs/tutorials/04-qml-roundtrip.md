# Tutorial: Qt Quick/QML round-trip

1. Import a Qt Quick project containing `Main.qml` and local QML components.
2. Confirm adapter detection reports **Qt Quick / QML**.
3. Inspect the imported object tree and verify QML IDs are retained as source identities where available.
4. Change a controlled literal property such as `text`, `width`, `height`, `x`, `y`, color, radius, spacing or font size.
5. Review and apply the QML patch. Opaque JavaScript handlers and unsupported bindings should remain preserved rather than rewritten.
6. For a new designer project, use the QML generation path to produce `Main.qml`, `main.cpp` and `CMakeLists.txt`.
7. Build/run the generated output with your installed Qt 6 toolchain; the designer's structural parser is not a replacement for Qt's runtime/compiler validation.

See [QML feature notes](../features/QML_ROUNDTRIP.md) and [backend reference](../reference/ROUNDTRIP_BACKENDS.generated.md).

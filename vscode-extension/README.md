# Astro UI Designer VS Code 2.17.2

Embeds the same Astro UI Designer 2.17 runtime used by the standalone application.

## Highlights

- Native VS Code folder chooser for **Import Existing Project…**.
- Adapter auto-detection and reviewed project import.
- Qt Quick/QML round-trip support alongside Astro, React, Vue, Svelte, Vanilla JS/TS, Tkinter, NiceGUI, LVGL and pwtk.
- Functional relocatable workbenches, editable hotkeys and safe page entity lifecycle.
- Source-aware round-trip review, file watching, checkpoints and rollback.
- Draw.io interchange and the existing designer/Component Lab/composition features.

Run **Astro UI Designer: Open Designer** from the command palette. The embedded designer uses VS Code workspace APIs for folder browsing, source reads/writes and other host integration.

## Direct canvas manipulation

The embedded designer has the same 2.17.2 artboard-level drag, resize, rotate and keyboard geometry editing as the standalone editor, including normal flex/grid children and breakpoint-local geometry writes.

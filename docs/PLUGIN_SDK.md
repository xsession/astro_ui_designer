# Plugin SDK

Plugins are ES modules imported by `standalone/plugins/bootstrap.js` and register through `registerDesignerPlugin()`.

Contribution kinds in the 2.10 baseline are `dataSources`, `importers`, `deployers`, `assistants`, `testAdapters`, `sourceAdapters`, and `tokenAdapters`. The 2.12 installer adds `backendAdapters`, which use one round-trip contract covering detection, inspection, import, generation, patching, preview and validation.

Plugins receive the active project/node/selection context when invoked by the Integrations workbench.


### backendAdapters

Backend adapters implement one round-trip contract covering detection, syntax inspection, neutral-IR import, code generation, reviewed source patching, managed preview and validation. The bundled adapters cover Astro, React, Vanilla JS/TS, Vue, Svelte, Tkinter, NiceGUI and LVGL. See `LAYOUT_SYNTH_ROUNDTRIP_INTEGRATION.md`.

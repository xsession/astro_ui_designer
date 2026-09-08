# Project build manifest

- Upstream repository: `https://github.com/xsession/astro_ui_designer.git`
- Pinned upstream commit: `3dbd68ae47693268e244e20042c05ee665ffff8a`
- Upstream version at pin: `2.10.0-color-pickers`
- Integrated target version: `2.15.0-global-tooltips`
- Integration lineage: Layout Synth-inspired round-trip system + relocatable Qt-style dock workbench + Draw.io/diagrams.net interchange + global menu/layout tooltip layer
- Packaging date: 2026-09-08

## Source-package scope

This ZIP is a complete runnable **source project**. It contains the browser designer, local host, project model, plugins, VS Code source mirror, round-trip runtime, relocatable dock manager, tests, examples and documentation.

The 2.15 workbench registers all 40 tool tabs as relocatable dock panels, adds Draw.io/diagrams.net import/export inside the relocatable Interchange panel, and installs global purpose-aware tooltips over menu, layout, docking, palette, source and workbench controls. Panels can move between left/right/bottom zones, reorder, float, resize and persist. Document tabs and supported inspector/workbench sections can also be reordered.

Historical generated release outputs such as old VSIX binaries, previous visual-regression PNGs and old generated sample ZIP archives are not authoritative source inputs. Current generated outputs are rebuilt from the integrated source.

Because the connected GitHub App rejects write operations with HTTP 403, integration was performed locally against the pinned public repository state rather than committed to the remote repository.

## Draw.io import/export scope

The 2.14 source tree adds `standalone/js/drawio-io.js` and the mirrored VS Code module. The adapter handles compressed/uncompressed mxGraph pages, embedded Draw.io SVG documents, geometry/style conversion, multi-page mapping, connector preservation, uncompressed export, Interchange workbench controls and public API access. See `docs/DRAWIO_INTERCHANGE.md`.

## Global tooltip scope

The 2.15 source tree adds `standalone/js/tooltips.js` plus its VS Code mirror. It provides explicit descriptions for compact/ambiguous shell controls, semantic descriptions for all relocatable dock panels and component-registry palette entries, automatic annotation of dynamically rendered controls, accessible focus behavior, viewport-aware rendering, and disabled-control fallback behavior. See `docs/TOOLTIPS.md`.

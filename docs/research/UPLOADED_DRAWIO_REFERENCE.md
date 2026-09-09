# Uploaded Draw.io reference analysis

Source inspected: user-provided `design.drawio`.

The file is an uncompressed diagrams.net `mxfile` with two pages. Both pages use a 4681 × 3300 page, 10-unit grid, guides and conventional C4/UML-style boxes/connectors.

## `GUI_design`

The GUI document presents an LVGL medical-device UI design with four screen concepts: main/device status, settings, critical-error/recovery and shutdown confirmation. The page combines screen mockups with labeled UI controls rather than treating the diagram as an abstract architecture-only view.

## `C4-C1-Architectural_design`

The architecture page uses a high-level C4 C1 presentation: a user/actor, an embedded medical device with GUI, Astro UI Designer and generated output artifacts. Notes distinguish application/framework concerns and file-level outputs such as C/C++, LVGL/LovyanGFX and metadata.

## Visual language reused in this documentation

The Astro UI Designer master architecture diagrams intentionally borrow the reference's useful characteristics without copying its domain content:

- large landscape engineering canvas;
- pastel blue/green/orange subsystem categories;
- simple rounded process/system boxes;
- explicit arrows with short relation labels;
- high-level C4 pages separated from detailed runtime/data pages;
- editable Draw.io source plus rendered previews.

The new diagrams broaden this into C1/C2/C3/C4, runtime, data-model, workbench, adapter, deployment and quality views.

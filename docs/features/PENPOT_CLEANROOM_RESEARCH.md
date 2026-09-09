# Penpot 2.17 Clean-Room Research and Implementation Map

**Research date:** 2026-08-30  
**Reference product:** Penpot 2.17.0  
**Implementation target:** introduced in Astro UI Designer Pro 2.4.0-penpot-cleanroom; retained in 2.6.0-plasmic-cleanroom

## Clean-room boundary

This implementation is intentionally independent. Penpot's source code was **not** copied, translated, mechanically ported, or used as an internal class/API template. The work uses public user/developer documentation, published release notes, observable workflow concepts, and the documented open `.penpot` interchange format as behavioral references.

Astro UI Designer keeps its own semantic model, UI implementation, renderer, plugin API, runtime, and exporter architecture. Penpot is treated as one interoperable design platform, not as the editor's internal data model.

Primary public references:

- https://github.com/penpot/penpot/releases
- https://help.penpot.app/technical-guide/developer/data-model/penpot-file-format/
- https://help.penpot.app/user-guide/export-import/penpot-file-format/
- https://help.penpot.app/user-guide/prototyping-testing/prototyping/
- https://help.penpot.app/user-guide/designing/layers/
- https://help.penpot.app/user-guide/export-import/exporting-layers/
- https://help.penpot.app/user-guide/design-systems/design-tokens/
- https://help.penpot.app/user-guide/design-systems/libraries/
- https://help.penpot.app/technical-guide/developer/data-model/

## Current Penpot reference baseline

The latest public GitHub release found during this review is **Penpot 2.17.0**, published 2026-07-22. Relevant 2.17 changes include:

- prototype viewer rendering changes;
- variant retrieval through the plugin API;
- searchable prototype destinations;
- explicit dashed-stroke dash/gap controls;
- richer history metadata;
- typography-token improvements.

The current documented `.penpot` interchange format is **v3**, implemented as a ZIP archive containing readable JSON metadata plus binary assets. The current documentation describes feature flags such as `design-tokens/v1`, `components/v2`, `variants/v1`, and `layout/grid`. This open structure makes a clean-room adapter practical without making Penpot's internal application model part of Astro UI Designer.

## Feature-gap analysis and implementation

| Penpot capability observed in public docs/release notes | Previous Astro UI Designer state | Clean-room implementation in 2.4 |
|---|---|---|
| Structured fills | Basic CSS color/background | Multi-fill design metadata + CSS projection |
| Structured strokes | Basic border fields | Multiple stroke records, width/style, dash/gap metadata |
| Dashed stroke dash/gap | Missing dedicated controls | Explicit dash/gap fields; preserved in SVG/Penpot interchange |
| Shadows | CSS field only | Structured shadow records + projection |
| Layer/background blur | Partial CSS support | Dedicated layer/background blur controls |
| Blend modes | Missing | Blend-mode model + inspector + CSS output |
| Constraints | Layout-specific only | Horizontal/vertical constraint metadata |
| Fixed-on-scroll prototype elements | Generic positioning only | Fixed-on-scroll metadata + Astro/CSS output |
| Clip content / mask-style containers | Partial overflow support | Clip flag + Mask component + export |
| Primitive vector shapes | Limited HTML primitives | Rectangle, ellipse, SVG path, raw SVG, group, mask |
| Guides | Missing | Horizontal/vertical guide model + canvas overlay |
| Selection size feedback | Selection name only | Width × height selection badge when dimensions exist |
| Prototype flows | Actions but no flow model | Named flow start model/workbench |
| Prototype triggers | Generic action events | click, mouse-enter, mouse-leave, after-delay |
| Prototype actions | Partial | navigate, open/toggle/close overlay, previous, open URL |
| Searchable prototype destinations | Missing | Searchable datalist destination selector |
| Prototype overlays | Partial modal actions | Overlay runtime metadata + local/cross-route preview path |
| Comments/review | Missing | Anchored comments, replies, resolve/reopen, jump to node |
| Inspect/handoff | Generated-code tab only | Selected-node geometry, CSS and HTML inspect workbench |
| Export presets | Missing | Per-node export-preset metadata |
| Multiple layer export formats | Astro-centric | Interchange/export adapter system; exact bitmap/PDF renderer remains separate |
| Shared design libraries | Components were project-local | Publish/import/apply/export library snapshots |
| Design tokens | Existing DTCG support | Retained; aligned as preferred cross-tool token boundary |
| Components/variants | Existing | Retained and represented in interchange feature flags |
| Open native design-file interchange | Missing | Penpot v3 clean-room ZIP/JSON importer/exporter |
| Multiple platform interchange | Partial provider hooks | Concrete Penpot/Figma bridge/HTML/SVG/neutral importers + multiple exporters |

## Penpot v3 adapter

The adapter is isolated in `standalone/js/platform-io.js`.

### Import

The reader accepts a documented ZIP+JSON Penpot v3 structure and maps supported objects into the independent Astro UI Designer model:

- frame/board → freeform container;
- group → group;
- rectangle → rectangle shape;
- circle/ellipse → ellipse shape;
- path/boolean-path metadata → SVG path representation;
- text → text;
- image → image;
- raw SVG → safe raw-SVG node;
- constraints, effects, interactions, export metadata and fixed-scroll semantics where representable;
- design tokens when present;
- page guides and flows.

Unknown or unsupported metadata is not used to mutate arbitrary application code. Import is intentionally loss-aware.

### Export

The clean-room exporter writes a v3-style ZIP/JSON package with manifest, file/page/shape records and explicit feature flags. It serializes supported effects, layout/design metadata, prototype interactions and token data.

The adapter is tested by exporting a real `.penpot` ZIP, parsing its entries, and importing it again into a fresh Astro UI Designer project.

**Compatibility qualification:** the implementation follows the published format documentation and passes its own structural/round-trip tests. The current execution environment did not contain a running Penpot 2.17 installation, so this build does **not** claim that every generated file has been acceptance-tested by Penpot itself. Unknown migrations and future Penpot data versions must remain guarded.

## Prototype model

Public Penpot documentation describes the following core trigger/action model, which is represented independently in Astro UI Designer:

Triggers:

- click/tap;
- mouse enter;
- mouse leave;
- after delay.

Actions:

- navigate;
- open overlay;
- toggle overlay;
- close overlay;
- previous screen;
- open URL.

Astro UI Designer stores these as generic prototype interactions and emits Astro/runtime behavior rather than Penpot-specific runtime code.

## Effects/vector model

The clean-room design layer stores structured design semantics separately from generated CSS:

```text
Node
└── design
    ├── constraints
    ├── effects
    │   ├── fills[]
    │   ├── strokes[]
    │   ├── shadows[]
    │   ├── blurs[]
    │   └── blendMode
    ├── interactions[]
    ├── exportPresets[]
    ├── fixedOnScroll
    ├── clipContent
    ├── vector
    └── libraryRef
```

This is deliberately not Penpot's internal shape schema. CSS/SVG/Penpot/export adapters each project the semantic data into their own target representation.

## Shared-library model

Astro UI Designer now supports portable library snapshots containing reusable components, themes and token metadata. A snapshot can be:

- published from the current project;
- applied to another project;
- exported as `.aui-library.json`;
- imported later.

This is a local/offline analogue of design-library reuse. It does not pretend to implement Penpot's multi-user team library server, permissions or remote synchronization.

## Deliberate non-goals / remaining depth

These are not falsely labelled as complete Penpot parity:

1. **Realtime multi-user collaboration / presence / CRDT.** The stable-ID model is compatible with adding this later, but no collaborative Penpot server protocol is cloned.
2. **Exact vector boolean geometry engine.** Boolean/path metadata can be preserved/mapped, but arbitrary robust union/difference/intersection/exclusion geometry needs a dedicated vector kernel.
3. **Pixel-identical Penpot rendering.** Penpot uses its own modern rendering stack; Astro UI Designer renders web/CSS/SVG semantics.
4. **Exact PNG/JPEG/WebP/PDF per-layer rendering.** Export presets are modeled, while raster/PDF rendering should be implemented through a dedicated headless-browser/vector export service.
5. **Penpot v1 legacy binary files.** The current adapter targets documented v3 ZIP+JSON.
6. **Penpot server/team/shared-library synchronization.** Local portable library snapshots are implemented instead.
7. **Native Figma `.fig`.** `.fig` is a closed native format and is intentionally not fabricated. Figma interoperability uses REST-style bridge JSON.
8. **Unbounded lossless conversion between every design platform.** Interchange adapters report their capabilities and should preserve unsupported information rather than silently guessing.

## Clean-room acceptance criteria

The implementation is considered clean-room compatible when:

- Astro UI Designer remains fully usable without Penpot installed;
- no runtime/import path depends on Penpot source packages;
- Penpot serialization lives only behind the adapter boundary;
- the project model has no Penpot-specific primary IDs/classes;
- all new GUI features have independent tests;
- import/export failures are explicit rather than destructive;
- interoperability limitations are shown in the UI.

These criteria are exercised by `penpot-cleanroom.test.mjs`, `platform-io.test.mjs`, `penpot-browser.test.mjs`, and the Penpot/interchange visual checkpoints.

# Draw.io / diagrams.net interchange

Astro UI Designer 2.14 adds a first-class Draw.io/diagrams.net importer and exporter.

## Where to use it

Open the **Interchange** tool tab. Because the workbench uses relocatable docks, the Interchange tab can be docked left/right/bottom or floated like every other tool panel.

- **Import .drawio** loads a Draw.io document into the Astro UI Designer project model.
- **Export .drawio** writes the current project as editable diagrams.net `mxGraphModel` XML.

The public API also exposes:

```js
const xml = AstroUIDesigner.exportDrawioText();
await AstroUIDesigner.importDrawioText(xml);
```

## Import support

The importer understands:

- standard uncompressed `.drawio` / `.xml` files;
- standard compressed Draw.io diagram pages (raw-DEFLATE + URI encoding);
- raw `mxGraphModel` XML;
- multi-page `mxfile` documents;
- Draw.io SVG exports containing an embedded `mxfile` in the SVG `content` attribute;
- `object`-wrapped `mxCell` records used for custom Draw.io properties.

Imported vertex cells become editable freeform designer nodes. The importer maps:

- `mxGeometry` x/y/width/height -> absolute canvas geometry;
- labels / simple rich-text labels -> editable text;
- fill, stroke and stroke width;
- dashed borders;
- font color, size, bold, italic and underline;
- horizontal / vertical label alignment;
- rounded rectangles and ellipses;
- image cells;
- opacity, rotation and simple shadow state;
- group hierarchy;
- multiple Draw.io pages -> multiple Astro UI Designer pages.

Connector cells are retained in `project.design.interchange.drawio.edges`, including source/target identities, style, labels and routing-point metadata. This allows loss-minimized Draw.io re-export even though Astro UI Designer does not yet have a general-purpose visible connector primitive on the web-layout canvas.

## Export support

The exporter writes a standard, editable, **uncompressed** diagrams.net document. Uncompressed XML is deliberate: it remains diffable, source-control friendly and easy to inspect while diagrams.net can open and re-save it normally.

Current Astro UI Designer nodes are converted to Draw.io vertices. Existing imported Draw.io cell IDs/styles are reused when possible, then updated from the current designer geometry/style. Preserved connectors are re-emitted with updated source/target cell IDs.

Optional prototype interaction export is also available through the module API:

```js
exportDrawio(project, { includePrototypeInteractions: true });
```

This converts node prototype destinations into Draw.io arrows in addition to preserved imported connectors.

## Round-trip behavior

For imported Draw.io shapes, Astro UI Designer stores Draw.io metadata under `node.meta.drawio`. Synthetic label children are marked with `node.meta.drawioSyntheticLabel`; they are used for visual editing but collapsed back into the parent Draw.io cell during export.

The intended round trip is:

```text
Draw.io -> Astro UI Designer -> edit geometry/text/style -> Draw.io
```

Multi-page identity, cell IDs, basic style, labels and edge connectivity are retained across the round trip.

## Deliberate limitations

- Vendor-specific / mxGraph stencil shapes are represented as generic editable cards when Astro UI Designer has no corresponding primitive. Their original Draw.io style string is retained for re-export.
- Edge routing metadata is preserved, but connectors are not yet rendered as first-class editable wires on the Astro web-layout canvas.
- Draw.io PNG files with compressed diagram metadata inside PNG chunks are not imported. Use `.drawio`, `.xml`, or Draw.io SVG instead.
- Very complex HTML labels are reduced to editable text on import. If the label is unchanged, the original Draw.io value is preserved for re-export.

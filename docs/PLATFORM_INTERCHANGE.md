# Multi-platform Import / Export

Astro UI Designer uses an independent semantic project model. Platform formats are adapters around that model rather than the persistence layer itself.

## Adapter matrix

| Platform / format | Import | Export | Fidelity / boundary |
|---|:---:|:---:|---|
| Astro project | Yes | **Native** | Primary target; source-aware workspace and full project generator |
| Astro UI Designer JSON | Yes | Yes | Native designer model / highest round-trip fidelity |
| Neutral Designer JSON (`.aui.json`) | Yes | Yes | Vendor-neutral internal interchange envelope |
| Penpot v3 (`.penpot`) | Yes | Yes | Clean-room ZIP+JSON adapter based on public v3 format docs; loss-aware |
| Figma REST-style JSON bridge | Yes | Yes | Bridge representation; **not** closed native `.fig` |
| Static HTML | Yes | Yes | Structural best effort; dynamic framework semantics are not reconstructable from HTML alone |
| SVG | Yes | Yes | Vector/layout best effort; supported native vector nodes preserved more directly |
| React / JSX | — | Yes | Readable component output |
| Vue SFC | — | Yes | Readable component output |
| Svelte | — | Yes | Readable component output |
| DTCG design tokens | Yes | Yes | Preferred design-token interchange boundary |
| Shared Astro UI library snapshot | Yes | Yes | Components/themes/token metadata (`.aui-library.json`) |

## Adapter principles

1. **No vendor format is the editor model.** A Penpot or Figma import becomes an independent project graph.
2. **Never fabricate closed native formats.** Figma `.fig` is explicitly not generated.
3. **Prefer readable standards.** Astro, HTML, SVG, JSON and DTCG stay inspectable.
4. **Report loss.** Unsupported constructs should generate diagnostics or remain as guarded metadata instead of being silently discarded.
5. **Use stable IDs.** Cross-format mapping is ID-based where source formats expose stable identifiers.
6. **Keep source ownership separate.** Importing a design does not grant the designer permission to arbitrarily rewrite handwritten Astro/TypeScript.
7. **Adapters are extensible.** Additional design/CMS/deployment/code targets should register through the integration API.

## Penpot v3

The current documented format is a ZIP containing JSON metadata and media assets. Import/export lives in `standalone/js/platform-io.js` and is tested as an actual ZIP round trip.

Supported mappings include pages/boards, groups, primitive shapes, text, images, SVG paths/raw SVG, constraints, effects, guides, flows, interactions, token data and export metadata where representable.

The adapter is intentionally version-aware. Unknown future feature flags or migrations must not trigger unsafe guesses.

## Figma bridge

The Figma adapter is designed around REST-style document JSON. It maps common node/layout/text/shape concepts into the independent model and can export a bridge JSON representation for external tooling.

It does not claim binary `.fig` compatibility.

## HTML / SVG import

HTML import uses a conservative structural parser. It reconstructs common semantic/layout/form elements but cannot infer arbitrary source framework state, build-time Astro expressions or hidden component boundaries from the final DOM.

SVG import maps supported vector primitives and preserves raw SVG when a clean semantic mapping would be more destructive than keeping the source representation.

## Code exporters

React, Vue and Svelte exporters target readable source rather than framework-specific visual-editor runtimes. Astro remains the richest/native exporter because it can preserve routes, content collections, integrations, assets, interactions, localization and project-level metadata.

## Future adapters

The contribution API intentionally leaves room for:

- Figma REST/plugin providers with authenticated asset fetch;
- Penpot server/library synchronization;
- Webflow/Framer-like public export bridges when a supported public API exists;
- Storybook/component-catalog exchange;
- design-system package importers;
- PDF/raster rendering services;
- additional frontend targets such as Lit/Web Components/Qwik/SolidStart.

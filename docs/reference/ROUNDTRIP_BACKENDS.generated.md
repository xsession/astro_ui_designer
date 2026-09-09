<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->

# Round-trip backend matrix

Generated from `standalone/js/roundtrip-engine.js`.

| Backend | Label | Family | Extensions | Supported | Partial/controlled | Unsupported |
|---|---|---|---|---|---|---|
| `astro` | Astro | web | `.astro` `.css` `.scss` `.sass` `.less` | data-ui-id anchored attribute edits; Plain-text content edits; CSS declaration edits; Responsive CSS selector edits | Component prop expressions; Class-list changes when expressions are present | Arbitrary frontmatter rewrites; Blind component-tree rewrites |
| `react` | React | web | `.tsx` `.jsx` `.css` `.scss` `.sass` `.less` | data-ui-id/class anchored CSS edits; Plain JSX text edits; Simple literal prop edits | JSX expressions; CSS-in-JS literals | Arbitrary hook/control-flow rewrites; Unanchored tree rewrites |
| `vanilla-js` | Vanilla JS | web | `.html` `.htm` `.css` `.js` | data-ui-id/id/class anchored HTML edits; Plain text edits; CSS declaration edits | Inline script literal updates | Arbitrary JavaScript control-flow rewrites |
| `vanilla-ts` | Vanilla TS | web | `.html` `.htm` `.css` `.ts` | data-ui-id/id/class anchored HTML edits; Plain text edits; CSS declaration edits | Simple TypeScript literal updates | Arbitrary TypeScript control-flow rewrites |
| `vue` | Vue | web | `.vue` `.css` `.scss` `.sass` `.less` | Template data-ui-id/class anchored CSS edits; Plain template text edits | Literal template props; Scoped-style selectors | Arbitrary script setup/control-flow rewrites |
| `svelte` | Svelte | web | `.svelte` `.css` `.scss` `.sass` `.less` | Template data-ui-id/class anchored CSS edits; Plain template text edits | Literal component props; Component-local style selectors | Arbitrary reactive/script rewrites |
| `tkinter` | Tkinter | python | `.py` | Stable widget-symbol mappings; Geometry/config value review | Literal text/color/font patch adapters | Blind pack/grid/place migrations; Callback/control-flow rewrites |
| `nicegui` | NiceGUI | python | `.py` | Stable symbol/line mappings; Style/text review | Literal .style() and label text patch adapters | Arbitrary Python control-flow rewrites |
| `lvgl` | LVGL | embedded | `.c` `.h` `.cpp` `.hpp` | Stable object-symbol mappings; Geometry/style setter review | Literal lv_obj/lv_style setter patch adapters | Callback logic rewrites; Complex style-class rewrites |
| `qml` | Qt Quick / QML | qt | `.qml` `.qmltypes` `.qrc` `.qmlproject` | QML object hierarchy import; id-anchored literal property edits; Qt Quick Controls/Layout mapping; Editable QML project generation | Anchored geometry/text/color/property patches; Local QML component graph discovery; Signal-handler preservation as opaque source | Arbitrary JavaScript handler rewrites; C++ business-logic rewrites; Dynamic Loader/Component factories without stable source structure |
| `pwtk` | pwtk Blocks | python | `.py` `.pyi` `.json` `.html` | Block / GUI-block symbol mappings from App & layout.json; Refresh-timer (timer_vals) review; Pin/mirror state review; App handler (@on) mapping; Preservation of untouched Python/HTML sources | Block container re-arrangement in layout.json; Block/group key renames; Generated scaffold when original Python sources are absent | Blind CANopen/communication logic rewrites; render_custom_html template rewrites; Arbitrary Python control-flow rewrites |

## Sync/dirty-state concepts

The engine also defines reviewed source→design, design→source and bidirectional-reviewed synchronization plus explicit clean/source-dirty/design-dirty/both-dirty states.

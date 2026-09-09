<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->

# Component and action registry

Generated from `standalone/js/registry.js`.

## Components (42)

| Type | Label | Category | Children | DOM tag | Hidden from palette | Declared fields |
|---|---|---|---:|---|---:|---|
| `page` | Page | Layout | yes | main | yes | `title`, `description`, `lang` |
| `section` | Section | Layout | yes | section | no | `ariaLabel` |
| `container` | Container | Layout | yes | div | no | — |
| `row` | Row | Layout | yes | div | no | — |
| `column` | Column | Layout | yes | div | no | — |
| `stack` | Stack | Layout | yes | div | no | — |
| `grid` | Grid | Layout | yes | div | no | — |
| `freeform` | Freeform Layer | Layout | yes | div | no | — |
| `group` | Group | Vector | yes | div | no | — |
| `mask` | Mask / Clip | Vector | yes | div | no | — |
| `shapeRect` | Rectangle | Vector | no | div | no | — |
| `shapeEllipse` | Ellipse | Vector | no | div | no | — |
| `svgPath` | Vector Path | Vector | no | div | no | `path` |
| `rawSvg` | Raw SVG | Vector | no | div | no | `markup` |
| `card` | Card | Layout | yes | article | no | — |
| `header` | Header | Semantic | yes | header | no | — |
| `footer` | Footer | Semantic | yes | footer | no | — |
| `nav` | Navigation | Semantic | yes | nav | no | `ariaLabel` |
| `form` | Form | Forms | yes | form | no | `method`, `action`, `noValidate` |
| `fieldset` | Fieldset | Forms | yes | fieldset | no | `legend` |
| `heading` | Heading | Content | no | h2 | no | `text`, `level` |
| `text` | Text | Content | no | p | no | `text` |
| `badge` | Badge | Content | no | span | no | `text` |
| `list` | List | Content | no | ul | no | `items`, `ordered` |
| `image` | Image | Media | no | img | no | `src`, `alt`, `loading` |
| `video` | Video | Media | no | video | no | `src`, `poster`, `controls`, `autoplay`, `muted`, `loop` |
| `icon` | Icon | Content | no | span | no | `text`, `ariaLabel` |
| `link` | Link | Controls | no | a | no | `text`, `href`, `target` |
| `button` | Button | Controls | no | button | no | `text`, `buttonType`, `disabled` |
| `label` | Label | Forms | no | label | no | `text`, `htmlFor` |
| `input` | Input | Forms | no | input | no | `inputType`, `name`, `placeholder`, `value`, `required`, `disabled`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `autocomplete` |
| `textarea` | Textarea | Forms | no | textarea | no | `name`, `placeholder`, `rows`, `required`, `disabled`, `minLength`, `maxLength` |
| `select` | Select | Forms | no | select | no | `name`, `options`, `required`, `disabled` |
| `checkbox` | Checkbox | Forms | no | input | no | `label`, `name`, `value`, `checked`, `required` |
| `radio` | Radio | Forms | no | input | no | `label`, `name`, `value`, `checked` |
| `divider` | Divider | Content | no | hr | no | — |
| `spacer` | Spacer | Layout | no | div | no | — |
| `slot` | Slot | Components | yes | slot | no | `name` |
| `componentInstance` | Component Instance | Components | yes | div | yes | — |
| `repeater` | Data Repeater | Data | yes | div | no | `source`, `itemAlias`, `filter`, `sort`, `limit`, `emptyText` |
| `externalComponent` | External Component | Advanced | yes | div | yes | `symbol`, `importPath`, `framework`, `client`, `propsJson` |
| `island` | Framework Island | Advanced | no | div | no | `symbol`, `importPath`, `client`, `framework`, `media`, `propsJson` |

## Action types (24)

| ID | Label | Target node | Value label |
|---|---|---:|---|
| `navigate` | Navigate | no | URL |
| `show` | Show target | yes | — |
| `hide` | Hide target | yes | — |
| `toggleClass` | Toggle class | yes | Class |
| `scrollTo` | Scroll to | yes | — |
| `setState` | Set state | no | variable=value |
| `toggleState` | Toggle boolean state | no | Variable |
| `setText` | Set target text | yes | Text / {{state.x}} |
| `emit` | Emit custom event | no | Event name |
| `invokeGlobalAction` | Invoke global action | no | context.action |
| `submit` | Submit nearest form | no | — |
| `openOverlay` | Open overlay / modal | yes | — |
| `toggleOverlay` | Toggle overlay / modal | yes | — |
| `closeOverlay` | Close overlay / modal | yes | — |
| `previous` | Previous screen / history | no | — |
| `openUrl` | Open external URL | no | URL |
| `setComponentState` | Set component state | yes | State name |
| `playAnimation` | Play animation | yes | — |
| `pauseAnimation` | Pause animation | yes | — |
| `stopAnimation` | Stop animation | yes | — |
| `reverseAnimation` | Reverse animation | yes | — |
| `seekAnimation` | Seek animation | yes | Progress 0-100 |
| `startTimeline` | Play animation (legacy) | yes | — |
| `stopTimeline` | Stop animation (legacy) | yes | — |

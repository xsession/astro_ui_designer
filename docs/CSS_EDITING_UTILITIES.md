# CSS Editing Utilities

**Version:** 2.10.0-color-pickers  
**Purpose:** structured, source-safe CSS editing for Astro UI Designer

## Why this workbench exists

The normal **Layout** inspector stays optimized for fast everyday geometry, Flex/Grid and typography edits. Compound CSS values become inefficient when exposed only as raw strings, so the **CSS Tools** workbench provides direct editors that still write ordinary CSS properties into the existing project model.

Nothing in this workbench requires an Astro UI Designer runtime after export. Generated pages use standard CSS selectors, custom properties and pseudo classes.

## Opening CSS Tools

Use any of these paths:

- Bottom workbench → **CSS Tools**
- Layout inspector → **CSS tools…**
- Public API → `AstroUIDesigner.openCssTools()`

The workbench edits the currently selected object. Base edits are breakpoint-aware; pseudo-state layers are global selector layers.

## Pseudo-state layers

Available layers:

- Base
- `:hover`
- `:focus`
- `:focus-visible`
- `:active`
- `:disabled`

Pseudo styles are stored independently from the normal breakpoint style map, so editing a hover background never overwrites the base background.

Example generated CSS:

```css
.ui-button123 {
  background-color: #2563eb;
}

.ui-button123:hover {
  background-color: #1d4ed8;
}

.ui-button123:focus-visible {
  outline: 2px solid #60a5fa;
}
```


## Universal color picker pairing

Every structured GUI field that represents a color or contains a color token now keeps two synchronized controls: an editable CSS text field and a native visual color swatch/picker. This applies to Layout appearance values, CSS Tools, design effects, design tokens, guide colors, animation color keyframes, reusable/code-component color props, Storybook-style Controls, and element-scoped CSS variables.

The text field remains the source of truth so values such as `var(--color-primary)`, `rgba(...)`, `hsl(...)`, `linear-gradient(...)`, `1px solid var(--color-border)` and shadow expressions remain legal. Choosing a swatch replaces only the color-bearing part of compound values. For a compound value stored entirely behind a CSS variable (for example `var(--shadow-sm)`), choosing a literal swatch resolves that token to its compound value and localizes it before replacing the color, avoiding accidental collapse to a bare color.

The picker swatch resolves project design tokens when possible. Alpha-capable raw values remain unchanged until a new opaque native picker value is selected.

## Box model

Margin and padding expose independent Top / Right / Bottom / Left fields. Values are serialized back to compact CSS shorthand when possible:

```text
8px 8px 8px 8px  -> 8px
8px 16px 8px 16px -> 8px 16px
```

Quick actions reset margin or padding to zero.

## Border and radius

Structured controls edit:

- border width
- border style
- border color
- top-left radius
- top-right radius
- bottom-right radius
- bottom-left radius

Quick presets include Pill and Square.

The utility prefers explicit `border-width`, `border-style` and `border-color` properties so later edits do not require reparsing an arbitrary border shorthand.

## Backgrounds and gradients

The editor supports:

- background color
- linear gradients
- radial gradients
- conic gradients
- angle
- two color stops
- gradient position

Example:

```css
background-image: linear-gradient(135deg, #3b82f6, #8b5cf6);
```

The generated value is still editable from the raw Layout inspector or source code.

## Shadows

Structured box-shadow controls:

- X offset
- Y offset
- blur
- spread
- color
- inset

Presets:

- Soft
- Raised
- None

## Filters

Structured controls generate standard CSS filter functions:

- blur
- brightness
- contrast
- saturation
- hue rotation
- grayscale

Example:

```css
filter: blur(2px) brightness(105%) saturate(120%);
```

## Typography utilities

The workbench exposes frequently co-edited text properties together:

- font family
- font size
- font weight
- line height
- letter spacing
- color

Quick toggles:

- Bold
- Italic
- Underline
- Uppercase

Direct Left / Center / Right / Justify buttons remain in the Layout inspector because those are high-frequency operations.

## Transform builder

Structured transform controls:

- translate X/Y
- rotate
- scale X/Y
- skew X
- transform origin

The builder emits one normal CSS `transform` string.

## Transition builder

Structured transition controls:

- property
- duration
- easing
- delay

Presets:

- Fast
- Smooth
- None

For complex multi-track motion use the separate Animation Workbench; CSS Tools is intended for ordinary component-state transitions.

## Behavior utilities

Quick structured controls cover:

- overflow X/Y
- cursor
- pointer events
- user select
- object fit

## Element-scoped CSS variables

Each node may own local CSS custom properties:

```css
.ui-card123 {
  --card-accent: #f97316;
}
```

These may then be referenced by any normal style value:

```css
border-color: var(--card-accent);
```

This is separate from project-level Design Tokens: use tokens for shared design-system values and local variables for component/element-specific customization.

## Public API

```js
AstroUIDesigner.setCssState(nodeId, 'hover', 'backgroundColor', '#111827');
AstroUIDesigner.setCssVariable(nodeId, 'card-accent', '#f97316');
AstroUIDesigner.openCssTools();
```

## Hermes MCP

`update_node` accepts the same semantic data:

```json
{
  "nodeId": "card123",
  "patch": {
    "cssStates": {
      "hover": { "backgroundColor": "#111827" }
    },
    "cssVariables": {
      "--card-accent": "#f97316"
    }
  }
}
```

The MCP surface remains project-scoped; this does not add arbitrary CSS-file or filesystem mutation tools.

## Export guarantees

CSS Tools must preserve these invariants:

1. Base CSS remains readable standard CSS.
2. Pseudo states emit native pseudo selectors.
3. Local variables emit native `--custom-properties`.
4. Breakpoint base styles continue to emit inside existing media queries.
5. Workbench UI state is not exported.
6. No proprietary client runtime is required for CSS-only features.

## Regression coverage

The dedicated suites verify:

- shorthand expansion/serialization
- gradient/shadow/filter/transform/transition generation
- pseudo-state storage isolation
- local CSS variables
- Astro CSS export
- real rendered workbench controls in Chromium
- visual shell geometry at 1600×900

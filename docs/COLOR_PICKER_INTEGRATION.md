# Universal color picker integration

**Version:** 2.10.0-color-pickers  
**Date:** 2026-08-31

## Goal

Astro UI Designer keeps CSS values source-friendly, but raw color codes alone are inefficient for visual design. Version 2.10 adds one shared paired control: an editable CSS text field remains the source of truth and a native visual swatch/picker sits beside it.

## GUI coverage

The paired picker is used in all structured editor surfaces that currently expose color-bearing values:

- Layout inspector appearance fields such as background, text color, border, outline and shadow.
- CSS Tools border color, background color, gradient stops, shadow color, typography color and color-valued local CSS variables.
- Penpot-style fills, strokes and shadows.
- Project design tokens when the token name/value is color-bearing.
- Responsive layout-guide color and persistent ruler/prototype guide colors.
- Animation keyframe values when the animated property is a color property or the keyframe already contains a color code.
- Reusable component props and imported/code-component props when the prop name/value is color-bearing.
- Storybook-style Component Lab controls inferred as color controls.

Raw source/code editors intentionally remain raw source editors rather than being rewritten into form controls.

## Supported value behavior

The swatch resolves common CSS forms including short/long hex, alpha hex, RGB/RGBA, HSL/HSLA, common named colors and exact `var(--token)` references. The editable field continues to accept any CSS value, including modern color functions not natively representable by `<input type="color">`.

Selecting a swatch is compound-safe:

```css
1px solid var(--color-border)
```

can become:

```css
1px solid #ff3300
```

without losing the border width or style. Likewise, a gradient replaces one color stop while preserving the angle and remaining stops, and a box shadow preserves its offsets/blur/spread.

When an entire compound value is stored behind a token, for example `var(--shadow-sm)`, choosing a literal swatch resolves and localizes the compound token first, then replaces its color. This avoids collapsing a shadow to a bare hex color.

## Alpha values

The raw text field preserves alpha-capable forms such as `#3b82f633` or `rgba(15,23,42,.18)`. The browser-native visual picker produces an opaque RGB hex value, so alpha is only removed if the user explicitly chooses a new swatch. This preserves existing projects without migration.

## Regression coverage

`tests/color-picker.test.mjs` verifies parsing, token resolution and compound replacement. `tests/color-picker-browser.test.mjs` exercises the real rendered GUI across Layout, CSS Tools, effects, tokens, guides, animation and Component Lab, and writes `tests/screenshots/18-color-pickers-1600x900.png`.

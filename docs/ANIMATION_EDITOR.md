# Animation Editor — CSS and JavaScript Motion Authoring

**Current build:** 2.3.0-ux (animation workbench introduced in 2.2.0-animation)

The Animation workbench is a Qt-style timeline editor for web motion. It edits the same visual node model used by the Astro exporter and can emit either native CSS animations or JavaScript using the Web Animations API (WAAPI).

## Core workflow

1. Select any visual node.
2. Open **Animation** in the bottom workbench.
3. Apply a preset or add property tracks.
4. Add, move, delete and edit keyframes on the timeline.
5. Scrub the playhead or use Play / Pause / Stop / Reverse.
6. Pick an export backend or leave **Auto** enabled.
7. Choose a trigger.
8. Inspect/copy the generated CSS or JavaScript before exporting the Astro project.

## Animation model

Each node stores:

- backend: `auto`, `css`, or `waapi`;
- trigger: manual/action, load, hover, focus, click, enter viewport, or scroll/view progress;
- duration and delay;
- global easing;
- iterations, including `infinite`;
- direction and fill mode;
- playback rate;
- reduced-motion policy;
- scroll/view timeline configuration;
- any number of property tracks;
- any number of keyframes per track;
- optional per-keyframe easing.

Keyframe offsets are normalized to `0..1` internally and displayed as percentages in the editor.

## Backend selection

### Auto

Auto chooses the backend that maps most naturally to the trigger:

| Trigger | Auto backend |
|---|---|
| Load | CSS |
| Hover | CSS |
| Focus | CSS |
| Scroll/view progress | CSS |
| Click | WAAPI |
| Enter viewport | WAAPI |
| Manual/action | WAAPI |

The user can override this decision.

### CSS backend

CSS output contains normal `@keyframes` plus trigger selectors. Scroll-driven animations use `animation-timeline` and `animation-range` rather than JavaScript scroll handlers.

For scroll-driven CSS, the exporter uses a non-zero `1ms` duration for interoperability while the scroll/view timeline drives actual progress.

### JavaScript / WAAPI backend

WAAPI output uses native `Element.animate()` keyframes and timing options. The generated Astro project contains:

- `src/scripts/ui-animation-definitions.ts` — readable animation definitions keyed by stable designer node IDs;
- `src/scripts/ui-runtime.ts` — generic event/playback wiring.

The runtime supports play, pause, stop, reverse and seek operations.

## Triggers

- **Manual / action** — starts only from the editor transport or an action.
- **On load** — begins when the rendered UI initializes.
- **Hover** — restarts on pointer entry.
- **Focus** — starts on keyboard/mouse focus.
- **Click** — starts on click.
- **Enter viewport** — uses `IntersectionObserver` in WAAPI mode.
- **Scroll / view progress** — prefers native CSS scroll-driven animations in Auto mode.

## Actions

The Actions inspector exposes:

- Play animation
- Pause animation
- Stop animation
- Reverse animation
- Seek animation (0–100%)

Legacy Start/Stop Timeline actions remain accepted for project compatibility.

## Scroll-driven animation

The editor exposes:

- view vs scroll progress timeline;
- source (`nearest`, `root`, `self`);
- axis (`block`, `inline`, `x`, `y`);
- animation range start/end.

This maps to modern CSS scroll-driven animation properties when CSS is selected.

## Reduced motion

Every animation has one of three policies:

- **Disable** — animation is removed when `prefers-reduced-motion: reduce` is active;
- **Shorten** — duration is limited and iterations are reduced;
- **Allow** — no automatic modification.

CSS output uses a `prefers-reduced-motion` media query. WAAPI output checks `matchMedia('(prefers-reduced-motion: reduce)')` before creating the animation.

## Staggering

When multiple objects are selected, **Stagger…** applies incremental delays across the selection. This is useful for lists, cards, menu items and hero sequences without creating a proprietary sequence object.

## Presets

Bundled presets include:

- Fade in
- Fade + rise
- Scale in
- Slide from right
- Pulse
- Spin

Presets are ordinary editable tracks after insertion.

## Generated CSS example

```css
@keyframes ui-animation-example {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0px); }
}

.ui-example:hover {
  animation-name: ui-animation-example;
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(.2,.8,.2,1);
  animation-fill-mode: both;
}

@media (prefers-reduced-motion: reduce) {
  .ui-example { animation: none !important; }
}
```

## Generated WAAPI concept

```js
const target = document.querySelector('[data-ui-id="example"]');
const animation = target?.animate(
  [
    { offset: 0, opacity: '0', transform: 'scale(.92)' },
    { offset: 1, opacity: '1', transform: 'scale(1)' }
  ],
  { duration: 420, easing: 'ease-out', fill: 'both' }
);
```

The generated project uses the shared definitions/runtime form rather than duplicating this code for every element.

## Web research behind the implementation

The animation architecture was cross-checked against current browser/Astro documentation:

- MDN — Web Animations API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- MDN — KeyframeEffect: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
- MDN — CSS scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- MDN — Scroll-driven animation timelines: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines
- MDN — animation-duration, including scroll-timeline behavior: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-duration
- Astro — View transitions: https://docs.astro.build/en/guides/view-transitions/

The resulting policy is: prefer CSS for declarative/scroll-driven motion; use WAAPI when runtime playback control, event-driven starts, seeking or sequencing is required.

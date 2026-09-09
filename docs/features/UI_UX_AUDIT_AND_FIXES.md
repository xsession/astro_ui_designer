# UI/UX Audit and Remediation Report

**Product:** Astro UI Designer Pro  
**Build:** `2.3.0-ux`  
**Audit date:** 2026-08-25  
**Tested viewports:** 1920×1080, 1600×900, 1366×768

## Executive conclusion

The editor had a capable engineering-style shell, but its information density was not yet well prioritized. The primary canvas lost too much space to permanent workbench chrome, several navigation destinations were hidden by horizontal tab overflow, and the most complex editor—the animation timeline—allowed lower controls to fall behind the status bar at compact resolutions.

The remediation keeps the dense Qt Creator-style character while changing the default hierarchy:

1. the canvas is primary;
2. routine navigation remains visible;
3. contextual tools appear only when they are valid;
4. large specialist workbenches open on demand;
5. every hidden panel has an explicit recovery/discovery path.

All identified critical and high-severity issues in the tested viewport range were fixed. The final build passes 18 automated suites and nine rendered visual checkpoints.

## Review method

The audit combined:

- manual inspection of desktop, compact, split-source, preview, freeform and animation states;
- rendered Chromium screenshots;
- DOM geometry measurements;
- keyboard and pointer interaction tests;
- overflow, collision and runtime-error assertions;
- before/after comparison at 1366×768 and 1600×900.

Baseline images are stored under `tests/screenshots/before/`. Corrected checkpoints are stored directly under `tests/screenshots/`.

## Findings and fixes

### Critical — dock collapse broke the workspace grid

**Observed behavior**

The original dock toggle applied `display:none` to a grid child without assigning stable grid columns. When the left dock was hidden, CSS Grid auto-placement moved the right inspector into the canvas column and reduced the actual canvas to zero width.

Measured failure at 1366×768:

```text
Before collapse:
  left dock   248 px
  canvas      768 px
  inspector   342 px

After collapse, before fix:
  canvas        0 px
  inspector  1020 px
```

**Fix**

Every workspace region now owns an explicit grid column:

```text
1 left dock
2 left splitter
3 canvas
4 right splitter
5 right dock
```

Collapsed tracks become zero-width without allowing the remaining regions to be auto-reordered.

**Regression coverage**

`ux-regression.test.mjs` verifies that hiding the left dock increases canvas width by more than 180 px and that restoring it returns the original layout.

---

### Critical — minimized bottom splitter caused status/workbench overlap

**Observed behavior**

When the horizontal splitter was removed from layout, the bottom dock and status bar were auto-placed into the same row. The tabs appeared, but the real bottom dock measured only 1 px and overlapped the status region.

**Fix**

All top-level shell regions now own explicit grid rows:

```text
1 menu
2 toolbar
3 workspace
4 bottom splitter
5 bottom workbench
6 status bar
```

The minimized workbench now measures a real 30 px, followed by an independent 23 px status bar.

**Regression coverage**

The visual suite asserts:

```text
bottomDock.bottom <= statusBar.top
statusBar.bottom <= viewport.bottom
```

---

### High — the bottom workbench permanently consumed the canvas

**Observed behavior**

At 1366×768, the previous always-open 170 px workbench used approximately 22.1% of the entire viewport even when it contained only an empty Problems message.

**Fix**

The workbench starts as a tabs-only 30 px strip. Clicking a tab opens it; clicking the active tab again collapses it. Animation opens with a purpose-specific 420 px working height. A dedicated chevron also expands/collapses the panel.

**Measured result**

```text
Before: 170 px / 768 px = 22.1%
After:   30 px / 768 px =  3.9%
Reclaimed default vertical space: 140 px
```

The corrected compact workspace occupies 656 of 768 vertical pixels before the tabs/status area.

---

### High — side and bottom tab destinations were hidden without discovery

**Observed behavior**

The left and right tab strips exceeded their visible width. Mouse-wheel horizontal scrolling existed only implicitly, and there was no clear way to discover off-screen destinations.

**Fix**

Each dock now has an explicit `…` destination menu listing every tab. Mouse-wheel motion over a tab strip also scrolls it horizontally, while activating a destination automatically brings its tab into view.

The design intentionally retains compact strips; it does not make every label permanently visible at the expense of the canvas.

---

### High — toolbar exposed invalid or low-priority actions

**Observed behavior**

Cut, copy, paste, delete, wrapping, movement and alignment tools were presented regardless of selection context. At compact widths this created visual noise and reduced space for high-value document/view controls.

**Fix**

The toolbar is grouped by purpose and updated contextually:

- undo/redo reflect history availability;
- edit tools disable when the root or Preview is active;
- layout tools appear only for a valid non-root design selection;
- alignment/distribution appear only for a compatible Freeform multi-selection;
- panel/focus controls have stateful active styling and tooltips.

The toolbar now has zero measured horizontal overflow at 1366×768.

---

### High — palette names were clipped and scanning was inefficient

**Observed behavior**

The two-column palette truncated labels including `Freeform Layer`, `Data Repeater` and `Framework Island`.

**Fix**

The palette now uses a one-column, Qt-like list with:

- full labels;
- category disclosure controls;
- category item counts;
- clearer hover/focus states;
- keyboard search with `/`;
- preserved drag and double-click insertion.

**Measured result**

```text
Clipped visible palette labels before: 3
Clipped visible palette labels after:  0
```

---

### High — the empty page did not teach the layout model

**Observed behavior**

A small `Drop components here` message provided no explanation of flow vs freeform authoring and no fast starting action.

**Fix**

The artboard now presents a first-use panel with:

- `Add Section`;
- `Add Container`;
- `Freeform / HMI`;
- concise drag/double-click instructions.

Nested empty containers use a smaller insertion affordance rather than repeating the large onboarding card.

---

### High — animation source controls could be hidden behind the status bar

**Observed behavior**

The refined timeline initially required 405 px of content in a 390 px content region. The generated CSS/JavaScript controls extended under the status bar. At 1366 px, a four-column settings layout made the problem worse.

**Fix**

- Generated source is collapsed by default and expands on demand.
- The animation editor exposes explicit `code-collapsed` / `code-expanded` states.
- The editor can vertically scroll when expanded.
- The compact timeline minimum was balanced against the detail/code rows.
- Five settings columns remain active on normal laptop widths because the workbench spans the full viewport.
- `Show code` and `Copy` remain fully visible at 1366×768.

The same visual editor still produces both CSS and WAAPI JavaScript; only disclosure and layout changed.

---

### Medium — side panels could not be temporarily escaped

**Fix**

Added stateful left/right panel toggles and a reversible Focus Canvas mode.

Keyboard access:

```text
Ctrl/Cmd+Shift+1   toggle left dock
Ctrl/Cmd+Shift+2   toggle right dock
Ctrl/Cmd+Shift+3   toggle bottom workbench
F11                focus canvas / restore workspace
/                  focus Palette search
```

Focus mode restores the exact prior dock state rather than forcing a default layout.

---

### Medium — property editing lacked hierarchy and field affordance

**Fix**

The inspector now uses:

- a sticky object header;
- stronger section separation;
- explicit input borders;
- larger field rows;
- clearer focus rings;
- better multi-selection indication;
- persistent saved/modified state in the status bar.

The changes preserve dense engineering ergonomics without making the inspector consumer-dashboard spacious.

## Final compact geometry

Measured at 1366×768 after remediation:

| Region | Size |
|---|---:|
| Menu + toolbar | 59 px high |
| Workspace | 1366 × 656 px |
| Left dock | 248 px wide |
| Canvas column | 768 px wide |
| Right inspector | 342 px wide |
| Minimized bottom workbench | 30 px high |
| Status bar | 23 px high |
| Toolbar overflow | 0 px |
| Clipped palette labels | 0 |

Focus mode expands the canvas column to the complete 1366 px viewport width.

## Final verification

`npm test` result:

```text
ALL TESTS PASSED (18 suites)
```

Coverage includes:

- 36 component types;
- 54 style/layout fields;
- 18 action types;
- 44 permanent shell controls;
- 8 menus;
- 5 left dock destinations;
- 7 inspector destinations;
- 13 bottom workbench destinations;
- 9 visual checkpoints.

The dedicated UX regression suite validates:

- minimized bottom-panel geometry;
- tab destination menus;
- unclipped palette labels;
- first-use quick actions;
- side-dock collapse/restore;
- reversible focus mode;
- bottom-tab open/re-click-collapse behavior;
- animation code progressive disclosure;
- animation/status non-overlap;
- keyboard palette search;
- document/toolbar overflow;
- uncaught runtime errors.

## Visual evidence

Before:

- `tests/screenshots/before/01-desktop-before.png`
- `tests/screenshots/before/02-compact-before.png`
- `tests/screenshots/before/03-animation-before.png`

After:

- `tests/screenshots/01-desktop-1920x1080.png`
- `tests/screenshots/02-compact-1366x768.png`
- `tests/screenshots/07-animation-editor-1600x900.png`
- `tests/screenshots/08-animation-compact-1366x768.png`
- `tests/screenshots/09-focus-mode-1366x768.png`

## Remaining intentional design constraints

- The application remains desktop-first and information-dense; it is not intended to become a phone-sized editor.
- At narrow desktop widths, some tab labels remain off-screen by design, but every destination is available through the explicit `…` menus.
- Keyboard shortcuts are currently fixed; a remapping UI is a future enhancement rather than a current usability blocker.
- Visual regression is performed at 100% browser scale; additional OS scaling checkpoints can be added later.

Side-by-side comparisons:

- `tests/screenshots/ux-review-desktop-before-after.png`
- `tests/screenshots/ux-review-compact-before-after.png`
- `tests/screenshots/ux-review-animation-before-after.png`

# Astro UI Designer 2.17.2 — test report

**Date:** 2026-09-08  
**Upstream reviewed:** `cef93ad7f5744e45c98876b0932ec4969691f78c` (`Restore manual drag, resize, and nudge geometry interaction (2.17.1)`)

## Automated regression

| Check | Result |
|---|---|
| Aggregate `npm test` | **26/26 suites PASS** |
| Manual canvas interaction regression | **PASS** |
| Round-trip script | **12/12 PASS** |
| Draw.io suites | **2/2 PASS** |
| Tooltip suites | **2/2 PASS** |
| Functional/hotkey/page/tab suites | **3/3 PASS** |
| Project-import suites | **2/2 PASS** |
| Component Lab integration | **PASS** |
| pwtk round-trip | **PASS** |
| Qt/QML round-trip + multiline preservation | **PASS** |
| Visual structural smoke | **PASS** |
| VS Code source smoke | **PASS** |
| Hermes MCP + skill | **2/2 PASS** |
| Astro example regeneration | **PASS** |
| VSIX 2.17.2 package generation | **PASS** |

## Direct-manipulation browser smoke

A real headless Chromium instance executed the complete standalone module graph and actual `app.js`/`styles.css`. Because this environment blocks direct browser navigation to loopback/file URLs, the exact local modules were mapped into browser `data:` module URLs and loaded with `page.set_content`; no interaction logic was replaced by a mock.

### Ordinary flow child move + resize

The browser selected the sample project's **Brand** heading whose immediate parent was `nav`, not a Freeform Layer.

Initial geometry:

- width: ~153.9 px
- height: ~20.7 px
- no explicit positioned geometry

Pointer-dragging the real **MOVE** overlay handle produced:

- `position: absolute`
- `left: 96px`
- `top: 48px`
- width: `154px`
- height: `21px`

Dragging the real south-east resize handle then produced:

- width: `216px`
- height: `56px`

No browser page/console errors were recorded.

### Ordinary flow child resize without relocating first

A second fresh browser run selected the same kind of ordinary `nav` child and dragged the east resize handle directly, before any move operation.

- initial width: ~153.9 px
- resulting width: `208px`
- node remained in normal flow (no `position` property was introduced)
- hit testing confirmed the pointer target was `.manual-handle.resize-handle.e`
- no browser page/console errors were recorded

This verifies both requested behaviors independently: a normal component can be resized in flow, and it can be manually relocated when the user chooses to drag it.

## Source consistency

- JavaScript/MJS files syntax-checked: **113 PASS**
- Runtime files included in relative-import audit: **81**
- Runtime relative imports checked: **161**
- Missing runtime relative imports: **0**
- `standalone/js/app.js` vs VS Code mirror: **byte-identical**
- `standalone/styles.css` vs VS Code mirror: **byte-identical**
- `functional-workbenches.js` standalone/VS Code mirror: **byte-identical**

## Live host smoke

A real `launch-designer.mjs --no-browser` process was started on `127.0.0.1:8766`:

- `/` returned HTTP 200
- `/api/workspace/info` returned `{available:true,...}`
- served `js/app.js` exposed `2.17.2-direct-manipulation`
- launcher banner identified `Astro UI Designer Pro 2.17.2 Direct Manipulation + Project Import + Qt/QML`

## Notes

The direct browser smoke is validation-environment-specific and is not part of `npm test`, so users do not need Playwright/Python to use or test the project. The repository regression test `tests/manual-canvas-interaction.test.mjs` covers the interaction integration contract and the pure resize/snap/constraint primitives without extra browser dependencies.

# pwtk round-trip review and hardening

## Review baseline

Newest upstream `main` reviewed on 2026-09-08:

- commit: `7863da396813093b592dba3c15cedc9dc65cdabf`
- subject: `Add pwtk blocks and GUI layout round-trip adapter (2.16.0)`
- upstream delta from the previous 2.16 functional-workbench commit: six paths, centered on `roundtrip-engine.js`, `roundtrip-neutral-ir.js`, their VS Code mirrors, and pwtk tests.

The upstream change introduced valuable support for pwtk/eel device GUI projects: backend detection, `layout.json` import/patching, a neutral representation, pwtk generation and a regression fixture. The review found several correctness and integration problems that could lose metadata, classify blocks incorrectly, generate misleading source, or make the backend unreachable from the normal workspace scan.

## Problems found and fixed

### 1. Block classification mismatch

The first implementation normalized `pwtk.Block` to `group`, while later code filtered `group` objects out of the block count. It then tried to classify an already-normalized kind again. This made `BundleBlock` recognition inconsistent and contradicted the upstream regression expectation.

**Fix:** class inheritance is normalized exactly once. `Block`, `BundleBlock`, GUI block classes and app classes are represented separately, and bundle nodes retain `pwtk.bundle` identity.

### 2. Class name vs displayed block name

`layout.json` addresses blocks as strings such as `Demo, Info`, while Python classes may be named `InfoGuiBlock` with `self.name = 'Info'`. Keying the source index only by class name loses the source class/event metadata when resolving the layout entry.

**Fix:** the importer indexes by class name, display name and group/display composite key.

### 3. Fragile Python class-body parsing

The previous line scanner could truncate the final line in a class and only retained one candidate Python block module.

**Fix:** class extents are determined from indentation without dropping the final statement, and all Python modules in the imported file set are scanned. `class X(App)` and `class X(pwtk.App)` are both accepted.

### 4. Lossy generation

The initial generator guessed an `import blocks`, guessed `${name}GuiBlock`, emitted only one GUI block, and reconstructed a reduced `layout.json`. That can destroy unrelated application settings and replace valid user Python with a synthetic scaffold.

**Fix:** imported Python/HTML source files are preserved by default. The complete original layout object is retained. If the semantic layout has not changed, the exact original `layout.json` text is emitted. A conservative scaffold is generated only when no source exists.

### 5. Unplaced classes were silently discarded

Python block classes that are not currently present in `block_containers` still represent useful project information.

**Fix:** unplaced block classes are retained in a neutral `pwtk.unplaced` bucket rather than disappearing.

### 6. Patch no-ops and metadata corruption

The first patcher could report a change when a timer/pin/container value was already equal to the requested value. Moving or renaming a block also needed to preserve `pinned_blocks` and `timer_vals` atomically.

**Fix:** timer, pin and container edits are no-op aware; move/rename operations preserve related timer and pin state. Key collisions are rejected instead of silently overwriting another block.

### 7. Group names containing commas

Splitting a layout key on every comma corrupts a key such as `Drive, Front, Status`.

**Fix:** the key is split on the last comma only, matching the group/name convention.

### 8. Workspace scanner made pwtk unreachable

The newest upstream `workspace-tools.mjs` only walked Astro/JS/TS/Vue/Svelte/JSON/MD/CSS extensions. `.py`, `.html`, `.c/.h/.cpp/.hpp`, `.scss/.sass/.less` were missing. As a result, normal workspace scans could not feed pwtk, LVGL or several vanilla/source-adapter inputs into the round-trip layer.

**Fix:** workspace discovery now includes those source families. Round-trip graph traversal also resolves local Python imports for pwtk, Tkinter and NiceGUI projects.

## Safety model

pwtk edits remain reviewed and source-aware. The designer does **not** attempt arbitrary Python control-flow or CANopen/communication rewrites. The direct pwtk patch surface is deliberately limited to anchored `layout.json` changes such as:

- refresh timer
- pin/mirror state
- container assignment
- block display name
- group name

The patch planner still carries the source fingerprint/staleness checks used by the common round-trip engine.

## Regression coverage

`tests/roundtrip-pwtk.test.mjs` covers:

- backend detection/registration
- pwtk app and block-class import
- BundleBlock identity
- source/display-name resolution
- multiple Python modules
- exact unchanged layout preservation
- timer edit and timer no-op
- pin no-op
- container move and no-op
- pin preservation when moving
- rename preservation of timer/pin state
- group names containing commas
- malformed layout normalization
- `pwtk.App` form detection

`tests/workspace-roundtrip-files.test.mjs` verifies the normal workspace scanner exposes Python, layout JSON, HTML, LVGL C/header and Sass sources.

## Remaining deliberate limitations

- No blind mutation of Python event/control-flow bodies.
- No semantic rewrite of `render_custom_html` templates.
- No attempt to infer device/CANopen business logic from GUI metadata.
- Complex pwtk descriptors remain source-owned unless a dedicated descriptor adapter is added.
- Generated pwtk scaffolds are fallback bootstraps, not substitutes for an imported application’s original source.

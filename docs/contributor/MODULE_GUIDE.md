# Module guide

## Change the semantic model
Edit `model.js` / focused lifecycle modules and add migration/validation tests.

## Add a visual component type
Edit `registry.js`; add rendering/property/export behavior only where needed. Prefer generic registry-driven behavior.

## Add a workbench
Use dock registration + functional workbench renderer; add tooltip, command/hotkey visibility and tab-functionality tests.

## Change manual editing
Coordinate `app.js`, `manual-layout.js` and `advanced-manual-edit.js`; verify zoom, nesting, breakpoint writes and flow/absolute transitions.

## Add source support
Prefer a round-trip adapter and neutral IR mapping rather than framework-specific branches in the canvas.

## Add host privileges
Expose a narrow workspace/VS Code bridge operation with path validation rather than calling privileged APIs from webview code.

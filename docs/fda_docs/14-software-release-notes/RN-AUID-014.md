# Software Release Notes

| Field | Value |
|-------|-------|
| **Document ID** | AUID-RN-014 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304 Clause 8.7 / 21 CFR 820.30(i) |

---

## Release: 2.18.0-advanced-simulation-mcp (2026-09-08)

### Features
- Advanced manual editing: Penpot-like multi-selection, bounding-box
  operations, group move/resize (advanced-manual-edit.js, 156 LOC).
- Deterministic page/project simulation with seeded RNG and reproducible
  state (simulation.js, 192 LOC) + simulation workbench UI.
- Semantic MCP tool server (integrations/hermes/mcp/server.mjs) for
  AI-agent project editing; MCP integration docs (docs/MCP.md).
- Project import flow: adapter auto-detection review, entry-file override,
  capability summary, live-vs-snapshot status (2.17.0, carried).
- Qt Quick/QML round-trip backend (2.17.0, carried): QML object graph,
  multiline preservation, workspace .qml graph traversal.
- 11 round-trip backends: astro, react, vue, svelte, vanilla-js,
  vanilla-ts, tkinter, nicegui, lvgl, pwtk, qml.
- Direct manipulation: drag/8-handle resize/rotate, smart snapping,
  geometry tooltip, keyboard nudge (Shift axis/aspect lock, Alt fine,
  Ctrl/Cmd snap bypass) for every unlocked non-root component (2.17.1-
  2.17.2, carried).
- 41 functional workbenches/dock tabs; editable hotkeys; Draw.io
  interchange.

### Fixes
- Restored canvas geometry interaction dropped in 2.15/2.16 rewrites
  (2.17.1): drag, edge resize, rotate, arrow-key nudge.
- QML multiline string preservation in round-trip.
- pwtk layout.json round-trip byte-identical (multi-part group keys,
  orphan timer_vals preservation).

### Known Issues
- None open at release.

### Verification Summary
29 test suites pass (`npm test`); VS Code mirror byte-identical; build
manifest + SHA-256 records current (PROJECT_BUILD_MANIFEST.md,
SHA256SUMS.txt). V&V summary: AUID-VVR-019.

### Build Manifest Reference
PROJECT_BUILD_MANIFEST.md; integrity: `sha256sum -c SHA256SUMS.txt`.

### Distribution
- Standalone: repository snapshot at release commit; `npm start`
  (node launch-designer.mjs, http://127.0.0.1:8766).
- VS Code extension: `npm run package:vscode` -> .vsix (byte-identical
  designer mirror).

## Prior Releases (summary)
| Version | Date | Summary |
|---------|------|---------|
| 2.17.2-direct-manipulation | 2026-09-08 | Direct manipulation extended to all unlocked non-root components; artboard-level resize overlay; modifier semantics |
| 2.17.1 | 2026-09-08 | Restored manual drag/resize/nudge geometry interaction |
| 2.17.0-project-import-qml | 2026-09-08 | Project import flow; Qt/QML round-trip backend |
| 2.16.0 | 2026-09 | Functional workbenches, project page lifecycle, hotkey system; pwtk blocks + GUI layout round-trip adapter |
| 2.15.x | 2026 | Workbench/relocation foundation (superseded by 2.16/2.17 rewrites) |

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

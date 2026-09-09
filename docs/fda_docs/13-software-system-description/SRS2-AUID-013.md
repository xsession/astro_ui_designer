# Software System Description (for 510(k) submission)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-SSD2-013 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | FDA 510(k) submission content; IEC 62304:2006+A1:2015 |

---

## 1. System-Level Description
Astro UI Designer Pro is a single-page web application (ES modules, no
build step) hosted by a loopback Node.js server (127.0.0.1:8766). It
provides a visual design environment (artboard + 41 dockable tool panels)
over an in-memory project model (schemaVersion 8), with lossless undo/redo
(80 JSON snapshots), autosave recovery checkpoints, and explicit JSON
save/load.

## 2. Functional System Diagram
See docs/c4/ (C1 system context, C2 containers, C3 components, C4 code) —
A1 diagrams in docs/c4/diagrams/.

## 3. External Interfaces
| Interface | Description | Security note |
|-----------|-------------|---------------|
| Browser to host (HTTP) | Static files + workspace file API (list/read/write project folders) | Loopback-only; project-root scoped; traversal rejected (REQ-SAFE-006) |
| MCP server (stdio) | Semantic tools: project read, selection, property edit, export, round-trip | Local process pair; no network |
| VS Code extension (webview) | Byte-identical shell inside VS Code | Mirror enforced byte-identical (REQ-INTF-002) |
| File system | Project folders opened by the user; export targets | No automatic writes outside opened/exported targets |

No network egress, no telemetry, no accounts, no PHI.

## 4. Data Flow
User edits -> state.project (mutate) -> renderer (artboard DOM) -> explicit
save (JSON) or workspace API write -> project folder. Round-trip flow:
source files -> detection -> neutral IR -> designer edits -> generation ->
anchored patch plan (review) -> applied source files. Import never executes
imported code (REQ-SAFE-004).

## 5. Safety-Reliant Behavior
The system relies on: (a) the 29-suite regression harness passing before
any release (artifact integrity); (b) anchored patch application (no
out-of-band source edits); (c) loopback-scoped file access; (d)
deterministic export. Failure of any of these is detected by release
gate tests (SVC-015..020, SVC-033).

## 6. Limitations
- Development workstation software; requires Chrome/Chromium and Node.js
  v22.x.
- GUI design tool: it does not validate the clinical correctness of a
  device GUI — that remains the consuming device's responsibility.
- Optional source-analysis parsers degrade gracefully when absent.

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

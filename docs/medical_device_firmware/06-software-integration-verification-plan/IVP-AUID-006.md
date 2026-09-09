# Software Integration & Verification Plan (IVP)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-IVP-006 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.5 (integration verification beyond Class A minimum) |
| **Safety Class** | Class A |

---

## 1. Introduction
Integration verification assembles software items (AUID-SAD-003 section 3)
and verifies interfaces between them. Integration test IDs: INT-<MODULE>-
<NNN>. Executed within the 29-suite regression harness.

## 2. Integration Order (bottom-up)
1. SI-002 model + SI-003 registry (foundation)
2. SI-004 manual-layout + SI-005 advanced-manual-edit (geometry)
3. SI-007 neutral IR + SI-006 round-trip engine + SI-008 support (pipeline)
4. SI-009 simulation + SI-010 I/O (dynamics and formats)
5. SI-011 UX subsystems (dock/tooltip/hotkey/workbench)
6. SI-001 application core (assembly point, public API, MCP bridge)

## 3. Interface Verification Cases
| ID | Interface | Case | Expected |
|----|-----------|------|----------|
| INT-RT-001 | detect -> import -> generate (full pipeline) | per-backend import of fixture project, unmodified generate | byte-identical files for all 11 backends |
| INT-RT-002 | neutral delta -> patch plan -> apply | edit a property in designer, build plan, apply | single anchored patch, source updated, rest untouched |
| INT-RT-003 | app-bridge -> engine | designer mutation via window.AstroUIDesigner | bridge marks dirty, triggers render, onProjectReplaced resets doc/selection correctly |
| INT-AP-001 | state -> renderer -> DOM | mutation via mutate() | artboard DOM matches design tree within one render |
| INT-AP-002 | pointer events -> manual-layout -> DOM | drag/resize synthetic events (CDP) | geometry updated live; snap lines rendered; committed on pointerup |
| INT-AP-003 | keyboard -> hotkeys -> commands | arrow keys, Delete, Ctrl+Z | nudge/delete/undo executed |
| INT-IO-001 | workspace API -> file system | project folder open, list, write, save | files written under project root only |
| INT-IO-002 | drawio-io -> model | import Draw.io XML, export back | structure preserved |
| INT-IO-003 | qml-io -> neutral IR -> generator | QML project round-trip | metadata preserved, multiline strings byte-identical |
| INT-UX-001 | dock-layout -> DOM | move/float/reset panels | layout persists and resets |
| INT-MCP-001 | MCP server -> public API | tool calls over stdio | project read/edit/export succeed; errors surfaced as tool errors |
| INT-VS-001 | standalone -> VS Code mirror | cmp loop over all standalone/js/*.js, styles.css, index.html | byte-identical |

## 4. Assembly Environment
Node.js v22.20.0; Chrome/Chromium current (CDP on 127.0.0.1:9222);
working directory = repository root; fixtures self-contained in tests/.

## 5. Exit Criteria
All INT cases pass; pipeline invariants (byte-identical unmodified
round-trip, no unanchored patches, loopback-only file API) hold.

## 6. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |

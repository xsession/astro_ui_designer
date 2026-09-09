# Hardware-Software Interface Specification (HSI)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-HSI-017 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304 Clause 8.2 (interfaces); supplementary to 21 CFR 820.30 |
| **Safety Class** | Class A |

---

## 1. Scope
The software is a desktop application with no direct hardware peripherals.
Its hardware interfaces are those of the developer workstation: display,
keyboard, pointer, file system, and local network stack (loopback only).
This document specifies the hardware-to-software contracts.

## 2. Display
| Item | Specification |
|------|---------------|
| Target | Any display supported by Chrome/Chromium current stable |
| Rendering | CSS/HTML on the artboard; zoom transform (state.zoom) for canvas scale |
| Minimum working resolution | 1280x800 (artboard base breakpoint 1280 px wide) |
| DPI awareness | Browser-standard; artboard geometry is in CSS px, pointer deltas corrected by 1/zoom (REQ-FUNC-003) |

## 3. Keyboard
| Item | Specification |
|------|---------------|
| Target | Standard PC keyboard |
| Contract | Keydown events dispatch via handleGlobalKeydown: arrows = nudge (Shift = resize mode, Alt = fine 1 px step), Delete/Backspace = remove selection, Escape = close popovers; hotkey system maps bindings to commands (REQ-FUNC-014) |
| Input safety | Keyboard shortcuts are suppressed while focus is in INPUT/TEXTAREA/SELECT (documented guard in handleGlobalKeydown) |

## 4. Pointer
| Item | Specification |
|------|---------------|
| Target | Mouse / touchpad |
| Contract | Pointer events (pointerdown/move/up) drive selection and direct manipulation; 3 px drag activation threshold; buttons===0 cancels in-flight gestures; handle hit-testing via data-handle attributes (REQ-FUNC-003/004) |

## 5. File System
| Item | Specification |
|------|---------------|
| Project folders | Opened by the user; accessed via workspace file API (loopback HTTP, project-root scoped, traversal rejected — REQ-SAFE-006) |
| Save/load | Project JSON (explicit save/load; autosave recovery checkpoints) |
| Export | User-selected target directory; deterministic output (REQ-SAFE-003) |
| OS support | Windows 10/11, macOS, Linux (REQ-NFR-001) |

## 6. Network Stack
| Item | Specification |
|------|---------------|
| Binding | 127.0.0.1 only (loopback); PORT environment variable overrides 8766 |
| Egress | None. No outbound network calls from any module (REQ-NFR-005) |
| MCP | stdio pipes between local processes (no sockets) |

## 7. Failure Behavior
| Hardware failure | Software behavior |
|------------------|-------------------|
| Display loss | No effect on project state; undo/recovery intact |
| Pointer/keyboard loss | Editing unavailable; state persisted via save/recovery |
| File system error on save | Save fails with visible error; in-memory state retained; user may retry or save elsewhere (REQ-NFR-002/003) |
| Loopback port conflict | Host startup fails visibly; no silent fallback port |

## 8. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

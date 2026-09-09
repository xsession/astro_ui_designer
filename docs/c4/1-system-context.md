# C1 — System Context

**System:** Astro UI Designer Pro (visual IDE for medical device GUI
design, 2.18.0-advanced-simulation-mcp).

## Actors
| Actor | Description | Relationship |
|-------|-------------|--------------|
| Device GUI Developer | Engineer designing/maintaining medical device GUIs | Primary user: designs, edits, simulates, exports device GUIs from a desktop browser |
| AI Agent (Hermes) | Coding agent with the MCP skill installed | Reads project state and performs edits through semantic MCP tools over stdio |
| Existing Device GUI Project | Source projects (Astro, React, Vue, Svelte, vanilla JS/TS, Tkinter, NiceGUI, LVGL, pwtk, Qt/QML) | Input: imported into the design model via the round-trip pipeline |
| Medical Device Project (consumer) | The device project that receives exported GUI artifacts | Output: deterministic, verified source export becomes part of the device's DMR/DHF |

## Context
The developer runs `node launch-designer.mjs` on a workstation; the IDE
serves itself at http://127.0.0.1:8766 (loopback). The developer opens an
existing device GUI project folder, edits it visually (or via AI agent),
and exports verified source back to the project folder. No cloud, no
network egress, no PHI — the tool operates entirely on the developer
workstation.

![C1 system context](diagrams/c1-system-context.png)

See also: AUID-SAD-003 (software architecture), AUID-SSD-012 (FDA SSD).

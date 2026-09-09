# C4 Documentation — Astro UI Designer Pro

C4 model for **Astro UI Designer Pro 2.18.0-advanced-simulation-mcp**, the
Astro-native Qt-style visual IDE for designing and exporting medical device
GUIs. Four levels of abstraction, each with a companion diagram (A1,
draw.io source + PNG render in `diagrams/`).

| Level | Document | Diagram | Question answered |
|-------|----------|---------|-------------------|
| C1 | [System Context](1-system-context.md) | `diagrams/c1-system-context.drawio` / `.png` | Who/what uses the system and why? |
| C2 | [Containers](2-containers.md) | `diagrams/c2-container.drawio` / `.png` | What are the major runtime components? |
| C3 | [Components](3-components.md) | `diagrams/c3-component.drawio` / `.png` | What are the key modules and their responsibilities? |
| C4 | [Code](4-code.md) | `diagrams/c4-code.drawio` / `.png` | How do the critical classes/functions fit together? |

Conventions:
- Every container/component is a plain ES module (no build step); the
  browser shell is the only rendering surface.
- "Round-trip" = import existing source -> neutral IR -> designer edits ->
  verified anchored source patches (byte-identical when unmodified).
- Diagrams are A1 landscape (841 x 594 mm). Regenerate PNGs with
  `"C:\Program Files\draw.io\draw.io.exe" -x -f png --scale 2 -o <n>.png <n>.drawio`.
  The deterministic overlap gate lives at `diagrams/check_drawio_overlaps.py`.

Related regulatory documentation: `docs/medical_device_firmware/`
(IEC 62304 DHF set; architecture cross-referenced as AUID-SAD-003).

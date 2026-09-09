# Qt Designer Workflow Parity Map

This project targets **workflow parity with the visual GUI-authoring role of Qt Designer / Qt Creator Design mode**, translated to responsive HTML/CSS/Astro semantics. It does not attempt to clone Qt source code, binary formats, C++ build/debug tooling, or the Qt runtime.

| Qt Designer / Creator concept | Astro UI Designer Pro equivalent | Status |
|---|---|---|
| Widget Box | Searchable component Palette | Implemented + browser-tested |
| Form Editor | Responsive central Artboard | Implemented + visually tested |
| Object Inspector | Object Tree bottom panel | Implemented + browser-tested |
| Property Editor | Properties inspector | Implemented + field-matrix tested |
| Geometry editor | Freeform Layer + drag/resize/nudge | Implemented + browser-tested |
| Layout toolbar | Row/Column/Stack/Grid/Flex + Wrap + Align/Distribute | Implemented + browser-tested |
| Horizontal/vertical spacers | Spacer widget | Implemented + widget-tested |
| Signals / Slots editor | Web Events + Actions + Bindings | Implemented + all action types tested |
| Buddy relationship | Label `for` / control DOM id | Implemented |
| Tab order | Common Tab index property | Implemented + exporter-tested |
| Z-order | Bring to Front / Send to Back | Implemented |
| Lock widgets | Lock property/context command | Implemented + browser-tested |
| Hide widgets | Hidden property/context command | Implemented + browser-tested |
| Preview form | Preview mode with interaction runtime | Implemented + visually tested |
| Resource browser | Asset manager | Implemented + file-input browser-tested |
| Custom widgets | Plugin-contributed components | Implemented + registry-tested |
| Widget properties | Schema-driven component properties | Implemented + every field tested |
| Stylesheet editing | Layout/style inspector + design tokens/themes | Implemented + 52 style fields tested |
| Multiple forms | Astro Pages + reusable component documents | Implemented |
| Reusable widgets | Astro component definitions/instances | Implemented + browser/export tests |
| Dynamic properties | Component props + state bindings | Implemented |
| Undo / Redo | Project snapshot command history | Implemented + browser-tested |
| Cut / Copy / Paste | Tree-subtree clipboard | Implemented + browser-tested |
| Raise / Lower | Sibling order and z-order operations | Implemented + browser-tested |
| Keyboard geometry | Arrow nudge, Alt 1 px, Shift resize | Implemented + browser-tested |
| Form/grid settings | Project grid + responsive breakpoints | Implemented + browser-tested |
| Menu/toolbar access | Dense IDE menu + command toolbar + command palette | Implemented + shell inventory tested |
| Custom form metadata | SEO, route, filename, accessibility metadata | Implemented |
| Code generation | Readable Astro/CSS/TS source tree | Implemented + exporter tests |
| Save/Open form | Versioned designer JSON project | Implemented + real file-input roundtrip test |
| Deployable output | Astro ZIP / folder export | Implemented + ZIP generation test |

## Web-native extensions beyond Qt Designer

- Responsive breakpoints and per-breakpoint styles.
- CSS Grid and Flexbox semantics.
- Design tokens and multiple themes.
- Astro pages/routes/layouts/components/slots.
- React/Vue/Svelte/Preact/Solid island metadata.
- Project state variables and declarative browser actions.
- SEO fields.
- Binary web asset export to `public/assets/`.
- Plugin validators and Astro output transforms.
- Headless model/export tests.

## Intentional boundary

"Parity" here means the visual GUI designer workflow. Qt Creator's C++ compiler toolchains, debuggers, profilers, QML runtime, CMake integration, device deployment, and Qt-specific `.ui` serialization are separate product domains and are not presented as implemented.

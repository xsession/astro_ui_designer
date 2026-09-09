# Astro UI Designer — advanced handbook

## 1. Product definition

Astro UI Designer is a source-owning visual development environment rather than a proprietary runtime platform. Its purpose is to provide the interaction density of a Qt/engineering IDE, the visual manipulation model of modern design tools, and controlled source synchronization suitable for real projects. The project model is editable and serializable, but the generated or imported source tree remains the deliverable.

The editor is optimized for five concurrent concerns: **visual composition**, **responsive layout**, **component/design-system modeling**, **source interoperability**, and **verification/simulation**. These concerns are exposed as relocatable workbenches instead of independent applications.

## 2. Host modes

### Standalone host

`node launch-designer.mjs` starts a local HTTP application and workspace API. The browser UI remains sandboxed from arbitrary filesystem access; the Node host implements explicitly scoped file, Git, preview and round-trip operations.

### VS Code extension

The extension embeds the same designer surface in a webview. Host-specific operations are bridged through VS Code rather than duplicated in the designer. The standalone and VS Code designer trees are expected to stay functionally mirrored.

## 3. Workspace mental model

The main shell has four regions:

1. **Left discovery area** — Palette, Project, Components, Assets, Sources.
2. **Center document surface** — page/component tabs and Design, Split, Code, Preview, Simulate and Component Lab modes.
3. **Right inspectors** — Properties, Layout, Actions, Bindings, Code, States/Variants, Data, Effects, Composition and Story.
4. **Bottom workbenches** — validation, object tree, manual layout, CSS, state, animation, tokens, libraries, connections, content, locales, tests, queries, Git, simulation, prototype, comments, inspect, interchange, round-trip, hotkeys and console.

Every major dock can move between left/right/bottom or float. This is not cosmetic: the workbench layout is part of the editor state so specialized engineering workflows can optimize screen real estate without hiding functionality.

## 4. Project model

A project contains pages, component definitions, assets, variables, design-system data, editor state, workspace metadata, simulation configuration and optional source mappings. Pages own rooted node trees. Components also own rooted node trees and can be instantiated in pages. Nodes are stable-ID entities with props, responsive styles, bindings, actions, design metadata, pseudo-state CSS and children.

Stable IDs are the common key across visual selection, source mappings, comments, prototype interactions, simulation events, tests and MCP inspection. Deleting a page therefore performs reference repair rather than only removing an array item.

## 5. Designing and direct manipulation

The recommended layout model is CSS-native and semantic. Row, Column, Grid, Stack and ordinary containers are preferred when the UI should adapt. Freeform is opt-in for HMI-style layouts, overlays and cases where explicit coordinates are the design intent.

Direct manipulation supports selection, multiselection, marquee selection, eight-handle resize, rotation, group transforms, alignment, distribution, tidy spacing, z-order, flips, lock state, rulers, guides and snapping. Moving a flow child detaches it only when a positional operation truly requires explicit positioning. Resizing a normal flow child can remain in flow.

Responsive edits are written to the active breakpoint layer rather than silently modifying base styles. This is a key invariant: visual manipulation should not erase responsive intent.

## 6. Components, variants and design systems

Reusable component definitions are source-of-truth design objects; instances carry compatible prop/variant overrides. The model also supports global variants, style mixins, design tokens, shared libraries, code-component contracts, slots, state overrides and composition metadata.

The practical workflow is:

- establish semantic tokens first;
- build primitive components and their variants;
- compose page-level sections from those components;
- use Component Lab stories to exercise states and viewport/theme/locale combinations;
- export ordinary source artifacts instead of depending on the designer at runtime.

## 7. Importing existing projects

**Import Existing Project** scans a selected folder or browser directory snapshot, identifies candidate adapters, lets the user review/override the detected backend and entry file, then creates a source-mapped designer project.

A live workspace keeps source files connected to the host API. A browser snapshot is intentionally read-only with respect to the original filesystem. In either case, the import process builds stable source identities so later visual-to-source changes can be reviewed rather than guessed.

## 8. Round-trip source editing

The round-trip system uses a framework-neutral engine plus backend adapters. The engine tracks source fingerprints, stable identities, dirty/conflict state, review plans, checkpoints and audit history. Adapters own framework-specific detection, inspection, import, generation and patch semantics.

The central rule is **controlled mutation**: a backend only patches syntax it can anchor and understand. Unsupported source structures remain opaque. The editor must prefer a visible limitation or a review requirement over a speculative rewrite.

Supported backend families currently include web frameworks, Python UI frameworks, embedded LVGL, Qt Quick/QML and pwtk device GUIs. See [Round-trip backend reference](reference/ROUNDTRIP_BACKENDS.generated.md).

## 9. Qt Quick/QML

The QML adapter recognizes object hierarchy, IDs, common Qt Quick Controls and Layouts, local component files and module metadata. It can update a controlled set of literal properties and preserve opaque handlers/bindings where it cannot safely rewrite them. New Qt/QML projects can be generated as `Main.qml`, `main.cpp` and `CMakeLists.txt`.

The adapter does not claim arbitrary JavaScript handler or C++ business-logic transformation. Those boundaries are deliberate.

## 10. Simulation

Simulation executes the designer's declarative interaction/state model, not arbitrary project code. A session has page, navigation history, overlays, state variables, viewport/fixture context and an event log. Page scope focuses on one screen; project scope allows route/prototype navigation between pages.

Simulation is deterministic enough to be driven from the UI, tests and MCP. It is intended to verify designer behavior before export, not to replace a real browser, Qt runtime, Python process or embedded target.

## 11. Component Lab and verification

Component Lab provides isolated stories, controls, viewport/background matrices, interaction steps, assertions, local accessibility checks and visual baselines. The project also contains validators, audits and a broad test suite covering model behavior, editors, round-trip adapters, docking, simulation, interchange and host integration.

For each feature, distinguish three levels of evidence:

- **model/unit evidence** — deterministic JavaScript logic;
- **integration evidence** — source/module/host boundaries;
- **rendered evidence** — browser-driven behavior and visual checkpoints where available.

## 12. MCP and agents

The Hermes integration exposes a project-scoped stdio MCP server with semantic tools for project summary, validation, page listing, node inspection, geometry mutation, arrangement, simulation and Astro export. It does not expose a generic shell or unrestricted filesystem.

Mutating tools operate on the designer project model and use contained paths. Simulation tools execute declarative designer actions only. Treat MCP as another editor client subject to the same invariants as the GUI, not as a privileged bypass.

## 13. Interchange

Draw.io, Penpot-cleanroom, Figma-style JSON, HTML, SVG and neutral JSON boundaries serve different purposes. Interchange is loss-aware: the importer should preserve raw/source metadata when exact semantic parity is not available and should never imply that every vendor-native feature becomes a fully editable native designer feature.

The documentation's master diagrams use diagrams.net XML deliberately so architecture material can be edited with the same interchange pipeline that the product supports.

## 14. Extension model

The plugin API can contribute components and actions plus data sources, importers, deployers, assistants, test adapters, source adapters, token adapters and backend adapters. A plugin must declare a unique ID and is activated with a constrained contribution context.

New capabilities should generally enter through a contribution boundary rather than adding provider-specific branching to the editor core.

## 15. Safety and integrity principles

1. Source writes require a stable mapping, reviewed patch or explicit generation operation.
2. File operations stay within the selected workspace/project root.
3. Simulation does not execute arbitrary imported code.
4. MCP does not expose unrestricted process or filesystem execution.
5. Page deletion repairs dependent references and refuses to delete the final page.
6. Imported unsupported syntax is preserved or marked partial instead of silently simplified.
7. Generated outputs are normal source files that can be reviewed without the designer.

## 16. Documentation map

For learning, use [tutorials](tutorials/README.md). For operational tasks, use [how-to guides](how-to/README.md). For exact APIs and schemas, use [reference](reference/README.md). For architecture and rationale, use [explanation](explanation/README.md), [arc42](architecture/README.md), [C4](c4/README.md) and the [ADR index](architecture/adr/README.md).

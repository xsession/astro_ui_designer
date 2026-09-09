# Documentation validation report

Date: 2026-09-09

## Baseline

- Latest upstream inspected: `xsession/astro_ui_designer` commit `b4e8f4649c6cb34a7dd348b27abce0c39f641e0f`, which reorganizes documentation into feature/C4/medical-device subtrees.
- Runtime working tree documented here: complete local `2.19.0-dense-clean-ui` package, which is a validated feature superset of the upstream 2.18 integration but is not claimed to be a byte-for-byte checkout of that GitHub commit.
- Uploaded Draw.io reference: parsed successfully; 2 diagrams.net pages, both 4681 × 3300, used as visual/structural inspiration for the new architecture diagram set.

## Documentation coverage

- Markdown documents: **113**
- Markdown words: approximately **24,800**
- Total files under `docs/`: **139**
- Source-generated reference documents: **9**
- Components documented from source: **42**
- Action types documented from source: **24**
- Core commands documented from source: **61**
- Relocatable panel commands: **42**
- Major dock/workbench panels: **42**
- Round-trip backends: **11**
- MCP tools: **11**
- Workspace client methods: **21**
- Standalone JS modules indexed: **33**
- Test modules indexed: **35**

## Documentation architecture

The new information architecture combines:

- Diátaxis: tutorials, how-to guides, reference and explanation;
- arc42: twelve architecture sections;
- C4: context, container, component and code views;
- MADR-style architectural decision records;
- contributor and operations manuals;
- source-generated registries/reference;
- traceability and quality models;
- research rationale and explicit source provenance.

## Diagrams

`docs/c4/diagrams/astro-ui-designer-master.drawio` contains **14 editable pages**:

1. Workbench Map
2. C4 C1 System Context
3. C4 C2 Containers
4. C4 C3 Components
5. C4 C4 Source Modules
6. Runtime Project Import
7. Runtime Visual-to-Source
8. Runtime Simulation
9. Runtime MCP
10. Project Data Model
11. Round-trip Adapter Architecture
12. Standalone Deployment
13. VS Code Deployment
14. Quality/Test Strategy

Seven high-value views also have Graphviz-generated SVG and PNG previews. The detailed Draw.io checker validates cell references and page bounds; result: **0 issues**.

## Automated documentation checks

`npm run test:docs`:

- generated reference regeneration: PASS
- Markdown files checked: 113
- relative documentation links checked: 128
- broken links: 0
- required generated-reference markers: PASS
- master Draw.io presence/basic XML recognition: PASS
- rendered diagram preview presence: PASS

Detailed `check-drawio.py`: PASS, 14/14 pages structurally valid, 0 dangling edge references, 0 page-bound violations.

## Product regression checks after documentation refactor

- `npm test`: **PASS — 30/30 suites**
- `npm run test:hermes`: PASS
- `npm run test:vscode`: PASS
- `npm run package:vscode`: PASS

No runtime source module was intentionally refactored as part of this documentation task. The only root executable metadata change is the addition of documentation generation/check scripts to `package.json`.

## Research sources applied

The documentation structure and maintenance model were informed by official/primary material from Diátaxis, arc42, MADR/ADR, Penpot, Storybook, Astro and the 2026-07-28 Model Context Protocol release/specification material. URLs and the rationale for each source are recorded in `docs/research/DOCUMENTATION_RESEARCH.md`.

## Remaining limitation

The latest upstream commit contains a 20-document `docs/medical_device_firmware/` controlled-document subtree. Because full Git transport was unavailable in the packaging environment, those upstream-controlled files were not silently reconstructed. Their exact upstream IDs are indexed in `docs/medical_device_firmware/README.md`; the full text should be synchronized byte-for-byte from GitHub when a normal clone/pull is available.

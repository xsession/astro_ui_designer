# Documentation research and design rationale

Research date: 2026-09-09.

## Selected patterns

### Diátaxis — organize around reader intent

Diátaxis identifies four different documentation needs: tutorials, how-to guides, reference and explanation. We use those as the user-facing information architecture because mixing learning steps, task recipes, exhaustive reference and conceptual rationale in one long page makes all four harder to use.

Sources:
- https://www.diataxis.fr/
- https://www.diataxis.fr/application/

### arc42 — structure architecture knowledge

arc42 provides twelve architecture sections covering goals, constraints, context, solution strategy, building blocks, runtime, deployment, cross-cutting concepts, decisions, quality, risks and glossary. Astro UI Designer uses this structure under `docs/architecture/` and complements it with C4 diagrams.

Sources:
- https://arc42.org/overview/
- https://arc42.org/documentation/
- https://docs.arc42.org/

### MADR/ADR — preserve decision context and tradeoffs

Important architectural choices use a Markdown ADR shape: context/problem, decision drivers, considered options, outcome, consequences and confirmation. This prevents architecture docs from becoming a list of unexplained current facts.

Sources:
- https://adr.github.io/madr/
- https://adr.github.io/madr/decisions/adr-template.html

### Penpot — design-system concepts need first-class documentation

Penpot's documentation treats assets, libraries, reusable components, variants and design tokens as a coherent design-system layer. That informed the separation between basic canvas tutorials and the design-system explanation/reference material here.

Sources:
- https://help.penpot.app/user-guide/design-systems/
- https://help.penpot.app/user-guide/design-systems/components/
- https://help.penpot.app/user-guide/design-systems/variants/
- https://help.penpot.app/user-guide/design-systems/design-tokens/

### Storybook — component docs should be living verification artifacts

Storybook's Autodocs and testing model reinforces two principles used here: component documentation should derive as much metadata as possible from the source model, and examples/stories should connect documentation to interaction, accessibility and visual verification.

Sources:
- https://storybook.js.org/docs/writing-docs/autodocs
- https://storybook.js.org/docs/writing-tests
- https://storybook.js.org/docs/writing-tests/accessibility-testing

### Astro — separate guides from exact reference

Astro's docs separate task-oriented guides from typed configuration reference. The generated reference pages in this project follow the same idea: source-derived tables should answer exact questions without long conceptual detours.

Source:
- https://docs.astro.build/en/reference/configuration-reference/

### MCP 2026-07-28 — document protocol and security posture explicitly

The current MCP revision emphasizes stateless request/response semantics, routeable/cacheable metadata and authorization hardening. Astro UI Designer currently uses a local stdio server, but its documentation explicitly states transport assumptions, root containment, mutation scope and non-goals so a future HTTP transport does not inherit ambiguous security expectations.

Source:
- https://blog.modelcontextprotocol.io/posts/2026-07-28/

## Documentation rules derived from the research

1. Every page has one primary reader intent.
2. Exact lists that can be generated from source are generated from source.
3. Architecture decisions record alternatives and consequences.
4. Diagrams accompany, not replace, textual architecture and runtime scenarios.
5. Capability claims distinguish implemented, partial/controlled, provider-boundary and unsupported behavior.
6. Security boundaries and non-goals are documented next to MCP/workspace operations.
7. Every user-visible specialist area has at least one tutorial/how-to or reference path.
8. Internal links are machine-checked.
9. Source baseline/provenance is explicit.

### C4 — use explicit abstraction levels and self-describing diagrams

The official C4 guidance defines the static zoom levels as system context, containers, components and code, with dynamic/deployment diagrams as supporting views. It also recommends titles, explicit element types, short responsibilities, labeled directional relationships and technology/protocol labels where applicable. The diagrams in this package therefore keep C1/C2/C3/C4 separate and add runtime/deployment pages instead of mixing every abstraction on one sheet.

Sources:
- https://c4model.com/
- https://c4model.com/diagrams
- https://c4model.com/diagrams/notation

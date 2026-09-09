# 2. Architecture constraints

- Browser code cannot assume unrestricted filesystem/process access.
- Standalone filesystem/Git/preview operations are mediated by the local Node host.
- VS Code operations are mediated by extension APIs and workspace trust.
- The project must work without a proprietary runtime in exported Astro output.
- Round-trip writes are constrained by adapter capability and source fingerprints.
- Simulation must not execute arbitrary imported application code.
- MCP is project-scoped and must not become a generic shell/filesystem API.
- Core runtime stays lightweight and dependency-minimal; optional parsers improve precision when installed.
- Standalone and VS Code designer behavior should remain mirrored.

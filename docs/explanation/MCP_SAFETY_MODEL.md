# MCP safety model

The MCP server is a semantic editor interface, not a general automation shell. Its trust boundary is the selected `ASTRO_UI_PROJECT_ROOT`. Project mutations are constrained to the designer project file and exports are contained under that root. Geometry inputs are validated as finite numbers. Simulation remains declarative and in-memory.

This design reduces ambient authority: an agent can ask for project summary, inspect nodes, arrange known objects, simulate interactions and export source without receiving arbitrary process execution. If future remote HTTP transport is added, authorization and current MCP transport requirements must be treated as a separate security design, not inherited from the local stdio assumptions.

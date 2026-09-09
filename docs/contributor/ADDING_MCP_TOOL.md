# Adding an MCP tool

A new tool needs a narrow semantic purpose, JSON Schema input, explicit validation, contained I/O and tests. Reuse model/arrangement/simulation modules instead of reimplementing semantics in the server. Mutations should use atomic project writes. Avoid generic path, shell or process execution. Add the tool to MCP tests and regenerate `MCP_TOOLS.generated.md`.

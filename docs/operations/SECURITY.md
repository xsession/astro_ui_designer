# Security model

## Assets and boundaries

- user project files and Git working tree;
- designer project model and recovery snapshots;
- local preview processes;
- MCP project mutations and exports;
- imported untrusted source text.

## Core controls

- path containment for host/MCP outputs;
- no arbitrary imported-code execution in simulation;
- reviewed/fingerprinted round-trip source patches;
- VS Code workspace trust for privileged operations;
- semantic MCP tool surface rather than generic shell;
- preservation of unsupported source instead of unsafe transformation.

## Future remote MCP/host warning

Local stdio/localhost assumptions are not a remote-security design. Any network-exposed transport requires explicit authentication, authorization, origin/CORS/CSRF review, rate limiting and current MCP authorization requirements.

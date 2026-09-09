# Documentation and product quality model

The quality model is intentionally scenario-based. A capability is not considered “documented” merely because a README names it.

## Documentation quality gates

1. **Findability:** the page is reachable from `docs/README.md` or `docs/SUMMARY.md`.
2. **Intent clarity:** the page is recognizably tutorial, how-to, reference, explanation, architecture or operations content.
3. **Grounding:** exact registries/APIs/backends/tools are generated or explicitly tied to source paths.
4. **Boundary clarity:** limitations and unsupported/provider-boundary behavior are stated near capability claims.
5. **Diagram portability:** master diagrams are editable Draw.io XML and important views have rendered previews.
6. **Link integrity:** relative links pass `npm run docs:check`.
7. **Change traceability:** architecture-impacting changes have an ADR; subsystem changes update the traceability row.
8. **Reproducibility:** a fresh extracted archive can regenerate/check docs without relying on the author's working directory.

## Product quality priorities

The architecture prioritizes source integrity, recoverability, responsive editing correctness, extensibility, deterministic verification, safe automation and understandable generated output. Performance matters primarily as interaction latency and large-project usability rather than benchmark throughput alone.

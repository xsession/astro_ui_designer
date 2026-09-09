# 10. Quality requirements

| Quality | Scenario | Evidence/response |
|---|---|---|
| Source integrity | Source changed after plan creation | Fingerprint mismatch prevents stale blind application. |
| Recoverability | User deletes a page referenced by flows/tests | Deterministic reference repair; final page cannot be deleted. |
| Responsiveness | User drags at non-100% zoom | Screen delta is transformed by zoom; DOM updates happen during gesture. |
| Extensibility | Add a new UI backend | Implement/register adapter instead of branching every editor subsystem. |
| Portability | Export project | Output is ordinary source, not a proprietary deployed runtime. |
| Safety | Agent manipulates project | MCP exposes constrained semantic tools and root-contained outputs. |
| Testability | Verify interactions without target runtime | Deterministic simulation and pure transform modules run in Node tests. |
| Usability | Expert needs many tools without losing canvas | Dense relocatable docks and progressive disclosure. |

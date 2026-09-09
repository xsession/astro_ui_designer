# 11. Risks and technical debt

- `app.js` and `functional-workbenches.js` are large orchestration files; further decomposition would improve ownership and test isolation.
- Browser/target-runtime parity is necessarily incomplete for QML, Python GUIs and embedded LVGL without those runtimes installed.
- Neutral IR can lose vendor-specific semantics if adapters fail to preserve opaque metadata.
- Draw.io connectors are preserved better than they are edited as first-class canvas wires.
- Local visual baselines are not a substitute for cross-browser/pixel infrastructure.
- Collaboration/CRDT and robust vector boolean geometry are explicit non-bundled areas.
- Documentation generated from regex/source parsing must fail loudly if source shapes change; it must not silently emit incomplete tables.

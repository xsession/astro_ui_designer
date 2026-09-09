# Why round-trip editing is controlled

Round-trip editing has an asymmetric risk: failure to update a visual property is visible, while an incorrect source rewrite can silently damage behavior. The engine therefore separates framework-neutral change intent from adapter-specific source mutation.

A source mapping includes path, backend, stable identity and fingerprint. A visual edit becomes a planned change. The backend decides whether the exact change is supported, partial or unsupported. The engine then handles review, staleness, checkpoints, dirty-state transitions and audit history.

This structure makes capability limitations explicit and allows a new backend to be conservative without weakening the rest of the editor.

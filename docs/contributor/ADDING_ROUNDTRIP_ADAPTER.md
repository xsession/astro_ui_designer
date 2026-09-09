# Adding a round-trip adapter

1. Define backend metadata: ID, family, extensions, supported/partial/unsupported capabilities and preview strategy.
2. Implement detection with evidence, not filename alone where possible.
3. Map source into neutral IR while preserving platform-specific metadata.
4. Produce stable source identities that can survive non-structural edits.
5. Implement only patch operations you can anchor safely.
6. Preserve opaque source when generation cannot represent it.
7. Add fixture tests for detection, import, no-op round-trip, patching, staleness and unsupported cases.
8. Register through the adapter SDK/built-ins/contribution boundary.
9. Regenerate backend reference docs.

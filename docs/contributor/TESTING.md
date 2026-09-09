# Testing

Use the smallest fast suite while developing, then the aggregate gate before packaging. Pure modules should have deterministic Node tests. DOM behavior should have browser tests when the environment supports it. Host/API behavior requires integration tests. Adapter tests must cover negative/unsupported cases, not only happy-path generation. Visual snapshots supplement structural assertions; they do not replace them.

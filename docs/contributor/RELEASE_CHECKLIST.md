# Release checklist

1. Recheck upstream head and record provenance.
2. Run `npm run docs:generate` and `npm run docs:check`.
3. Run `npm test` and relevant specialist suites.
4. Run VS Code smoke/package if extension files changed.
5. Generate example outputs when exporter/model behavior changed.
6. Verify standalone/VS Code designer parity where required.
7. Refresh validation/test reports.
8. Regenerate SHA256 manifest.
9. Extract the final archive into a clean directory and rerun docs checks + aggregate tests.
10. Never claim a GitHub push unless the remote write actually succeeded.

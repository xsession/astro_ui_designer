# Documentation maintenance policy

- Put learning exercises in Tutorials, recipes in How-to, exact data in Reference and conceptual rationale in Explanation.
- Architecture belongs in arc42/C4/ADRs, not scattered feature READMEs.
- If information can be generated from source, add it to `docs/scripts/generate-reference.mjs` instead of copying it manually.
- Update capability status honestly when behavior is partial or environment-dependent.
- Add links from `docs/SUMMARY.md` and run `npm run docs:check`.
- Keep diagrams editable in Draw.io and provide rendered SVG/PNG previews for readers without diagrams.net.
- Record source baseline/provenance whenever documentation is packaged from a tree that differs from upstream.

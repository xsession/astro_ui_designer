# Workflows

## Page creation

1. Read project summary and pages.
2. Inspect component registry and reusable components.
3. Create the page.
4. Build semantic layout hierarchy: Page → Section → Container → Row/Column/Grid → content.
5. Add responsive breakpoint styles.
6. Add actions/bindings/queries.
7. Validate and audit.
8. Inspect generated source.
9. Export Astro only after errors are resolved.

## UI review

1. Run validation.
2. Run all audits.
3. Group findings by page and node ID.
4. Inspect the exact nodes causing high-severity findings.
5. Fix the smallest root cause instead of applying broad style overrides.
6. Re-run validation/audits and report remaining intentional warnings.

## Component workflow

1. List reusable components.
2. Inspect props, slots and component root.
3. Check usage references before contract changes.
4. Ensure default plus important variant/state stories exist.
5. Check accessibility and responsive behavior.
6. Export only after stories and validator results are acceptable.

## Animation workflow

1. Inspect the node and existing timeline.
2. Prefer `engine:auto`.
3. Use CSS for declarative load/hover/focus/scroll behavior.
4. Use WAAPI for click/manual/in-view playback or runtime control.
5. Preserve reduced-motion behavior.
6. Audit accessibility after motion changes.

## Interchange workflow

Treat Astro as the native target. Penpot v3, Figma REST-style JSON, HTML, SVG, React, Vue, Svelte and neutral JSON are interoperability paths. Review generated artifacts because unsupported semantics may be flattened or omitted.

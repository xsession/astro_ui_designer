# Adding a component type

1. Add the registry specification with category, label, defaults and child-acceptance semantics.
2. Ensure `createNode` defaults remain valid.
3. Add renderer/DOM-property handling only if generic mapping is insufficient.
4. Add inspector controls for new props, not ad-hoc modal state.
5. Update Astro/platform export where the type has output semantics.
6. Add component registry and GUI-element tests.
7. Run `npm run docs:generate`; the component reference should pick up the new type automatically.

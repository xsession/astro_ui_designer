# Reference Notes

The interaction model is inspired by publicly observable workflows common to Qt Creator / Qt Designer and professional IDE/EDA tools: palette/widget box, design canvas, object navigator, property editor, actions/connections and dense docked panels.

The implementation is independent and web-specific.

Astro mapping follows public Astro concepts:

- `.astro` components render to HTML by default.
- reusable layouts are ordinary Astro components using slots.
- route files live under `src/pages`.
- reusable components commonly live under `src/components`.
- framework components can be hydrated with `client:*` directives.

No Qt or Kactus2 source code or UI assets are part of this project.

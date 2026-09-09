# Astro UI Designer documentation

**Documentation baseline:** local 2.19.0 dense-clean UI feature set, reconciled with the latest upstream documentation layout at commit `b4e8f4649c6cb34a7dd348b27abce0c39f641e0f` (2026-09-09).

Astro UI Designer is a dense, desktop-style visual IDE for designing production interfaces while keeping generated and imported source code as a first-class artifact. Astro is the primary generation target; round-trip adapters extend the same visual/source workflow to React, Vue, Svelte, Vanilla JS/TS, Tkinter, NiceGUI, LVGL, Qt Quick/QML and pwtk device GUIs.

This documentation is organized using **Diátaxis** for user needs and **arc42** for architecture. The feature shelf remains available for implementation-specific history and subsystem notes.

## Choose your path

| Need | Start here |
|---|---|
| I am new and want a working project | [Tutorial: first project](tutorials/01-first-project.md) |
| I need to import an existing UI project | [Tutorial: import an existing project](tutorials/02-import-existing-project.md) |
| I need a precise command/API/schema answer | [Reference](reference/README.md) |
| I need to understand why the system works this way | [Explanation](explanation/README.md) |
| I am modifying the application | [Contributor guide](contributor/README.md) |
| I need architectural detail | [arc42 architecture](architecture/README.md) and [C4 views](c4/README.md) |
| I am operating the standalone or VS Code host | [Operations](operations/README.md) |
| I need the complete product narrative | [Advanced handbook](ASTRO_UI_DESIGNER_HANDBOOK.md) |

## Documentation sets

- **Tutorials** are learning-oriented, end-to-end exercises.
- **How-to guides** solve a specific operational goal without teaching every concept.
- **Reference** is information-oriented and source-derived where possible.
- **Explanation** develops the mental model: source ownership, neutral IR, simulation, editing semantics and safety.
- **Architecture** documents quality goals, boundaries, runtime scenarios, deployment and decisions.
- **Feature notes** preserve detailed implementation history and specialist subsystem material.

## Authority and freshness

The source code is authoritative for executable behavior. Generated reference pages are derived from the checked-in source and can be regenerated with `npm run docs:generate`. Human-authored docs state the baseline they describe. `npm run docs:check` validates internal links, generated-reference markers and Draw.io XML integrity.

See [Documentation maintenance policy](contributor/DOCUMENTATION.md) for the rules that keep docs from drifting away from the implementation.

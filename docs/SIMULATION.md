# Page and project simulation

Astro UI Designer 2.18 includes a deterministic simulator for the designer's declarative UI model. It is intended to test navigation, state, bindings, overlays, and interactions before exporting or writing source patches.

## Starting simulation

Use the **Simulate** toolbar mode, F7, or the **Simulation** workbench. Two scopes are available:

- **Page** — stays on the selected page; cross-page navigation is reported as blocked.
- **Project** — allows navigation between project page entities and prototype flows.

A flow selector can start from a flow's configured start page. The viewport selector uses project breakpoints plus desktop/tablet/mobile defaults.

## Interpreted behavior

The simulator understands designer actions and prototype interactions including:

- navigate / previous
- open, toggle, and close overlay
- open URL recording
- set/toggle project state
- show / hide target
- toggle class
- set text
- component state changes
- emit events
- scroll/submit intent
- animation/timeline state intent
- global-action intent
- click, hover, input/change, focus/blur, submit, and delay triggers

Direct `state.foo` bindings are two-way for common form values. Visibility conditions and ordinary state bindings are evaluated by a restricted expression resolver; arbitrary JavaScript/Python/QML code is not evaluated.

Plain internal Link components also follow matching project routes when no explicit click action overrides them.

## Delay scheduling

Each delayed prototype interaction is scheduled independently by interaction ID. Navigating to another page cancels stale page timers and schedules the destination page's delays. Leaving Simulation mode cancels active timers; re-entering schedules the current page again.

## Runtime inspector

The Simulation pane shows:

- current page and route
- scope / flow / start page / viewport
- mutable runtime state values
- overlay stack and navigation history
- interaction hotspots
- event log
- recorded external URLs

Simulation state is ephemeral and does not alter the project unless the user explicitly edits the project in another workbench.

## Limitations

Simulation is a declarative model interpreter, not a browser/backend/native runtime. It does not execute arbitrary framework source, backend services, network requests, Qt C++, Python callbacks, or external JavaScript. Use it to validate modeled behavior; use the framework's real preview/build environment for full integration testing.

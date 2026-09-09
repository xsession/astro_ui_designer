# Project model reference

## Project

The project root contains schema/version identity, pages, reusable components, assets, variables, settings, editor/workspace metadata and optional design/composition/story/simulation subsystems. Migration functions normalize older structures before editing.

## Page entity

Important fields: `id`, `name`, `route`, `filename`, `seo`, `root`. Routes are normalized and duplicate routes/filenames are validation errors.

## Node

A node has a stable `id`, `type`, display `name`, `props`, `style`, `children`, `actions`, `bindings`, metadata and design/CSS-state information. Responsive styles use `style.base` plus breakpoint-specific style objects.

## Identity invariants

- Node IDs are unique within the effective project graph.
- Page IDs and component-definition IDs are stable document identities.
- Source mappings and prototype/test/comment references use IDs, not visual labels.
- Duplication remaps internal IDs.
- Deletion performs reference repair where a safe deterministic replacement exists.

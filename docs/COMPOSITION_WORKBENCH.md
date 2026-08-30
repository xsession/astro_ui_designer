# Composition Workbench

The Composition Workbench is Astro UI Designer's framework-neutral layer for code-component contracts, global visual configuration, app-local queries, reusable style patterns, templates and project-wide refactoring.

## Composition inspector

Select an object and open **Composition** in the right inspector.

### Code Component Contract

For discovered/imported code components you can refine:

- display name and description;
- typed props;
- slots;
- state/event metadata;
- provided data;
- global actions;
- styling scope.

Rich prop types include:

```text
string
number
boolean
enum
color
date
richText
object
list
slot
eventHandler
```

Instance controls are generated from these types.

### Style Mixins

Create a mixin from a selected node's current styles, then apply/remove it from any node. Mixins are references rather than copied style snapshots, so changing the mixin updates every use through the effective-style pipeline.

### Global Variants

A global variant group contains project-wide values such as:

```text
Brand
  default
  contrast

Density
  comfortable
  compact
```

Select a current value, then use **Style selected for current value** to capture the selected node's style override for that variant value.

### Global Contexts

Contexts model app-wide services/data and their actions. A context can expose actions such as:

```text
auth.signOut
cart.open
telemetry.track
```

Nodes may bind to contexts and Actions may invoke `context.action` references.

## Queries workbench

Open **Queries** in the bottom workbench.

Query kinds:

- collection;
- static;
- HTTP;
- GraphQL;
- expression.

The editor can preview deterministic/local query kinds directly. HTTP/GraphQL previews use mock data by default so the editor never needs to hold production secrets.

Astro export produces:

```text
src/data/ui-queries.ts
```

so query execution belongs to the generated application rather than a visual-builder proxy.

## Templates workbench

Open **Templates** and save the currently selected subtree as a reusable starting pattern. Inserting a template creates fresh node IDs, so the new section can diverge independently.

Use reusable **components** when instances should stay linked to one definition. Use **templates** when the desired behavior is copy-and-customize.

## Usages and refactoring

Open **Usages** to search references to:

- components;
- assets;
- mixins;
- design tokens;
- global variants;
- queries;
- contexts.

Click an occurrence to navigate to the owning page/component and node.

For components, **Replace component** changes matching instances globally while preserving compatible `propValues` by name. The operation is recorded in composition refactor history.

## Export artifacts

Astro generation adds:

```text
src/data/ui-queries.ts
src/composition/ui-composition.json
src/composition/ui-contexts.json
```

Visual output remains ordinary HTML/CSS/Astro. Active global variants are represented through normal `data-ui-global-*` attributes and CSS selectors.

## Security and ownership

- Network query secrets belong to application/server code, not the visual editor.
- Editor expression preview is restricted rather than arbitrary JavaScript execution.
- Code-owned/hybrid source policies remain authoritative.
- The Composition model is independent of Plasmic or any other external builder runtime.

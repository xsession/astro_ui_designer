# Plasmic clean-room research and implementation map

**Astro UI Designer target:** 2.6.0-plasmic-cleanroom  
**Research date:** 2026-08-30  
**Reference:** current public Plasmic repository, product pages, blog posts, documentation/community material.

## Clean-room boundary

Plasmic is used only as a public behavioral/product reference. This implementation does **not** copy Plasmic source code, internal data structures, proprietary project data, cloud services, assets, UI strings, or runtime/compiler implementation. Astro UI Designer keeps its own schema, component model, query representation, UI, exporter, and plugin interfaces.

Primary public references:

- https://github.com/plasmicapp/plasmic
- https://www.plasmic.app/blog/data-queries-evolved
- https://forum.plasmic.app/t/code-component-features-new-prop-types-state-and-style-sections/3924
- https://www.plasmic.app/

## Practical ideas selected for Astro UI Designer

The existing editor already covered many concepts that overlap Plasmic: reusable components, props, slots, component variants/states, content/client modes, data bindings, framework component discovery, Astro code generation, design tokens, responsive editing, Git/source workflows and visual testing. The clean-room pass therefore focused on the gaps that improve composition of a real application codebase.

| Publicly observable/reference capability | Clean-room Astro UI Designer implementation | Notes |
|---|---|---|
| Bring-your-own code components | Rich generic code-component contracts | Astro/React/Vue/Svelte discovery remains native; contracts add typed props, slots, states, events, provided data, global actions and style scope |
| Rich prop types | string, number, boolean, enum, color, date, richText, object, list, slot, eventHandler | Independent schema; not Plasmic registration metadata |
| Stateful/composable code components | states/events/provided-data/global-action metadata | Integrates with existing component-state/action system |
| Global variants | project-level variant groups + active values + node style overrides | Exported as normal CSS selectors / HTML data attributes |
| Reusable style abstractions | style mixins | Mixins merge into effective visual style and normal generated CSS |
| Global context/action concepts | generic contexts + actions + node bindings | Runtime-independent descriptor model; actions integrate with normal Action system |
| New app-local data queries | local/server query model + generated `src/data/ui-queries.ts` | Data runs in the generated application. Network queries are not proxied through Astro UI Designer |
| HTTP / GraphQL / custom data | collection/static/HTTP/GraphQL/expression query kinds | Editor uses mock data for network preview; credentials stay in the target application |
| Dynamic value binding | query/context bindings on nodes | Existing binding engine remains the core evaluator |
| Insertable reusable sections | templates | Save selected subtree, insert cloned instances with fresh IDs |
| Project-wide find usages | generic reference search | Components, assets, mixins, tokens, global variants, queries and contexts |
| Global component swap/refactor | replace component usages | Preserves compatible instance prop values instead of recreating every instance |
| Content-editor guardrails | existing Designer / Content / Client modes | Retained; no duplicate feature created |
| Source/codebase integration | existing source ownership + VS Code/workspace bridge | Composition metadata remains source-first and exporter-independent |

## Data-query architecture

Plasmic's July 2026 public announcement describes a move away from legacy server-proxied `$queries` to new queries that execute in the user's own application on server or client. That principle is especially appropriate for an Astro-native tool.

Astro UI Designer therefore generates a normal source module:

```text
src/data/ui-queries.ts
```

The project model stores descriptors only. The generated application owns execution and secrets. The visual editor does not become a mandatory request proxy.

Supported clean-room query kinds:

- Astro/content collection
- static/local values
- JSON-style data
- HTTP
- GraphQL
- restricted expression/function descriptor

Editor preview deliberately avoids arbitrary remote execution. HTTP/GraphQL queries use user-supplied mock/sample data unless a project runtime/provider performs the request.

## Rich code-component contracts

The visual component contract is framework-neutral:

```text
Component Contract
├── display name / description / section
├── typed props
├── named slots
├── state descriptors
├── event descriptors
├── provided data descriptors
├── global actions
├── style scope
└── child/content policy
```

This contract can describe an Astro component or a React/Vue/Svelte island without coupling the editor to Plasmic's registration calls.

## Global variants and mixins

Global variants are represented independently from responsive breakpoints and component-local variants. Example uses:

- brand A / brand B
- high contrast
- logged-in / guest presentation
- product edition
- experimental UI mode

Style mixins provide reusable style fragments and participate in the same effective-style pipeline as base styles, responsive overrides and component states.

Generated CSS remains ordinary CSS. No Plasmic runtime is required.

## Templates and refactoring

Templates solve a different problem from reusable components: they are **insertable starting structures** that become editable independent copies. They are appropriate for hero sections, settings pages, dashboard rows, forms and other project patterns.

The Usages workbench makes reusable abstractions safer by locating references before deletion/replacement. Component replacement preserves instance property values by name where possible.

## Features deliberately not cloned

The following were not implemented merely for parity:

- Plasmic cloud/backend APIs
- Plasmic proprietary project serialization
- exact Plasmic Studio UI
- Plasmic multiplayer/collaboration implementation
- Plasmic package registry / project marketplace
- Plasmic-specific deployment/CDN runtime
- legacy `$queries` server proxy
- legacy Plasmic App Auth, which Plasmic publicly says is being sunset with legacy queries on 2026-11-01
- exact Plasmic codegen/loader APIs

Existing Astro UI Designer plugin/provider boundaries remain the correct place for collaboration, hosted deployment, AI or external data-provider integrations.

## Resulting product direction

The practical composition stack is now:

```text
Existing codebase
      │
      ├── Astro / React / Vue / Svelte components
      │         ↓
      │   Rich component contracts
      │
      ├── Application queries / contexts
      │         ↓
      │   Visual data binding
      │
      └── Source ownership / Git / VS Code
                ↓
        Astro UI Designer
      ┌─────────┼──────────┐
      │         │          │
   Mixins   Global     Templates
            Variants
      │         │          │
      └─────────┼──────────┘
                ↓
         normal Astro source
```

This preserves the strongest idea behind codebase-integrated visual development without making the generated site depend on a builder service.

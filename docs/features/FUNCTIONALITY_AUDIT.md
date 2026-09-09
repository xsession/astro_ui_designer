# Astro UI Designer 2.16 — Functionality Audit

## Scope

This audit was performed against the current public `xsession/astro_ui_designer` `main` head reviewed on 2026-09-08:

- commit: `b4b0ded9a1ae9e014766a1180d2f238adb81e22a`
- subject: `Fix the menu functionality`

The upstream change from the immediately preceding public state was concentrated in menu/toolbar behavior, shell CSS, VS Code mirrors, workspace-tool formatting and editor settings. The dock renderer structure still contained many panels whose content was generic, diagnostic-only or much shallower than the name of the panel implied.

The 2.16 work deliberately keeps the panels instead of hiding them. Each built-in panel now has a concrete job and direct editing actions.

## Audit outcome

| Dock | Panel | Before 2.16 audit | 2.16 functionality |
|---|---|---|---|
| Left | Palette | useful | Search/filter 42-component registry and insert into current container |
| Left | Project | partial | Page CRUD, routes/files, page selection, reusable component navigation, settings |
| Left | Components | partial | Create, extract from selection, insert instance, rename and delete definitions |
| Left | Assets | partial | Import local files, register URL assets, copy asset refs, delete assets |
| Left | Sources | useful but shallow | Workspace open/rescan, indexed source list, source editor navigation |
| Right | Properties | useful | Typed props, identity, DOM/class/ARIA metadata, source ownership, lock/hide |
| Right | Layout | useful | Display/sizing, Flex/Grid, position, spacing and manual sizing modes |
| Right | Actions | placeholder/shallow | Event/action CRUD, target selection, value and condition editing |
| Right | Bindings | placeholder/shallow | Property binding editor with state/props expression suggestions and clear |
| Right | Code | useful | Node HTML/CSS inspection plus generated owner source and copy actions |
| Right | States | placeholder/shallow | Node states, container rules and reusable component variants |
| Right | Data | placeholder/shallow | Visibility condition, data source/context and alias configuration |
| Right | Effects | shallow | Constraints, blend, fills, strokes, shadows, blur, fixed/clip behavior |
| Right | Composition | shallow | Mixins, global variants, captured variant styles, query/context bindings |
| Right | Story | shallow | Story select/create/duplicate/delete, controls, interaction steps, Autodocs/CSF |
| Bottom | Problems | useful | Core validator + page-entity validation with navigation to findings |
| Bottom | Object Tree | useful | Full hierarchy tree and selection navigation |
| Bottom | Layout Tools | placeholder | Exact geometry, positioning, sizing, rotation, snapping, guides, tidy/infer layout |
| Bottom | CSS Tools | placeholder | Pseudo-state layer editing, declarations, padding, gradient/shadow/transition, variables, generated CSS |
| Bottom | State | placeholder | Project state-variable CRUD and binding usage counts |
| Bottom | Animation | shallow | Engine/trigger/timing, presets, tracks/keyframes and generated CSS/JS |
| Bottom | Design Tokens | placeholder | Token CRUD plus DTCG import/export |
| Bottom | Libraries | placeholder | Publish/apply/import/export/delete reusable design-library snapshots |
| Bottom | Connections | placeholder | Global action/connection table with selection navigation |
| Bottom | Content | placeholder | Content collection, schema-entry and data-source management |
| Bottom | Locales | placeholder | Locale CRUD/default locale and selected-node translation editing |
| Bottom | Tests | placeholder | Interaction-test CRUD, page target and ordered test steps |
| Bottom | Story Results | placeholder | Story results, pass marking, visual baselines, portable-story/manifest export |
| Bottom | Queries | placeholder | Query CRUD, preview, selected-node binding and generated query module |
| Bottom | Templates | placeholder | Save selection as reusable template, insert and delete templates |
| Bottom | Usages | placeholder | Find component/mixin/query/context/token usages and jump/replace references |
| Bottom | Audit | shallow | Accessibility, contrast, responsive, SEO and performance findings combined |
| Bottom | Git | placeholder | Status, per-file diff, stage all and commit through workspace API |
| Bottom | Prototype | placeholder | Flow CRUD, selected-node prototype interactions and guide editing |
| Bottom | Comments | placeholder | Review comments, replies, resolve/reopen, show resolved and node navigation |
| Bottom | Inspect | placeholder | Geometry, constraints, HTML/CSS handoff, copy and node JSON export |
| Bottom | Interchange | useful | Draw.io/diagrams.net and multi-platform import/export |
| Bottom | Integrations | useful but shallow | Installed plugins/providers, provider execution and result logging |
| Bottom | Round-trip | useful | Round-trip status and Studio launch |
| Bottom | Hotkeys | new | Search, capture/change, clear/reset, conflict detection and all panel commands |
| Bottom | Console | useful | Runtime log stream with clear/copy |

**Result:** all 41 built-in relocatable panels are explicitly routed to useful functionality. Unknown third-party/plugin panel IDs still receive a diagnostic fallback rather than silently pretending to be implemented.

## Cross-cutting fixes found during review

### 1. Page workbench helper binding

The initial implementation exposed `pageEditor` and `deletePageUi` as unbound helper functions. Calls from the document tabs and command registry therefore passed the page ID where the helper expected the workbench context. The exported workbench API now binds the context explicitly.

### 2. Checkbox property rendering

Registry checkbox fields were being treated as normal text inputs because the generic field control handled `boolean` but not the registry's `checkbox` kind. Both forms now render as checkbox controls.

### 3. Legacy/no-page project loading

Project load now normalizes a missing `pages` array before ensuring a fallback Home page. This prevents malformed/older JSON projects from failing before the page entity helper can repair them.

### 4. Command coverage

The command registry now exposes every built-in relocatable panel as a command (`panel.left.*`, `panel.right.*`, `panel.bottom.*`). This makes panel switching accessible from the command palette and from user-assigned hotkeys.

## Architecture

The functionality is split instead of growing `app.js` with one renderer per tab:

- `standalone/js/functional-workbenches.js` — built-in left/right/bottom panel implementations.
- `standalone/js/hotkeys.js` — pure shortcut normalization, event matching, conflict detection and override helpers.
- `standalone/js/project-pages.js` — pure page create/update/duplicate/delete/validation helpers.
- `standalone/js/app.js` — state orchestration, commands, menus, docking and public API.

The same runtime files are mirrored into `vscode-extension/designer/js/`.

## Non-goals

A panel being functional does not mean every future feature in its domain is complete. For example, Git intentionally delegates to the existing local workspace API rather than implementing a new Git engine; Story results are local result/baseline metadata rather than a cloud test service; and Draw.io connectors remain preserved interchange metadata rather than replacing the web-layout canvas with a graph editor.

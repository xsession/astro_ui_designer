# Plugin and Integration SDK

Plugins are loaded from `standalone/plugins/bootstrap.js` and register through `standalone/js/plugin-api.js`.

## Classic editor contributions

A plugin may contribute:

- palette component definitions;
- action types;
- validators;
- Astro export transforms.

The plugin should use declarative metadata and model APIs rather than manipulating private editor DOM structure.

## Research Edition provider contributions

Provider kinds:

```text
assistants
importers
deployers
dataSources
testAdapters
sourceAdapters
tokenAdapters
```

Register providers through `registerDesignerPlugin({...})` and retrieve them through `getDesignerContributions(kind)`.

A contribution may expose metadata and an optional `run(context)` function. The Integrations workbench renders registered contributions and can invoke runnable providers with the active project/node/selection context.

## Intended providers

### assistants

Examples:

- responsive layout advisor;
- accessibility repair assistant;
- optional remote AI component/layout generation.

The bundled research plugin provides an offline deterministic layout advisor. Remote AI must be an explicit provider with user-supplied configuration.

### importers

Examples:

- DTCG token import;
- Penpot/Figma design-document adapter;
- legacy project importer.

DTCG is the preferred standard token interchange. Full vendor-specific canvas import is not hard-coded into core.

### deployers

Examples:

- deployment preview provider;
- self-hosted build/upload adapter;
- cloud platform adapter.

Credentials belong to the provider, not the base editor.

### dataSources

Examples:

- REST;
- GraphQL;
- Astro Content Collections;
- Astro Live Collections;
- custom CMS/API adapters.

### testAdapters

Examples:

- built-in Chromium/CDP test runner;
- Playwright adapter;
- Storybook/Vitest integration.

### sourceAdapters

Examples:

- controlled `data-ui-id` source patcher;
- Astro compiler AST transformer;
- TypeScript language-service/source mapping adapter.

### tokenAdapters

Examples:

- DTCG import/export;
- organization design-system format;
- design-tool token bridge.

## Export transform

Plugins can transform the generated Astro file map before ZIP/folder export. Transforms should be deterministic and should not mutate editor state implicitly.

## Safety guidance

- Do not execute arbitrary source expressions in the editor.
- Do not write outside the selected workspace root.
- Do not silently rewrite code-owned source.
- Keep provider network credentials outside serialized projects unless a user explicitly chooses otherwise.
- Validators should report unsupported constructs rather than deleting them.

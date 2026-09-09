# Plugin SDK reference

`registerDesignerPlugin(plugin)` requires a unique `plugin.id`.

A plugin can contribute:

- `components` — new component registry entries;
- `actions` — action type descriptors;
- `dataSources`;
- `importers`;
- `deployers`;
- `assistants`;
- `testAdapters`;
- `sourceAdapters`;
- `tokenAdapters`;
- `backendAdapters`.

The `activate` callback receives `{components, actions, contributions, registerContribution}`. Duplicate component types or duplicate plugin IDs throw. Contribution access is available through `getDesignerContributions(kind)` and the public API.

A plugin should avoid direct DOM coupling when a contribution point exists. New provider integrations should be isolated behind one of the contribution kinds rather than adding credentials or vendor logic to core modules.

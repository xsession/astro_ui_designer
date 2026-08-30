# Component Lab

Component Lab is Astro UI Designer's isolated component development, documentation and test workspace. It is inspired by the useful workflow concepts of modern Storybook but is implemented independently on top of the editor's own component model.

## Open the Lab

Use **Lab** in the main toolbar, or select a component/story through the public API. When Lab opens, the normal component palette is temporarily hidden so the story browser and preview can use the available width. The right dock switches to **Story** and the bottom workbench switches to **Story Results**. Leaving Lab restores the exact prior dock/workbench state.

## Workspace anatomy

```text
Component Lab toolbar
├── component selector
├── New Story
├── Duplicate Story
├── Tests selector
├── Run tests
└── Watch

Story browser          Preview                    Addons
├── search             ├── viewport              ├── Controls
├── filter             ├── theme                 ├── Interactions
├── hierarchy          ├── locale                ├── A11y
├── tags               ├── background            ├── Visual
└── status             ├── layout                └── Docs
                       ├── direction
                       ├── grid/outline/measure
                       └── rendered component

Right inspector
└── Story metadata/policy

Bottom workbench
└── Story Results
```

At laptop widths, preview globals wrap into two rows rather than requiring horizontal scrolling.

## Stories

A story records a reproducible component state:

```json
{
  "name": "Primary",
  "title": "Components/Button",
  "tags": ["dev", "test", "autodocs"],
  "args": { "label": "Save", "disabled": false },
  "viewport": "desktop",
  "theme": "default",
  "locale": "en",
  "background": "light",
  "direction": "ltr",
  "state": "default",
  "parameters": {
    "layout": "centered",
    "a11y": { "mode": "error" }
  }
}
```

The story is data in the designer project; it is not coupled to a specific UI framework runtime.

## Controls

Controls are inferred from reusable-component props. Typical mapping:

| Prop | Control |
|---|---|
| `string` | text |
| `boolean` | checkbox |
| `number` | number |
| enum/options | select |
| color | color |
| date | date |
| object/array | structured/object editor |

Changing a Control modifies only the selected story's args, then rematerializes the preview.

## Globals

Component Lab exposes:

- viewport
- theme
- locale
- background
- layout: centered / padded / fullscreen
- direction: LTR / RTL
- grid overlay
- outline overlay
- measurement overlay

Use **Generate matrix...** to create story combinations for themes, viewports and locales.

## Interactions

Supported recorded steps:

- click
- type
- select
- toggle
- hover
- focus
- keyboard key
- wait

Targets use stable story-source IDs so component materialization does not invalidate the recorded test.

## Assertions

Supported assertions:

- visible
- hidden
- text contains
- value equals
- attribute equals
- count
- enabled
- disabled

When exporting a CSF bridge, supported steps and assertions become readable `userEvent` and `expect` code.

## Accessibility

Per story:

- `off` — skip local a11y checks
- `todo` — report problems as warnings
- `error` — fail the accessibility result

The built-in checks are deterministic and zero-dependency. They look for common structural issues such as missing image alternatives, missing accessible names, duplicate IDs and unlabeled form controls. Use the test-provider/plugin boundary when a project needs axe-core or a complete accessibility suite.

## Visual baseline

**Save baseline** captures the current preview at click time. The fingerprint includes relative DOM geometry and key computed styles. **Compare** then reports pass/fail against that saved baseline.

The geometry is relative to the preview root so moving the whole IDE window or resizing unrelated docks does not invalidate the component baseline.

## Test selector and Watch

The Tests menu can independently enable:

- Render
- Interaction
- Accessibility
- Visual
- Coverage

Coverage is deliberately skipped while Watch is enabled. Built-in coverage reports component-node/interaction reachability, not instrumented source line/branch coverage.

## Docs

The Docs addon can:

- preview/copy generated Markdown Autodocs
- export a CSF bridge
- export portable stories
- export the component manifest

Generated Astro project artifacts:

```text
component-lab/
├── portable-stories.json
├── component-manifest.json
├── test-results.json
└── docs/
    └── <component>.md

tests/
└── ui-designer.tests.json
```

## Public automation API

The browser automation/test API provides:

```js
AstroUIDesigner.createReusableComponent(name)
AstroUIDesigner.addComponentProp(componentId, prop)
AstroUIDesigner.createStory(componentId, name)
AstroUIDesigner.setStoryArg(componentId, storyId, name, value)
AstroUIDesigner.openStory(componentId, storyId)
AstroUIDesigner.storybookSummary()
```

This is used by the editor's own Chromium/CDP tests and can be used by future integration adapters.

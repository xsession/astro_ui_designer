# Page Entity Lifecycle

Astro UI Designer 2.16 makes project pages fully manageable from the visual project rather than treating every created page as permanent.

## Create

Pages can be created from:

- Project panel → **+ Page**
- Form/Project menus → **Create Page**
- default shortcut **Ctrl+Alt+N**
- public API `AstroUIDesigner.createPage(...)`

Names and routes are made unique automatically. The default source filename is derived from the route.

## Edit

The Project panel exposes page editing for:

- name
- route
- SEO title
- description

Changing a route regenerates the default filename unless an explicit filename is supplied by API.

## Duplicate

Duplication copies the full page subtree and:

- gives the page a unique name and route,
- regenerates every node ID,
- regenerates action IDs,
- remaps action targets that point inside the duplicated subtree.

## Delete

Delete is available from:

- Project panel row `×`
- page document-tab close `×`
- Form/Project menus → **Delete Active Page**
- default shortcut **Ctrl+Shift+Delete**
- public API `AstroUIDesigner.deletePage(pageId)`

The UI asks for confirmation. The final remaining page cannot be deleted.

Deletion removes the **designer page entity only**. It does not silently delete an Astro source file from an opened workspace.

## Reference repair

When a page is removed, page-scoped references are repaired to the nearest remaining page:

- `project.design.flows[].startPageId`
- `project.recordedTests[].pageId`
- `project.componentTests[].pageId`

The removed page is also deleted from `project.editor.documentTabOrder`.

## Public API

```js
const page = AstroUIDesigner.createPage({
  name: 'Settings',
  route: '/settings',
});

const copy = AstroUIDesigner.duplicatePage(page.id);
const result = AstroUIDesigner.deletePage(copy.id);
```

`deletePage` returns an object containing `ok`, `reason`, `removed` and `nextPageId`.

## Additional deletion repair

The deletion pass also gathers every node ID in the removed page and cleans dangling cross-page metadata:

- prototype interaction destinations that pointed at the removed page are moved to the replacement page and marked for review,
- action targets pointing at removed nodes are cleared and marked for review,
- recorded/component test step/assertion targets pointing at removed nodes are cleared and marked for review,
- comments attached to removed nodes are removed.

The return value includes a `repairs` counter object so integrations can report exactly what was changed.

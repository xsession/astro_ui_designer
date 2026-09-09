# How to manage pages safely

Use the Project panel or page commands to create, edit, duplicate and delete page entities. Page routes are normalized and made unique. Duplication remaps node/action IDs inside the cloned subtree. Deletion refuses to remove the final page and repairs prototype-flow starts, recorded/component tests, interaction destinations, node action targets, review comments and document-tab order. The operation returns repair counters through the public API.

Deleting a designer page does **not** imply deleting an arbitrary original workspace source file; filesystem deletion must be an explicit host operation.

# Tutorial: import an existing UI project

## Goal

Bring an existing supported project into the designer, inspect adapter detection and make a reviewed source change.

## Steps

1. Choose **Import Project** in the toolbar or **File → Import Existing Project…** (`Ctrl+Shift+I`).
2. Select the project directory. In the standalone/VS Code host this is a live workspace; in a plain browser the fallback is a source snapshot.
3. Review the detection dialog. Confirm the adapter, detected entry file, source-file count and supported capability list. Override the adapter only if detection is wrong.
4. Import the project and open Round-trip Studio.
5. Inspect a mapped source node. Confirm its backend, relative path, stable source identity and baseline fingerprint.
6. Make a simple visual change that the backend explicitly supports, such as text, pixel geometry or a literal color.
7. Review the visual→source plan before applying it. If the source fingerprint changed externally, reconcile/reload instead of forcing the patch.
8. Apply the patch and inspect the source file in Code/Sources.
9. Create a checkpoint before larger edits. Use history/rollback if the result is not acceptable.

## Important distinction

A live workspace can write reviewed patches to the original folder. A browser directory snapshot cannot write back to the original filesystem. It is still useful for visual analysis and cross-framework export.

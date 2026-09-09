# Source and documentation baseline

## Latest upstream inspected

Repository: `xsession/astro_ui_designer`

Commit: `b4e8f4649c6cb34a7dd348b27abce0c39f641e0f`

Commit intent: reorganize documentation into `docs/features`, `docs/c4` and `docs/medical_device_firmware` subtrees. The upstream `VERSION` file at that commit still reports `2.18.0-advanced-simulation-mcp`.

## Working documentation baseline

This documentation package is applied to the complete locally validated `2.19.0-dense-clean-ui` source package produced after the 2.18 feature integration. Therefore:

- runtime feature documentation includes the 2.19 dense-clean UI refinements;
- documentation organization follows the newer upstream 2.18.1 subtree layout;
- source-grounded generated references are derived from the actual packaged 2.19 source tree;
- upstream-only regulatory documents are not silently reconstructed from memory. Their published subtree is indexed under `docs/medical_device_firmware/README.md` and should be synchronized byte-for-byte from upstream when a full Git transport is available.

This distinction is intentional so provenance is visible rather than pretending that a locally reconstructed package is a byte-identical clone of GitHub.

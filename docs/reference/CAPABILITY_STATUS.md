# Capability status vocabulary

Use these terms consistently in documentation and UI:

| Term | Meaning |
|---|---|
| Implemented | The repository contains a usable built-in path and tests or direct evidence for it. |
| Controlled | Implemented only for explicitly recognized source/model operations; arbitrary rewriting is intentionally rejected. |
| Partial | A meaningful subset works, but important constructs remain opaque or require review. |
| Adapter/provider boundary | The core contract exists; an external provider/runtime is not bundled. |
| Foundation | Data model or integration seam exists but end-user parity is incomplete. |
| Not bundled | Deliberately outside the current product/package. |
| Not executed | Implementation exists but the stated environment did not run the external dependency/tool. |

Do not upgrade a capability claim merely because a type or placeholder exists in the schema.

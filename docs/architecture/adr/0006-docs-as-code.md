# Use docs-as-code plus generated reference

Status: **Accepted**

## Context and problem statement

How can broad documentation stay current?

## Decision drivers

- preserve source integrity and user ownership
- keep behavior testable and understandable
- minimize hidden coupling

## Considered options

- Manual prose-only documentation
- Docs-as-code with source-generated reference and link checks

## Decision outcome

Chosen option: **Docs-as-code with source-generated reference and link checks**, because Architecture rationale needs prose, but exact registries/backends/tools/scripts are safer when generated from the same source that implements them.

## Consequences

- Good: the chosen invariant can be tested and documented explicitly.
- Good: new integrations have a predictable boundary.
- Bad: some operations remain intentionally unsupported instead of being magically inferred.

## Confirmation

Regression tests, generated reference checks and architecture review should fail or require an ADR update when this invariant changes.

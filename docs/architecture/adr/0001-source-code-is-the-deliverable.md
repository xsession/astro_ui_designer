# Source code remains the deliverable

Status: **Accepted**

## Context and problem statement

How should projects depend on the designer after export?

## Decision drivers

- preserve source integrity and user ownership
- keep behavior testable and understandable
- minimize hidden coupling

## Considered options

- Deploy a proprietary designer runtime
- Generate ordinary source and metadata

## Decision outcome

Chosen option: **Generate ordinary source and metadata**, because Users retain ownership, reviewability and framework-native deployment; the editor cannot hide runtime behavior in a proprietary service.

## Consequences

- Good: the chosen invariant can be tested and documented explicitly.
- Good: new integrations have a predictable boundary.
- Bad: some operations remain intentionally unsupported instead of being magically inferred.

## Confirmation

Regression tests, generated reference checks and architecture review should fail or require an ADR update when this invariant changes.

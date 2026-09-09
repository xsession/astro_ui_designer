# Use a neutral IR for multi-platform conversion

Status: **Accepted**

## Context and problem statement

How should many import/export platforms interoperate?

## Decision drivers

- preserve source integrity and user ownership
- keep behavior testable and understandable
- minimize hidden coupling

## Considered options

- Pairwise converters
- One neutral semantic representation plus platform metadata

## Decision outcome

Chosen option: **One neutral semantic representation plus platform metadata**, because It reduces pairwise integration edges and centralizes loss semantics while allowing platform-specific metadata to survive.

## Consequences

- Good: the chosen invariant can be tested and documented explicitly.
- Good: new integrations have a predictable boundary.
- Bad: some operations remain intentionally unsupported instead of being magically inferred.

## Confirmation

Regression tests, generated reference checks and architecture review should fail or require an ADR update when this invariant changes.

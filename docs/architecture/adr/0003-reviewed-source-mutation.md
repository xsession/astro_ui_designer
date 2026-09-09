# Require reviewed, fingerprinted source mutation

Status: **Accepted**

## Context and problem statement

How should visual edits update hand-authored source safely?

## Decision drivers

- preserve source integrity and user ownership
- keep behavior testable and understandable
- minimize hidden coupling

## Considered options

- Blind text/AST rewrite
- Generate files only
- Backend-scoped patch plans with source fingerprints

## Decision outcome

Chosen option: **Backend-scoped patch plans with source fingerprints**, because It allows useful write-back while rejecting stale or unsupported edits instead of guessing.

## Consequences

- Good: the chosen invariant can be tested and documented explicitly.
- Good: new integrations have a predictable boundary.
- Bad: some operations remain intentionally unsupported instead of being magically inferred.

## Confirmation

Regression tests, generated reference checks and architecture review should fail or require an ADR update when this invariant changes.

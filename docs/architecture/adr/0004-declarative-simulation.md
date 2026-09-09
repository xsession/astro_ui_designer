# Keep simulation declarative

Status: **Accepted**

## Context and problem statement

Should preview simulation execute imported framework code?

## Decision drivers

- preserve source integrity and user ownership
- keep behavior testable and understandable
- minimize hidden coupling

## Considered options

- Execute arbitrary target code in the designer
- Interpret only the designer action/condition model

## Decision outcome

Chosen option: **Interpret only the designer action/condition model**, because Determinism and safety are more valuable for design verification; full runtime behavior remains a target-runtime responsibility.

## Consequences

- Good: the chosen invariant can be tested and documented explicitly.
- Good: new integrations have a predictable boundary.
- Bad: some operations remain intentionally unsupported instead of being magically inferred.

## Confirmation

Regression tests, generated reference checks and architecture review should fail or require an ADR update when this invariant changes.

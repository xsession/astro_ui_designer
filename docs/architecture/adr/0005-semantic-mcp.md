# Expose semantic MCP tools, not generic shell authority

Status: **Accepted**

## Context and problem statement

What authority should an agent receive?

## Decision drivers

- preserve source integrity and user ownership
- keep behavior testable and understandable
- minimize hidden coupling

## Considered options

- Generic shell/filesystem tools
- Constrained project/model tools

## Decision outcome

Chosen option: **Constrained project/model tools**, because Semantic operations can be validated, contained and audited without granting ambient OS authority.

## Consequences

- Good: the chosen invariant can be tested and documented explicitly.
- Good: new integrations have a predictable boundary.
- Bad: some operations remain intentionally unsupported instead of being magically inferred.

## Confirmation

Regression tests, generated reference checks and architecture review should fail or require an ADR update when this invariant changes.

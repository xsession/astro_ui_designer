# How to perform safe round-trip synchronization

- Start from a clean baseline fingerprint.
- Inspect source and source identity before planning a change.
- Restrict visual changes to adapter-supported operations when write-back is expected.
- Review the generated patch plan and its confidence/staleness information.
- If both source and design are dirty, reconcile instead of applying blindly.
- Create a checkpoint before a batch of edits.
- After external edits, rescan/reload before applying an older plan.
- Use rollback/history for rejected changes.

Never treat a backend's `partial` capability as a promise of arbitrary AST rewriting.

# Software Problem-Resolution Process

| Field | Value |
|-------|-------|
| **Document ID** | AUID-PR-009 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.8 |
| **Safety Class** | Class A |

---

## 1. Scope
Process for identifying, recording, classifying, diagnosing, fixing, and
verifying software problems (defects) discovered during development,
verification, or post-implementation.

## 2. Workflow
1. **Identification & recording** — any defect is recorded in the issue
   tracker with: repro steps, expected/actual, severity (S1 crash/data loss,
   S2 function loss, S3 minor, S4 cosmetic), affected software item
   (SI-001..SI-011), and requirement IDs (AUID-SRS-002) where known.
2. **Classification** — a defect that can corrupt exported/round-tripped
   source (REQ-SAFE-001/002 violations) or silently modify source without an
   anchored patch is classified S1-equivalent (artifact-integrity class),
   regardless of UI severity, because its impact propagates to medical
   device GUI source (HAZ-001, AUID-RMF-010).
3. **Diagnosis & fix** — root-cause analysis; fix on a feature branch with a
   failing regression test added first (defect-becomes-test).
4. **Verification** — full 29-suite harness (`npm test`) plus the new
   regression test; mirror re-sync + cmp for any standalone/ change.
5. **Disposition** — issue closed with traceability to the regression test
   and the release that carries the fix (AUID-RN-014). Known-issue entries
   remain in the release notes until resolved.
6. **Post-implementation reports** — user/agent reports enter the same
   tracker and are trended per AUID-PMSP-015.

## 3. Tooling
Git (fix branches), issue tracker (repo issues), 29-suite regression
harness, VS Code mirror cmp loop.

## 4. Records
Issue history, fix commits, regression tests, release notes — retained in
the DHF (AUID-DHFI-020).

## 5. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

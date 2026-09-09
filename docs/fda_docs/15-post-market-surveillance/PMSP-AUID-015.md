# Post-Market Surveillance Plan (PMSP)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-PMSP-015 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304 Clause 9; ISO 14971 Clause 9; FDA 21 CFR 820.200; EU MDR Annex III |
| **Safety Class** | Class A |

---

## 1. Purpose
Monitor the software in post-implementation use, identify problems, trend
them, and implement corrective actions. Applies to the standalone tool, the
VS Code extension, and the MCP server.

## 2. Problem Reporting
- Channels: issue tracker (repo), user/agent reports, VS Code extension
  feedback, MCP server error logs.
- Each report captured with: version string (from window.AstroUIDesigner.
  version), platform (OS/Node/Chrome), steps to reproduce, exported project
  snapshot (JSON) where available, and affected function.

## 3. Problem Review and Trend Analysis
- Monthly review: open/closed problems by function area (round-trip,
  editing, simulation, MCP, UI).
- Trend triggers (any of): round-trip integrity complaint; patch applied
  with non-exact anchor (should never occur — investigate immediately);
  mirror drift report; data-loss report; repeated report of the same root
  cause.
- Trend analysis feeds risk re-analysis (AUID-RMF-010 section 6) and, where
  required, corrective action per AUID-PR-009.

## 4. Corrective Action
Defects enter AUID-PR-009 with a regression test. Artifact-integrity
defects (HAZ-001 class) are triaged as S1-equivalent. Re-analysis of
affected requirements (AUID-RTM-011) is recorded; the affected release's
release notes (AUID-RN-014) list the corrective action.

## 5. Post-Market Safety Reports (PMSR / PSUR support)
Aggregated annual summary: reported problems, root causes, corrective
actions, residual-risk status, and any impact on the risk-benefit
conclusion. For the consuming medical device, this tool's PMSR input
covers GUI-artifact integrity (round-trip/export defects) only.

## 6. Software Maintenance
Per IEC 62304 Clause 9.2: maintenance follows the same process as
development (AUID-SDP-001) with impact analysis on affected requirements
and re-verification of impacted test cases plus the full 29-suite harness.
Versioning continues semantically; every maintenance release carries
release notes.

## 7. Records
PMSR inputs, trend analyses, corrective actions — retained in the DHF
(AUID-DHFI-020).

## 8. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA / Regulatory | | | |

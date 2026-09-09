# Requirements Traceability Matrix (RTM)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-RTM-011 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.5 |
| **Safety Class** | Class A |

---

Bidirectional traceability: hazard (AUID-RMF-010) -> requirement
(AUID-SRS-002) -> software item/design (AUID-SAD-003, AUID-SDD-004) ->
unit test (AUID-UV-005) -> integration test (AUID-IVP-006) -> system
verification case (AUID-SVP-007). Every requirement traces to at least one
test; every test traces to at least one requirement. No TBD entries.

## 1. Hazard -> Requirement
| Hazard | Requirements |
|--------|--------------|
| HAZ-001 | REQ-SAFE-001, REQ-SAFE-002, REQ-SAFE-003, REQ-FUNC-005, REQ-FUNC-006, REQ-FUNC-008 |
| HAZ-002 | REQ-SAFE-004, REQ-INTG-004 |
| HAZ-003 | REQ-SAFE-006, REQ-INTF-005, REQ-NFR-005 |
| HAZ-004 | REQ-INTF-002, REQ-INTG-003 |
| HAZ-005 | REQ-SAFE-005, REQ-NFR-002, REQ-NFR-003 |
| HAZ-006 | REQ-SAFE-003, REQ-FUNC-009, REQ-FUNC-016 |
| HAZ-007 | REQ-FUNC-006, REQ-FUNC-007 |

## 2. Requirement -> Design -> Test
| Requirement | SI / Design | Unit | Integration | System |
|-------------|-------------|------|-------------|--------|
| REQ-FUNC-001 | SI-001/002/003 | UT-MD-001 | INT-AP-001 | SVC-001 |
| REQ-FUNC-002 | SI-001/002 (project-pages) | UT-MD-008 | INT-AP-001 | SVC-002 |
| REQ-FUNC-003 | SI-001/004/005 | UT-ML-001..008, UT-AP-002,003 | INT-AP-002 | SVC-003 |
| REQ-FUNC-004 | SI-005 | UT-AP-002 | INT-AP-002 | SVC-004 |
| REQ-FUNC-005 | SI-006 | UT-RT-001,011 | INT-RT-001 | SVC-005 |
| REQ-FUNC-006 | SI-006 | UT-RT-001,002 | INT-RT-001 | SVC-005 |
| REQ-FUNC-007 | SI-007 | UT-RT-003..009 | INT-RT-001,003 | SVC-006 |
| REQ-FUNC-008 | SI-006/008 | UT-RT-006..010 | INT-RT-002 | SVC-007 |
| REQ-FUNC-009 | SI-009 | UT-SIM-001..003 | INT-RT-001 | SVC-008 |
| REQ-FUNC-010 | SI-001 + integrations/hermes/mcp | UT-AP-004 | INT-MCP-001 | SVC-009 |
| REQ-FUNC-011 | SI-010 (drawio-io) | UT-IO-001 | INT-IO-002 | SVC-010 |
| REQ-FUNC-012 | SI-011 (dock-layout) | UT-UX-001 | INT-UX-001 | SVC-011 |
| REQ-FUNC-013 | SI-011 (workbenches) | UT-UX-003 | INT-UX-001 | SVC-012 |
| REQ-FUNC-014 | SI-011 (hotkeys) | UT-UX-002 | INT-AP-003 | SVC-012 |
| REQ-FUNC-015 | SI-011 (animation/storybook) | UT-UX-003 | INT-UX-001 | SVC-012 |
| REQ-FUNC-016 | SI-001/010 (exporter) | UT-IO-003 | INT-IO-003 | SVC-013 |
| REQ-FUNC-017 | SI-008 (plugin) | UT-RT-011 | INT-RT-001 | SVC-014 |
| REQ-SAFE-001 | SI-006/007 | UT-RT-004,005,009 | INT-RT-001 | SVC-015 |
| REQ-SAFE-002 | SI-006 | UT-RT-006,007 | INT-RT-002 | SVC-016 |
| REQ-SAFE-003 | SI-009/010 | UT-SIM-001 | INT-RT-001 | SVC-017 |
| REQ-SAFE-004 | SI-007 (parse-only) | UT-RT-003 | INT-RT-001 | SVC-018 |
| REQ-SAFE-005 | SI-001 | UT-AP-001 | INT-AP-001 | SVC-019 |
| REQ-SAFE-006 | SI-010 (workspace-client/platform-io) | UT-IO-002 | INT-IO-001 | SVC-020 |
| REQ-PERF-001..004 | SI-001/004/005 | UT-AP-003 | INT-AP-002 | SVC-021..024 |
| REQ-INTF-001 | host (launch-designer.mjs) | — | INT-IO-001 | SVC-025 |
| REQ-INTF-002 | mirror | — | INT-VS-001 | SVC-026 |
| REQ-INTF-003 | SI-001 | UT-AP-004 | INT-MCP-001 | SVC-027 |
| REQ-INTF-004 | integrations/hermes/mcp | UT-AP-004 | INT-MCP-001 | SVC-028 |
| REQ-INTF-005 | SI-010 | UT-IO-002 | INT-IO-001 | SVC-029 |
| REQ-INTG-001 | all modules | — | INT-AP-001 | SVC-030 |
| REQ-INTG-002 | SI-006/007/008 | UT-RT-* | INT-RT-001/002 | SVC-015 |
| REQ-INTG-003 | VS Code extension | — | INT-VS-001 | SVC-031 |
| REQ-INTG-004 | SI-006/007 (optional parsers) | UT-RT-011 | INT-RT-001 | SVC-032 |
| REQ-CMPL-001..004 | process | — | — | SVC-033,034 |
| REQ-NFR-001..005 | all | UT-IO-003 | INT-IO-001 | SVC-035 |

## 3. Completeness Statement
All 40 requirements (17 FUNC, 6 SAFE, 4 PERF, 5 INTF, 4 INTG, 4 CMPL,
5 NFR) are traced to design elements and at least one passing test case.
All 7 hazards trace to at least one controlling requirement.

## 4. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA / Regulatory | | | |

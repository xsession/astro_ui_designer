# Design History File Index (DHFI)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-DHFI-020 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | FDA 21 CFR 820.184 (device master record) / 820.30(i) design history file; ISO 13485 4.2.3 |
| **Safety Class** | Class A |

---

## 1. Purpose
Master index of the Design History File (DHF) for Astro UI Designer Pro,
release 2.18.0-advanced-simulation-mcp. All documents reside in
docs/medical_device_firmware/ unless noted.

## 2. Document Index
| # | Document ID | Title | File |
|---|-------------|-------|------|
| 1 | AUID-SDP-001 | Software Development Plan | 01-software-development-plan/SDP-AUID-001.md |
| 2 | AUID-SRS-002 | Software Requirements Specification | 02-software-requirements-spec/SRS-AUID-002.md |
| 3 | AUID-SAD-003 | Software Architecture Description | 03-software-architecture/SAD-AUID-003.md |
| 4 | AUID-SDD-004 | Software Detailed Design | 04-software-detailed-design/SDD-AUID-004.md |
| 5 | AUID-UV-005 | Software Unit Verification Plan | 05-software-unit-verification-plan/UV-AUID-005.md |
| 6 | AUID-IVP-006 | Software Integration & Verification Plan | 06-software-integration-verification-plan/IVP-AUID-006.md |
| 7 | AUID-SVP-007 | Software System Verification Plan | 07-software-system-verification-plan/SVP-AUID-007.md |
| 8 | AUID-CMP-008 | Software Configuration Management Plan | 08-software-config-management-plan/CMP-AUID-008.md |
| 9 | AUID-PR-009 | Software Problem-Resolution Process | 09-software-problem-resolution/PR-AUID-009.md |
| 10 | AUID-RMF-010 | Software Risk Management File | 10-software-risk-management/RMF-AUID-010.md |
| 11 | AUID-RTM-011 | Requirements Traceability Matrix | 11-requirements-traceability/RTM-AUID-011.md |
| 12 | AUID-SSD-012 | Software Summary Description (FDA 510(k)) | 12-software-summary-description/SSD-AUID-012.md |
| 13 | AUID-SSD2-013 | Software System Description (510(k)) | 13-software-system-description/SRS2-AUID-013.md |
| 14 | AUID-RN-014 | Software Release Notes | 14-software-release-notes/RN-AUID-014.md |
| 15 | AUID-PMSP-015 | Post-Market Surveillance Plan | 15-post-market-surveillance/PMSP-AUID-015.md |
| 16 | AUID-CRA-016 | Cybersecurity Risk Assessment | 16-cybersecurity-risk-assessment/CRA-AUID-016.md |
| 17 | AUID-HSI-017 | Hardware-Software Interface Specification | 17-hardware-software-interface/HSI-AUID-017.md |
| 18 | AUID-FUP-018 | Software Update Procedure (FUP) | 18-firmware-update-procedure/FUP-AUID-018.md |
| 19 | AUID-VVR-019 | Verification & Validation Report | 19-verification-and-validation-report/VVR-AUID-019.md |
| 20 | AUID-DHFI-020 | Design History File Index (this document) | 20-design-history-file-index/DHFI-AUID-020.md |

## 3. C4 Model (companion documentation)
| Document | File |
|----------|------|
| C4 overview | docs/c4/README.md |
| C1 System Context | docs/c4/1-system-context.md + diagrams/c1-system-context.drawio/.png |
| C2 Containers | docs/c4/2-containers.md + diagrams/c2-container.drawio/.png |
| C3 Components | docs/c4/3-components.md + diagrams/c3-component.drawio/.png |
| C4 Code | docs/c4/4-code.md + diagrams/c4-code.drawio/.png |

## 4. Evidence Artifacts
| Artifact | Location |
|----------|----------|
| Test harness + fixtures | tests/ (29 suites, 60 test files) |
| Golden export | examples/generated-astro/ |
| Build manifest | PROJECT_BUILD_MANIFEST.md, SHA256SUMS.txt |
| Version record | VERSION, package.json, vscode-extension/package.json |
| Changelog | CHANGELOG.md, vscode-extension/CHANGELOG.md |

## 5. DHF Completeness Statement
All 20 documents present and mutually consistent (cross-document audit
performed 2026-09-08: unique document IDs, resolved cross-references,
matching version string 2.18.0-advanced-simulation-mcp, matching constants
(port 8766, Node v22.20.0, 11 backends, 41 components/dock tabs, 29
suites, 80 undo states, 3 px drag threshold, 24 px min resize, 8 px/1 px
nudge, 6 px snap distance)).

## 6. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA / Regulatory | | | |

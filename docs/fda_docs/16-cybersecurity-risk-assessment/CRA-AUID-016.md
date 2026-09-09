# Cybersecurity Risk Assessment (CRA)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-CRA-016 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | FD&C Act section 524B (2023) + FDA cybersecurity final guidance (2025-06-27); IEC 81001-5-1:2021 |

---

## 1. System Overview
Astro UI Designer Pro runs on a developer workstation. Connectivity:
loopback HTTP (127.0.0.1:8766) between the browser-based IDE and its local
Node.js host; MCP over stdio between the local MCP server process and an
agent host. No Ethernet, Wi-Fi, Bluetooth, cloud, telemetry, or accounts.
The tool is update-capable (software is reinstalled from source
releases), so the FDA cybersecurity guidance applies to premarket
submission of the consuming device's design process and to this tool as
part of the development environment description.

## 2. Asset Identification and Data Flow Classification
| Asset | Classification | Sensitivity |
|-------|----------------|-------------|
| Design project model (in-memory, JSON on save) | Internal | High — device GUI source content |
| Opened project folders (workspace API) | Internal | High — medical device source code |
| Exported source artifacts (Astro/QML/etc.) | Internal | High — delivered device GUI source |
| Hotkey/user settings (in project JSON) | Internal | Low |
| MCP tool calls/results | Internal | Medium — project state + edits |
| Build source (Git repo) | Internal | Medium — IP |

Data flows: workstation file system <-> host (scoped project folders);
browser <-> host (loopback); agent host <-> MCP server (stdio, local).
No data leaves the workstation by design (REQ-NFR-005).

## 3. STRIDE Threat Model
### 3.1 Spoofing
| Threat | Scenario | Likelihood | Impact | Mitigation |
|--------|----------|-----------|--------|------------|
| T-S1 | Local process impersonating the host on 127.0.0.1:8766 | Low | Medium — wrong files served to IDE | Port bound at launch by the trusted host; user opens the known URL; verify host process |
| T-S2 | Agent injecting MCP tool calls to a different project | Low | Medium — edits to wrong project | MCP server operates on the single connected project root; tool calls carry explicit project scope |
| T-S3 | Malicious project folder content (imported source) | Medium | High — crafted source could mislead round-trip parse | Parse-only import (REQ-SAFE-004); no code execution; anchored patches only |
### 3.2 Tampering
| Threat | Scenario | Likelihood | Impact | Mitigation |
|--------|----------|-----------|--------|------------|
| T-T1 | Tampered exported/round-tripped source | Low | High — corrupted device GUI | Byte-identical round-trip tests (REQ-SAFE-001); anchored exact-symbol patches (REQ-SAFE-002); SHA-256 build manifest (REQ-CMPL-001) |
| T-T2 | Tampered save file (project JSON) | Low | Medium — design loss/corruption | JSON save/load verified (REQ-NFR-002); undo history (REQ-SAFE-005) |
| T-T3 | Tampered VS Code mirror | Low | High — unverified code in extension | Byte-identical mirror enforcement + cmp gate (REQ-INTF-002) |
### 3.3 Repudiation
| Threat | Scenario | Likelihood | Impact | Mitigation |
|--------|----------|-----------|--------|------------|
| T-R1 | Unclear origin of a source edit | Low | Medium — incident investigation | MCP tool calls + designer edit history/provenance (SI-008 roundtrip-history); release notes |
### 3.4 Information Disclosure
| Threat | Scenario | Likelihood | Impact | Mitigation |
|--------|----------|-----------|--------|------------|
| T-I1 | Non-loopback exposure of project files | Low | High | Loopback-only binding (REQ-SAFE-006); no network egress (REQ-NFR-005) |
| T-I2 | Project content in logs/screenshots | Low | Medium | No PHI in projects by intended use; simulation is local |
### 3.5 Denial of Service
| Threat | Scenario | Likelihood | Impact | Mitigation |
|--------|----------|-----------|--------|------------|
| T-D1 | Huge project folder via workspace API | Low | Medium — host slowdown | Sync file ops bounded; loopback only; autosave recovery (REQ-NFR-003) |
| T-D2 | Path traversal DoS | Low | High | Traversal rejection (REQ-SAFE-006, UT-IO-002) |
### 3.6 Privilege Escalation
| Threat | Scenario | Likelihood | Impact | Mitigation |
|--------|----------|-----------|--------|------------|
| T-P1 | IDE induced to write outside project root | Low | High | Workspace API scoped to project root (REQ-INTF-005); export writes only to user-selected targets |

## 4. SBOM (Software Bill of Materials)
| Component | Version | License | Source | Purpose | CVE status |
|-----------|---------|---------|--------|---------|------------|
| Node.js | v22.20.0 | MIT | nodejs.org | Runtime (host, tests, MCP) | Checked at each release; no open critical CVEs at 2026-09-08 |
| Chrome/Chromium | current stable | BSD-3 | chromium.org | Rendering engine | Vendor advisory monitoring |
| Git | 2.x | GPL-2 | git-scm.com | Version control | Vendor advisory monitoring |
| @astrojs/compiler-rs | latest (optional) | MIT | npm | Astro source analysis | Checked when installed at build |
| @vue/compiler-sfc, @vue/compiler-dom | latest (optional) | MIT | npm | Vue SFC parsing | Checked when installed at build |
| svelte | latest (optional) | MIT | npm | Svelte analysis | Checked when installed at build |
| typescript | latest (optional) | Apache-2.0 | npm | TS analysis | Checked when installed at build |
| tree-sitter, tree-sitter-c | latest (optional) | MIT | npm | Source parsing | Checked when installed at build |

No runtime npm dependencies; optional components may be absent.

## 5. Security Controls (IEC 81001-5-1:2021 section 8.4)
| Control | Implementation | IEC ref |
|---------|----------------|---------|
| Access control | Local workstation; no user authentication (single-user dev tool); host bound to loopback | 8.4.1 |
| Authentication | N/A — single-user, no remote access | 8.4.2 |
| Data protection | Project data local; SHA-256 integrity records; no PHI by intended use | 8.4.3 |
| Secure update | Release from version-controlled source; build manifest + SHA-256 verification; VS Code .vsix from verified mirror | 8.4.4 |
| Logging | Designer logs (state.logs), MCP tool error surface; no telemetry | 8.4.5 |
| Network security | No network egress; loopback-only local API | 8.4.6 |

## 6. Vulnerability Management
### 6.1 Pre-market
- SOUP (Node.js, Chromium, optional parsers) checked for known CVEs at
  each release; SBOM updated with each dependency change.
### 6.2 Post-market
- Monitor Node.js and Chromium security advisories at each release and
  quarterly.
- Vulnerability assessment refreshed for major releases; support
  commitment: security-relevant fixes for the current major line while the
  tool is in active development.

## 7. Residual Cybersecurity Risk
Acceptable: no network attack surface; local-only data flows; physical
workstation security assumed; integrity of device GUI artifacts protected
by deterministic, tested round-trip controls; update integrity via SHA-256
build manifests.

## 8. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Cybersecurity Lead | | | |
| Safety Engineer | | | |

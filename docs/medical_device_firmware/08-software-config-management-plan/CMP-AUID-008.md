# Software Configuration Management Plan (CMP)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-CMP-008 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.7; FDA 21 CFR 820.30(i) |
| **Safety Class** | Class A |

---

## 1. Introduction
Defines configuration management (CM) items, version control, change
control, and release management.

## 2. Configuration Management Items
| CMI | Item | Form |
|-----|------|------|
| CMI-001 | Software source (standalone/, vscode-extension/, integrations/, launch-designer.mjs) | Git repository |
| CMI-002 | Test harness + fixtures (tests/) | Git repository |
| CMI-003 | Documentation (docs/, this DHF set, CHANGELOG.md) | Git repository |
| CMI-004 | Version record | VERSION file, package.json, vscode-extension/package.json |
| CMI-005 | Build manifest | PROJECT_BUILD_MANIFEST.md, SHA256SUMS.txt |
| CMI-006 | Toolchain | Node.js v22.20.0 (recorded in manifest), Chrome current stable |

## 3. Version Control
- Repository: `astro_ui_designer` (GitHub, main branch, linear history with
  per-release commits).
- Version scheme: semantic, with descriptive suffix (e.g.
  2.18.0-advanced-simulation-mcp). VERSION file is the single source of the
  release string; package.json and the VS Code extension manifest must match
  (verified by SVC-033).
- Every commit message states the change and the version; releases are
  commits on main.

## 4. Change Control
1. Change proposed (issue or direct commit on feature branch).
2. Implementation with tests (29-suite harness must pass; `npm test`).
3. VS Code mirror sync: after any change to standalone/js/, standalone/
   styles.css, or standalone/index.html, the mirror must be re-synced and
   verified byte-identical (cmp loop) — a release with mirror drift is
   blocked (REQ-INTF-002).
4. Manifest refresh: PROJECT_BUILD_MANIFEST.md and SHA256SUMS.txt
   regenerated; CHANGELOG.md updated (REQ-CMPL-001/002).
5. Review + merge to main; tag/release record.

## 5. Build and Release
- No compilation: shipped code = committed source. Build = repository
  snapshot at the release commit.
- Release artifacts: Git tag/commit, PROJECT_BUILD_MANIFEST.md (file list
  with sizes + SHA-256), release notes (AUID-RN-014, 14-software-release-notes).
- VS Code extension packaging: `npm run package:vscode` produces a .vsix
  from the byte-identical mirror (SVC-031).
- Integrity verification: `sha256sum -c SHA256SUMS.txt` must pass for every
  listed file.

## 6. Toolchain Control
Node.js v22.20.0 (LTS) is the reference runtime; Chrome current stable is
the reference engine. Toolchain versions are recorded in
PROJECT_BUILD_MANIFEST.md; changes require a re-run of the full suite and
manifest update.

## 7. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA / Regulatory | | | |

# Software Update Procedure (FUP)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-FUP-018 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304 Clause 9.2 (maintenance); IEC 81001-5-1:2021 8.4.4 (secure update) |
| **Safety Class** | Class A |

---

## 1. Scope
Procedure for updating the software (standalone, VS Code extension, MCP
server). The tool has no bootloader; updates are full software replacements
from version-controlled source. (Terminology: "firmware update procedure"
per the DHF numbering; this is a desktop software update.)

## 2. Update Mechanism
1. **Standalone / source**: clone/checkout the release commit or tag from
   the Git repository; verify the release against PROJECT_BUILD_MANIFEST.md
   and `sha256sum -c SHA256SUMS.txt`; run `npm start`.
2. **VS Code extension**: install the release .vsix produced by
   `npm run package:vscode` (packaged from the byte-identical designer
   mirror — REQ-INTF-002); verify package version matches VERSION file.
3. **MCP server**: `npm run mcp` from the verified release commit
   (integrations/hermes/mcp/server.mjs).

## 3. Pre-Update Verification
- Confirm current version: window.AstroUIDesigner.version / VERSION file.
- Verify release integrity (SHA-256 manifest) before deployment.
- Review release notes (AUID-RN-014) for known issues and breaking changes.
- Back up open project folders (plain JSON + source files).

## 4. Update Execution
- Stop the running host (`node launch-designer.mjs`) and any MCP server.
- Replace source with the verified release.
- Relaunch; confirm version string and open a known project; verify the
  project renders and one round-trip export matches the pre-update golden
  (regression gate).

## 5. Post-Update Verification
- Run `npm test` (29 suites) on the release before deployment to a shared
  development environment.
- Confirm VS Code mirror integrity inside the .vsix (byte-identical check).
- Record the update in the DHF (AUID-DHFI-020): from-version, to-version,
  date, operator, verification evidence.

## 6. Rollback
- Rollback = deploy the previous verified release commit (full
  replacement; no partial state). Previous releases remain available by
  Git tag.

## 7. Integrity and Security
- No runtime self-update; no network fetch of code at runtime
  (REQ-NFR-005).
- Update integrity via SHA-256 build manifest (REQ-CMPL-001).
- Optional npm parser packages, when installed, are pinned by the
  release's package.json resolution and listed in the SBOM (AUID-CRA-016
  section 4).

## 8. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Software Development Lead | | | |

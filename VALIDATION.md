# Astro UI Designer 2.16.0 — validation

**Validation date:** 2026-09-08  
**Integrated version:** `2.16.0-functional-workbenches`  
**Latest upstream head reviewed:** `b4b0ded9a1ae9e014766a1180d2f238adb81e22a` (`Fix the menu functionality`)

## Functional audit

- Built-in relocatable panels registered: **41**.
- Built-in panels with explicit functional renderer branch: **41/41**.
- Built-in panel commands available for editable hotkeys: **41/41**.
- Old generic built-in placeholder sentence: **0 active occurrences**.
- Component Lab: **functional preview/controls/checks/results/baseline path present**.
- Active stale `2.15.0` version markers outside historical docs/build metadata: **0**.

## Automated tests

- Aggregate project runner: **21/21 suites PASS**.
- Functional/hotkey/page suites: **3/3 PASS**.
- Component Lab integration suite: **PASS**.
- Round-trip suites: **9/9 PASS**.
- Draw.io suites: **2/2 PASS**.
- Tooltip suites: **2/2 PASS**.
- Hermes MCP + skill: **2/2 PASS**.
- Visual shell structural smoke: **PASS**.
- VS Code source smoke: **PASS**.
- VSIX packaging: **PASS** (`astro-ui-designer-vscode-2.16.0.vsix`).

## Source consistency

- JavaScript/MJS syntax validation: **106 files PASS**.
- Runtime JS/MJS files included in relative-import audit: **79**.
- Runtime relative imports checked: **160**.
- Missing runtime relative imports: **0**.
- Standalone / VS Code parity checked for shell, app, workbenches, hotkeys, page entities, tooltips, Draw.io and dock-layout runtime: **PASS**.

## Runtime smoke

A real local launcher was started on an isolated port with `--no-browser`:

- `/` returned the 2.16 designer shell: **PASS**.
- `/api/workspace/info` returned a valid workspace API response: **PASS**.

Browser-driven CDP visual automation is not part of this validation because the available managed Chromium environment blocks localhost/file navigation by organization policy. Runtime HTTP smoke plus module/unit/integration tests were used instead.

## Generated outputs

- Astro example regeneration: **PASS**.
- Draw.io sample version marker updated to 2.16.
- VS Code package regenerated from the 2.16 mirrored designer source.

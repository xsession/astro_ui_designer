# Astro UI Designer 2.15.0 Global Tooltips + Draw.io + Relocatable Docks + Round-trip — validation

**Validation date:** 2026-09-08  
**Integrated version:** `2.15.0-global-tooltips`

## Tooltip coverage

- Static shell buttons: **92/92 resolve to tooltip text**.
- Top menus: **8/8 purpose-specific descriptions**.
- Relocatable dock tabs: **40/40 semantic descriptions**.
- Component registry: **42 component definitions supported by component-aware palette tooltip generation**.
- Floating-dock relocation controls, dock context-menu commands, document tabs, splitters and relocatable section handles: **covered**.
- Dynamically rendered buttons/selects/inputs/textareas: **covered by shared semantic fallback + MutationObserver annotation**.
- Hover and keyboard-focus activation, viewport clamping, Escape dismissal and disabled-control native fallback: **implemented**.
- Standalone / VS Code tooltip module and CSS parity: **PASS**.

## Automated validation

- Aggregate project test runner: **17/17 suites PASS**.
- Tooltip regression suites: **2/2 PASS**.
- Round-trip suites: **9/9 PASS**.
- Draw.io suites: **2/2 PASS**.
- Hermes MCP + skill suites: **2/2 PASS**.
- Visual shell smoke: **PASS**.
- VS Code source smoke: **PASS**.
- VSIX package build (`2.15.0`): **PASS**.
- JavaScript/MJS syntax validation: **92 files PASS**.
- Static relative module imports: **151 checked, 0 missing**.
- Local launcher HTTP smoke: **PASS**.

## Notes

The tooltip layer is centralized in `standalone/js/tooltips.js` and mirrored into the VS Code designer. Explicit metadata is used for compact/ambiguous layout and menu controls, while generic generated controls receive semantic fallback tooltips automatically. This avoids requiring every future workbench renderer to manually wire hover help.

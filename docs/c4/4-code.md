# C4 — Code

Code-level view of the safety-relevant round-trip pipeline (the artifact-
integrity critical path, HAZ-001/HAZ-007 per AUID-RMF-010).

## Key functions and flow

```
detectRoundTripBackend(files)                 roundtrip-engine.js
   - extension scan + content sniff
   - pwtk/qml sniffs BEFORE generic .py/.html/.c fallthrough
   - explicit override wins
        |
        v
importFilesToNeutral(backendId, files)        roundtrip-neutral-ir.js
   - branch: importPwtkFiles / importQmlFiles / parseXNeutral
   - pwtk: main.py block classes + layout.json
     (pinned_blocks / block_containers / timer_vals, keys "Group, Name")
     + web/index.html container anchor
   - qml: object graph with id/type/property metadata
        |
        v
neutral design document (state.project, schemaVersion 8)
        |
        v  (designer editing via mutate(fn, label) in app.js)
        |
generateNeutralBackend(backendId, neutralDoc) roundtrip-neutral-ir.js
   - generateXFromNeutral per backend
   - invariant: unmodified input -> byte-identical output
        |
        v
buildRoundTripPatchPlan(backendId, delta)     roundtrip-engine.js
   - patch records: {file, anchor, strategy:'exact-symbol', before, after}
   - pwtk-style JSON backends patch layout.json, not the .py file
   - unanchorable patches (0 or >1 anchor occurrences) are REJECTED
        |
        v
dry-run review (roundtrip-ui.js) -> applied source files
```

## Critical invariants (tested)
1. **Byte-identical unmodified round-trip** for all 11 backends
   (roundtrip-pwtk, roundtrip-qml + per-backend suites).
2. **Anchored-only edits**: `exact-symbol` strategy; no anchor = no edit
   (UT-RT-007, SVC-016).
3. **Parse-only import**: imported code is never executed (SVC-018).
4. **Mutation discipline**: every state.project write goes through
   `mutate(fn, label)` (callback first) -> 80-snapshot history (UT-AP-001).
5. **Mirror integrity**: vscode-extension/designer/js/* is byte-identical
   to standalone/js/* (INT-VS-001, SVC-026/031).

## Module map (standalone/js/, 32 modules, 3490 LOC)
| Module | LOC | Role in pipeline |
|--------|-----|------------------|
| app.js | 382 | state, rendering, interaction, public API |
| roundtrip-engine.js | 458 | matrix, detection, patch plans, patchers |
| drawio-io.js | 481 | Draw.io XML import/export |
| roundtrip-neutral-ir.js | 149 | parsers/generators, multi-file importers |
| simulation.js | 192 | deterministic simulation |
| advanced-manual-edit.js | 156 | multi-selection editing |
| model.js | 125 | design tree + migration |
| manual-layout.js | 30 | geometry math |
| (24 more) | 2681 | UX subsystems + support |

![C4 code](diagrams/c4-code.png)

See also: AUID-SDD-004 (detailed design), AUID-RTM-011 (traceability).

# Software Unit Verification Plan (UV)

| Field | Value |
|-------|-------|
| **Document ID** | AUID-UV-005 |
| **Revision** | 1.0 |
| **Date** | 2026-09-08 |
| **Product** | Astro UI Designer Pro 2.18.0-advanced-simulation-mcp |
| **Standards** | IEC 62304:2006+A1:2015 Clause 8.4 (unit verification beyond Class A minimum) |
| **Safety Class** | Class A |

---

## 1. Introduction
Unit verification covers each software item (SI-001..SI-011, AUID-SAD-003
section 3) against its detailed design (AUID-SDD-004). Unit test IDs:
UT-<MODULE>-<NNN>. Unit tests are executed inside the 29-suite regression
harness (`npm test`, tests/run-all.mjs) so they run on every change.

## 2. Coverage Strategy
- **Pure-function modules** (SI-002 model, SI-004 manual-layout, SI-007
  neutral IR, SI-006 patchers): statement coverage target 100% of exported
  functions via direct call with crafted inputs/outputs.
- **Stateful modules** (SI-001 core, SI-008 conversion, SI-009 simulation):
  exercised through their public entry points with assertions on state
  transitions and rendered DOM.
- **I/O modules** (SI-010): exercised with in-memory/temp project fixtures;
  no test reads outside the repo (no user device repos in tests).
- **UI modules** (SI-011): CDP browser harness asserts DOM structure, event
  wiring, and interaction outcomes.

## 3. Unit Verification Cases by Item

### 3.1 SI-002 model (UT-MD-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-MD-001 | createNode defaults | createNode('container') | node has registry defaults, style.base, empty children, design.constraints |
| UT-MD-002 | createNode override merge | overrides for props/style/meta | merged, no default loss |
| UT-MD-003 | unknown type | createNode('nope') | throws Error |
| UT-MD-004 | findNode/findParent | nested tree | correct node/parent |
| UT-MD-005 | insertNode/removeNode/duplicateNode | tree ops | structure correct, IDs unique |
| UT-MD-006 | deepClone independence | clone mutated | original unchanged |
| UT-MD-007 | migrateProject | older schemaVersion | upgraded to 8 without data loss |
| UT-MD-008 | page entity create/duplicate/delete (project-pages.js) | deletePageEntity on current page | returns ok + nextPageId, current page replaced |

### 3.2 SI-004 manual-layout (UT-ML-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-ML-001 | snapPosition grid | rect near grid line within snapDistance 6 px | snapped to grid; snap line returned |
| UT-ML-002 | snapPosition sibling edge | rect near sibling edge | edge-aligned snap |
| UT-ML-003 | snapPosition no-candidate | rect far from everything | original position, no lines |
| UT-ML-004 | resizeRect min clamps | dx making width < 24 | width clamped to 24 |
| UT-ML-005 | resizeRect aspect lock | aspectLocked true | ratio preserved |
| UT-ML-006 | constrainChildRect | parent resized 2x, child 50% constraint | child position/size scaled proportionally |
| UT-ML-007 | applyRotation | deg values | node design rotation updated; 15-degree snap honored |
| UT-ML-008 | ensureManualLayoutProject defaults | empty project | settings merged (snapDistance 6, bigNudge 8, fineNudge 1) |

### 3.3 SI-006/SI-007 round-trip pipeline (UT-RT-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-RT-001 | detectRoundTripBackend per backend | 11 crafted file sets | correct backendId for each of the 11 |
| UT-RT-002 | pwtk before generic .py | pwtk app (main.py + layout.json + web/index.html) | 'pwtk', not tkinter |
| UT-RT-003 | importPwtkFiles multi-part group key | layout.json key "Demo, Info" | group "Demo", name "Info" |
| UT-RT-004 | pwtk round-trip byte-identical | import then generate, unmodified | layout.json + main.py + index.html byte-identical |
| UT-RT-005 | orphan timer_vals preserved | timer_vals entry with no pinned block | present in generated layout.json |
| UT-RT-006 | patchPwtkSource exact-symbol | timer change for a key | layout.json patched; anchor occurs exactly once |
| UT-RT-007 | patch unanchorable | anchor occurs 0 or 2+ times | patch reported unapplicable, no edit |
| UT-RT-008 | qml import object graph | .qml file set with local component graph | neutral nodes with id/type/property metadata |
| UT-RT-009 | qml multiline string preservation | multiline property values | byte-identical regeneration |
| UT-RT-010 | buildRoundTripPatchPlan strategy | neutral delta | all patches carry strategy 'exact-symbol' + anchor |
| UT-RT-011 | builtin auto-registration | listRoundTripBackends() | 11 backends registered from BACKEND_MATRIX |

### 3.4 SI-009 simulation (UT-SIM-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-SIM-001 | determinism | same seed, run twice | identical state snapshot |
| UT-SIM-002 | seed change | different seeds | different snapshots |
| UT-SIM-003 | stable iteration order | shuffled input children | stable canonical order |

### 3.5 SI-010 I/O (UT-IO-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-IO-001 | drawio export | project | valid Draw.io XML, round-trip import restores model |
| UT-IO-002 | workspace file API scoping | path traversal attempt (../) | rejected |
| UT-IO-003 | zip project archive | export/import cycle | byte-identical project |

### 3.6 SI-011 UX (UT-UX-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-UX-001 | dock layout snapshot/move/reset | moveDockPanelUi | snapshot reflects move; reset restores |
| UT-UX-002 | hotkey set/override/reset | setCommandBinding | currentHotkeyMap reflects override |
| UT-UX-003 | tooltip system install | installTooltipSystem | all 41 panels have tooltips |
| UT-UX-004 | validator | project with missing alt text | issue reported |

### 3.7 SI-001 core (UT-AP-*)
| ID | Case | Input | Expected |
|----|------|-------|----------|
| UT-AP-001 | mutate history cap | 90 mutations | history length 80, undo works |
| UT-AP-002 | nudgeSelected big/fine | ArrowRight x2, Alt x1 | left +16 px, then +1 px |
| UT-AP-003 | drag threshold | pointermove < 3 px | no drag state entered |
| UT-AP-004 | public API version | window.AstroUIDesigner.version | '2.18.0-advanced-simulation-mcp' |

## 4. Exit Criteria
All UT cases pass in the regression harness; no open UT-level defects.

## 5. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |

# Simulation reference

Primary module: `standalone/js/simulation.js`.

Exported operations include project normalization, page resolution, session creation, restricted expression/condition/literal evaluation, per-node simulated view resolution, navigation/back, action execution, event dispatch, delayed-event collection, reset, summary and hotspot discovery.

A session records current page/route, navigation history, overlays, variables/state and recent events. `scope` is `page` or `project`; viewport and fixture IDs are contextual inputs. Simulation is declarative and intentionally does not execute arbitrary framework code.

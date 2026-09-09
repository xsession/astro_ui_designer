# Tutorial: simulate a multi-page flow

Create two pages, add a button or link, define a Navigate interaction, and open **Simulate** (`F7`). Start with project scope, trigger the event, inspect the route/history/state/event log, then use Back. Add a state variable and an action that updates it, plus a visibility binding that depends on the value. Reset the simulation and verify deterministic behavior from a clean state.

For automated or agent-driven use, repeat the same sequence with MCP `simulation_start`, `simulation_event`, `simulation_state` and `simulation_reset`.

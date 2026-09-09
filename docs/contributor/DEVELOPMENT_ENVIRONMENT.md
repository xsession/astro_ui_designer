# Development environment

Required baseline: a modern Node.js runtime. The core is intentionally dependency-light; optional compiler/parser packages improve source inspection. Use `npm test` before changes and the specialist test script for the subsystem you are editing. `npm start` launches the standalone host. `npm run package:vscode` builds the VSIX.

Do not assume optional target runtimes (Qt, Python UI stacks, LVGL simulator) are present. Record target-runtime tests separately from structural adapter tests.

# Verification and test matrix

The repository contains model/unit, integration, browser/rendered and host-level tests. Major areas include project model, page lifecycle, manual layout, advanced selection transforms, animation, CSS/color tools, component lab/story logic, Penpot/Plasmic clean-room adapters, platform interchange, Draw.io, plugins, workspace tools, hotkeys, docks, round-trip core/history/UI/QML/pwtk, simulation, MCP/Hermes, VS Code smoke and visual snapshots.

Use `npm test` as the aggregate regression gate. Specialist scripts (`test:roundtrip`, `test:drawio`, `test:tooltips`, `test:functional`, `test:import`, `test:advanced`, `test:simulation`, `test:hermes`, `test:vscode`) shorten focused development loops.

A passing structural suite is not evidence that external runtimes such as Qt, Python GUI stacks or every frontend framework dependency are installed. Target-runtime builds remain separate acceptance evidence.

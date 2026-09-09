# C4 C2 — containers

This view treats C4 **containers** as independently runnable applications/processes or data stores, not as internal JavaScript modules and not as Docker by default.

| Container | Technology | Responsibility |
|---|---|---|
| Designer Web App | Browser HTML/CSS/ES modules | Canvas, semantic model editing, workbenches, command system and simulation UI. |
| Standalone Host | Node.js | Static serving, local workspace/Git/preview APIs and contained filesystem/process boundary. |
| VS Code Extension Host | VS Code extension host + webview bridge | Workspace trust, native file/Git/tasks/diagnostics/tests and custom-editor integration. |
| Hermes MCP Server | Node.js stdio process | Project-scoped semantic inspection/mutation, simulation sessions and contained export. |
| Project Workspace | Local filesystem + Git data store | User-owned source files, designer project JSON and generated artifacts. |
| Target Preview / Build Runtime | External framework/toolchain process | Astro/Vite, Python GUI, Qt/QML, LVGL simulator or other target runtime execution. |

Round-trip, model, canvas and adapter modules are **components inside the Designer Web App/host codebase**, so they appear at C3 rather than being misclassified as independently deployable C2 containers.

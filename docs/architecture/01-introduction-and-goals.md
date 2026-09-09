# 1. Introduction and goals

## Business goal

Provide a professional visual IDE that accelerates UI construction and maintenance without taking source ownership away from developers.

## Stakeholders

- UI/frontend developers who want direct manipulation without losing code quality;
- embedded/HMI engineers using LVGL, QML or device web UIs;
- designers/developers maintaining reusable components and tokens;
- maintainers adding adapters, plugins, workbenches and host integrations;
- automation/agent clients using MCP under constrained authority.

## Top quality goals

1. **Source integrity** — never silently corrupt imported source.
2. **Understandable output** — generated Astro/QML/etc. should remain ordinary reviewable source.
3. **Interaction responsiveness** — direct manipulation must feel immediate even in a dense workbench.
4. **Extensibility** — new frameworks/providers enter through explicit adapters/contribution seams.
5. **Deterministic verification** — core transforms/simulation can be tested without arbitrary target-runtime execution.
6. **Recoverability** — checkpoints, history, validation and safe page lifecycle reduce destructive mistakes.

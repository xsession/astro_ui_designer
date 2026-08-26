# Product Specification — Astro UI Designer Pro

## Product intent

A Qt Creator-like GUI construction environment for professional web interfaces, with Astro as the primary code-generation target.

The product is not a website template generator and not a low-code runtime platform. The generated Astro source tree is the deliverable.

## Default workspace

```text
+--------------------------------------------------------------------------------+
| File Edit Form Layout View Project Build Help                                  |
+--------------------------------------------------------------------------------+
| File / history / clipboard / layout        Breakpoint Design Preview Export    |
+----------------------+--------------------------------------+------------------+
| Palette / Project /  | document tabs                        | Properties /     |
| Components / Assets  +--------------------------------------+ Layout /         |
|                      |                                      | Actions /        |
|                      |          Design Surface              | Bindings /       |
|                      |                                      | Code             |
+----------------------+--------------------------------------+------------------+
| Problems | Object Tree | State | Tokens | Connections | Console              |
+--------------------------------------------------------------------------------+
| selection                              document/breakpoint             status   |
+--------------------------------------------------------------------------------+
```

## Core UX principles

1. Keep the design surface permanently visible during normal property work.
2. Prefer docked dense tables and inspectors over modal workflows.
3. Use semantic responsive containers as the default layout model.
4. Keep freeform pixel placement opt-in and scoped.
5. Make actions and state explicit model objects.
6. Do not require a proprietary browser runtime for static output.
7. Do not silently destroy broken references.
8. Keep generated source understandable.

## Primary use cases

- company/freelancer websites
- documentation/frontends
- engineering dashboards
- embedded-device configuration UIs
- HMI/control panels through Freeform Layer
- project-management/admin frontends
- reusable design systems
- Astro sites containing React/Vue/Svelte/etc. islands

## Output ownership

Users own the generated source tree. The editor adds stable mapping metadata but the site remains a normal Astro application.

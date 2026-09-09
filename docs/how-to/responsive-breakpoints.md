# How to work with responsive breakpoints

1. Create/rename breakpoints in Project Settings.
2. Keep shared intent in `style.base`.
3. Switch to a breakpoint before making an override; direct manipulation and Layout Tools write geometry to the active breakpoint layer.
4. Prefer semantic Row/Grid/Container rules over per-breakpoint absolute positions.
5. Use container queries for component-level responsiveness where viewport breakpoints are too global.
6. Run responsive audits at representative widths before export.
7. Remove redundant overrides when a breakpoint value becomes identical to base.

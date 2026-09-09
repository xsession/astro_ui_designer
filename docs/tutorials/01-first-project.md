# Tutorial: build your first responsive page

## Goal

Create a small responsive page, verify it in the designer, simulate it and export ordinary Astro source.

## Steps

1. Start the standalone host with `npm start` and open the printed local URL.
2. Create a new project. Keep the default Desktop breakpoint and add a mobile breakpoint in Project → Manage Breakpoints.
3. From Palette, insert a **Section**, then a **Container**, then a **Column**. This keeps layout semantic instead of starting with absolute coordinates.
4. Add a Heading, Text and Button. Select each object and use Properties for content and Layout for width, gap, padding and alignment.
5. Switch to the mobile breakpoint and make a breakpoint-local spacing or font-size change. Return to Desktop and verify that the base style was not overwritten.
6. Select multiple objects with Shift/Ctrl and use Arrange or Layout Tools to align or tidy them.
7. Add a second page with Project → Create Page, give it route `/about`, and set an internal link or prototype Navigate interaction.
8. Press **F7** to enter Simulation. Trigger the navigation and verify page history and event log in the Simulation workbench.
9. Run Build → Validate Project and resolve any Problems.
10. Export Astro ZIP. Inspect the generated `src/pages`, `src/components`, `src/styles`, token and test artifacts. The exported project must make sense without the designer.

## What you learned

The designer's default workflow is semantic/responsive first, direct manipulation when useful, declarative simulation for behavior verification, and source ownership at export.

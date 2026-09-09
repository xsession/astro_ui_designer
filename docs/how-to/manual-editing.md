# How to move, resize and arrange objects precisely

- Click to select; Shift/Ctrl/Cmd extends the selection; drag empty canvas for marquee selection.
- Drag an object or the move affordance to reposition. A normal flow child becomes positioned only when actual movement requires a coordinate model.
- Resize with N/NE/E/SE/S/SW/W/NW handles. Shift locks aspect ratio; Alt resizes from center; Ctrl/Cmd bypasses snapping for the gesture.
- Rotate with the rotation handle; Shift quantizes to 15°.
- Use arrow keys for movement, Alt+Arrow for fine movement and Shift+Arrow for resize.
- Use alignment, distribution and tidy spacing for multi-selection. Parent+child selections are normalized to avoid applying the transform twice.
- Use rulers/guides and smart geometry snapping for engineering/HMI layouts.
- Return an accidentally detached node to normal layout with Position → Flow.

For the implementation model, see [Direct manipulation explanation](../explanation/DIRECT_MANIPULATION_MODEL.md).

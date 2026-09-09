# Simulation model

Simulation is a deterministic interpreter of the designer's declarative behavior graph. Its state consists of current page, history, overlays, variables, fixture/viewport context and event history. Event dispatch finds modeled actions/interactions for the target node, evaluates restricted conditions and applies declarative effects such as navigation, state changes, visibility/class/text changes or overlay operations.

The simulator deliberately does not evaluate arbitrary imported JavaScript, Python, QML JavaScript or C/C++ callbacks. That keeps designer behavior reproducible and safe, but means runtime-specific logic must still be verified in the target application.

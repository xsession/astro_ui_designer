# How to troubleshoot common failures

## Import says no adapter was detected

Check that supported source files are inside the selected directory and not only under ignored build/vendor directories. Use the import review dialog to override backend/entry file if detection is ambiguous.

## Visual source patch is stale

The source fingerprint changed after the plan was created. Reload/rescan the source, rebuild the plan and review again.

## A component will not move

Check Design mode, lock state and whether an editable control inside the component received the pointer event. Use the move affordance or Layout Tools. Flow items remain in flow until movement actually requires explicit coordinates.

## Preview does not start

The host can only launch a preview command if the target project dependencies/runtime are installed. Check the Console/Git/Problems panels and run the underlying framework command manually for its full error.

## QML generates but does not run

The structural adapter cannot substitute for a Qt 6 installation. Verify `Qt6Config.cmake`, CMake kit, QML imports and runtime modules with your Qt toolchain.

## MCP client receives invalid JSON

Ensure no wrapper writes banners/logs to stdout. stdio MCP stdout must be protocol data; diagnostics belong on stderr.

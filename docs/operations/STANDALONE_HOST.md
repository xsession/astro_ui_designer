# Standalone host

`npm start` runs `launch-designer.mjs`, serving the designer and scoped APIs. Workspace operations include open/browse/rescan/read/write, Git status/diff/stage/commit, preview start/stop and round-trip inspect/plan/apply/watch/preview operations. Treat the host as a local privileged boundary: bind conservatively and do not expose it to untrusted networks without a separate authentication/threat model.

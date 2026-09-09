<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->

# Workspace client API

Generated from `standalone/js/workspace-client.js`. In VS Code the same logical operations are bridged through the extension request surface.

| Client function | Parameters | Host endpoint |
|---|---|---|
| `openWorkspace` | `rootPath` | `/api/workspace/open` |
| `browseWorkspace` | `initialPath=''` | `/api/workspace/browse` |
| `rescanWorkspace` | `` | `/api/workspace/rescan` |
| `readWorkspaceFile` | `relativePath` | `/api/workspace/read` |
| `writeWorkspaceFile` | `relativePath,content` | `/api/workspace/write` |
| `gitStatus` | `` | `/api/git/status` |
| `gitDiff` | `relativePath=''` | `/api/git/diff` |
| `gitStage` | `relativePath=''` | `/api/git/stage` |
| `gitCommit` | `message` | `/api/git/commit` |
| `startPreview` | `` | `/api/preview/start` |
| `stopPreview` | `` | `/api/preview/stop` |
| `workspaceInfo` | `` | `/api/workspace/info` |
| `roundTripHealth` | `` | `/api/roundtrip/health` |
| `roundTripInspectSource` | `relativePath,backend='astro'` | `/api/roundtrip/inspect` |
| `roundTripPlanSource` | `{relativePath,backend='astro',baselineFingerprint='',sourceIdentity={},nodeId='',changes=[]}={}` | `/api/roundtrip/plan` |
| `roundTripApplySource` | `{relativePath,baselineFingerprint,nextSource,backend='astro'}={}` | `/api/roundtrip/apply` |
| `roundTripWatchStart` | `` | `/api/roundtrip/watch/start` |
| `roundTripWatchPoll` | `after=0` | `/api/roundtrip/watch/poll` |
| `roundTripWatchStop` | `` | `/api/roundtrip/watch/stop` |
| `roundTripPreviewStart` | `backend='astro'` | `/api/roundtrip/preview/start` |
| `roundTripPreviewStop` | `` | `/api/roundtrip/preview/stop` |

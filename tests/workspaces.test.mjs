import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureWorkspaces, workspaceSnapshot, saveWorkspace, deleteWorkspace, applyWorkspaceToState } from '../standalone/js/workspaces.js';

const app = fs.readFileSync('standalone/js/app.js', 'utf8');
const html = fs.readFileSync('standalone/index.html', 'utf8');

// Module API: ensure adds the array and normalizes entries
const project = {};
assert.equal(ensureWorkspaces(project), project.workspaces);
assert.deepEqual(project.workspaces, []);
ensureWorkspaces({ workspaces: [{ name: 'X' }] });

const p = {};
ensureWorkspaces(p);
const snap = workspaceSnapshot({ zones: { left: ['left:palette'], right: [], bottom: [] }, floating: {} }, { left: 200, right: 300, bottom: 200 }, 'tablet');
assert.equal(snap.breakpoint, 'tablet');
assert.ok(snap.dockLayout.zones.left.includes('left:palette'));

// save creates + dedupes by name
const ws1 = saveWorkspace(p, 'Design', snap);
assert.equal(p.workspaces.length, 1);
assert.equal(ws1.name, 'Design');
const ws2 = saveWorkspace(p, 'design', snap);
assert.equal(p.workspaces.length, 1, 'same-name save must update, not duplicate');
assert.equal(ws2.id, ws1.id);
saveWorkspace(p, 'Review', snap);
assert.equal(p.workspaces.length, 2);

// apply writes dock layout/breakpoint into state via the api hooks
const state = { project: { editor: {}, settings: { breakpoints: [{ id: 'base' }, { id: 'tablet' }] } }, breakpoint: 'base', activeWorkspaceId: '' };
let applied = true;
applyWorkspaceToState(state, p.workspaces[0], {
  applyDockLayout: () => { applied = true; },
  applyDockSizes: () => { applied = true; },
});
assert.equal(state.breakpoint, 'tablet');
assert.equal(state.activeWorkspaceId, p.workspaces[0].id);
assert.ok(state.project.editor.dockLayout);

// delete
const id = p.workspaces[0].id;
assert.equal(deleteWorkspace(p, id), true);
assert.equal(p.workspaces.length, 1);
assert.equal(deleteWorkspace(p, 'nope'), false);

// Integration: the workspaces bottom tab, panel command, command palette entries
assert.match(html, /data-bottom-tab="workspaces"/);
assert.match(app, /bottom:workspaces/);
// app.js wiring for canvas UX features
assert.match(app, /function showCanvasContextMenu/);
assert.match(app, /function copyFormat/);
assert.match(app, /function pasteFormat/);
assert.match(app, /function setZoom/);
assert.match(app, /function bindCanvasInteraction/);
assert.match(app, /function quickInsertAtCursor/);
assert.match(app, /function toggleGrid/);
assert.match(app, /function toggleSnap/);
assert.match(app, /id:'edit.copyFormat'/);
assert.match(app, /id:'edit.pasteFormat'/);
assert.match(app, /id:'view.toggleGrid'/);
assert.match(app, /id:'view.toggleSnap'/);
// workspaces panel renders + ctx hooks
const fw = fs.readFileSync('standalone/js/functional-workbenches.js', 'utf8');
assert.match(fw, /state.bottomTab==='workspaces'/);
assert.match(fw, /data-ws-save/);
assert.match(fw, /data-ws-apply/);
assert.match(fw, /data-ws-delete/);
assert.match(app, /ensureWorkspaces,saveWorkspace:wsSave/);
// tooltips for the new dock tab
const tips = fs.readFileSync('standalone/js/tooltips.js', 'utf8');
assert.match(tips, /workspaces:'/);
// zoom dropdown + cursor status in the shell
assert.match(html, /id="zoom-percent-select"/);
assert.match(html, /id="status-cursor"/);

console.log('workspaces.test.mjs passed');

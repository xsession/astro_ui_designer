// Workspaces: named, switchable editor layouts (EEZ Studio "workspace" pattern).
// A workspace captures the relocatable dock layout + dock sizes + active
// breakpoint so an engineer can save several named arrangements ("design",
// "review", "simulate") and switch between them.

const WORKSPACES_STORAGE_KEY = 'astro-ui-designer-workspaces-v1';

export function ensureWorkspaces(project) {
  project.workspaces ??= [];
  for (const ws of project.workspaces) {
    ws.id ??= `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    ws.name ??= 'Workspace';
    ws.dockLayout ??= null;
    ws.dockSizes ??= {};
    ws.breakpoint ??= 'base';
  }
  return project.workspaces;
}

export function workspaceSnapshot(dockLayout, dockSizes = {}, breakpoint = 'base') {
  return {
    id: `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    dockLayout: dockLayout ? JSON.parse(JSON.stringify(dockLayout)) : null,
    dockSizes: dockSizes ? JSON.parse(JSON.stringify(dockSizes)) : {},
    breakpoint: breakpoint || 'base',
    savedAt: new Date().toISOString(),
  };
}

export function saveWorkspace(project, name, snapshot) {
  const list = ensureWorkspaces(project);
  const trimmed = String(name || '').trim() || `Workspace ${list.length + 1}`;
  const existing = list.find(w => w.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    existing.dockLayout = snapshot.dockLayout;
    existing.dockSizes = snapshot.dockSizes;
    existing.breakpoint = snapshot.breakpoint;
    existing.savedAt = new Date().toISOString();
    return existing;
  }
  const ws = { ...snapshot, name: trimmed };
  list.push(ws);
  return ws;
}

export function deleteWorkspace(project, id) {
  const list = ensureWorkspaces(project);
  const i = list.findIndex(w => w.id === id);
  if (i >= 0) list.splice(i, 1);
  return i >= 0;
}

export function applyWorkspaceToState(state, ws, api) {
  if (!ws) return false;
  if (ws.dockLayout) {
    state.project.editor ??= {};
    state.project.editor.dockLayout = JSON.parse(JSON.stringify(ws.dockLayout));
  }
  if (api?.applyDockLayout) api.applyDockLayout(ws.dockLayout);
  if (ws.dockSizes && api?.applyDockSizes) api.applyDockSizes(ws.dockSizes);
  if (ws.breakpoint && state.project.settings?.breakpoints?.some(b => b.id === ws.breakpoint)) {
    state.breakpoint = ws.breakpoint;
  }
  state.activeWorkspaceId = ws.id || '';
  return true;
}

export function loadStoredWorkspaces() {
  try {
    const raw = localStorage.getItem(WORKSPACES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistWorkspaces(list) {
  try {
    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(list || []));
  } catch { /* ignore quota */ }
}

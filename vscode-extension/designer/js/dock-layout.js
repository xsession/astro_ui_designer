export const DOCK_ZONES = Object.freeze(['left', 'right', 'bottom']);
export const DOCK_LAYOUT_VERSION = 1;

const clone = value => JSON.parse(JSON.stringify(value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function dockPanelKey(origin, id) {
  return `${origin}:${id}`;
}

export function createDockPanelRegistry(entries = []) {
  const registry = {};
  for (const entry of entries) {
    if (!entry || !DOCK_ZONES.includes(entry.origin) || !entry.id) continue;
    const key = entry.key || dockPanelKey(entry.origin, entry.id);
    if (registry[key]) throw new Error(`Duplicate dock panel: ${key}`);
    registry[key] = {
      key,
      origin: entry.origin,
      id: String(entry.id),
      label: String(entry.label || entry.id),
      order: finite(entry.order, 0),
    };
  }
  return registry;
}

export function defaultDockLayout(registry) {
  const layout = {
    version: DOCK_LAYOUT_VERSION,
    zones: { left: [], right: [], bottom: [] },
    active: { left: null, right: null, bottom: null },
    floating: {},
  };
  for (const panel of Object.values(registry).sort((a, b) => a.order - b.order)) {
    layout.zones[panel.origin].push(panel.key);
  }
  for (const zone of DOCK_ZONES) layout.active[zone] = layout.zones[zone][0] || null;
  return layout;
}

function sanitizeRect(rect = {}) {
  return {
    x: Math.max(0, finite(rect.x, 120)),
    y: Math.max(0, finite(rect.y, 90)),
    width: Math.max(220, finite(rect.width, 420)),
    height: Math.max(140, finite(rect.height, 320)),
  };
}

function removeEverywhere(layout, key) {
  for (const zone of DOCK_ZONES) layout.zones[zone] = (layout.zones[zone] || []).filter(x => x !== key);
  delete layout.floating[key];
}

export function normalizeDockLayout(input, registry) {
  const fallback = defaultDockLayout(registry);
  const layout = input && typeof input === 'object' ? clone(input) : fallback;
  layout.version = DOCK_LAYOUT_VERSION;
  layout.zones ||= {};
  layout.active ||= {};
  layout.floating ||= {};

  const known = new Set(Object.keys(registry));
  const seen = new Set();
  for (const zone of DOCK_ZONES) {
    const next = [];
    for (const key of Array.isArray(layout.zones[zone]) ? layout.zones[zone] : []) {
      if (!known.has(key) || seen.has(key)) continue;
      next.push(key);
      seen.add(key);
    }
    layout.zones[zone] = next;
  }

  const floating = {};
  for (const [key, rect] of Object.entries(layout.floating || {})) {
    if (!known.has(key) || seen.has(key)) continue;
    floating[key] = sanitizeRect(rect);
    seen.add(key);
  }
  layout.floating = floating;

  for (const panel of Object.values(registry).sort((a, b) => a.order - b.order)) {
    if (seen.has(panel.key)) continue;
    layout.zones[panel.origin].push(panel.key);
    seen.add(panel.key);
  }

  for (const zone of DOCK_ZONES) {
    if (!layout.zones[zone].includes(layout.active[zone])) layout.active[zone] = layout.zones[zone][0] || null;
  }
  return layout;
}

export function locateDockPanel(layout, key) {
  for (const zone of DOCK_ZONES) {
    const index = (layout.zones?.[zone] || []).indexOf(key);
    if (index >= 0) return { kind: 'zone', zone, index };
  }
  if (layout.floating?.[key]) return { kind: 'floating', rect: clone(layout.floating[key]) };
  return null;
}

export function moveDockPanel(input, key, targetZone, index = Infinity) {
  if (!DOCK_ZONES.includes(targetZone)) throw new Error(`Unknown dock zone: ${targetZone}`);
  const layout = clone(input);
  layout.zones ||= { left: [], right: [], bottom: [] };
  layout.active ||= { left: null, right: null, bottom: null };
  layout.floating ||= {};
  const prior = locateDockPanel(layout, key);
  removeEverywhere(layout, key);
  const list = layout.zones[targetZone] ||= [];
  const at = Math.max(0, Math.min(list.length, finite(index, list.length)));
  list.splice(at, 0, key);
  layout.active[targetZone] = key;
  if (prior?.kind === 'zone' && prior.zone !== targetZone && layout.active[prior.zone] === key) {
    layout.active[prior.zone] = layout.zones[prior.zone][Math.min(prior.index, Math.max(0, layout.zones[prior.zone].length - 1))] || layout.zones[prior.zone][0] || null;
  }
  return layout;
}

export function reorderDockPanel(layout, key, targetIndex) {
  const loc = locateDockPanel(layout, key);
  if (!loc || loc.kind !== 'zone') return clone(layout);
  return moveDockPanel(layout, key, loc.zone, targetIndex);
}

export function floatDockPanel(input, key, rect = {}) {
  const layout = clone(input);
  layout.zones ||= { left: [], right: [], bottom: [] };
  layout.active ||= { left: null, right: null, bottom: null };
  layout.floating ||= {};
  const prior = locateDockPanel(layout, key);
  removeEverywhere(layout, key);
  layout.floating[key] = sanitizeRect(rect);
  if (prior?.kind === 'zone' && layout.active[prior.zone] === key) {
    layout.active[prior.zone] = layout.zones[prior.zone][Math.min(prior.index, Math.max(0, layout.zones[prior.zone].length - 1))] || layout.zones[prior.zone][0] || null;
  }
  return layout;
}

export function updateFloatingRect(input, key, patch = {}) {
  const layout = clone(input);
  if (!layout.floating?.[key]) return layout;
  layout.floating[key] = sanitizeRect({ ...layout.floating[key], ...patch });
  return layout;
}

export function activateDockPanel(input, key) {
  const layout = clone(input);
  const loc = locateDockPanel(layout, key);
  if (loc?.kind === 'zone') layout.active[loc.zone] = key;
  return layout;
}

export function resetDockLayout(registry) {
  return defaultDockLayout(registry);
}

export function panelSequence(layout) {
  return DOCK_ZONES.flatMap(zone => (layout.zones?.[zone] || []).map((key, index) => ({ key, zone, index })))
    .concat(Object.keys(layout.floating || {}).map(key => ({ key, zone: 'floating', index: -1 })));
}

export function moveSectionOrder(order = [], id, targetIndex) {
  const list = [...new Set(order.filter(Boolean))];
  const current = list.indexOf(id);
  if (current >= 0) list.splice(current, 1);
  const at = Math.max(0, Math.min(list.length, finite(targetIndex, list.length)));
  list.splice(at, 0, id);
  return list;
}

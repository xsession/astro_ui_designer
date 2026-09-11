import { readFileSync } from 'node:fs';

const CDP = 'http://127.0.0.1:9222';
const APP = 'http://127.0.0.1:8766/';

async function getTab() {
  const tabs = await (await fetch(`${CDP}/json`)).json();
  let tab = tabs.find(t => t.type === 'page' && t.url.startsWith('http://127.0.0.1:8766'));
  if (!tab) {
    tab = tabs.find(t => t.type === 'page');
    if (!tab) tab = (await (await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' }))).json ? null : null;
  }
  if (!tab) {
    const created = await (await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' })).json();
    tab = created;
  }
  return tab;
}

class CDPSession {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = []; this.exceptions = []; }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const s = new CDPSession(ws);
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && s.pending.has(msg.id)) { s.pending.get(msg.id)(msg); s.pending.delete(msg.id); }
      else if (msg.method) {
        s.events.push(msg);
        if (msg.method === 'Runtime.exceptionThrown') s.exceptions.push(msg.params);
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') s.exceptions.push({ consoleError: msg.params.args });
      }
    };
    return s;
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve) => { this.pending.set(id, resolve); setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); resolve({ error: { message: 'timeout ' + method } }); } }, 15000); });
  }
  async eval(expression, opts = {}) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, ...opts });
    if (r.result && r.result.exceptionDetails) throw new Error('Eval exception: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
    return r.result?.result?.value;
  }
}

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const tab = await getTab();
const cdp = await CDPSession.connect(tab.webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Page.navigate', { url: APP + '?v=' + Date.now() });
// wait for app
for (let i = 0; i < 60; i++) {
  const ready = await cdp.eval(`Boolean(window.AstroUIDesigner && document.querySelector('#artboard'))`).catch(() => false);
  if (ready) break;
  await new Promise(r => setTimeout(r, 500));
}
check('app boot (AstroUIDesigner + artboard)', await cdp.eval(`Boolean(window.AstroUIDesigner && document.querySelector('#artboard'))`), 'version=' + await cdp.eval(`window.AstroUIDesigner.version`));
await cdp.eval(`localStorage.clear()`);

// Seed 2 boxes into the active page root. getProject() returns a clone, so
// mutate the clone and re-load it via loadProjectObject to persist into state.
const seed = await cdp.eval(`(() => {
  const api = window.AstroUIDesigner;
  const p = api.getProject();
  const root = p.pages[0].root;
  root.children = root.children.filter(c => c.type !== 'shapeRect' && c.type !== 'freeform');
  root.children.push({ id:'ff1', type:'freeform', name:'Layer1', props:{}, style:{base:{position:'relative', width:'400px', height:'300px'}}, actions:[], bindings:{}, meta:{}, children:[] });
  root.children.push({ id:'boxA', type:'shapeRect', name:'BoxA', props:{}, style:{base:{position:'absolute', left:'20px', top:'20px', width:'120px', height:'80px', background:'#ff0000'}}, actions:[], bindings:{}, meta:{}, children:[] });
  root.children.push({ id:'boxB', type:'shapeRect', name:'BoxB', props:{}, style:{base:{position:'absolute', left:'180px', top:'20px', width:'120px', height:'80px', background:'#00cc00'}}, actions:[], bindings:{}, meta:{}, children:[] });
  api.loadProjectObject(p);
  api.render();
  return { ok: Boolean(document.querySelector('[data-node-id="boxA"]')), nodes: api.getProject().pages[0].root.children.length };
})()`);
check('seed project with freeform + 2 boxes', seed && seed.ok, `nodes=${seed?.nodes}`);
// reset the exception gate now that boot+seed are verified, so only interaction
// exceptions count (avoids stale entries from the initial page load)
cdp.exceptions.length = 0;

// 1. Canvas context menu on a node
await cdp.eval(`window.AstroUIDesigner.selectNode('boxA')`);
const nodeEl = await cdp.eval(`document.querySelector('[data-node-id="boxA"]').getBoundingClientRect().x + ',' + document.querySelector('[data-node-id="boxA"]').getBoundingClientRect().y`);
const [nx, ny] = nodeEl.split(',').map(Number);
const cm = await cdp.eval(`(() => {
  const el = document.querySelector('[data-node-id="boxA"]');
  const r = el.getBoundingClientRect();
  el.dispatchEvent(new MouseEvent('contextmenu', { clientX: r.x + 10, clientY: r.y + 10, bubbles: true, cancelable: true }));
  const menu = document.querySelector('.canvas-ctx-menu');
  if (!menu) return { ok: false };
  const items = [...menu.querySelectorAll('button')].map(b => b.textContent.trim());
  return { ok: true, items };
})()`);
check('context menu opens on node', cm && cm.ok);
check('context menu has Copy Format', cm && cm.items.some(t => t.includes('Copy Format')), (cm?.items || []).slice(0, 12).join(' | '));
check('context menu has Paste Format', cm && cm.items.some(t => t.includes('Paste Format')));
check('context menu has Extract as Component', cm && cm.items.some(t => t.includes('Extract as Component')));

// click Copy Format, then select boxB and Paste Format, verify style copied
await cdp.eval(`document.querySelector('.canvas-ctx-menu button[data-ctx="edit.copyFormat"]').click()`);
await cdp.eval(`window.AstroUIDesigner.selectNode('boxB')`);
await cdp.eval(`window.AstroUIDesigner.executeCommand('edit.pasteFormat')`);
const copied = await cdp.eval(`(() => { const p = window.AstroUIDesigner.getProject(); const b = p.pages[0].root.children.find(c => c.id === 'boxB'); return b.style.base.background; })()`);
check('copy format → paste format applies background to boxB', copied === '#ff0000', `boxB bg=${copied}`);

// 2. multi-select context menu (align section)
await cdp.eval(`(() => { const p = window.AstroUIDesigner.getProject(); window.AstroUIDesigner.selectNodes(['boxA','boxB']); const r = p.pages[0].root; const el = document.querySelector('[data-node-id="boxB"]'); el.dispatchEvent(new MouseEvent('contextmenu', { clientX: 400, clientY: 300, bubbles: true, cancelable: true })); const menu = document.querySelector('.canvas-ctx-menu'); return menu ? [...menu.querySelectorAll('button')].map(b => b.textContent.trim()) : null; })()`);
const multiMenu = await cdp.eval(`[...document.querySelectorAll('.canvas-ctx-menu button')].map(b => b.textContent.trim())`);
check('multi-select context menu shows Group + Distribute', multiMenu && multiMenu.some(t => t.includes('Group')) && multiMenu.some(t => t.includes('Distribute H')), (multiMenu || []).join(' | '));
await cdp.eval(`document.querySelector('.canvas-ctx-menu') ? document.body.dispatchEvent(new MouseEvent('pointerdown', {bubbles:true})) : null`);

// 3. empty-canvas context menu
const emptyMenu = await cdp.eval(`(() => { const shell = document.querySelector('#artboard-shell'); const art = document.querySelector('#artboard'); const r = art.getBoundingClientRect(); const x = Math.min(innerWidth-260, r.right + 60), y = r.top + 40; if (x < 0) return { ok: 'no-space' }; document.querySelector('#artboard-shell').dispatchEvent(new MouseEvent('contextmenu', { clientX: x < r.left ? r.left + 5 : x, clientY: y, bubbles: true, cancelable: true })); const menu = document.querySelector('.canvas-ctx-menu'); if (!menu) { // dispatch directly on stage empty area
  const stage = document.querySelector('#editor-stage'); const sr = stage.getBoundingClientRect(); stage.dispatchEvent(new MouseEvent('contextmenu', { clientX: sr.left + sr.width - 40, clientY: sr.top + 200, bubbles: true, cancelable: true })); const m2 = document.querySelector('.canvas-ctx-menu'); return m2 ? { ok: true, items: [...m2.querySelectorAll('button')].map(b => b.textContent.trim()) } : { ok: false }; } return { ok: true, items: [...menu.querySelectorAll('button')].map(b => b.textContent.trim()) }; })()`);
check('empty-canvas context menu', emptyMenu && emptyMenu.ok, (emptyMenu?.items || []).join(' | '));
check('empty menu has Insert at Cursor', emptyMenu && emptyMenu.items.some(t => t.includes('Insert at Cursor')));
check('empty menu has Hide/Show Grid toggle', emptyMenu && emptyMenu.items.some(t => t.includes('Grid')));
await cdp.eval(`document.body.dispatchEvent(new MouseEvent('pointerdown', {bubbles:true}))`);

// 4. wheel zoom (ctrl+wheel)
const z0 = await cdp.eval(`document.querySelector('#artboard').style.getPropertyValue('--canvas-zoom')`);
await cdp.eval(`(() => { const shell = document.querySelector('#artboard-shell'); const r = shell.getBoundingClientRect(); shell.dispatchEvent(new WheelEvent('wheel', { clientX: r.left + r.width/2, clientY: r.top + r.height/2, deltaY: -240, ctrlKey: true, bubbles: true, cancelable: true })); shell.dispatchEvent(new WheelEvent('wheel', { clientX: r.left + r.width/2, clientY: r.top + r.height/2, deltaY: -240, ctrlKey: true, bubbles: true, cancelable: true })); return true; })()`);
const z1 = await cdp.eval(`document.querySelector('#artboard').style.getPropertyValue('--canvas-zoom')`);
check('ctrl+wheel zooms in', parseFloat(z1) > parseFloat(z0), `zoom ${z0} → ${z1}`);

// 5. zoom dropdown
await cdp.eval(`(() => { const s = document.querySelector('#zoom-percent-select'); s.value = '50'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
await new Promise(r => setTimeout(r, 150));
const z2 = await cdp.eval(`document.querySelector('#artboard').style.getPropertyValue('--canvas-zoom')`);
check('zoom dropdown sets 50%', Math.abs(parseFloat(z2) - 0.5) < 0.01, `zoom=${z2}`);

// 6. grid toggle
const g0 = await cdp.eval(`document.querySelector('#artboard-shell').classList.contains('grid-off')`);
await cdp.eval(`window.AstroUIDesigner.executeCommand('view.toggleGrid')`);
const g1 = await cdp.eval(`document.querySelector('#artboard-shell').classList.contains('grid-off')`);
check('grid toggle flips grid-off class', g0 !== g1, `before=${g0} after=${g1}`);
await cdp.eval(`window.AstroUIDesigner.executeCommand('view.toggleGrid')`);

// 7. status bar content
const sb = await cdp.eval(`({ sel: document.querySelector('#status-selection').textContent, mid: document.querySelector('#status-middle').textContent, cur: document.querySelector('#status-cursor').textContent, doc: document.querySelector('#status-doc').textContent })`);
check('status bar shows zoom % + node count', sb.mid.includes('%') && sb.mid.includes('nodes'), sb.mid);
check('status bar shows selection + dimensions', sb.sel.includes('·') && /×/.test(sb.sel), sb.sel);
check('status doc shows 2.21 version', sb.doc.includes('2.21'), sb.doc);

// 8. cursor position tracking
await cdp.eval(`(() => { const art = document.querySelector('#artboard'); const r = art.getBoundingClientRect(); art.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 100, clientY: r.top + 50, bubbles: true })); return true; })()`);
const cur = await cdp.eval(`document.querySelector('#status-cursor').textContent`);
check('cursor position shown in status bar', /x \d+/.test(cur || ''), `cursor="${cur}"`);

// 9. workspaces: open tab, save, change layout, apply restores, delete
await cdp.eval(`window.AstroUIDesigner.openBottomTab('workspaces')`);
const wsPanel = await cdp.eval(`(() => { const box = document.querySelector('#bottom-content'); return { html: box.innerHTML.includes('Workspaces'), save: Boolean(box.querySelector('[data-ws-save]')) }; })()`);
check('workspaces panel renders', wsPanel.html && wsPanel.save);
// save the current (default-ish) layout
await cdp.eval(`(() => { window.prompt = () => 'Design WS'; document.querySelector('#bottom-content [data-ws-save]').click(); return true; })()`);
const wsList1 = await cdp.eval(`window.AstroUIDesigner.getProject().workspaces.length`);
check('workspace saved (name from prompt)', wsList1 === 1, `workspaces=${wsList1}`);
// mutate the live layout (move a DIFFERENT panel to the left dock)
await cdp.eval(`window.AstroUIDesigner.moveDockPanel('bottom:objects','left',0)`);
// reopen the workspaces panel (still in bottom dock) and apply the saved layout
await cdp.eval(`window.AstroUIDesigner.openBottomTab('workspaces')`);
await cdp.eval(`(() => { const b = document.querySelector('#bottom-content [data-ws-apply]'); if (b) b.click(); return true; })()`);
const wsApplied = await cdp.eval(`(() => { const l = window.AstroUIDesigner.dockLayout(); return l.zones.left.includes('bottom:objects') ? 'still-left' : 'restored-bottom'; })()`);
check('workspace apply restores dock layout', wsApplied === 'restored-bottom', wsApplied);
// delete
await cdp.eval(`(() => { const b = document.querySelector('#bottom-content [data-ws-delete]'); if (b) b.click(); return true; })()`);
const wsList2 = await cdp.eval(`window.AstroUIDesigner.getProject().workspaces.length`);
check('workspace deleted', wsList2 === 0, `workspaces=${wsList2}`);

// 10. quick insert menu (double-click on empty shell area)
const before = await cdp.eval(`window.AstroUIDesigner.getProject().pages[0].root.children.length`);
await cdp.eval(`(() => { const shell = document.querySelector('#artboard-shell'); const art = document.querySelector('#artboard'); const r = art.getBoundingClientRect(); const x = r.right + 40, y = r.top + 20; shell.dispatchEvent(new MouseEvent('dblclick', { clientX: x, clientY: y, bubbles: true, cancelable: true })); const menu = document.querySelector('.quick-insert-menu'); return menu ? 'opened' : 'missing'; })()`);
const qi = await cdp.eval(`(() => { const m = document.querySelector('.quick-insert-menu'); return m ? [...m.querySelectorAll('button')].map(b=>b.textContent.trim()) : null; })()`);
check('double-click empty canvas opens insert menu', Array.isArray(qi), (qi || []).join(', '));
await cdp.eval(`(() => { const b = [...document.querySelectorAll('.quick-insert-menu button')].find(x => x.textContent.includes('Rectangle')); if (b) b.click(); return true; })()`);
const after = await cdp.eval(`window.AstroUIDesigner.getProject().pages[0].root.children.length`);
check('quick insert adds a node', after === before + 1, `children ${before} → ${after}`);

// 11. pan (middle-drag) — zoom in first so the shell has scrollable overflow
await cdp.eval(`(() => { const s = document.querySelector('#zoom-percent-select'); s.value = '200'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
await new Promise(r => setTimeout(r, 250));
const pan = await cdp.eval(`(() => { const shell = document.querySelector('#artboard-shell'); shell.scrollLeft = 0; shell.scrollTop = 0; const r = shell.getBoundingClientRect(); const down = new PointerEvent('pointerdown', { clientX: r.left + 100, clientY: r.top + 100, button: 1, bubbles: true, cancelable: true, pointerId: 7 }); shell.dispatchEvent(down); shell.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 40, clientY: r.top + 40, bubbles: true, pointerId: 7 })); shell.dispatchEvent(new PointerEvent('pointerup', { clientX: r.left + 40, clientY: r.top + 40, bubbles: true, pointerId: 7 })); return { sl: shell.scrollLeft, st: shell.scrollTop, sw: shell.scrollWidth, cw: shell.clientWidth, maxSl: shell.scrollWidth - shell.clientWidth }; })()`);
check('middle-drag pans the canvas', pan.maxSl > 0 && (pan.sl > 0 || pan.st > 0), JSON.stringify(pan));
await cdp.eval(`(() => { const s = document.querySelector('#zoom-percent-select'); s.value = '100'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);

// 12. command palette includes new commands
const palette = await cdp.eval(`window.AstroUIDesigner.commands().map(c => c.id).filter(id => ['edit.copyFormat','edit.pasteFormat','view.toggleGrid','view.toggleSnap','panel.bottom.workspaces'].includes(id))`);
check('command palette registers new commands', palette.length === 5, (palette || []).join(', '));

// 13. hotkeys resolve for copy format
const hk = await cdp.eval(`(() => { const c = window.AstroUIDesigner.commands().find(x => x.id === 'edit.copyFormat'); return c?.bindings?.[0]; })()`);
check('copy format hotkey is Ctrl+Shift+C', (hk || '').includes('Shift+C'), `binding=${hk}`);

// 14. version surfaces
check('public API version 2.21', (await cdp.eval(`window.AstroUIDesigner.version`)).startsWith('2.21'));

// exceptions gate
const realEx = cdp.exceptions.filter(e => {
  const txt = JSON.stringify(e);
  return !txt.includes('favicon') && !txt.includes('404');
});
check('no runtime exceptions (CDP gate)', realEx.length === 0, realEx.length+' exc');

// screenshots
async function shot(name) {
  const r = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const buf = Buffer.from(r.result.data, 'base64');
  const fs = await import('node:fs');
  fs.writeFileSync(`E:/GIT/astro_ui_designer/tests/screenshots/v221-${name}.png`, buf);
  console.log(`screenshot: tests/screenshots/v221-${name}.png (${(buf.length / 1024).toFixed(0)}KB)`);
}
// restore a clean view for screenshots
await cdp.eval(`window.AstroUIDesigner.executeCommand('view.zoomReset')`);
await cdp.eval(`window.AstroUIDesigner.openBottomTab('problems')`);
await shot('main-shell');
await cdp.eval(`(() => { const el = document.querySelector('[data-node-id="boxA"]'); if (!el) return false; const r = el.getBoundingClientRect(); el.dispatchEvent(new MouseEvent('contextmenu', { clientX: r.x + 10, clientY: r.y + 10, bubbles: true, cancelable: true })); return true; })()`);
await shot('context-menu');
await cdp.eval(`document.body.dispatchEvent(new MouseEvent('pointerdown', {bubbles:true}))`);
await cdp.eval(`window.AstroUIDesigner.openBottomTab('workspaces')`);
await shot('workspaces-panel');

const failed = results.filter(r => !r.ok);
console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
if (failed.length) { console.log('FAILED:'); failed.forEach(f => console.log(' - ' + f.name + (f.detail ? ' — ' + f.detail : ''))); process.exit(1); }
process.exit(0);

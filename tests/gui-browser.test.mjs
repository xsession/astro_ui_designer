import assert from 'node:assert/strict';
import path from 'node:path';
import { DesignerBrowser } from './cdp-harness.mjs';
import { ACTION_TYPES, STYLE_GROUPS } from '../standalone/js/registry.js';

const browser = new DesignerBrowser(path.resolve('.'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function testValue(field) {
  if (field.kind === 'checkbox') return true;
  if (field.kind === 'number') return '7';
  if (field.kind === 'select') return field.options.find((x) => String(x) !== '') ?? field.options[0];
  return `test-${field.key}`;
}

try {
  await browser.start({ width: 1600, height: 900 });
  const boot = JSON.parse(await browser.evaluate(`JSON.stringify({
    palette:[...document.querySelectorAll('.palette-item')].map(x=>x.dataset.type),
    title:document.title,
    api:window.AstroUIDesigner?.version,
    errors:window.__designerErrors
  })`));
  assert.equal(boot.title, 'Astro UI Designer Pro');
  assert.equal(boot.api, '2.7.0-hermes');
  assert.ok(boot.palette.length >= 30);
  assert.deepEqual(boot.errors, []);

  // Palette + property editor: exercise every palette-visible GUI primitive and every declared prop control.
  const specs = JSON.parse(await browser.evaluate(`JSON.stringify(Object.fromEntries(Object.entries(AstroUIDesigner.registry).map(([k,v])=>[k,{paletteHidden:!!v.paletteHidden,componentDefinitionOnly:!!v.componentDefinitionOnly,label:v.label,fields:v.fields||[]}])) )`));
  const paletteTypes = Object.entries(specs).filter(([,s]) => !s.paletteHidden && !s.componentDefinitionOnly).map(([type]) => type);
  for (const type of paletteTypes) {
    await browser.evaluate('AstroUIDesigner.reset()');
    await browser.click('[data-left-tab="palette"]');
    await browser.dblclick(`.palette-item[data-type="${type}"]`);
    await sleep(10);
    const session = await browser.evaluate('AstroUIDesigner.getSession()');
    const node = await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(session.selectedId)})`);
    assert.equal(node.type, type, `${type}: double-click insert`);
    assert.equal(await browser.evaluate(`Boolean(document.querySelector('[data-node-id="${session.selectedId}"]'))`), true, `${type}: rendered`);

    await browser.click('[data-right-tab="properties"]');
    for (const field of specs[type].fields) {
      const selector = `#p-${field.key}`;
      assert.equal(await browser.evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`), true, `${type}.${field.key}: property control exists`);
      const value = testValue(field);
      if (field.kind === 'checkbox') await browser.change(selector, null, { checked: value });
      else await browser.change(selector, value);
      const actual = await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(session.selectedId)}).props[${JSON.stringify(field.key)}]`);
      assert.equal(actual, value, `${type}.${field.key}: property edit`);
    }
  }

  // Generic layout/style inspector: every style control is editable.
  await browser.evaluate('AstroUIDesigner.reset()');
  const cardId = await browser.evaluate(`AstroUIDesigner.insert('card')`);
  await browser.click('[data-right-tab="layout"]');
  for (const group of STYLE_GROUPS) {
    const prefix = `s-${group.name.replace(/\W/g, '')}`;
    for (const field of group.fields) {
      const selector = `#${prefix}-${field.key}`;
      const exists = await browser.evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
      assert.equal(exists, true, `style ${field.key}: control exists`);
      const value = field.kind === 'select' ? (field.options.find((x) => String(x) !== '') ?? field.options[0]) : 'initial';
      await browser.change(selector, value);
      const actual = await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(cardId)}).style.base[${JSON.stringify(field.key)}]`);
      assert.equal(actual, value, `style ${field.key}: edit`);
    }
  }
  await browser.change('#breakpoint-select', 'mobile');
  await browser.click('[data-right-tab="layout"]');
  await browser.change('#s-Layout-width', '100%');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(cardId)}).style.mobile.width`), '100%', 'responsive override');

  // Undo / redo / duplicate / copy-paste / delete toolbar functions.
  await browser.evaluate('AstroUIDesigner.reset()');
  const originalId = await browser.evaluate(`AstroUIDesigner.insert('button')`);
  const count1 = await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children.length`);
  await browser.click('#duplicate-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children.length`), count1 + 1, 'duplicate');
  await browser.click('#undo-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children.length`), count1, 'undo');
  await browser.click('#redo-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children.length`), count1 + 1, 'redo');
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(originalId)})`);
  await browser.click('#copy-btn');
  await browser.click('#paste-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children.length`), count1 + 2, 'copy/paste');
  await browser.click('#delete-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children.length`), count1 + 1, 'delete');

  // Signals/actions: every action type can be selected through the Actions editor.
  await browser.evaluate('AstroUIDesigner.reset()');
  const actionNode = await browser.evaluate(`AstroUIDesigner.insert('button')`);
  await browser.click('[data-right-tab="actions"]');
  await browser.click('#add-action');
  for (const action of ACTION_TYPES) {
    await browser.change('.action-card [data-key="type"]', action.id);
    const actual = await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(actionNode)}).actions[0].type`);
    assert.equal(actual, action.id, `action ${action.id}`);
  }

  // State binding + Preview mode action execution.
  await browser.evaluate('AstroUIDesigner.reset()');
  const textId = await browser.evaluate(`AstroUIDesigner.insert('text')`);
  await browser.click('[data-right-tab="bindings"]');
  await browser.change('[data-binding="text"]', 'state.message');
  await browser.click('[data-right-tab="actions"]');
  await browser.click('#add-action');
  await browser.change('.action-card [data-key="type"]', 'setState');
  await browser.change('.action-card [data-key="value"]', 'message=Changed in preview');
  await browser.click('#preview-mode-btn');
  await browser.click(`[data-node-id="${textId}"]`);
  await sleep(20);
  assert.equal(await browser.evaluate(`document.querySelector('[data-node-id="${textId}"]').textContent.trim()`), 'Changed in preview', 'preview state/action');
  await browser.click('#design-mode-btn');

  // Page creation dialog.
  await browser.click('[data-left-tab="project"]');
  await browser.click('#add-page');
  await browser.change('#m-pname', 'About');
  await browser.change('#m-route', '/about');
  await browser.change('#m-file', 'about/index.astro');
  await browser.change('#m-title', 'About Us');
  await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages.some(p=>p.route==='/about'&&p.filename==='about/index.astro')`), true, 'create page');

  // Reusable component extraction and insertion.
  await browser.evaluate('AstroUIDesigner.reset()');
  const selectedForComponent = await browser.evaluate(`AstroUIDesigner.insert('card')`);
  await browser.click('[data-left-tab="components"]');
  await browser.click('#from-selection');
  await browser.change('#m-cname', 'FeaturePanel');
  await browser.change('#m-cfile', 'FeaturePanel.astro');
  await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.length`), 1, 'extract reusable component');
  await browser.click('[data-left-tab="components"]');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('[data-ins]'))`), true, 'component insert control');
  await browser.click('[data-ins]');
  assert.equal(await browser.evaluate(`{const walk=n=>(n.type==='componentInstance'?1:0)+(n.children||[]).reduce((a,c)=>a+walk(c),0);walk(AstroUIDesigner.getProject().pages[0].root)}`), 2, 'insert reusable component');

  // Breakpoint management.
  await browser.click('#breakpoints-btn');
  await browser.click('#add-bp');
  const customIndex = await browser.evaluate(`document.querySelectorAll('#bp-rows .breakpoint-row').length-1`);
  await browser.change(`#bp-rows .breakpoint-row:nth-child(${customIndex + 1}) [data-k="label"]`, 'Wide');
  await browser.change(`#bp-rows .breakpoint-row:nth-child(${customIndex + 1}) [data-k="width"]`, '1600');
  await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().settings.breakpoints.some(b=>b.label==='Wide'&&b.width===1600)`), true, 'custom breakpoint');

  // Design token edit and theme duplication.
  await browser.click('[data-bottom-tab="tokens"]');
  const firstToken = await browser.evaluate(`document.querySelector('[data-token-val]')?.dataset.tokenVal`);
  assert.ok(firstToken);
  await browser.change(`[data-token-val="${firstToken}"]`, '#123456');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().theme.themes.default.tokens[${JSON.stringify(firstToken)}]`), '#123456', 'token edit');
  await browser.click('#theme-btn');
  await browser.change('#m-newtheme', 'Dark Test');
  await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`Boolean(AstroUIDesigner.getProject().theme.themes['dark-test'])`), true, 'theme duplicate');

  // Freeform multi-select, alignment and resize handle.
  await browser.evaluate('AstroUIDesigner.reset()');
  const freeform = await browser.evaluate(`AstroUIDesigner.insert('freeform')`);
  const a = await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(freeform)})`);
  const b = await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(freeform)})`);
  const c = await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(freeform)})`);
  for (const [id,left,top] of [[a,'24px','24px'],[b,'180px','96px'],[c,'340px','180px']]) {
    await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'position','absolute')`);
    await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'left',${JSON.stringify(left)})`);
    await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'top',${JSON.stringify(top)})`);
    await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'width','120px')`);
  }
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)});AstroUIDesigner.select(${JSON.stringify(b)},{add:true});AstroUIDesigner.select(${JSON.stringify(c)},{add:true});true`);
  await browser.click('#align-left-btn');
  const lefts = await browser.evaluate(`[${[a,b,c].map((id)=>`AstroUIDesigner.getNode(${JSON.stringify(id)}).style.base.left`).join(',')}]`);
  assert.equal(new Set(lefts).size, 1, 'multi-select align left');
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)})`);
  const beforeWidth = await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.width)`);
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('[data-node-id="${a}"] > .resize-handle'))`), true, 'resize handle exists');
  await browser.drag(`[data-node-id="${a}"] > .resize-handle`, 48, 32);
  assert.ok(await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.width)`) > beforeWidth, 'resize changes width');

  // Dock resize and fit button.
  const dockBefore = await browser.evaluate(`parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--left-dock-width'))`);
  await browser.drag('#left-splitter', 36, 0);
  const dockAfter = await browser.evaluate(`parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--left-dock-width'))`);
  assert.ok(dockAfter > dockBefore, 'left dock resize');
  await browser.click('#fit-btn');
  assert.ok((await browser.evaluate('AstroUIDesigner.getSession().zoom')) <= 1.4, 'fit artboard');

  // Command palette and generated code browser.
  await browser.click('#command-btn');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#command-search'))`), true, 'command palette');
  await browser.change('#command-search', 'Export');
  await browser.evaluate(`document.querySelector('#command-search').dispatchEvent(new Event('input',{bubbles:true}))`);
  assert.ok(await browser.evaluate(`document.querySelectorAll('.command-item').length`) > 0, 'command search');
  await browser.evaluate(`document.querySelector('#modal-layer').innerHTML=''`);
  await browser.click('[data-right-tab="code"]');
  assert.ok((await browser.evaluate(`document.querySelector('.code-preview').textContent`)).includes('Astro'), 'generated code view');

  const errors = await browser.runtimeErrors();
  assert.deepEqual(errors, [], `browser runtime errors: ${errors.join('\n')}`);
  console.log(`gui-browser.test: OK (${paletteTypes.length} palette widgets, ${STYLE_GROUPS.flatMap(g=>g.fields).length} style controls, ${ACTION_TYPES.length} actions)`);
} finally {
  await browser.close();
}

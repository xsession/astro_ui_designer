import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser = new DesignerBrowser();
try {
  await browser.start({ width: 1366, height: 768 });
  await browser.evaluate(`AstroUIDesigner.reset()`);

  const rect = (selector) => browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight}})()`);

  // Bottom workbench must start as a compact tabs-only strip instead of consuming the canvas.
  assert.equal(await browser.evaluate(`document.querySelector('#app').classList.contains('bottom-minimized')`), true, 'bottom panel starts minimized');
  const compactBottom = await rect('.bottom-dock');
  assert.ok(compactBottom.height >= 29 && compactBottom.height <= 31, `bottom tabs-only strip is exactly one tab row (${compactBottom.height}px)`);
  const workspace = await rect('.workspace');
  assert.ok(workspace.height / 768 > 0.78, 'workspace retains most of the compact viewport');

  // Overflow affordances make every dock destination discoverable.
  for (const [button, expected] of [['#left-tabs-more', 5], ['#right-tabs-more', 7], ['#bottom-tabs-more', 13]]) {
    await browser.click(button);
    assert.equal(await browser.evaluate(`document.querySelectorAll('.tab-overflow-menu button').length`), expected, `${button} exposes all destinations`);
    await browser.evaluate(`document.querySelector('#popover-layer').innerHTML=''`);
  }

  // The Palette is a one-column Qt-like list; labels must not be clipped at 1366px.
  const clippedLabels = await browser.evaluate(`[...document.querySelectorAll('.palette-label')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.trim())`);
  assert.deepEqual(clippedLabels, [], `palette labels fit: ${clippedLabels.join(', ')}`);

  // First-use empty state has meaningful, actionable starting layouts.
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('.drop-empty-root [data-quick-add="section"]'))`), true, 'root onboarding actions exist');
  await browser.click('.drop-empty-root [data-quick-add="section"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children[0]?.type`), 'section', 'quick-start creates a Section');

  // Side dock toggles reclaim canvas space and restore deterministically.
  const canvasBefore = await rect('.canvas-area');
  await browser.click('#toggle-left-btn');
  assert.equal(await browser.evaluate(`document.querySelector('.workspace').classList.contains('left-hidden')`), true, 'left dock collapses');
  const canvasWithoutLeft = await rect('.canvas-area');
  assert.ok(canvasWithoutLeft.width > canvasBefore.width + 180, 'left-dock collapse gives space back to canvas');
  await browser.click('#toggle-left-btn');
  assert.equal(await browser.evaluate(`document.querySelector('.workspace').classList.contains('left-hidden')`), false, 'left dock restores');

  // Focus mode is a reversible canvas-only workspace state.
  await browser.click('#focus-mode-btn');
  assert.equal(await browser.evaluate(`document.querySelector('.workspace').classList.contains('left-hidden') && document.querySelector('.workspace').classList.contains('right-hidden') && document.querySelector('#app').classList.contains('bottom-minimized')`), true, 'focus mode hides side and bottom panels');
  await browser.click('#focus-mode-btn');
  assert.equal(await browser.evaluate(`!document.querySelector('.workspace').classList.contains('left-hidden') && !document.querySelector('.workspace').classList.contains('right-hidden')`), true, 'focus mode restores prior panel state');

  // Re-clicking the active workbench tab collapses it; opening Animation uses its useful height.
  await browser.click('[data-bottom-tab="animation"]');
  assert.equal(await browser.evaluate(`!document.querySelector('#app').classList.contains('bottom-minimized')`), true, 'workbench opens from its tab');
  assert.ok((await rect('.bottom-dock')).height >= 400, 'Animation receives a usable workbench height');
  await browser.click('[data-bottom-tab="animation"]');
  assert.equal(await browser.evaluate(`document.querySelector('#app').classList.contains('bottom-minimized')`), true, 'active workbench tab collapses on re-click');

  // Animation output is progressive disclosure: controls remain visible, source opens on demand.
  await browser.evaluate(`AstroUIDesigner.reset();AstroUIDesigner.insert('card')`);
  await browser.click('[data-bottom-tab="animation"]');
  await browser.change('#anim-preset', 'fadeUp');
  await browser.click('#anim-apply-preset');
  assert.equal(await browser.evaluate(`getComputedStyle(document.querySelector('.animation-code')).display`), 'none', 'generated code starts collapsed');
  const codeTabs = await rect('.animation-code-tabs');
  const bottomContent = await rect('.bottom-content');
  assert.ok(codeTabs.bottom <= bottomContent.bottom + 1, `animation code controls stay above status bar (${codeTabs.bottom}/${bottomContent.bottom})`);
  await browser.click('#anim-code-css');
  assert.notEqual(await browser.evaluate(`getComputedStyle(document.querySelector('.animation-code')).display`), 'none', 'generated CSS expands on request');
  assert.equal(await browser.evaluate(`document.querySelector('.animation-editor').classList.contains('code-expanded')`), true, 'animation editor exposes expanded state');

  // Keyboard-first access to the palette search.
  await browser.key('/', { code: 'Slash', keyCode: 191 });
  assert.equal(await browser.evaluate(`document.activeElement?.id`), 'palette-search', 'slash focuses Palette search');

  // No shell-level overflow or uncaught runtime failures.
  const shell = await browser.evaluate(`({vw:innerWidth,doc:document.documentElement.scrollWidth,toolbar:document.querySelector('.toolbar').scrollWidth,toolbarClient:document.querySelector('.toolbar').clientWidth})`);
  assert.ok(shell.doc <= shell.vw + 1, `document does not overflow horizontally (${shell.doc}/${shell.vw})`);
  assert.ok(shell.toolbar <= shell.toolbarClient + 1, `toolbar does not overflow (${shell.toolbar}/${shell.toolbarClient})`);
  assert.deepEqual(await browser.runtimeErrors(), [], 'UX regression flow has no runtime errors');

  console.log('ux-regression.test: OK (compact shell, panel discovery, focus mode, onboarding, animation disclosure)');
} finally {
  await browser.close();
}

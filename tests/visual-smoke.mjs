import assert from 'node:assert/strict';
import path from 'node:path';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser = new DesignerBrowser();
const out = path.resolve('tests/screenshots');

async function setViewport(width, height) {
  await browser.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 80));
}

async function assertShell(label) {
  const g = await browser.evaluate(`(()=>{
    const rect=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}:null};
    const root=document.documentElement,body=document.body;
    return {
      vw:innerWidth,vh:innerHeight,sw:root.scrollWidth,sh:root.scrollHeight,
      toolbar:rect('.toolbar'),left:rect('.left-dock'),canvas:rect('.canvas-area'),right:rect('.right-dock'),bottom:rect('.bottom-dock'),status:rect('.statusbar'),
      toolbarOverflow:(document.querySelector('.toolbar')?.scrollWidth||0)>(document.querySelector('.toolbar')?.clientWidth||0)+1,
      errors:window.__designerErrors||[]
    }
  })()`);
  assert.ok(g.sw <= g.vw + 1, `${label}: horizontal document overflow ${g.sw}/${g.vw}`);
  assert.ok(g.sh <= g.vh + 1, `${label}: vertical document overflow ${g.sh}/${g.vh}`);
  assert.equal(g.toolbarOverflow, false, `${label}: toolbar overflow`);
  assert.ok(g.left && g.canvas && g.right && g.bottom, `${label}: shell regions exist`);
  assert.ok(g.left.l >= -1 && g.left.r <= g.vw + 1, `${label}: left dock leaves viewport`);
  assert.ok(g.right.l >= -1 && g.right.r <= g.vw + 1, `${label}: right dock leaves viewport ${g.right.r}/${g.vw}`);
  assert.ok(g.left.r <= g.canvas.l + 1, `${label}: left dock overlaps canvas`);
  assert.ok(g.canvas.r <= g.right.l + 1, `${label}: canvas overlaps right dock`);
  assert.ok(g.bottom.t >= g.canvas.b - 1, `${label}: bottom dock overlaps workspace`);
  assert.ok(g.bottom.b <= g.status.t + 1, `${label}: bottom dock overlaps status bar`);
  assert.ok(g.status.b <= g.vh + 1, `${label}: status bar leaves viewport`);
  assert.deepEqual(g.errors, [], `${label}: runtime errors`);
  return g;
}

try {
  await browser.start({width:1920,height:1080});
  await browser.evaluate(`AstroUIDesigner.reset()`);
  await setViewport(1920,1080);
  await assertShell('desktop');
  await browser.screenshot(path.join(out,'01-desktop-1920x1080.png'));

  await setViewport(1366,768);
  await assertShell('compact');
  await browser.screenshot(path.join(out,'02-compact-1366x768.png'));

  await setViewport(1600,900);
  const f=await browser.evaluate(`AstroUIDesigner.insert('freeform')`);
  const a=await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(f)})`);
  const b=await browser.evaluate(`AstroUIDesigner.insert('input',${JSON.stringify(f)})`);
  const c=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(f)})`);
  for (const [id,x,y,w] of [[a,32,32,140],[b,240,100,220],[c,520,180,260]]) {
    await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'position','absolute');AstroUIDesigner.setStyle(${JSON.stringify(id)},'left','${x}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'top','${y}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'width','${w}px');true`);
  }
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)});AstroUIDesigner.select(${JSON.stringify(b)},{add:true});AstroUIDesigner.select(${JSON.stringify(c)},{add:true});true`);
  await assertShell('freeform');
  assert.equal(await browser.evaluate(`document.querySelectorAll('.designer-node.multi-selected,.designer-node.selected').length>=3`),true,'freeform: multi selection visible');
  await browser.screenshot(path.join(out,'03-freeform-multiselect-1600x900.png'));

  await browser.evaluate(`AstroUIDesigner.setMode('preview')`);
  await assertShell('preview');
  assert.equal(await browser.evaluate(`document.querySelectorAll('.node-badge,.resize-handle').length`),0,'preview: design chrome absent');
  await browser.screenshot(path.join(out,'04-preview-1600x900.png'));

  await browser.evaluate(`AstroUIDesigner.setMode('design')`);
  await browser.click('#split-mode-btn');
  await assertShell('split');
  assert.equal(await browser.evaluate(`document.querySelector('.canvas-area').classList.contains('view-split')`),true,'split: source and design layout active');
  await browser.screenshot(path.join(out,'05-split-source-1600x900.png'));

  await browser.click('#design-mode-btn');
  await browser.click('[data-right-tab="variants"]');
  await browser.click('[data-bottom-tab="integrations"]');
  await assertShell('research-workbench');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#add-node-state') && document.querySelector('[data-run-contrib]'))`),true,'research: variants + integrations visible');
  await browser.screenshot(path.join(out,'06-research-workbench-1600x900.png'));

  await browser.evaluate(`AstroUIDesigner.reset()`);
  const animated=await browser.evaluate(`AstroUIDesigner.insert('card')`);
  // Selection is already the inserted card; open the animation workbench and apply a production preset.
  await browser.click('[data-bottom-tab="animation"]');
  await browser.change('#anim-preset','fadeUp');
  await browser.click('#anim-apply-preset');
  await browser.change('#anim-trigger','hover');
  await assertShell('animation-editor');
  assert.equal(await browser.evaluate(`document.querySelectorAll('.animation-track-row').length`),2,'animation: preset tracks visible');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('.backend-badge'))`),true,'animation: backend badge visible');
  await browser.screenshot(path.join(out,'07-animation-editor-1600x900.png'));

  await setViewport(1366,768);
  await assertShell('animation-compact');
  const compactAnimation=await browser.evaluate(`(()=>{const t=document.querySelector('.animation-code-tabs').getBoundingClientRect(),c=document.querySelector('.bottom-content').getBoundingClientRect();return {tabsBottom:t.bottom,contentBottom:c.bottom}})()`);
  assert.ok(compactAnimation.tabsBottom<=compactAnimation.contentBottom+1,`animation-compact: code controls clipped ${compactAnimation.tabsBottom}/${compactAnimation.contentBottom}`);
  await browser.screenshot(path.join(out,'08-animation-compact-1366x768.png'));

  await browser.evaluate(`AstroUIDesigner.reset()`);
  await browser.click('#focus-mode-btn');
  const focus=await browser.evaluate(`(()=>{const c=document.querySelector('.canvas-area').getBoundingClientRect();return {canvasWidth:c.width,leftDisplay:getComputedStyle(document.querySelector('.left-dock')).display,rightDisplay:getComputedStyle(document.querySelector('.right-dock')).display,bottomHeight:document.querySelector('.bottom-dock').getBoundingClientRect().height,errors:window.__designerErrors||[]}})()`);
  assert.ok(focus.canvasWidth>=1365,`focus: canvas does not fill viewport ${focus.canvasWidth}`);
  assert.equal(focus.leftDisplay,'none','focus: left dock hidden');
  assert.equal(focus.rightDisplay,'none','focus: right dock hidden');
  assert.ok(focus.bottomHeight<=31,`focus: bottom panel not minimized ${focus.bottomHeight}`);
  assert.deepEqual(focus.errors,[],'focus: runtime errors');
  await browser.screenshot(path.join(out,'09-focus-mode-1366x768.png'));

  console.log('visual-smoke: OK (9 rendered checkpoints)');
} finally {
  await browser.close();
}

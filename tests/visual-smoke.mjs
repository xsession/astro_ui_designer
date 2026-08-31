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

  await setViewport(1600,900);
  await browser.click('#focus-mode-btn');
  await browser.evaluate(`AstroUIDesigner.reset();AstroUIDesigner.insert('card')`);
  await browser.click('[data-right-tab="effects"]');
  await browser.click('#add-fill');
  await browser.click('#add-shadow');
  await browser.change('#background-blur','6');
  await browser.click('[data-bottom-tab="prototype"]');
  await browser.click('#add-flow');
  await browser.click('#add-interaction');
  await browser.click('#add-vguide');
  await assertShell('penpot-cleanroom');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#blend-mode')&&document.querySelector('.prototype-grid')&&document.querySelector('.guide-line'))`),true,'penpot clean-room: effects/prototype/guides visible');
  await browser.screenshot(path.join(out,'10-penpot-cleanroom-1600x900.png'));

  await browser.click('[data-bottom-tab="interchange"]');
  await assertShell('platform-interchange');
  const interchange=await browser.evaluate(`(()=>{const cards=[...document.querySelectorAll('.platform-card')];return {cards:cards.length,imports:cards.filter(x=>/Import/.test(x.textContent||'')).length,exports:document.querySelectorAll('[data-export-platform]').length,text:document.querySelector('.bottom-content')?.textContent||''}})()`);
  assert.ok(interchange.cards>=8,'interchange: expected platform cards');
  assert.ok(interchange.imports>=5,'interchange: expected multiple importers');
  assert.ok(interchange.exports>=8,'interchange: expected multiple exporters');
  assert.match(interchange.text,/Penpot v3/);
  assert.match(interchange.text,/Figma REST-style JSON bridge/);
  await browser.screenshot(path.join(out,'11-platform-interchange-1600x900.png'));

  // Storybook-inspired Component Lab: story hierarchy, controls, globals, test addons and preview must coexist cleanly.
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const labComponent=await browser.evaluate(`AstroUIDesigner.createReusableComponent('StatusCard')`);
  await browser.evaluate(`AstroUIDesigner.addComponentProp(${JSON.stringify(labComponent)},{name:'title',type:'string',default:'System Status'});true`);
  const labStory=await browser.evaluate(`AstroUIDesigner.createStory(${JSON.stringify(labComponent)},'Healthy')`);
  await browser.evaluate(`AstroUIDesigner.openStory(${JSON.stringify(labComponent)},${JSON.stringify(labStory)})`);
  await assertShell('component-lab');
  assert.equal(await browser.evaluate(`document.querySelector('.canvas-area').classList.contains('view-lab')`),true,'component lab: dedicated canvas mode active');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#lab-story-list .lab-story-item')&&document.querySelector('[data-lab-arg="title"]')&&document.querySelector('#lab-preview-frame'))`),true,'component lab: stories, controls and preview visible');
  await browser.screenshot(path.join(out,'12-component-lab-1600x900.png'));
  await setViewport(1366,768);
  await assertShell('component-lab-compact');
  assert.equal(await browser.evaluate(`document.querySelector('.canvas-area').classList.contains('view-lab')`),true,'component lab compact: active');
  const compactGlobals=await browser.evaluate(`(()=>{const g=document.querySelector('.lab-globals');const labels=[...g.querySelectorAll('label')];const r=g.getBoundingClientRect();return {scrollWidth:g.scrollWidth,clientWidth:g.clientWidth,labels:labels.map(x=>{const q=x.getBoundingClientRect();return {text:(x.textContent||'').trim(),left:q.left,right:q.right,top:q.top,bottom:q.bottom,visible:q.right<=r.right+1&&q.left>=r.left-1&&q.bottom<=r.bottom+1&&q.top>=r.top-1}})}})()`);
  assert.ok(compactGlobals.scrollWidth<=compactGlobals.clientWidth+1,'component lab compact: globals must wrap instead of horizontal scrolling');
  assert.equal(compactGlobals.labels.every(x=>x.visible),true,'component lab compact: every global control must remain discoverable');
  await browser.screenshot(path.join(out,'13-component-lab-compact-1366x768.png'));


  // Plasmic-inspired clean-room composition workspace: contracts, mixins, global variants, queries and usages.
  await setViewport(1600,900);
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const compositionCard=await browser.evaluate(`AstroUIDesigner.insert('card')`);
  await browser.evaluate(`AstroUIDesigner.addMixin('Card Surface',{background:'#fff',borderRadius:'14px'});AstroUIDesigner.addGlobalVariant('Brand',['default','contrast']);AstroUIDesigner.addQuery('products','static');AstroUIDesigner.select(${JSON.stringify(compositionCard)});true`);
  await browser.click('[data-right-tab="composition"]');
  await browser.click('[data-node-mixin]');
  await browser.click('[data-bottom-tab="usages"]');
  await assertShell('plasmic-composition');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#new-mixin')&&document.querySelector('#new-global-variant')&&document.querySelector('#usage-ref'))`),true,'plasmic composition: inspector and usage workbench visible');
  assert.match(await browser.evaluate(`document.querySelector('#bottom-content')?.textContent||''`),/1 usage/,'plasmic composition: applied mixin is discoverable through project-wide usage search');
  await browser.screenshot(path.join(out,'14-plasmic-composition-1600x900.png'));

  // Manual layout clean-room workbench: rulers, guide, multi-selection, spacing and direct geometry controls.
  await setViewport(1600,900);
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const manualFreeform=await browser.evaluate(`AstroUIDesigner.insert('freeform')`);
  const manualA=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(manualFreeform)})`);
  const manualB=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(manualFreeform)})`);
  const manualC=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(manualFreeform)})`);
  for(const [id,x,y] of [[manualA,60,90],[manualB,280,90],[manualC,500,90]]) await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'position','absolute');AstroUIDesigner.setStyle(${JSON.stringify(id)},'left','${x}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'top','${y}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'width','150px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'height','88px');true`);
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(manualA)});AstroUIDesigner.select(${JSON.stringify(manualB)},{add:true});AstroUIDesigner.select(${JSON.stringify(manualC)},{add:true});true`);
  await browser.click('#manual-tools-btn');
  await browser.click('#ml-add-v-guide');
  await browser.click('#manual-spacing-btn');
  await browser.click('#ml-layout-guide');
  await browser.click('[data-right-tab="layout"]');
  await assertShell('manual-layout');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('.canvas-ruler')&&document.querySelector('.guide-line')&&document.querySelector('.smart-spacing-handle')&&document.querySelector('#manual-tidy'))`),true,'manual layout: rulers, guide, smart spacing and workbench visible');
  await browser.screenshot(path.join(out,'15-manual-layout-1600x900.png'));

  // Compact direct text/content alignment controls in the Layout inspector.
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const alignRow=await browser.evaluate(`AstroUIDesigner.insert('row')`);
  await browser.evaluate(`AstroUIDesigner.insert('heading',${JSON.stringify(alignRow)});AstroUIDesigner.insert('button',${JSON.stringify(alignRow)});AstroUIDesigner.select(${JSON.stringify(alignRow)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-text-align="center"]');
  await browser.click('[data-content-align="x:center"]');
  await browser.click('[data-content-align="y:center"]');
  await assertShell('alignment-controls');
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-text-align]').length`),4,'alignment controls: text buttons visible');
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-content-align]').length`),6,'alignment controls: content buttons visible');
  await browser.screenshot(path.join(out,'16-alignment-controls-1600x900.png'));

  // Structured CSS editing workbench: pseudo states, box model and compound editors.
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const cssCard=await browser.evaluate(`AstroUIDesigner.insert('card')`);
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(cssCard)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-manual-quick="css"]');
  await browser.click('[data-css-pseudo="hover"]');
  await assertShell('css-tools');
  assert.ok(await browser.evaluate(`document.querySelectorAll('.css-tool-card').length`)>=10,'css tools: compound editors visible');
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-css-pseudo]').length`),6,'css tools: pseudo state tabs visible');
  await browser.screenshot(path.join(out,'17-css-tools-1600x900.png'));

  console.log('visual-smoke: OK (17 rendered checkpoints)');
} finally {
  await browser.close();
}

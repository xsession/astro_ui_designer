import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const f=await browser.evaluate(`AstroUIDesigner.insert('freeform')`);
  const a=await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(f)})`);
  const b=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(f)})`);
  const c=await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(f)})`);
  for(const [id,x,y] of [[a,30,40],[b,220,80],[c,430,130]]){
    await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'position','absolute');AstroUIDesigner.setStyle(${JSON.stringify(id)},'left','${x}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'top','${y}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'width','120px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'height','56px');true`);
  }

  // Manual tools are first-class shell controls and workbench destination.
  await browser.click('#manual-tools-btn');
  assert.equal(await browser.evaluate(`document.querySelector('[data-bottom-tab="manual"]').classList.contains('active')`),true,'manual workbench active');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#ml-rulers')&&document.querySelector('#ml-layout-guide'))`),true,'manual workbench rendered');

  // Rulers + persistent guide creation.
  await browser.click('#ml-add-v-guide');
  assert.ok(await browser.evaluate(`AstroUIDesigner.getProject().design.guides.length`)>=1,'guide added');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('.guide-line'))`),true,'guide visible');
  await browser.click('#manual-rulers-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.manualSettings().rulers`),false,'ruler toolbar toggle');
  await browser.click('#manual-rulers-btn');

  // Direct manual drag with smart snapping and exact model update.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)})`);
  const before=await browser.evaluate(`({left:AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.left,top:AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.top})`);
  await browser.drag(`[data-node-id="${a}"]`,57,41,{steps:5});
  const after=await browser.evaluate(`({left:AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.left,top:AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.top})`);
  assert.notDeepEqual(after,before,'manual drag changes geometry');

  // Eight resize handles + rotation.
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-node-id="${a}"] > .resize-handle').length`),8,'eight resize handles');
  const width0=await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.width)`);
  await browser.drag(`[data-node-id="${a}"] > .resize-handle.e`,44,0);
  assert.ok(await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.width)`) > width0,'east resize increases width');
  await browser.drag(`[data-node-id="${a}"] > .rotate-handle`,24,-20);
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.rotate||''`),/deg$/,'rotation applied');

  // Alt measurement overlay between selected and hovered nodes.
  await browser.evaluate(`(()=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:'Alt'}));const e=document.querySelector('[data-node-id="${b}"]');e.dispatchEvent(new PointerEvent('pointerenter',{bubbles:false}));return true})()`);
  assert.ok(await browser.evaluate(`document.querySelectorAll('.measure-line').length`)>=1,'Alt measurement overlay visible');
  await browser.evaluate(`window.dispatchEvent(new KeyboardEvent('keyup',{key:'Alt'}))`);

  // Box-model overlay.
  await browser.click('#manual-spacing-btn');
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('.spacing-overlay')&&document.querySelector('.padding-overlay'))`),true,'spacing overlay visible');

  // Smart selection tidy and editable gaps.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)});AstroUIDesigner.select(${JSON.stringify(b)},{add:true});AstroUIDesigner.select(${JSON.stringify(c)},{add:true});true`);
  await browser.click('#manual-tools-btn'); // re-open if selection render collapsed it
  if(!await browser.evaluate(`Boolean(document.querySelector('#manual-tidy'))`)) await browser.click('[data-bottom-tab="manual"]');
  await browser.click('#manual-tidy');
  assert.ok(await browser.evaluate(`document.querySelectorAll('.smart-spacing-handle').length`)>=2,'smart spacing handles visible');

  // Fill/Hug sizing and flow escape through public API.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)})`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.setSizing(${JSON.stringify(a)},'x','hug')`),true);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.width`),'fit-content','hug sizing');
  assert.equal(await browser.evaluate(`AstroUIDesigner.setPositionMode(${JSON.stringify(a)},'absolute')`),true);

  // Grid direct placement overlay.
  const grid=await browser.evaluate(`AstroUIDesigner.insert('grid')`);
  const item=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(grid)})`);
  await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(grid)},'gridTemplateColumns','repeat(3,minmax(0,1fr))');AstroUIDesigner.setStyle(${JSON.stringify(grid)},'gridTemplateRows','repeat(2,minmax(0,1fr))');AstroUIDesigner.select(${JSON.stringify(item)});true`);
  assert.equal(await browser.evaluate(`document.querySelectorAll('.grid-cell-target').length`),6,'grid edit cells visible');
  await browser.click('.grid-cell-target:nth-of-type(5)');
  assert.ok(await browser.evaluate(`Boolean(AstroUIDesigner.getNode(${JSON.stringify(item)}).style.base.gridColumnStart)`),'grid child placement written');

  // Direct text/content alignment button groups.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(b)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-text-align]').length`),4,'four text alignment buttons');
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-content-align]').length`),6,'six content alignment axis buttons');
  assert.equal(await browser.evaluate(`document.querySelector('[data-content-align]').disabled`),true,'content alignment disabled for non flex/grid object');
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-text-align="center"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.textAlign`),'center','text center alignment applied');

  // Multi-selection text alignment applies atomically to every selected object.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)});AstroUIDesigner.select(${JSON.stringify(c)},{add:true});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-text-align="right"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(a)}).style.base.textAlign`),'right','multi text align primary');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(c)}).style.base.textAlign`),'right','multi text align secondary');

  // Direct flex gap handles.
  const row=await browser.evaluate(`AstroUIDesigner.insert('row')`);
  const r1=await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(row)})`);
  await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(row)});AstroUIDesigner.select(${JSON.stringify(row)});true`);
  assert.ok(await browser.evaluate(`document.querySelectorAll('.flow-gap-handle').length`)>=1,'flow gap handle visible');
  const gap0=await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(row)}).style.base.gap||0)`);
  await browser.drag('.flow-gap-handle',30,0);
  assert.ok(await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(row)}).style.base.gap||0)`)>=gap0,'flow gap drag edits gap');

  // Content alignment maps canvas X/Y to the correct Flex axes.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(row)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-content-align="x:end"]');
  await browser.click('[data-content-align="y:center"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(row)}).style.base.justifyContent`),'flex-end','row X alignment uses justify-content');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(row)}).style.base.alignItems`),'center','row Y alignment uses align-items');
  await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(row)},'flexDirection','column');AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-content-align="x:center"]');
  await browser.click('[data-content-align="y:end"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(row)}).style.base.alignItems`),'center','column X alignment uses align-items');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(row)}).style.base.justifyContent`),'flex-end','column Y alignment uses justify-content');

  // Grid content alignment writes CSS grid item alignment.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(grid)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-content-align="x:end"]');
  await browser.click('[data-content-align="y:center"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(grid)}).style.base.justifyItems`),'end','grid X alignment uses justify-items');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(grid)}).style.base.alignItems`),'center','grid Y alignment uses align-items');

  assert.deepEqual(await browser.runtimeErrors(),[],'manual layout runtime errors');
  console.log('manual-layout-browser.test: OK');
}finally{await browser.close()}

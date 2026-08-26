import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';
const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate('AstroUIDesigner.reset()');
  const f=await browser.evaluate(`AstroUIDesigner.insert('freeform')`);
  const ids=[];for(let i=0;i<3;i++)ids.push(await browser.evaluate(`AstroUIDesigner.insert('button',${JSON.stringify(f)})`));
  async function place(){for(const [id,x,y,w,h] of [[ids[0],24,24,100,40],[ids[1],180,100,120,48],[ids[2],350,190,140,56]])await browser.evaluate(`AstroUIDesigner.setStyle(${JSON.stringify(id)},'left','${x}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'top','${y}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'width','${w}px');AstroUIDesigner.setStyle(${JSON.stringify(id)},'height','${h}px');true`)}
  async function selectAll(){await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(ids[0])});AstroUIDesigner.select(${JSON.stringify(ids[1])},{add:true});AstroUIDesigner.select(${JSON.stringify(ids[2])},{add:true});true`)}
  const buttons={left:'#align-left-btn',right:'#align-right-btn',hcenter:'#align-hcenter-btn',top:'#align-top-btn',bottom:'#align-bottom-btn',vcenter:'#align-vcenter-btn'};
  for(const [mode,sel] of Object.entries(buttons)){
    await place();await selectAll();await browser.click(sel);
    const r=await browser.evaluate(`(${JSON.stringify(ids)}).map(id=>{const n=AstroUIDesigner.getNode(id),s=n.style.base;return {l:+parseFloat(s.left),t:+parseFloat(s.top),w:+parseFloat(s.width),h:+parseFloat(s.height)}})`);
    const vals=mode==='left'?r.map(x=>x.l):mode==='right'?r.map(x=>x.l+x.w):mode==='hcenter'?r.map(x=>x.l+x.w/2):mode==='top'?r.map(x=>x.t):mode==='bottom'?r.map(x=>x.t+x.h):r.map(x=>x.t+x.h/2);
    assert.ok(Math.max(...vals)-Math.min(...vals)<=1,`align ${mode}`);
  }
  // Distribute horizontally / vertically preserve ordering and approximately equal gaps.
  await place();await selectAll();await browser.click('#dist-h-btn');
  let rr=await browser.evaluate(`(${JSON.stringify(ids)}).map(id=>{const s=AstroUIDesigner.getNode(id).style.base;return {l:+parseFloat(s.left),w:+parseFloat(s.width)}}).sort((a,b)=>a.l-b.l)`);
  let gaps=[rr[1].l-(rr[0].l+rr[0].w),rr[2].l-(rr[1].l+rr[1].w)];assert.ok(Math.abs(gaps[0]-gaps[1])<=1,'distribute horizontal');
  await place();await selectAll();await browser.click('#dist-v-btn');
  rr=await browser.evaluate(`(${JSON.stringify(ids)}).map(id=>{const s=AstroUIDesigner.getNode(id).style.base;return {t:+parseFloat(s.top),h:+parseFloat(s.height)}}).sort((a,b)=>a.t-b.t)`);gaps=[rr[1].t-(rr[0].t+rr[0].h),rr[2].t-(rr[1].t+rr[1].h)];assert.ok(Math.abs(gaps[0]-gaps[1])<=1,'distribute vertical');

  // Keyboard nudge uses grid, Alt uses 1 px, Shift resizes.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(ids[0])})`);const x0=await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(ids[0])}).style.base.left)`);await browser.key('ArrowRight',{code:'ArrowRight',keyCode:39});assert.equal(await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(ids[0])}).style.base.left)`),x0+8,'grid keyboard nudge');
  await browser.key('ArrowLeft',{code:'ArrowLeft',keyCode:37,alt:true,modifiers:1});assert.equal(await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(ids[0])}).style.base.left)`),x0+7,'1px Alt nudge');
  const h0=await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(ids[0])}).style.base.height)`);await browser.key('ArrowDown',{code:'ArrowDown',keyCode:40,shift:true,modifiers:8});assert.equal(await browser.evaluate(`parseFloat(AstroUIDesigner.getNode(${JSON.stringify(ids[0])}).style.base.height)`),h0+8,'Shift+Arrow resize');

  // Node context menu: real right-click event, lock/unlock and z-order command surface.
  await browser.evaluate(`(()=>{const e=document.querySelector('[data-node-id="${ids[0]}"]'),r=e.getBoundingClientRect();e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.left+5,clientY:r.top+5}));return true})()`);
  assert.ok(await browser.evaluate(`document.querySelectorAll('.node-context button').length`)>=10,'node context menu commands');
  await browser.evaluate(`{const b=[...document.querySelectorAll('.node-context button')].find(x=>x.textContent.trim()==='Lock');b.click();true}`);assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(ids[0])}).meta.locked`),true,'context menu lock');
  await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(ids[0])})`);

  // Accessibility/tab-order metadata through Property editor and source generation.
  await browser.click('[data-right-tab="properties"]');await browser.change('#obj-locked','',{checked:false});await browser.change('#obj-aria','Primary action');await browser.change('#obj-role','button');await browser.change('#obj-title','Run operation');await browser.change('#obj-tabindex','3');
  const files=await browser.evaluate(`AstroUIDesigner.generate()`);const pageFile=Object.entries(files).find(([k])=>k.startsWith('src/pages/'))?.[1]||'';assert.match(pageFile,/aria-label="Primary action"/);assert.match(pageFile,/role="button"/);assert.match(pageFile,/title="Run operation"/);assert.match(pageFile,/tabindex="3"/);

  // Wrap and sibling ordering toolbar functions.
  await browser.evaluate('AstroUIDesigner.reset()');const a=await browser.evaluate(`AstroUIDesigner.insert('text')`);const b=await browser.evaluate(`AstroUIDesigner.insert('button')`);await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(a)})`);await browser.click('#wrap-row-btn');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children[0].type`),'row','wrap row');
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(b)})`);await browser.click('#move-up-btn');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children[0].id`),b,'move sibling up');await browser.click('#move-down-btn');assert.notEqual(await browser.evaluate(`AstroUIDesigner.getProject().pages[0].root.children[0].id`),b,'move sibling down');

  assert.deepEqual(await browser.runtimeErrors(),[],'interaction runtime errors');
  console.log('interaction-parity.test: OK (align/distribute, keyboard nudge/resize, context menu, accessibility/tab order, wrapping/order)');
}finally{await browser.close()}

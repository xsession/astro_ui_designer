import assert from 'node:assert/strict';
import path from 'node:path';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const card=await browser.evaluate(`AstroUIDesigner.insert('card')`);
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(card)});AstroUIDesigner.setStyle(${JSON.stringify(card)},'border','1px solid var(--color-border)');AstroUIDesigner.openResearchPanel('right','layout');true`);

  // Layout inspector: compound CSS stays editable as text and receives a paired picker.
  assert.equal(await browser.evaluate(`document.querySelector('#s-Appearance-border')?.closest('.color-code-control')?.querySelectorAll('[data-color-picker]').length`),1,'Layout border has a color picker');
  await browser.evaluate(`(()=>{const p=document.querySelector('#s-Appearance-border').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#ff3300';p.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.border`),'1px solid #ff3300','compound border keeps width/style');

  // CSS Tools: gradient stops, background, border, shadow and type colors expose pickers.
  await browser.evaluate(`AstroUIDesigner.openCssTools()`);
  assert.ok(await browser.evaluate(`document.querySelectorAll('.css-tools-grid [data-color-picker]').length`)>=7,'CSS Tools renders color pickers');
  await browser.evaluate(`(()=>{const p=document.querySelector('#css-gradient-a').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#0f766e';p.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#css-gradient-b').value='#38bdf8';return true})()`);
  await browser.click('#css-apply-gradient');
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.backgroundImage`),/#0f766e/,'gradient picker updates stop without losing gradient structure');

  // Penpot-style Effects: fills, strokes and shadows all use the same paired control.
  await browser.evaluate(`AstroUIDesigner.openResearchPanel('right','effects')`);
  await browser.click('#add-fill');
  await browser.click('#add-stroke');
  await browser.click('#add-shadow');
  assert.ok(await browser.evaluate(`document.querySelectorAll('#right-content [data-color-picker]').length`)>=3,'Effects exposes fill/stroke/shadow pickers');
  await browser.evaluate(`(()=>{const p=document.querySelector('[data-fill-color="0"]').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#22c55e';p.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).design.effects.fills[0].color`),'#22c55e','fill picker updates design effect');

  // Design tokens: color-valued tokens keep the raw token text beside a picker.
  await browser.evaluate(`AstroUIDesigner.openResearchPanel('bottom','tokens')`);
  assert.equal(await browser.evaluate(`document.querySelector('[data-token-val="color-primary"]')?.closest('.color-code-control')?.querySelectorAll('[data-color-picker]').length`),1,'color-primary token has picker');
  await browser.evaluate(`(()=>{const p=document.querySelector('[data-token-val="color-primary"]').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#7c3aed';p.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().theme.themes[AstroUIDesigner.getProject().theme.active].tokens['color-primary']`),'#7c3aed','token picker updates active theme');

  // Manual layout guide colors are no longer hidden model-only values.
  await browser.evaluate(`AstroUIDesigner.openResearchPanel('bottom','manual')`);
  assert.equal(await browser.evaluate(`document.querySelector('#ml-lg-color')?.closest('.color-code-control')?.querySelectorAll('[data-color-picker]').length`),1,'layout guide color has picker');
  await browser.evaluate(`(()=>{const p=document.querySelector('#ml-lg-color').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#2563eb';p.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().manualLayout.layoutGuides.base.color`),'#2563eb','layout guide picker updates model');
  await browser.click('#ml-add-v-guide');
  assert.equal(await browser.evaluate(`document.querySelector('[data-guide-color]')?.closest('.color-code-control')?.querySelectorAll('[data-color-picker]').length`),1,'persistent guide row has picker');

  // Animation keyframe values become picker-aware when the track animates a color property.
  await browser.evaluate(`AstroUIDesigner.addAnimationTrack(${JSON.stringify(card)},'color');AstroUIDesigner.openResearchPanel('bottom','animation');true`);
  await browser.click('.animation-keyframe');
  assert.equal(await browser.evaluate(`document.querySelector('#anim-kf-value')?.closest('.color-code-control')?.querySelectorAll('[data-color-picker]').length`),1,'color animation keyframe has picker');
  await browser.evaluate(`(()=>{const p=document.querySelector('#anim-kf-value').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#e11d48';p.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).timeline.tracks.find(t=>t.property==='color').keyframes[0].value`),'#e11d48','animation picker updates keyframe value');

  // Storybook-style Controls: inferred color controls retain a raw editable CSS value.
  const componentId=await browser.evaluate(`AstroUIDesigner.createReusableComponent('ColorCard')`);
  await browser.evaluate(`AstroUIDesigner.addComponentProp(${JSON.stringify(componentId)},{name:'accentColor',type:'string',default:'#336699'});true`);
  const storyId=await browser.evaluate(`AstroUIDesigner.createStory(${JSON.stringify(componentId)},'Default')`);
  await browser.evaluate(`AstroUIDesigner.openStory(${JSON.stringify(componentId)},${JSON.stringify(storyId)});true`);
  assert.equal(await browser.evaluate(`document.querySelector('[data-lab-arg="accentColor"]')?.closest('.color-code-control')?.querySelectorAll('[data-color-picker]').length`),1,'Component Lab color control has paired picker');
  await browser.evaluate(`(()=>{const p=document.querySelector('[data-lab-arg="accentColor"]').closest('.color-code-control').querySelector('[data-color-picker]');p.value='#f59e0b';p.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(componentId)}).stories.find(s=>s.id===${JSON.stringify(storyId)}).args.accentColor`),'#f59e0b','Component Lab picker updates story arg');

  // Capture a useful visual checkpoint with CSS Tools + Effects visible together.
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(card)});AstroUIDesigner.setMode('design');AstroUIDesigner.openResearchPanel('right','effects');AstroUIDesigner.openCssTools();true`);
  await browser.screenshot(path.resolve('tests/screenshots/18-color-pickers-1600x900.png'),{width:1600,height:900});
  assert.deepEqual(await browser.runtimeErrors(),[],'color picker runtime errors');
  console.log('color-picker-browser.test: OK');
}finally{await browser.close()}

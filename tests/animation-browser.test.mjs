import assert from 'node:assert/strict';
import path from 'node:path';
import { DesignerBrowser } from './cdp-harness.mjs';
const b=new DesignerBrowser(path.resolve('.'));
try{
  await b.start({width:1600,height:900});
  await b.evaluate(`AstroUIDesigner.reset()`);
  const card=await b.evaluate(`AstroUIDesigner.insert('card')`);
  await b.click('[data-bottom-tab="animation"]');
  assert.equal(await b.evaluate(`Boolean(document.querySelector('.animation-editor'))`),true,'animation editor visible');
  await b.change('#anim-preset','fadeUp');await b.click('#anim-apply-preset');
  let node=await b.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)})`);assert.equal(node.timeline.tracks.length,2,'preset creates tracks');
  assert.equal(await b.evaluate(`document.querySelectorAll('.animation-track-row').length`),2,'track rows rendered');
  await b.change('#anim-engine','css');await b.change('#anim-trigger','hover');await b.change('#anim-duration','760');await b.change('#anim-delay','90');await b.change('#anim-reduced-motion','shorten');
  assert.equal(await b.evaluate(`document.querySelector('.backend-badge').textContent.trim()`),'CSS','effective backend badge');
  assert.ok((await b.evaluate(`document.querySelector('.animation-code').textContent`)).includes('@keyframes'),'CSS code generated');assert.ok((await b.evaluate(`document.querySelector('.animation-code').textContent`)).includes('prefers-reduced-motion'),'reduced motion CSS');
  await b.click('#anim-code-js');assert.ok((await b.evaluate(`document.querySelector('.animation-code').textContent`)).includes('.animate(keyframes, options)'),'JS code generated');
  // Keyframe editing and drag.
  await b.click('.animation-keyframe');assert.equal(await b.evaluate(`Boolean(document.querySelector('#anim-kf-value'))`),true,'keyframe inspector');
  await b.change('#anim-kf-value','0.15');node=await b.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)})`);assert.equal(node.timeline.tracks[0].keyframes[0].value,'0.15');
  const before=node.timeline.tracks[0].keyframes[0].at;await b.evaluate(`(()=>{const key=document.querySelector('.animation-keyframe'),lane=key.closest('.animation-lane'),kr=key.getBoundingClientRect(),lr=lane.getBoundingClientRect();key.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:kr.left+kr.width/2,clientY:kr.top+kr.height/2,pointerId:1}));document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:lr.left+lr.width*.32,clientY:kr.top,pointerId:1}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:lr.left+lr.width*.32,clientY:kr.top,pointerId:1}));return true})()`);node=await b.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)})`);assert.notEqual(node.timeline.tracks[0].keyframes[0].at,before,'keyframe drag changes offset');
  // Scrub and transport controls.
  await b.evaluate(`(()=>{const e=document.querySelector('#animation-playhead-range');e.value='40';e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);assert.ok((await b.evaluate(`document.querySelector('#animation-time-label').textContent`)).includes('ms'));
  await b.click('#anim-play');await b.click('#anim-pause');await b.click('#anim-reverse');await b.click('#anim-stop');
  // Scroll-driven CSS controls.
  await b.click('#anim-code-css');
  await b.change('#anim-trigger','scroll');assert.equal(await b.evaluate(`Boolean(document.querySelector('#anim-scroll-timeline'))`),true,'scroll timeline settings');
  assert.ok((await b.evaluate(`document.querySelector('.animation-code').textContent`)).includes('animation-timeline'),'scroll CSS code');
  // WAAPI export registry.
  await b.change('#anim-engine','waapi');await b.change('#anim-trigger','click');const files=await b.evaluate(`AstroUIDesigner.generate()`);assert.ok(files['src/scripts/ui-animation-definitions.ts'].includes(card),'WAAPI definitions exported');
  assert.deepEqual(await b.runtimeErrors(),[],'animation editor runtime errors');
  console.log('animation-browser.test: OK (timeline UI, transport, keyframes, CSS/JS, scroll, export)');
}finally{await b.close()}

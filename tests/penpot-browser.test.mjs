import assert from 'node:assert/strict';
import path from 'node:path';
import { DesignerBrowser } from './cdp-harness.mjs';

const b=new DesignerBrowser(path.resolve('.'));
try{
  await b.start({width:1600,height:900});
  await b.evaluate(`AstroUIDesigner.reset()`);
  const id=await b.evaluate(`AstroUIDesigner.insert('card')`);
  await b.click('[data-right-tab="effects"]');
  assert.equal(await b.evaluate(`Boolean(document.querySelector('#blend-mode')&&document.querySelector('#add-fill')&&document.querySelector('#add-shadow'))`),true,'effects inspector rendered');
  await b.click('#add-fill');await b.click('#add-shadow');await b.click('#add-stroke');await b.change('#background-blur','5');await b.change('#blend-mode','multiply');
  await b.change('[data-stroke-style="0"]','dashed');await b.change('[data-stroke-dash="0"]','9');await b.change('[data-stroke-gap="0"]','4');
  let node=await b.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(id)})`);
  assert.equal(node.design.effects.fills.length,1);assert.equal(node.design.effects.shadows.length,1);assert.equal(node.design.effects.strokes.length,1);assert.equal(node.design.effects.strokes[0].style,'dashed');assert.equal(Number(node.design.effects.strokes[0].dash),9);assert.equal(Number(node.design.effects.strokes[0].gap),4);assert.equal(node.design.effects.blendMode,'multiply');assert.equal(node.style.base.backdropFilter,'blur(5px)');

  await b.click('[data-bottom-tab="prototype"]');await b.click('#add-flow');await b.click('#add-interaction');await b.click('#add-vguide');
  node=await b.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(id)})`);let project=await b.evaluate(`AstroUIDesigner.getProject()`);
  assert.equal(node.design.interactions.length,1);assert.equal(project.design.flows.length,1);assert.equal(project.design.guides.length,1);
  await b.change('[data-int-action="0"]','openUrl');await b.change('[data-int-dest="0"]','https://example.com');
  node=await b.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(id)})`);assert.equal(node.design.interactions[0].url,'https://example.com');

  await b.evaluate(`window.prompt=()=> 'Review this element'`);await b.click('[data-bottom-tab="comments"]');await b.click('#add-comment');
  project=await b.evaluate(`AstroUIDesigner.getProject()`);assert.equal(project.design.comments.length,1);assert.equal(project.design.comments[0].nodeId,id);

  await b.evaluate(`window.prompt=()=> 'Shared UI Library'`);await b.click('[data-bottom-tab="libraries"]');await b.click('#publish-library');project=await b.evaluate(`AstroUIDesigner.getProject()`);assert.equal(project.design.libraries.length,1);
  await b.click('[data-bottom-tab="inspect"]');assert.equal(await b.evaluate(`document.querySelectorAll('.inspect-grid pre').length`),2,'inspect CSS/HTML rendered');
  await b.click('[data-bottom-tab="interchange"]');const info=await b.evaluate(`({cards:document.querySelectorAll('.platform-card').length,exports:document.querySelectorAll('[data-export-platform]').length,text:document.querySelector('.bottom-content').textContent})`);
  assert.ok(info.cards>=8);assert.ok(info.exports>=8);assert.match(info.text,/Penpot v3/);assert.match(info.text,/Figma REST-style JSON bridge/);assert.match(info.text,/Static HTML/);assert.match(info.text,/SVG/);

  const generated=await b.evaluate(`AstroUIDesigner.generate()`);const page=generated['src/pages/index.astro'];assert.match(page,/data-ui-prototype=/);assert.match(generated['src/styles/global.css'],/backdrop-filter: blur\(5px\)/);
  assert.deepEqual(await b.runtimeErrors(),[]);
  console.log('penpot-browser.test: OK (effects/strokes, prototype, comments, libraries, inspect, interchange)');
} finally { await b.close(); }

import assert from 'node:assert/strict';
import path from 'node:path';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const card=await browser.evaluate(`AstroUIDesigner.insert('card')`);
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(card)});AstroUIDesigner.openResearchPanel('right','layout');true`);
  await browser.click('[data-manual-quick="css"]');
  assert.equal(await browser.evaluate(`document.querySelector('[data-bottom-tab="css"]').classList.contains('active')`),true,'CSS Tools tab active');
  assert.ok(await browser.evaluate(`document.querySelectorAll('.css-tool-card').length`)>=10,'compound CSS utility cards rendered');
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-css-pseudo]').length`),6,'pseudo state tabs rendered');

  // Box model side editing.
  await browser.evaluate(`(()=>{const e=document.querySelector('[data-css-quad="padding:0"]');e.value='32px';e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.padding`),/^32px/,'padding top edited');

  // Gradient builder.
  await browser.evaluate(`(()=>{document.querySelector('#css-gradient-type').value='linear';document.querySelector('#css-gradient-angle').value='45';document.querySelector('#css-gradient-a').value='#0f172a';document.querySelector('#css-gradient-b').value='#38bdf8';return true})()`);
  await browser.click('#css-apply-gradient');
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.backgroundImage`),/linear-gradient\(45deg/,'gradient applied');

  // Shadow preset and structured transform/transition utilities.
  await browser.click('[data-css-shadow-preset="soft"]');
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.boxShadow`),/rgba/,'shadow preset applied');
  await browser.evaluate(`(()=>{document.querySelector('#css-transform-x').value='12';document.querySelector('#css-transform-rotate').value='6';return true})()`);
  await browser.click('#css-apply-transform');
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.transform`),/translate\(12px, 0px\).*rotate\(6deg\)/,'transform builder applied');
  await browser.click('[data-css-transition-preset="smooth"]');
  assert.match(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.transition`),/280ms/,'transition preset applied');

  // Pseudo state layer edits export without contaminating base style.
  await browser.click('[data-css-pseudo="hover"]');
  await browser.evaluate(`(()=>{document.querySelector('#css-bg-color').value='#111827';return true})()`);
  await browser.click('#css-apply-bg');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).cssStates.hover.backgroundColor`),'#111827','hover style stored');
  assert.notEqual(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).style.base.backgroundColor||''`),'#111827','hover style isolated from base');

  // Local CSS variables.
  await browser.evaluate(`(()=>{document.querySelector('#css-var-name').value='card-accent';document.querySelector('#css-var-value').value='#f97316';return true})()`);
  await browser.click('#css-var-add');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(card)}).cssVariables['--card-accent']`),'#f97316','element CSS variable added');

  const generated=await browser.evaluate(`document.querySelector('#css-generated-preview').textContent`);
  assert.match(generated,/--card-accent/,'generated CSS includes custom property');
  assert.match(generated,/:hover/,'generated CSS includes pseudo selector');

  const files=await browser.evaluate(`AstroUIDesigner.generate()`);
  assert.match(files['src/styles/global.css'],/:hover/,'Astro export includes pseudo styles');
  assert.match(files['src/styles/global.css'],/--card-accent:\s*#f97316/,'Astro export includes element variable');

  await browser.click('#css-clear-transform');
  await browser.screenshot(path.resolve('tests/screenshots/17-css-tools-1600x900.png'),{width:1600,height:900});
  assert.deepEqual(await browser.runtimeErrors(),[],'CSS workbench runtime errors');
  console.log('css-tools-browser.test: OK');
}finally{await browser.close()}

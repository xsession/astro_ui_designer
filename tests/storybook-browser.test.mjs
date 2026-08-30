import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const cid=await browser.evaluate(`AstroUIDesigner.createReusableComponent('LabCard')`);
  assert.ok(cid,'component created');
  await browser.evaluate(`AstroUIDesigner.addComponentProp(${JSON.stringify(cid)},{name:'title',type:'string',default:'Hello',description:'Card title'});AstroUIDesigner.addComponentProp(${JSON.stringify(cid)},{name:'disabled',type:'boolean',default:false});AstroUIDesigner.addComponentProp(${JSON.stringify(cid)},{name:'count',type:'number',default:2});AstroUIDesigner.addComponentProp(${JSON.stringify(cid)},{name:'tone',type:'enum',default:'primary',options:['primary','danger']});true`);
  const sid=await browser.evaluate(`AstroUIDesigner.createStory(${JSON.stringify(cid)},'Primary')`);
  assert.ok(sid,'story created');
  assert.equal(await browser.evaluate(`AstroUIDesigner.openStory(${JSON.stringify(cid)},${JSON.stringify(sid)})`),true,'story opened');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().mode`),'lab','lab mode active');
  assert.equal(await browser.evaluate(`document.querySelectorAll('.lab-story-item').length`),1,'story hierarchy populated');
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-lab-arg]').length`),4,'controls generated from props');

  // Args/Controls update the story model.
  await browser.evaluate(`{const e=document.querySelector('[data-lab-arg="title"]');e.value='Changed title';e.dispatchEvent(new Event('change',{bubbles:true}));true}`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).stories.find(s=>s.id===${JSON.stringify(sid)}).args.title`),'Changed title','control updates args');
  await browser.evaluate(`{const e=document.querySelector('[data-lab-arg="disabled"]');e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));true}`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).stories.find(s=>s.id===${JSON.stringify(sid)}).args.disabled`),true,'boolean control');

  // Globals toolbar.
  await browser.change('#lab-viewport','mobile');
  await browser.change('#lab-background','dark');
  await browser.change('#lab-direction','rtl');
  await browser.change('#lab-layout','fullscreen');
  assert.equal(await browser.evaluate(`document.querySelector('#lab-preview-frame').style.width`),'390px','mobile viewport applied');
  assert.equal(await browser.evaluate(`document.querySelector('#lab-preview-frame').classList.contains('story-layout-fullscreen')`),true,'story layout global applied');
  assert.equal(await browser.evaluate(`document.querySelector('#lab-preview-frame').dir`),'rtl','direction applied');
  await browser.click('#lab-grid');
  assert.equal(await browser.evaluate(`document.querySelector('#lab-preview-frame').classList.contains('grid-on')`),true,'grid global');

  // Story inspector metadata/tags.
  await browser.click('[data-right-tab="story"]');
  await browser.evaluate(`{const e=document.querySelector('#story-tags');e.value='stable, smoke';e.dispatchEvent(new Event('change',{bubbles:true}));const a=document.querySelector('#story-a11y-mode');a.value='error';a.dispatchEvent(new Event('change',{bubbles:true}));true}`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).stories.find(s=>s.id===${JSON.stringify(sid)}).tags.includes('stable')`),true,'story tag set');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).stories.find(s=>s.id===${JSON.stringify(sid)}).parameters.a11y.mode`),'error','a11y enforcement mode');

  // Add and duplicate stories.
  await browser.click('#lab-new-story');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).stories.length`),2,'new story');
  await browser.click('#lab-duplicate-story');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).stories.length`),3,'duplicate story');

  // Reopen Primary and test search/filter.
  await browser.evaluate(`AstroUIDesigner.openStory(${JSON.stringify(cid)},${JSON.stringify(sid)})`);
  await browser.evaluate(`{const e=document.querySelector('#lab-story-search');e.value='Primary';e.dispatchEvent(new Event('input',{bubbles:true}));true}`);
  assert.equal(await browser.evaluate(`document.querySelectorAll('.lab-story-item').length`),1,'story search');
  await browser.evaluate(`{const e=document.querySelector('#lab-story-search');e.value='';e.dispatchEvent(new Event('input',{bubbles:true}));true}`);
  await browser.click('#lab-filter-btn');
  assert.ok(await browser.evaluate(`document.querySelectorAll('.lab-filter-popover input').length`)>=1,'filter popover');
  await browser.evaluate(`document.querySelector('#popover-layer').innerHTML=''`);

  // Interaction test: wait + visible root assertion.
  const rootId=await browser.evaluate(`AstroUIDesigner.getProject().components.find(c=>c.id===${JSON.stringify(cid)}).root.id`);
  await browser.click('[data-lab-addon="interactions"]');
  await browser.click('#lab-add-step');
  await browser.evaluate(`{const card=document.querySelector('[data-story-step="0"]');const t=card.querySelector('[data-step-k="type"]');t.value='wait';t.dispatchEvent(new Event('change',{bubbles:true}));const v=card.querySelector('[data-step-k="value"]');v.value='1';v.dispatchEvent(new Event('change',{bubbles:true}));true}`);
  await browser.click('#lab-add-assert');
  await browser.evaluate(`{const card=document.querySelector('[data-story-assert="0"]');const t=card.querySelector('[data-assert-k="target"]');t.value=${JSON.stringify(rootId)};t.dispatchEvent(new Event('change',{bubbles:true}));true}`);
  await browser.click('#lab-run-interaction');
  await new Promise(r=>setTimeout(r,40));
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().storybook.results[${JSON.stringify(sid)}].interaction.status`),'pass','interaction test passes');

  // Accessibility and visual test addons.
  await browser.click('[data-lab-addon="a11y"]');
  await browser.click('#lab-run-a11y');
  assert.ok(['pass','fail'].includes(await browser.evaluate(`AstroUIDesigner.getProject().storybook.results[${JSON.stringify(sid)}].a11y.status`)),'a11y result recorded');
  await browser.click('[data-lab-addon="visual"]');
  await browser.click('#lab-save-baseline');
  assert.equal(await browser.evaluate(`Object.hasOwn(AstroUIDesigner.getProject().storybook.visualBaselines,${JSON.stringify(sid)})`),true,'visual baseline saved');
  await browser.click('#lab-compare-baseline');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().storybook.results[${JSON.stringify(sid)}].visual.status`),'pass','visual baseline compares');

  // Autodocs and portable artifacts.
  await browser.click('[data-lab-addon="docs"]');
  assert.match(await browser.evaluate(`document.querySelector('.lab-docs').innerText`),/LabCard/,'autodocs rendered');
  assert.ok(await browser.evaluate(`document.querySelector('.lab-docs').textContent.includes('title')`),'prop docs rendered');

  // Test-selection widget + Watch mode + consolidated run.
  await browser.click('#lab-test-options');
  await browser.evaluate(`{const e=document.querySelector('[data-lab-test-type="coverage"]');e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));true}`);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().storybook.settings.testSelection.coverage`),true,'coverage test selection');
  await browser.evaluate(`document.querySelector('#popover-layer').innerHTML=''`);
  await browser.click('#lab-watch');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().storybook.settings.watch`),true,'watch setting');
  await browser.click('#lab-run-tests');
  await new Promise(r=>setTimeout(r,80));
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().storybook.results[${JSON.stringify(sid)}].render.status`),'pass','render test passes');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().storybook.results[${JSON.stringify(sid)}].coverage.skipped`),'watch-mode','coverage honestly skips in watch mode');
  assert.ok(await browser.evaluate(`AstroUIDesigner.storybookSummary().stories`)>=3,'summary exposed');

  await browser.evaluate(`AstroUIDesigner.openBottomTab('storybook')`);
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('[data-result-story]'))`),true,'results workbench populated');
  assert.deepEqual(await browser.runtimeErrors(),[],'no runtime errors');
  console.log('storybook-browser.test: OK (controls, globals, interactions, a11y, visual, docs, results)');
} finally { await browser.close(); }

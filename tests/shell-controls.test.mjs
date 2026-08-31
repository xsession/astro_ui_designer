import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';

const browser = new DesignerBrowser();
try {
  await browser.start({width:1600,height:900});
  await browser.evaluate(`AstroUIDesigner.reset()`);

  // Every persistent shell control must exist and be wired.
  const staticIds = [
    'new-btn','open-btn','save-btn','undo-btn','redo-btn','toggle-left-btn','focus-mode-btn','toggle-right-btn','cut-btn','copy-btn','paste-btn','duplicate-btn','delete-btn',
    'wrap-row-btn','wrap-col-btn','move-up-btn','move-down-btn','align-left-btn','align-hcenter-btn','align-right-btn','align-top-btn','align-vcenter-btn','align-bottom-btn','dist-h-btn','dist-v-btn',
    'breakpoint-select','breakpoints-btn','left-tabs-more','right-tabs-more','bottom-tabs-more','bottom-toggle-btn','design-mode-btn','split-mode-btn','code-mode-btn','preview-mode-btn','component-lab-mode-btn','zoom-out-btn','fit-btn','zoom-in-btn','workspace-btn','live-preview-btn','command-btn','export-btn','manual-rulers-btn','manual-snap-btn','manual-spacing-btn','manual-tools-btn','file-open','asset-open','platform-import-open','library-import-open'
  ];
  for (const id of staticIds) assert.equal(await browser.evaluate(`Boolean(document.getElementById(${JSON.stringify(id)}))`), true, `static control #${id}`);
  const handlerIds = staticIds.filter(x=>!['file-open','asset-open','platform-import-open','library-import-open'].includes(x));
  for (const id of handlerIds) assert.equal(await browser.evaluate(`{const e=document.getElementById(${JSON.stringify(id)});Boolean(e.onclick||e.onchange||e.oninput||e.onpointerdown)}`), true, `handler #${id}`);
  assert.equal(await browser.evaluate(`typeof document.getElementById('file-open').onchange==='function'`), true, 'open file input handler');
  assert.equal(await browser.evaluate(`typeof document.getElementById('asset-open').onchange==='function'`), true, 'asset file input handler');
  assert.equal(await browser.evaluate(`typeof document.getElementById('platform-import-open').onchange==='function'`), true, 'platform import file input handler');
  assert.equal(await browser.evaluate(`typeof document.getElementById('library-import-open').onchange==='function'`), true, 'library import file input handler');

  // All menu buttons open a non-empty popover.
  for (const name of ['file','edit','form','layout','view','project','build','help']) {
    await browser.click(`[data-menu="${name}"]`);
    assert.ok(await browser.evaluate(`document.querySelectorAll('.menu-popover button').length`) > 0, `${name} menu has commands`);
    await browser.evaluate(`document.querySelector('#popover-layer').innerHTML=''`);
  }

  // Left dock tabs.
  const leftExpect = {palette:'#palette-search',project:'#add-page',components:'#new-component',assets:'#add-assets',sources:'#open-workspace-left'};
  for (const [tab, sel] of Object.entries(leftExpect)) {
    await browser.click(`[data-left-tab="${tab}"]`);
    assert.equal(await browser.evaluate(`Boolean(document.querySelector(${JSON.stringify(sel)}))`), true, `left tab ${tab}`);
  }

  // Right inspector tabs.
  const textId=await browser.evaluate(`AstroUIDesigner.insert('text')`);
  const rightExpect={properties:'#obj-name',layout:'[id^="s-"]',effects:'#blend-mode',actions:'#add-action',bindings:'[data-binding]',code:'#code-file',variants:'#add-node-state',data:'#source-ownership',composition:'#new-mixin',story:'#right-content .empty'};
  for (const [tab,sel] of Object.entries(rightExpect)) {
    await browser.click(`[data-right-tab="${tab}"]`);
    assert.equal(await browser.evaluate(`Boolean(document.querySelector(${JSON.stringify(sel)}))`),true,`right tab ${tab}`);
  }

  // Bottom dock tabs.
  for (const tab of ['problems','objects','manual','css','state','animation','tokens','libraries','actions','content','locales','tests','storybook','audit','git','prototype','comments','inspect','interchange','integrations','queries','templates','usages','console']) {
    await browser.click(`[data-bottom-tab="${tab}"]`);
    assert.equal(await browser.evaluate(`document.querySelector('[data-bottom-tab="${tab}"]').classList.contains('active')`),true,`bottom tab ${tab}`);
  }

  // Palette filter is functional.
  await browser.click('[data-left-tab="palette"]');
  await browser.evaluate(`{const e=document.querySelector('#palette-search');e.value='Button';e.dispatchEvent(new Event('input',{bubbles:true}));true}`);
  assert.equal(await browser.evaluate(`document.querySelectorAll('.palette-item').length`),1,'palette filter narrows to Button');
  assert.equal(await browser.evaluate(`document.querySelector('.palette-item')?.dataset.type`),'button','palette filter result');

  // Breakpoint selector.
  await browser.change('#breakpoint-select','mobile');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().breakpoint`),'mobile','breakpoint selector');

  // Design/preview/component-lab and zoom toolbar.
  await browser.click('#preview-mode-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().mode`),'preview','preview toolbar');
  await browser.click('#design-mode-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().mode`),'design','design toolbar');
  await browser.click('#component-lab-mode-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().mode`),'lab','component lab toolbar');
  await browser.click('#design-mode-btn');
  const z0=await browser.evaluate(`AstroUIDesigner.getSession().zoom`);
  await browser.click('#zoom-in-btn');
  assert.ok(await browser.evaluate(`AstroUIDesigner.getSession().zoom`) > z0,'zoom in');
  await browser.click('#zoom-out-btn');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().zoom`),z0,'zoom out');

  // Download actions are exercised without actually navigating/downloading.
  await browser.evaluate(`window.__downloads=[];HTMLAnchorElement.prototype.click=function(){window.__downloads.push({download:this.download,href:this.href})}`);
  await browser.click('#save-btn');
  assert.equal(await browser.evaluate(`window.__downloads.at(-1)?.download.endsWith('.astro-ui.json')`),true,'Save JSON download');
  await browser.click('#export-btn');
  assert.equal(await browser.evaluate(`window.__downloads.at(-1)?.download.endsWith('-astro.zip')`),true,'Astro ZIP download');

  // JSON open path through actual file input.
  const nameBefore=await browser.evaluate(`AstroUIDesigner.getProject().name`);
  await browser.evaluate(`(()=>{const p=AstroUIDesigner.getProject();p.name='OpenedThroughFileInput';const f=new File([JSON.stringify(p)],'roundtrip.astro-ui.json',{type:'application/json'});const e=document.querySelector('#file-open');Object.defineProperty(e,'files',{configurable:true,value:[f]});e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  await new Promise(r=>setTimeout(r,60));
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().name`),'OpenedThroughFileInput','Open JSON file input');
  assert.notEqual(await browser.evaluate(`AstroUIDesigner.getProject().name`),nameBefore,'project replaced');

  assert.deepEqual(await browser.runtimeErrors(),[],'shell runtime errors');
  console.log(`shell-controls.test: OK (${staticIds.length} static controls, 8 menus, 5 left tabs, 10 right tabs, 24 bottom tabs)`);
} finally {
  await browser.close();
}

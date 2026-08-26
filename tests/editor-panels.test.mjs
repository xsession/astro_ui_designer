import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate('AstroUIDesigner.reset()');

  // Common object properties.
  const node=await browser.evaluate(`AstroUIDesigner.insert('text')`);
  await browser.click('[data-right-tab="properties"]');
  await browser.change('#obj-name','BodyCopy');
  await browser.change('#obj-domid','body-copy');
  await browser.change('#obj-classes','prose muted');
  await browser.change('#obj-slot','content');
  await browser.change('#obj-locked','',{checked:true});
  await browser.change('#obj-hidden','',{checked:true});
  let n=await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(node)})`);
  assert.deepEqual({name:n.name,domId:n.meta.domId,className:n.meta.className,slot:n.meta.slot,locked:n.meta.locked,hidden:n.meta.hidden},{name:'BodyCopy',domId:'body-copy',className:'prose muted',slot:'content',locked:true,hidden:true},'common object properties');
  // Restore visible/unlocked so later navigation remains straightforward.
  await browser.change('#obj-locked','',{checked:false});await browser.change('#obj-hidden','',{checked:false});

  // Layout quick commands.
  await browser.click('[data-right-tab="layout"]');
  await browser.click('[data-style="display:grid"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(node)}).style.base.display`),'grid','layout quick Grid');
  await browser.click('[data-style="display:flex"]');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getNode(${JSON.stringify(node)}).style.base.display`),'flex','layout quick Flex');

  // Page inspector / SEO fields.
  const root=await browser.evaluate(`AstroUIDesigner.getRootId()`);await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(root)})`);await browser.click('[data-right-tab="properties"]');
  await browser.change('#page-route','/home');await browser.change('#seo-title','Visual Home');await browser.change('#seo-description','Visual editor generated page');await browser.change('#seo-canonical','https://example.invalid/home');await browser.change('#seo-og','/assets/og.png');
  let page=await browser.evaluate(`AstroUIDesigner.getProject().pages[0]`);
  assert.equal(page.filename,'home/index.astro','route updates filename');assert.equal(page.seo.title,'Visual Home','SEO title');

  // Project panel: create, duplicate, edit and delete page.
  await browser.click('[data-left-tab="project"]');await browser.click('#add-page');await browser.change('#m-pname','Docs');await browser.change('#m-route','/docs');await browser.change('#m-file','docs/index.astro');await browser.change('#m-title','Docs');await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages.length`),2,'page created');
  await browser.click('[data-left-tab="project"]');await browser.click('[data-copy]');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages.length`),3,'page duplicated');
  await browser.click('[data-left-tab="project"]');const editId=await browser.evaluate(`document.querySelector('[data-edit]')?.dataset.edit`);await browser.click(`[data-edit="${editId}"]`);await browser.change('#m-pname','Home Renamed');await browser.click('#modal-save');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages.some(p=>p.name==='Home Renamed')`),true,'page edited');
  await browser.click('[data-left-tab="project"]');const delId=await browser.evaluate(`document.querySelectorAll('[data-del]')[0]?.dataset.del`);await browser.click(`[data-del="${delId}"]`);await sleep(20);assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().pages.length`),2,'page deleted');

  // Project settings modal.
  await browser.click('[data-left-tab="project"]');await browser.click('#project-settings');await browser.change('#m-name','ParityWorkspace');await browser.change('#m-site','https://example.invalid');await browser.change('#m-base','/app/');await browser.change('#m-output','server');await browser.change('#m-lang','hu');await browser.change('#m-grid','12');await browser.click('#modal-save');
  const ps=await browser.evaluate(`({name:AstroUIDesigner.getProject().name,s:AstroUIDesigner.getProject().settings})`);assert.equal(ps.name,'ParityWorkspace');assert.equal(ps.s.gridSize,12);assert.equal(ps.s.output,'server');

  // Reusable component: blank, props, rename, insert, delete.
  await browser.click('[data-left-tab="components"]');await browser.click('#new-component');await browser.change('#m-cname','StatusPanel');await browser.change('#m-cfile','StatusPanel.astro');await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.length`),1,'blank component created');
  await browser.click('[data-right-tab="properties"]');await browser.click('#manage-component-props');await browser.change('#m-cprops','title:string=Status\ncount:number=0\nactive:boolean=true');await browser.click('#modal-save');
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components[0].props.length`),3,'component props');
  await browser.click('[data-left-tab="components"]');const cid=await browser.evaluate(`AstroUIDesigner.getProject().components[0].id`);await browser.click(`[data-ren="${cid}"]`);await browser.change('#m-cname','StatusCard');await browser.change('#m-cfile','StatusCard.astro');await browser.change('#m-cdesc','Reusable status card');await browser.click('#modal-save');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components[0].name`),'StatusCard','component renamed');
  // Switch to first page via document tab then insert component.
  await browser.evaluate(`{const p=AstroUIDesigner.getProject().pages[0];document.querySelector('.doc-tab[data-kind="page"][data-id="'+p.id+'"]').click();true}`);await browser.click('[data-left-tab="components"]');await browser.click(`[data-ins="${cid}"]`);assert.equal(await browser.evaluate(`{const walk=n=>(n.type==='componentInstance'?1:0)+(n.children||[]).reduce((a,c)=>a+walk(c),0);walk(AstroUIDesigner.getProject().pages[0].root)}`),1,'component instance inserted');
  await browser.click('[data-left-tab="components"]');await browser.click(`[data-del="${cid}"]`);await sleep(20);assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().components.length`),0,'component definition deleted');
  assert.ok((await browser.evaluate(`AstroUIDesigner.validate().some(i=>i.code&&/COMPONENT|component/i.test(i.message||''))`)),'unresolved component diagnosed');

  // Asset file input import and asset delete.
  await browser.evaluate(`(()=>{const bytes=new Uint8Array([137,80,78,71,13,10,26,10]);const f=new File([bytes],'tiny.png',{type:'image/png'});const e=document.querySelector('#asset-open');Object.defineProperty(e,'files',{configurable:true,value:[f]});e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);await sleep(100);
  assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().assets.length`),1,'asset imported');
  await browser.click('[data-left-tab="assets"]');const aid=await browser.evaluate(`AstroUIDesigner.getProject().assets[0].id`);assert.equal(await browser.evaluate(`Boolean(document.querySelector('.asset-row img.asset-thumb'))`),true,'asset thumbnail');await browser.click(`[data-del="${aid}"]`);assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().assets.length`),0,'asset deleted');

  // State table add/edit/type/initial/delete.
  await browser.click('[data-bottom-tab="state"]');const vars0=await browser.evaluate(`AstroUIDesigner.getProject().variables.length`);await browser.click('#add-state');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().variables.length`),vars0+1,'state added');
  const rowSel='.state-table tbody tr:last-child';await browser.change(`${rowSel} [data-k="name"]`,'counter');await browser.change(`${rowSel} [data-k="type"]`,'number');await browser.change(`${rowSel} [data-k="initial"]`,'42');
  assert.deepEqual(await browser.evaluate(`{const v=AstroUIDesigner.getProject().variables.at(-1);({name:v.name,type:v.type,initial:v.initial})}`),{name:'counter',type:'number',initial:42},'state edited');await browser.click(`${rowSel} [data-del]`);assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().variables.length`),vars0,'state deleted');

  // Design token add/rename/value/delete.
  await browser.click('[data-bottom-tab="tokens"]');const tok0=await browser.evaluate(`Object.keys(AstroUIDesigner.getProject().theme.themes[AstroUIDesigner.getProject().theme.active].tokens).length`);await browser.click('#add-token');assert.equal(await browser.evaluate(`Object.keys(AstroUIDesigner.getProject().theme.themes[AstroUIDesigner.getProject().theme.active].tokens).length`),tok0+1,'token added');
  const oldKey=await browser.evaluate(`document.querySelector('.token-table tbody tr:last-child [data-token-key]').dataset.tokenKey`);await browser.change(`.token-table tbody tr:last-child [data-token-key]`,'space-custom');assert.equal(await browser.evaluate(`Object.hasOwn(AstroUIDesigner.getProject().theme.themes[AstroUIDesigner.getProject().theme.active].tokens,'space-custom')`),true,'token renamed');await browser.change(`[data-token-val="space-custom"]`,'18px');assert.equal(await browser.evaluate(`AstroUIDesigner.getProject().theme.themes[AstroUIDesigner.getProject().theme.active].tokens['space-custom']`),'18px','token value');await browser.click(`[data-token-del="space-custom"]`);assert.equal(await browser.evaluate(`Object.hasOwn(AstroUIDesigner.getProject().theme.themes[AstroUIDesigner.getProject().theme.active].tokens,'space-custom')`),false,'token deleted');

  // Object tree selection and action connection navigation.
  await browser.evaluate('AstroUIDesigner.reset()');const btn=await browser.evaluate(`AstroUIDesigner.insert('button')`);await browser.click('[data-bottom-tab="objects"]');await browser.click(`.tree-row[data-id="${btn}"]`);assert.equal(await browser.evaluate(`AstroUIDesigner.getSession().selectedId`),btn,'object tree selects node');
  await browser.click('[data-right-tab="actions"]');await browser.click('#add-action');await browser.click('[data-bottom-tab="actions"]');assert.equal(await browser.evaluate(`document.querySelectorAll('#bottom-content tr[data-node]').length`),1,'connections table contains action');await browser.click(`#bottom-content tr[data-node="${btn}"]`);assert.equal(await browser.evaluate(`document.querySelector('[data-right-tab="actions"]').classList.contains('active')`),true,'connection row opens Actions inspector');

  assert.deepEqual(await browser.runtimeErrors(),[],'panel runtime errors');
  console.log('editor-panels.test: OK (properties, pages, settings, components, assets, state, tokens, object tree, connections)');
}finally{await browser.close()}

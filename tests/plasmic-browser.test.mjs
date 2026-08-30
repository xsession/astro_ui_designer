import assert from 'node:assert/strict';
import { DesignerBrowser } from './cdp-harness.mjs';
const browser=new DesignerBrowser();
try{
  await browser.start({width:1600,height:900});
  await browser.evaluate(`AstroUIDesigner.reset()`);
  const root=await browser.evaluate(`AstroUIDesigner.getRootId()`);
  const card=await browser.evaluate(`AstroUIDesigner.insert('card',${JSON.stringify(root)})`);assert.ok(card);
  const mix=await browser.evaluate(`AstroUIDesigner.addMixin('Card Surface',{background:'#fff',borderRadius:'14px'})`);assert.ok(mix);
  const gv=await browser.evaluate(`AstroUIDesigner.addGlobalVariant('Brand',['default','contrast'])`);assert.ok(gv);
  const qid=await browser.evaluate(`AstroUIDesigner.addQuery('products','static')`);assert.ok(qid);
  const ext=await browser.evaluate(`AstroUIDesigner.registerCodeComponent({name:'ProductTile',symbol:'ProductTile',importPath:'src/components/ProductTile.tsx',framework:'react',contract:{description:'Product tile',props:[{name:'title',type:'string',default:'Item'},{name:'featured',type:'boolean',default:false},{name:'items',type:'list',default:[]}],slots:['default'],states:[{name:'selected'}],providesData:['product'],globalActions:[{name:'refresh',parameters:[]}]}})`);assert.ok(ext);
  await browser.evaluate(`AstroUIDesigner.select(${JSON.stringify(card)});AstroUIDesigner.openResearchPanel('right','composition')`);
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#new-mixin'))`),true,'composition inspector');
  await browser.evaluate(`AstroUIDesigner.openResearchPanel('bottom','queries')`);
  assert.equal(await browser.evaluate(`document.querySelectorAll('[data-query]').length`),1,'query workbench');
  await browser.evaluate(`AstroUIDesigner.openResearchPanel('bottom','templates')`);
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#template-from-selection'))`),true,'templates workbench');
  await browser.evaluate(`AstroUIDesigner.openResearchPanel('bottom','usages')`);
  assert.equal(await browser.evaluate(`Boolean(document.querySelector('#usage-ref'))`),true,'usage workbench');
  const files=await browser.evaluate(`Object.keys(AstroUIDesigner.generate())`);
  assert.ok(files.includes('src/data/ui-queries.ts'),'query module exported');
  assert.ok(files.includes('src/composition/ui-composition.json'),'composition manifest exported');
  assert.deepEqual(await browser.runtimeErrors(),[],'no runtime errors');
  await browser.screenshot('14-plasmic-composition-1600x900.png');
  console.log('plasmic-browser.test: OK');
} finally {await browser.close();}

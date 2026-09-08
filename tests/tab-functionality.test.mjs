import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../standalone/index.html',import.meta.url),'utf8');
const wb=fs.readFileSync(new URL('../standalone/js/functional-workbenches.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../standalone/js/app.js',import.meta.url),'utf8');
const tabs=(zone)=>[...html.matchAll(new RegExp(`data-${zone}-tab=["']([^"']+)["']`,'g'))].map(m=>m[1]);
for(const id of tabs('left')){assert.match(wb,new RegExp(`state\\.leftTab(?:===|!==)'${id}'`),`left tab ${id} has no renderer branch`);assert.ok(app.includes(`['left:${id}'`),`left tab ${id} has no command entry`)}
for(const id of tabs('right')){assert.match(wb,new RegExp(`state\\.rightTab(?:===|!==)'${id}'`),`right tab ${id} has no renderer branch`);assert.ok(app.includes(`['right:${id}'`),`right tab ${id} has no command entry`)}
for(const id of tabs('bottom')){assert.match(wb,new RegExp(`state\\.bottomTab==='${id}'`),`bottom tab ${id} has no renderer branch`);assert.ok(app.includes(`['bottom:${id}'`),`bottom tab ${id} has no command entry`)}
assert.doesNotMatch(wb,/Workbench data is retained in the project model/);
assert.match(app,/renderHotkeysPanel/);assert.match(app,/deletePageEntity/);assert.match(app,/data-doc-close/);assert.match(app,/function renderComponentLab/);
assert.match(wb,/pageEditor:\(page=null\)=>pageEditor\(ctx,page\)/,'page editor must be context-bound');
assert.match(wb,/deletePageUi:\(pageId\)=>deletePageUi\(ctx,pageId\)/,'page delete must be context-bound');
assert.ok(tabs('bottom').includes('hotkeys'));
console.log(`tab-functionality.test.mjs passed (${tabs('left').length+tabs('right').length+tabs('bottom').length} tabs audited)`);

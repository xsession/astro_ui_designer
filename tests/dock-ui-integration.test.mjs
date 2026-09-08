import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createDockPanelRegistry, defaultDockLayout, moveDockPanel, floatDockPanel } from '../standalone/js/dock-layout.js';

const html=fs.readFileSync('standalone/index.html','utf8');
const app=fs.readFileSync('standalone/js/app.js','utf8');
const css=fs.readFileSync('standalone/styles.css','utf8');
const entries=[];
for(const zone of ['left','right','bottom']){
  const re=new RegExp(`<button[^>]*data-${zone}-tab="([^"]+)"[^>]*>([\\s\\S]*?)<\\/button>`,'g');
  let m;let order=0;
  while((m=re.exec(html)))entries.push({origin:zone,id:m[1],label:m[2].replace(/<[^>]+>/g,'').trim(),order:entries.length+order++});
}
assert.ok(entries.length>=35,`expected all dock tabs, got ${entries.length}`);
const registry=createDockPanelRegistry(entries);
assert.equal(Object.keys(registry).length,entries.length,'every dock tab must have a unique relocatable panel key');
let layout=defaultDockLayout(registry);
assert.ok(layout.zones.left.includes('left:palette'));
assert.ok(layout.zones.right.includes('right:properties'));
assert.ok(layout.zones.bottom.includes('bottom:objects'));
layout=moveDockPanel(layout,'bottom:objects','right',0);
assert.equal(layout.zones.right[0],'bottom:objects');
layout=floatDockPanel(layout,'left:palette',{x:80,y:60,width:420,height:320});
assert.ok(layout.floating['left:palette']);
assert.match(app,/initDocking\(\)/);
assert.match(app,/data\.dockPanel|dataset\.dockPanel|data-dock-panel/);
assert.match(app,/floatDockPanelUi/);
assert.match(app,/enableRelocatableSections/);
assert.match(app,/documentTabOrder/);
assert.match(app,/bindDockResizers/);
assert.match(app,/resetDockLayoutUi/);
assert.match(css,/\.floating-dock-window/);
assert.match(css,/\.dock-drop-active/);
assert.match(css,/\.relocatable-section/);
assert.match(html,/id="dock-layout-btn"/);
console.log(`dock-ui-integration.test.mjs passed (${entries.length} relocatable dock tabs)`);

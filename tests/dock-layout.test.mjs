import assert from 'node:assert/strict';
import {
  createDockPanelRegistry, defaultDockLayout, normalizeDockLayout, locateDockPanel,
  moveDockPanel, reorderDockPanel, floatDockPanel, updateFloatingRect, activateDockPanel,
  moveSectionOrder,
} from '../standalone/js/dock-layout.js';

const registry=createDockPanelRegistry([
  {origin:'left',id:'palette',label:'Palette',order:0},
  {origin:'left',id:'project',label:'Project',order:1},
  {origin:'right',id:'properties',label:'Properties',order:2},
  {origin:'bottom',id:'objects',label:'Object Tree',order:3},
  {origin:'bottom',id:'console',label:'Console',order:4},
]);
let layout=defaultDockLayout(registry);
assert.deepEqual(layout.zones.left,['left:palette','left:project']);
assert.equal(layout.active.right,'right:properties');
layout=moveDockPanel(layout,'bottom:objects','right',0);
assert.deepEqual(layout.zones.right,['bottom:objects','right:properties']);
assert.equal(layout.active.right,'bottom:objects');
assert.equal(locateDockPanel(layout,'bottom:objects').zone,'right');
layout=reorderDockPanel(layout,'right:properties',0);
assert.deepEqual(layout.zones.right,['right:properties','bottom:objects']);
layout=floatDockPanel(layout,'bottom:objects',{x:12,y:20,width:500,height:260});
assert.equal(locateDockPanel(layout,'bottom:objects').kind,'floating');
assert.equal(layout.floating['bottom:objects'].width,500);
layout=updateFloatingRect(layout,'bottom:objects',{width:80,height:20});
assert.equal(layout.floating['bottom:objects'].width,220);
assert.equal(layout.floating['bottom:objects'].height,140);
layout=moveDockPanel(layout,'bottom:objects','left',1);
assert.equal(layout.floating['bottom:objects'],undefined);
assert.equal(layout.zones.left[1],'bottom:objects');
layout=activateDockPanel(layout,'left:project');
assert.equal(layout.active.left,'left:project');
const malformed={zones:{left:['left:palette','left:palette','bogus'],right:[],bottom:[]},active:{left:'bogus'},floating:{'right:properties':{x:-5,y:-5,width:10,height:10}}};
const normalized=normalizeDockLayout(malformed,registry);
assert.equal(normalized.zones.left.filter(x=>x==='left:palette').length,1);
assert.equal(normalized.floating['right:properties'].width,220);
assert.equal(new Set([...normalized.zones.left,...normalized.zones.right,...normalized.zones.bottom,...Object.keys(normalized.floating)]).size,Object.keys(registry).length);
assert.deepEqual(moveSectionOrder(['a','b','c'],'c',0),['c','a','b']);
console.log('dock-layout.test.mjs passed');

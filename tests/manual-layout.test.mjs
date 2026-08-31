import assert from 'node:assert/strict';
import { createProject, createNode } from '../standalone/js/model.js';
import {
  ensureManualLayoutProject, ensureManualLayoutNode, applySizingMode, setPositionMode,
  applyRotation, snapPosition, smartSelectionMetrics, tidyRects, resizeRect,
  constrainChildRect, boxSpacing, buildLayoutGuideColumns
} from '../standalone/js/manual-layout.js';

const p=createProject();
assert.equal(p.schemaVersion,8);
const ml=ensureManualLayoutProject(p);
assert.equal(ml.settings.rulers,true);
assert.equal(ml.settings.snapDistance,6);

const n=createNode('button');
assert.equal(ensureManualLayoutNode(n).sizingX,'fixed');
applySizingMode(n,'x','fill');assert.equal(n.style.base.width,'100%');
applySizingMode(n,'x','hug');assert.equal(n.style.base.width,'fit-content');
setPositionMode(n,'absolute',{left:12,top:18});assert.equal(n.style.base.position,'absolute');assert.equal(n.style.base.left,'12px');
setPositionMode(n,'flow');assert.equal(n.style.base.position,undefined);
applyRotation(n,30);assert.equal(n.style.base.rotate,'30deg');

const snap=snapPosition({x:97,y:101,width:20,height:20,parentRect:{left:0,top:0,width:400,height:300},guides:[{axis:'x',position:100},{axis:'y',position:100}],settings:{snapDistance:5,snapEnabled:true,snapGrid:false,snapGuides:true,snapGeometry:false}});
assert.equal(snap.x,100);assert.equal(snap.y,100);assert.equal(snap.lines.length,2);
const grid=snapPosition({x:13,y:19,width:10,height:10,parentRect:{left:0,top:0,width:100,height:100},settings:{snapEnabled:true,snapGrid:true,snapGuides:false,snapGeometry:false},gridSize:8});
assert.equal(grid.x,16);assert.equal(grid.y,16);

const rects=[{id:'a',left:0,top:0,width:50,height:20},{id:'b',left:80,top:0,width:50,height:20},{id:'c',left:170,top:0,width:50,height:20}];
const metrics=smartSelectionMetrics(rects);assert.equal(metrics.axis,'h');
const tidy=tidyRects(rects,'h',20);assert.deepEqual(tidy.map(x=>x.left),[0,70,140]);

const resized=resizeRect({left:10,top:10,width:100,height:50},'se',50,25,{aspectLocked:true});
assert.equal(Math.round(resized.width/resized.height*100)/100,2);
const centered=resizeRect({left:10,top:10,width:100,height:50},'e',10,0,{fromCenter:true});
assert.ok(centered.width>110);assert.ok(centered.left<10);

const constrained=constrainChildRect({left:10,top:20,width:50,height:40},{width:200,height:100},{width:300,height:200},{horizontal:'left-right',vertical:'bottom'});
assert.equal(constrained.width,150);assert.equal(constrained.top,120);

assert.deepEqual(boxSpacing({margin:'4 8',padding:'1 2 3 4'}),{margin:[4,8,4,8],padding:[1,2,3,4]});
const cols=buildLayoutGuideColumns(1200,{enabled:true,type:'columns',count:12,gap:20,margin:40,maxWidth:1120});
assert.equal(cols.length,12);assert.ok(cols[0].left>=40);assert.ok(cols.at(-1).left+cols.at(-1).width<=1160.001);

console.log('manual-layout.test: OK');

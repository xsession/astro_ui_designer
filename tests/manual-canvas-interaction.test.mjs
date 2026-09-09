import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resizeRect, snapPosition, constrainChildRect } from '../standalone/js/manual-layout.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const app=fs.readFileSync(path.join(root,'standalone/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'standalone/styles.css'),'utf8');
const workbenches=fs.readFileSync(path.join(root,'standalone/js/functional-workbenches.js'),'utf8');

// Runtime integration: direct manipulation must not be limited to Freeform Layer children.
assert.match(app,/function directManipulable\(node\)/);
assert.doesNotMatch(app,/function directManipulable\(node\)\{[^\n]*p\.type==='freeform'/);
assert.match(app,/function detachFromFlow\(node,parent,rect\)/);
assert.match(app,/target\.position='absolute'/);
assert.match(app,/function geometryStyleTarget\(node\)/);
assert.match(app,/state\.breakpoint&&state\.breakpoint!=='base'/);
assert.match(app,/function renderSelectionOverlay\(\)/);
assert.match(app,/function topLevelSelectionNodes\(\)/);
assert.match(app,/function nudgeSelected\([^\n]*topLevelSelectionNodes\(\)/); // nested marquee selections transform only top-level nodes.
assert.match(app,/manual-selection-overlay/);
assert.match(app,/MANUAL_HANDLES=\['nw','n','ne','e','se','s','sw','w'\]/);
assert.match(app,/manual-move-handle/);
assert.match(app,/function beginManualDrag\(/);
assert.match(app,/function beginManualResize\(/);
assert.match(app,/function beginManualRotate\(/);
assert.match(app,/function nudgeSelected\(/);
assert.match(app,/ArrowLeft/);
assert.match(app,/ev\.shiftKey/);
assert.match(app,/ev\.altKey/);
assert.match(app,/handle\.includes\('w'\)\|\|handle\.includes\('n'\)\|\|ev\.altKey/); // centered resize detaches flow geometry so x/y can change.
assert.match(app,/clientLeft/); // border-box to positioning-context correction.
assert.match(app,/node\.meta\?\.locked/);
assert.match(app,/renderNode\(deepClone\(c\.root\),false\)/); // component previews must not steal selection.
assert.match(css,/\.manual-selection-overlay/);
assert.match(css,/\.resize-handle\.se/);
assert.match(css,/--canvas-zoom/);
assert.match(workbenches,/base=ctx\.activeStyle\(n\)/);
assert.match(workbenches,/n\.style\[state\.breakpoint\]\[k\]/); // Layout Tools exact geometry follows active breakpoint.

// Geometry primitives used by the interaction layer.
assert.deepEqual(resizeRect({left:10,top:20,width:100,height:50},'se',20,10),{left:10,top:20,width:120,height:60});
assert.deepEqual(resizeRect({left:10,top:20,width:100,height:50},'nw',10,5),{left:20,top:25,width:90,height:45});
assert.deepEqual(resizeRect({left:10,top:20,width:100,height:50},'e',10,0,{fromCenter:true}),{left:0,top:20,width:120,height:50});
const snapped=snapPosition({x:13,y:19,width:20,height:20,parentRect:{left:0,top:0,width:200,height:200},settings:{snapEnabled:true,snapGrid:true,snapGuides:false,snapGeometry:false},gridSize:8});
assert.equal(snapped.x,16);
assert.equal(snapped.y,16);
const constrained=constrainChildRect({left:10,top:10,width:30,height:20},{width:100,height:100},{width:200,height:100},{horizontal:'left-right',vertical:'top'});
assert.equal(constrained.left,10);
assert.equal(constrained.width,130);

console.log('manual-canvas-interaction.test.mjs passed');

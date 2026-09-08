import assert from 'node:assert/strict';
import { detectRoundTripBackend, buildRoundTripPatchPlan, createSourceIdentity, listRoundTripBackends } from '../standalone/js/roundtrip-engine.js';
import { importFilesToNeutral, generateNeutralBackend, importPwtkFiles } from '../standalone/js/roundtrip-neutral-ir.js';

// Self-contained pwtk fixture modeled on a real CANopen device GUI app.
const mainPy=`from pwtk import App, on
import demo
class Demo_App(App):
    def __init__(self):
        super().__init__()
        self.demo_gui_block = demo.DemoGuiBlock('demo_target')
        self.add_block(self.demo_gui_block)
        self.set_block_container('#block_container')
    @on('enable_cbx', 'click')
    def on_enable_cbx_click(self):
        self.resume_container('#block_container')
`;
const blocksPy=`import pwtk
class InfoGuiBlock(pwtk.BundleBlock):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.name = 'Info'
        self.descriptor = {}
class CanGuiBlock(pwtk.BundleBlock):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.name = 'Can_status'
class DemoGuiBlock(pwtk.Block):
    def __init__(self, target_html_id):
        super().__init__(target_html_id)
        self.group_name = 'Demo'
`;
const layoutJson=JSON.stringify({
  pinned_blocks:{'Demo, Info':'#block_container','Demo, Can_status':'#block_container'},
  block_containers:{'#block_container':['Demo, Info','Demo, Can_status']},
  timer_vals:{'Demo, Info':500,'Demo, Can_status':100}
},null,4);
const indexHtml=`<!DOCTYPE html><html><body><div id='container'><div id="block_container" class='container'></div></div><div class='sidebar'><div id='demo_target'></div></div></body></html>`;
const files=[{filename:'main.py',content:mainPy},{filename:'blocks.py',content:blocksPy},{filename:'layout.json',content:layoutJson},{filename:'web/index.html',content:indexHtml}];

// Detection recognizes pwtk device apps.
assert.equal(detectRoundTripBackend(files),'pwtk');
assert.ok(listRoundTripBackends().some(b=>b.id==='pwtk'));

// Import: neutral IR exposes containers, blocks, pin/timer state and app metadata.
const doc=importFilesToNeutral(files,{backend:'pwtk'});
assert.equal(doc.backend,'pwtk');
assert.equal(doc.root.children.length,1);
const container=doc.root.children[0];
assert.equal(container.tag,'pwtk.container');
assert.equal(container.name,'#block_container');
assert.equal(container.children.length,2);
const info=container.children.find(b=>b.name==='Info');
const can=container.children.find(b=>b.name==='Can_status');
assert.equal(info.attrs.group,'Demo');
assert.equal(info.attrs.pinned,true);
assert.equal(info.attrs.timer,500);
assert.equal(info.source.symbolPath,'Demo, Info');
assert.equal(can.attrs.timer,100);
assert.equal(doc.metadata.blocks,3);
assert.equal(doc.metadata.app.appClass,'Demo_App');
assert.equal(doc.metadata.app.container,'#block_container');
assert.ok(doc.metadata.app.handlers.some(h=>h.id==='enable_cbx'&&h.event==='click'));

// Generation round-trips layout.json and emits a runnable main.py + index.html.
const gen=generateNeutralBackend(doc,'pwtk');
assert.ok(gen['main.py']&&gen['layout.json']&&gen['web/index.html']);
const regen=JSON.parse(gen['layout.json']);
assert.deepEqual(regen.block_containers['#block_container'],['Demo, Info','Demo, Can_status']);
assert.deepEqual(regen.timer_vals,{'Demo, Info':500,'Demo, Can_status':100});
assert.match(gen['main.py'],/class Demo_App\(App\):/);
assert.match(gen['main.py'],/set_block_container\('#block_container'\)/);
assert.match(gen['web/index.html'],/<div id="block_container" class='container'/);

// Patching: edit a block's refresh timer via the "Group, Name" key anchor.
const plan=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Info',confidence:1}),changes:[{domain:'attribute',property:'timer',previousValue:500,value:100}]});
assert.equal(plan.ok,true);
assert.equal(plan.plan.resolution.strategy,'exact-symbol');
const patched=JSON.parse(plan.plan.nextSource);
assert.equal(patched.timer_vals['Demo, Info'],100);

// Patching: move a block into a new container.
const move=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Can_status',confidence:1}),changes:[{domain:'attribute',property:'container',previousValue:'#block_container',value:'#sidebar'}]});
assert.equal(move.ok,true);
const moved=JSON.parse(move.plan.nextSource);
assert.ok(moved.block_containers['#sidebar'].includes('Demo, Can_status'));
assert.ok(!moved.block_containers['#block_container'].includes('Demo, Can_status'));

// The multi-file importer is exported directly and rejects nothing on malformed layout.
assert.equal(importPwtkFiles(files).backend,'pwtk');
const noLayout=importPwtkFiles([{filename:'main.py',content:mainPy}]);
assert.equal(noLayout.backend,'pwtk');

console.log('roundtrip-pwtk.test.mjs passed');

import assert from 'node:assert/strict';
import { detectRoundTripBackend, buildRoundTripGraph, buildRoundTripPatchPlan, createSourceIdentity, listRoundTripBackends } from '../standalone/js/roundtrip-engine.js';
import { importFilesToNeutral, generateNeutralBackend, importPwtkFiles } from '../standalone/js/roundtrip-neutral-ir.js';

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
const extraPy=`import pwtk
class ExtraGuiBlock(pwtk.Block):
    def __init__(self, target_html_id):
        super().__init__(target_html_id)
        self.name = 'Extra'
`;
const layoutObj={
  schema_version:7,
  custom_flag:true,
  pinned_blocks:{'Demo, Info':'#block_container','Demo, Can_status':'#block_container'},
  block_containers:{'#block_container':['Demo, Info','Demo, Can_status']},
  timer_vals:{'Demo, Info':500,'Demo, Can_status':100}
};
const layoutJson=JSON.stringify(layoutObj,null,2)+'\n';
const indexHtml=`<!DOCTYPE html><html><body><div id='container'><div id="block_container" class='container'></div></div><div class='sidebar'><div id='demo_target'></div></div></body></html>`;
const files=[{filename:'main.py',content:mainPy},{filename:'blocks.py',content:blocksPy},{filename:'extra.py',content:extraPy},{filename:'layout.json',content:layoutJson},{filename:'web/index.html',content:indexHtml}];

assert.equal(detectRoundTripBackend(files),'pwtk');
assert.ok(listRoundTripBackends().some(b=>b.id==='pwtk'));

const graph=buildRoundTripGraph(files,{backend:'pwtk'});
assert.equal(graph.entryFile,'main.py');
assert.ok(graph.reachableFiles.includes('main.py'));

const doc=importFilesToNeutral(files,{backend:'pwtk'});
assert.equal(doc.backend,'pwtk');
assert.equal(doc.metadata.blocks,4); // Info, Can, Demo, Extra
assert.equal(doc.metadata.app.appClass,'Demo_App');
assert.equal(doc.metadata.app.container,'#block_container');
assert.ok(doc.metadata.app.handlers.some(h=>h.id==='enable_cbx'&&h.event==='click'));
assert.equal(doc.metadata.rawLayout.custom_flag,true);
const container=doc.root.children.find(c=>c.tag==='pwtk.container');
assert.ok(container);
assert.equal(container.children.length,2);
const info=container.children.find(b=>b.name==='Info');
assert.equal(info.tag,'pwtk.bundle');
assert.equal(info.attrs.className,'InfoGuiBlock');
assert.equal(info.attrs.pinned,true);
assert.equal(info.attrs.timer,500);
assert.equal(info.source.symbolPath,'Demo, Info');
assert.ok(doc.root.children.some(c=>c.tag==='pwtk.unplaced'));

// Unmodified generation preserves source files and layout text exactly.
const gen=generateNeutralBackend(doc,'pwtk');
assert.equal(gen['main.py'],mainPy);
assert.equal(gen['web/index.html'],indexHtml);
assert.equal(gen['layout.json'],layoutJson);
assert.equal(gen['blocks.py'],blocksPy);
assert.equal(gen['extra.py'],extraPy);

// Timer patch.
const plan=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Info',confidence:1}),changes:[{domain:'attribute',property:'timer',previousValue:500,value:100}]});
assert.equal(plan.ok,true);
assert.equal(plan.plan.relativePath,'layout.json');
assert.equal(JSON.parse(plan.plan.nextSource).timer_vals['Demo, Info'],100);
assert.equal(JSON.parse(plan.plan.nextSource).custom_flag,true);

// No-op changes must not produce a patch.
const noTimer=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Info',confidence:1}),changes:[{property:'timer',value:500}]});
assert.equal(noTimer.ok,false);
const noPin=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Info',confidence:1}),changes:[{property:'pinned',value:true}]});
assert.equal(noPin.ok,false);
const noMove=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Info',confidence:1}),changes:[{property:'container',value:'#block_container'}]});
assert.equal(noMove.ok,false);

// Move and rename preserve pin/timer metadata.
const move=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Can_status',confidence:1}),changes:[{property:'container',value:'#sidebar'}]});
assert.equal(move.ok,true);
const moved=JSON.parse(move.plan.nextSource);
assert.deepEqual(moved.block_containers['#sidebar'],['Demo, Can_status']);
assert.equal(moved.pinned_blocks['Demo, Can_status'],'#sidebar');

const rename=buildRoundTripPatchPlan({backend:'pwtk',files,sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Demo, Info',confidence:1}),changes:[{property:'name',value:'Info2'}]});
assert.equal(rename.ok,true);
const renamed=JSON.parse(rename.plan.nextSource);
assert.ok(renamed.block_containers['#block_container'].includes('Demo, Info2'));
assert.equal(renamed.pinned_blocks['Demo, Info2'],'#block_container');
assert.equal(renamed.timer_vals['Demo, Info2'],500);
assert.ok(!('Demo, Info' in renamed.timer_vals));

// Last-comma parsing preserves group names that contain commas.
const commaLayout=JSON.stringify({pinned_blocks:{'Plant, Left, Speed':'#x'},block_containers:{'#x':['Plant, Left, Speed']},timer_vals:{'Plant, Left, Speed':10}},null,4);
const commaPlan=buildRoundTripPatchPlan({backend:'pwtk',files:[{filename:'layout.json',content:commaLayout}],sourceIdentity:createSourceIdentity({relativeFilePath:'layout.json',symbolPath:'Plant, Left, Speed',confidence:1}),changes:[{property:'name',value:'RPM'}]});
assert.equal(commaPlan.ok,true);
assert.ok(JSON.parse(commaPlan.plan.nextSource).block_containers['#x'].includes('Plant, Left, RPM'));

// Malformed layout maps should be normalized rather than throwing.
const malformed=importPwtkFiles([{filename:'main.py',content:mainPy},{filename:'layout.json',content:'{"block_containers":{"#x":"oops"},"pinned_blocks":[],"timer_vals":null}'}]);
assert.equal(malformed.backend,'pwtk');
assert.equal(malformed.metadata.containers,1);

// pwtk.App form is accepted as app class.
const namespaced=importPwtkFiles([{filename:'app.py',content:`import pwtk\nclass Namespaced(pwtk.App):\n    pass\n`}]);
assert.equal(namespaced.metadata.app.appClass,'Namespaced');

console.log('roundtrip-pwtk.test.mjs passed');

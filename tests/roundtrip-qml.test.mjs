import assert from 'node:assert/strict';
import { detectRoundTripBackend, buildRoundTripGraph, buildRoundTripPatchPlan, createSourceIdentity, listRoundTripBackends, changesFromDesignAgainstInspection } from '../standalone/js/roundtrip-engine.js';
import { importFilesToNeutral, generateNeutralBackend } from '../standalone/js/roundtrip-neutral-ir.js';
import { inspectQmlSource, patchQmlSource } from '../standalone/js/qml-io.js';
import { neutralToDesignerProject, designerProjectToNeutral } from '../standalone/js/roundtrip-conversion.js';
import { inspectSourceAst, buildSyntaxPatchPlan, parserAvailability } from '../roundtrip-node.mjs';
import '../standalone/js/roundtrip-builtins.js';
import { roundTripAdapterManifest } from '../standalone/js/roundtrip-adapter-sdk.js';

const main=`import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ApplicationWindow {
    id: window
    width: 900
    height: 600
    visible: true
    title: qsTr("Demo")

    ColumnLayout {
        id: formColumn
        anchors.fill: parent
        spacing: 12

        Label {
            id: titleLabel
            text: "Device status"
            color: "#ddeeff"
            font.pixelSize: 22
        }
        Button {
            id: connectButton
            text: "Connect"
            width: 160
            onClicked: console.log("connect")
        }
        CheckBox {
            id: autoCheck
            text: "Automatic"
            checked: true
        }
    }
}
`;
const card=`import QtQuick
Rectangle {
    id: cardRoot
    width: 240
    height: 120
    color: "#222222"
}
`;
const files=[{filename:'Main.qml',content:main},{filename:'DeviceCard.qml',content:card},{filename:'CMakeLists.txt',content:'project(Demo)'}];

assert.equal(detectRoundTripBackend(files),'qml');
assert.ok(listRoundTripBackends().some(x=>x.id==='qml'&&x.family==='qt'));
const qmlAdapter=roundTripAdapterManifest().find(x=>x.id==='qml');
assert.ok(qmlAdapter?.operations?.import&&qmlAdapter?.operations?.generate&&qmlAdapter?.operations?.patch,'QML must be exposed through the unified adapter SDK');
const parserHealth=await parserAvailability();assert.equal(parserHealth.qmlStructural,true);assert.equal(typeof parserHealth.qmlRuntime,'boolean');
const graph=buildRoundTripGraph(files,{backend:'qml'});
assert.equal(graph.entryFile,'Main.qml');
assert.ok(graph.reachableFiles.includes('Main.qml'));
const quotedGraph=buildRoundTripGraph([
  {filename:'Main.qml',content:'import QtQuick\nimport "widgets"\nItem { Panel { } }'},
  {filename:'widgets/Panel.qml',content:'import QtQuick\nRectangle { width: 20; height: 20 }'}
],{backend:'qml'});
assert.ok(quotedGraph.reachableFiles.includes('widgets/Panel.qml'),'quoted local QML import directories must resolve component types');
const moduleGraph=buildRoundTripGraph([
  {filename:'Main.qml',content:'import QtQuick\nimport Demo.Components 1.0\nItem { Thing { } }'},
  {filename:'components/qmldir',content:'module Demo.Components\nThing 1.0 Thing.qml\n'},
  {filename:'components/Thing.qml',content:'import QtQuick\nItem { }'}
],{backend:'qml'});
assert.ok(moduleGraph.reachableFiles.includes('components/Thing.qml'),'qmldir module imports must resolve local QML component types');

const inspected=inspectQmlSource(main,{filename:'Main.qml'});
assert.equal(inspected.astValidated,true);
assert.equal(inspected.parser,'qml-structural');
assert.ok(inspected.nodes.some(n=>n.symbolPath==='connectButton'&&n.tag==='Button'&&n.text==='Connect'));
const label=inspected.nodes.find(n=>n.symbolPath==='titleLabel');
assert.equal(label.style.fontSize,'22px');
assert.equal(label.style.color,'#ddeeff');
const form=inspected.nodes.find(n=>n.symbolPath==='formColumn');assert.equal(form.style.width,'100%');assert.equal(form.style.height,'100%');

const doc=importFilesToNeutral(files,{backend:'qml',entryFile:'Main.qml'});
assert.equal(doc.backend,'qml');
assert.equal(doc.filename,'Main.qml');
assert.equal(doc.root.children[0].attrs.qmlType,'ApplicationWindow');
const designer=neutralToDesignerProject(doc,{name:'QML Demo',sourceFiles:files});
assert.equal(designer.workspace.roundTrip.backend,'qml');
assert.ok(designer.workspace.roundTrip.mappings.some(m=>m.symbolPath==='connectButton'));
const findDesigner=(n,id)=>{if(!n)return null;if(n.id===id)return n;for(const c of n.children||[]){const x=findDesigner(c,id);if(x)return x}return null};
const checkMapping=designer.workspace.roundTrip.mappings.find(m=>m.symbolPath==='autoCheck');
const checkNode=findDesigner(designer.pages[0].root,checkMapping.nodeId);
assert.equal(checkNode.type,'checkbox');
checkNode.props.checked=false;
const checkChanges=changesFromDesignAgainstInspection(designer,checkNode.id,inspected);
assert.ok(checkChanges.some(c=>c.property==='checked'&&c.value===false),'QML checked edits must participate in visual-to-source review');
const designerNeutral=designerProjectToNeutral(designer);
const regenFromDesigner=generateNeutralBackend(designerNeutral,'qml');
assert.match(regenFromDesigner['Main.qml'],/CheckBox\s*\{/,'designer export must preserve imported QML control type');
assert.match(regenFromDesigner['Main.qml'],/anchors\.fill:\s*parent/,'opaque direct QML bindings should survive designer export');
assert.match(regenFromDesigner['Main.qml'],/onClicked:\s*console\.log\("connect"\)/,'QML signal handlers should survive export without being rewritten');
assert.match(regenFromDesigner['Main.qml'],/title:\s*qsTr\("Demo"\)/,'opaque root bindings should be preserved when the designer has no mapped replacement');

const gen=generateNeutralBackend(doc,'qml');
assert.ok(gen['Main.qml']);
assert.ok(gen['main.cpp']);
assert.ok(gen['CMakeLists.txt']);
assert.match(gen['Main.qml'],/import QtQuick\.Controls/);
assert.match(gen['Main.qml'],/ApplicationWindow\s*\{/);
assert.match(gen['CMakeLists.txt'],/qt_add_qml_module/);
assert.match(gen['main.cpp'],/QQmlApplicationEngine/);

const patched=patchQmlSource(main,{relativeFilePath:'Main.qml',symbolPath:'connectButton'},[
  {domain:'text',property:'text',value:'Reconnect'},
  {domain:'style',property:'width',value:'200px'}
]);
assert.equal(patched.ok,true);
assert.match(patched.source,/text: "Reconnect"/);
assert.match(patched.source,/width: 200/);
assert.match(patched.source,/onClicked: console\.log\("connect"\)/,'handler must be preserved');

const plan=buildRoundTripPatchPlan({backend:'qml',files:[{filename:'Main.qml',content:main}],sourceIdentity:createSourceIdentity({relativeFilePath:'Main.qml',symbolPath:'titleLabel',confidence:1}),changes:[{domain:'text',property:'text',value:'Ready'}]});
assert.equal(plan.ok,true);
assert.equal(plan.plan.resolution.strategy,'exact-symbol');
assert.match(plan.plan.nextSource,/text: "Ready"/);

const nodeInspection=await inspectSourceAst({backend:'qml',source:main,relativePath:'Main.qml'});
assert.equal(nodeInspection.astValidated,true);
assert.equal(nodeInspection.parser,'qml-structural');
const syntax=await buildSyntaxPatchPlan({backend:'qml',source:main,relativePath:'Main.qml',sourceIdentity:{relativeFilePath:'Main.qml',symbolPath:'connectButton',nodePath:'connectButton',confidence:1},nodeId:'connectButton',changes:[{domain:'text',property:'text',value:'Go'}]});
assert.equal(syntax.ok,true);
assert.match(syntax.plan.nextSource,/text: "Go"/);

console.log('roundtrip-qml.test.mjs passed');

// Multiline JavaScript/property-object bindings stay opaque and are not flattened into visual children.
const multiline=`import QtQuick
import QtQuick.Controls
ApplicationWindow {
    id: multiWindow
    width: 500
    height: 300
    states: [
        State {
            name: "active"
        }
    ]
    Button {
        id: multiButton
        text: "Run"
        background: Rectangle {
            color: "#224466"
            radius: 6
        }
        onClicked: {
            const next = 1 + 2
            console.log(next)
        }
    }
}
`;
const multiInspect=inspectQmlSource(multiline,{filename:'Main.qml'});
const multiButtonInspect=multiInspect.nodes.find(n=>n.symbolPath==='multiButton');
assert.match(multiButtonInspect.properties.find(p=>p.name==='onClicked').raw,/console\.log\(next\)/);
assert.match(multiInspect.nodes.find(n=>n.symbolPath==='multiWindow').properties.find(p=>p.name==='states').raw,/State\s*\{/);
const multiDoc=importFilesToNeutral([{filename:'Main.qml',content:multiline}],{backend:'qml'});
const visualWindow=multiDoc.root.children[0];
assert.equal(visualWindow.children.length,1,'QML objects assigned to states/background properties must not become ordinary visual children');
assert.equal(visualWindow.children[0].name,'multiButton');
const multiDesigner=neutralToDesignerProject(multiDoc,{name:'Multiline QML',sourceFiles:[{filename:'Main.qml',content:multiline}]});
const multiExport=generateNeutralBackend(designerProjectToNeutral(multiDesigner),'qml')['Main.qml'];
assert.match(multiExport,/states:\s*\[\s*State\s*\{/s);
assert.match(multiExport,/background:\s*Rectangle\s*\{/s);
assert.match(multiExport,/onClicked:\s*\{[\s\S]*console\.log\(next\)[\s\S]*\}/);
console.log('roundtrip-qml multiline preservation passed');

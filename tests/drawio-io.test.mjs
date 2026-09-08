import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { createProject, createNode } from '../standalone/js/model.js';
import { exportDrawio, importDrawioText, isDrawioText, parseDrawioStyle } from '../standalone/js/drawio-io.js';
import { listPlatformAdapters } from '../standalone/js/platform-io.js';

const source=`<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" compressed="false">
  <diagram id="page-a" name="Architecture">
    <mxGraphModel pageWidth="1200" pageHeight="800"><root>
      <mxCell id="0"/><mxCell id="1" parent="0"/>
      <mxCell id="api" value="&lt;b&gt;API&lt;/b&gt;" style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontColor=#1f2937;fontSize=16;align=center;verticalAlign=middle;" vertex="1" parent="1"><mxGeometry x="100" y="120" width="180" height="80" as="geometry"/></mxCell>
      <mxCell id="db" value="Database" style="ellipse;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="430" y="120" width="140" height="90" as="geometry"/></mxCell>
      <mxCell id="edge-1" value="query" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;html=1;" edge="1" parent="1" source="api" target="db"><mxGeometry relative="1" as="geometry"/></mxCell>
    </root></mxGraphModel>
  </diagram>
  <diagram id="page-b" name="Second page"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="note" value="Note" style="text;html=1;strokeColor=none;fillColor=none;" vertex="1" parent="1"><mxGeometry x="40" y="50" width="120" height="30" as="geometry"/></mxCell></root></mxGraphModel></diagram>
</mxfile>`;

assert.equal(isDrawioText(source),true);
assert.equal(parseDrawioStyle('rounded=1;fillColor=#fff;').rounded,'1');
const imported=await importDrawioText(source,{projectName:'diagram-import'});
assert.equal(imported.name,'diagram-import');
assert.equal(imported.pages.length,2);
assert.equal(imported.pages[0].name,'Architecture');
const canvas=imported.pages[0].root.children[0];
assert.equal(canvas.type,'freeform');
assert.equal(canvas.meta.drawioCanvas,true);
assert.equal(canvas.children.length,2);
const api=canvas.children.find(n=>n.name==='API');
const db=canvas.children.find(n=>n.name==='Database');
assert.ok(api&&db);
assert.equal(api.style.base.left,'100px');
assert.equal(api.style.base.top,'120px');
assert.equal(api.style.base.width,'180px');
assert.equal(api.style.base.background,'#dae8fc');
assert.equal(api.children[0].props.text,'API');
assert.equal(db.style.base.borderRadius,'50%');
assert.equal(imported.design.interchange.drawio.edges.length,1);
assert.equal(imported.design.interchange.drawio.edges[0].sourceNodeId,api.id);
assert.equal(imported.design.interchange.drawio.edges[0].targetNodeId,db.id);

api.children[0].props.text='Public API';
api.style.base.left='140px';
const exported=exportDrawio(imported,{modified:'2026-09-08T00:00:00.000Z'});
assert.match(exported,/compressed="false"/);
assert.match(exported,/name="Architecture"/);
assert.match(exported,/value="Public API"/);
assert.match(exported,/x="140"/);
assert.match(exported,/source="api" target="db"/);
const roundTrip=await importDrawioText(exported);
assert.equal(roundTrip.pages.length,2);
assert.equal(roundTrip.pages[0].root.children[0].children.find(n=>n.name==='Public API')?.style.base.left,'140px');
assert.equal(roundTrip.design.interchange.drawio.edges.length,1);

const inner='<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="z" value="Compressed node" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="12" y="34" width="100" height="50" as="geometry"/></mxCell></root></mxGraphModel>';
const compressed=deflateRawSync(Buffer.from(encodeURIComponent(inner))).toString('base64');
const compressedProject=await importDrawioText(`<mxfile><diagram name="Compressed">${compressed}</diagram></mxfile>`);
assert.equal(compressedProject.pages[0].root.children[0].children[0].name,'Compressed node');
assert.equal(compressedProject.pages[0].root.children[0].children[0].style.base.top,'34px');

const project=createProject();
const freeform=createNode('freeform',{name:'DiagramCanvas',meta:{drawioCanvas:true}});
freeform.children=[];
const shape=createNode('card',{name:'Service',style:{base:{position:'absolute',left:'55px',top:'65px',width:'220px',height:'90px',background:'#fff2cc',border:'2px solid #d6b656',borderRadius:'12px'}}});
shape.children.push(createNode('text',{name:'ServiceLabel',props:{text:'Service'}}));
freeform.children.push(shape);project.pages[0].root.children=[freeform];
const freshExport=exportDrawio(project,{modified:'2026-09-08T00:00:00.000Z'});
assert.match(freshExport,/fillColor=#fff2cc/);
assert.match(freshExport,/strokeColor=#d6b656/);
assert.match(freshExport,/width="220" height="90"/);


const objectWrapped='<mxfile compressed="false"><diagram name="Objects"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><object id="obj-1" label="Object label"><mxCell style="rounded=1;fillColor=#f8cecc;" vertex="1" parent="1"><mxGeometry x="20" y="30" width="160" height="70" as="geometry"/></mxCell></object></root></mxGraphModel></diagram></mxfile>';
const objectProject=await importDrawioText(objectWrapped);
assert.equal(objectProject.pages[0].root.children[0].children[0].name,'Object label');
assert.equal(objectProject.pages[0].root.children[0].children[0].meta.drawio.cellId,'obj-1');

const embeddedSvg='<svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile compressed=&quot;false&quot;&gt;&lt;diagram name=&quot;SVG embedded&quot;&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;mxCell id=&quot;0&quot;/&gt;&lt;mxCell id=&quot;1&quot; parent=&quot;0&quot;/&gt;&lt;mxCell id=&quot;s1&quot; value=&quot;Embedded&quot; style=&quot;text;strokeColor=none;fillColor=none;&quot; vertex=&quot;1&quot; parent=&quot;1&quot;&gt;&lt;mxGeometry x=&quot;5&quot; y=&quot;6&quot; width=&quot;100&quot; height=&quot;30&quot; as=&quot;geometry&quot;/&gt;&lt;/mxCell&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;"></svg>';
assert.equal(isDrawioText(embeddedSvg),true);
const svgProject=await importDrawioText(embeddedSvg);
assert.equal(svgProject.pages[0].name,'SVG embedded');
assert.equal(svgProject.pages[0].root.children[0].children[0].name,'Embedded');

const adapter=listPlatformAdapters().find(a=>a.id==='drawio');
assert.ok(adapter);
assert.deepEqual(adapter.extensions,['.drawio','.xml','.drawio.svg']);

console.log('drawio-io.test.mjs passed');

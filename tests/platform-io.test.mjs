import assert from 'node:assert/strict';
import { createProject, createNode } from '../standalone/js/model.js';
import { ensureDesignProject, addGuide, addInteraction, addFill, addShadow } from '../standalone/js/penpot-cleanroom.js';
import { exportPenpotV3, importPenpotV3, exportStaticHtml, exportReact, exportVue, exportSvelte, exportSvg, exportNeutralJson, importNeutralJson, exportFigmaJson, importFigmaJson, importHtmlText, importSvgText, listPlatformAdapters } from '../standalone/js/platform-io.js';

const p=createProject();p.name='Interchange Demo';ensureDesignProject(p);
const box=createNode('shapeRect',{name:'Box',style:{base:{position:'absolute',left:'12px',top:'24px',width:'200px',height:'100px'}}});p.pages[0].root.children.push(box);addFill(box,{color:'#336699'});addShadow(box,{x:0,y:4,blur:12});addInteraction(box,{trigger:'click',action:'openUrl',url:'https://example.com'});addGuide(p,'x',80,'Grid');
const penpot=exportPenpotV3(p);assert.equal(penpot[0],0x50);assert.equal(penpot[1],0x4b);
const back=await importPenpotV3(new Blob([penpot]));assert.equal(back.name,'Interchange Demo');assert.ok(back.pages[0].root.children.length>=1);assert.equal(back.design.guides.length,1);
const html=exportStaticHtml(p);assert.match(Object.values(html)[0],/Interchange Demo|data-ui-id/);
assert.match(exportReact(p),/function App/);assert.match(exportVue(p),/<template>/);assert.match(exportSvelte(p),/<script lang="ts">/);assert.match(exportSvg(p),/<svg/);
const neutral=exportNeutralJson(p),neutralBack=importNeutralJson(neutral);assert.equal(neutralBack.name,p.name);
const figma=exportFigmaJson(p),figmaBack=importFigmaJson(figma);assert.equal(figmaBack.pages.length,1);assert.ok(figmaBack.pages[0].root.children.length>=1);
const htmlBack=importHtmlText('<main><section style="padding:20px"><h1>Hello</h1><button>Go</button></section></main>');assert.ok(htmlBack.pages[0].root.children.length>=1);
const svgBack=importSvgText('<svg width="300" height="200"><rect x="10" y="20" width="100" height="50" fill="#f00"/><text x="20" y="100">Hi</text></svg>');assert.ok(svgBack.pages[0].root.children.length>=2);
const adapters=listPlatformAdapters();assert.ok(adapters.filter(a=>a.canImport).length>=5);assert.ok(adapters.filter(a=>a.canExport).length>=8);
assert.equal(adapters.find(a=>a.id==='figma').note.includes('not native'),true);
console.log('platform-io.test: OK');

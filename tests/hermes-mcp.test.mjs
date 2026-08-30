import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const server=path.join(root,'integrations/hermes/mcp/server.mjs');
const fixture=path.join(root,'examples/generated-astro/designer-project.json');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'aui-hermes-mcp-'));
const project=path.join(tmp,'designer-project.json');
fs.copyFileSync(fixture,project);
const parsed=JSON.parse(fs.readFileSync(project,'utf8'));
const rootId=parsed.pages[0].root.id;
const staleRevision=crypto.createHash('sha256').update(fs.readFileSync(project,'utf8')).digest('hex').slice(0,16);

const messages=[
  {jsonrpc:'2.0',id:1,method:'server/discover',params:{}},
  {jsonrpc:'2.0',id:2,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'test',version:'1'}}},
  {jsonrpc:'2.0',method:'notifications/initialized',params:{}},
  {jsonrpc:'2.0',id:3,method:'tools/list',params:{}},
  {jsonrpc:'2.0',id:4,method:'resources/list',params:{}},
  {jsonrpc:'2.0',id:5,method:'prompts/list',params:{}},
  {jsonrpc:'2.0',id:6,method:'tools/call',params:{name:'project_summary',arguments:{}}},
  {jsonrpc:'2.0',id:7,method:'tools/call',params:{name:'add_node',arguments:{parentId:rootId,type:'section',name:'HermesSection',props:{ariaLabel:'Hermes section'},style:{base:{padding:'24px'}}}}},
  {jsonrpc:'2.0',id:8,method:'tools/call',params:{name:'validate_project',arguments:{}}},
  {jsonrpc:'2.0',id:9,method:'tools/call',params:{name:'export_project',arguments:{target:'astro',outputDir:'hermes-out'}}},
  {jsonrpc:'2.0',id:10,method:'tools/call',params:{name:'update_node',arguments:{nodeId:rootId,patch:{name:'StaleWrite'},expectedRevision:staleRevision}}},
  {jsonrpc:'2.0',id:11,method:'tools/call',params:{name:'export_project',arguments:{target:'astro',outputDir:'../escape'}}},
  {jsonrpc:'2.0',id:12,method:'resources/read',params:{uri:'aui://component-registry'}},
  {jsonrpc:'2.0',id:13,method:'prompts/get',params:{name:'review-ui',arguments:{}}},
];
const r=spawnSync(process.execPath,[server,'--project',project],{input:messages.map(x=>JSON.stringify(x)).join('\n')+'\n',encoding:'utf8',timeout:15000});
assert.equal(r.status,0,r.stderr);
const lines=r.stdout.trim().split(/\n+/).map(x=>JSON.parse(x));
const byId=new Map(lines.filter(x=>x.id!=null).map(x=>[x.id,x]));
assert.equal(byId.get(1).result.supportedVersions[0],'2026-07-28');
assert.equal(byId.get(2).result.protocolVersion,'2025-11-25');
assert.ok(byId.get(3).result.tools.some(t=>t.name==='project_summary'));
assert.ok(byId.get(3).result.tools.some(t=>t.name==='add_animation'));
assert.equal(byId.get(4).result.resources.length,4);
assert.equal(byId.get(5).result.prompts.length,3);
assert.equal(byId.get(6).result.structuredContent.counts.pages,2);
assert.equal(byId.get(7).result.structuredContent.result.name,'HermesSection');
assert.equal(byId.get(8).result.structuredContent.errors,0);
assert.ok(byId.get(9).result.structuredContent.files.some(f=>f.includes('src/pages/index.astro')));
assert.equal(byId.get(10).result.isError,true);
assert.equal(byId.get(10).result.structuredContent.code,'REVISION_CONFLICT');
assert.equal(byId.get(11).result.isError,true);
assert.match(byId.get(11).result.content[0].text,/escapes workspace/i);
assert.match(byId.get(12).result.contents[0].text,/Section/);
assert.match(byId.get(13).result.messages[0].content.text,/validate_project/);
const mutated=JSON.parse(fs.readFileSync(project,'utf8'));
assert.ok(mutated.pages[0].root.children.some(n=>n.name==='HermesSection'));
assert.ok(fs.existsSync(path.join(tmp,'hermes-out','src','pages','index.astro')));

const ro=spawnSync(process.execPath,[server,'--project',project,'--read-only'],{input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'create_page',arguments:{name:'Blocked'}}})+'\n',encoding:'utf8',timeout:10000});
assert.equal(ro.status,0,ro.stderr);
const roMsg=JSON.parse(ro.stdout.trim());
assert.equal(roMsg.jsonrpc,'2.0');
assert.equal(roMsg.result.isError,true);
assert.match(roMsg.result.content[0].text,/read-only/i);

fs.rmSync(tmp,{recursive:true,force:true});
console.log('hermes-mcp.test: OK');

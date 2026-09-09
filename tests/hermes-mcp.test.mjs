import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createSampleProject, createNode, makeId } from '../standalone/js/model.js';

const project=createSampleProject();
const free=createNode('freeform',{name:'McpCanvas',style:{base:{position:'relative',width:'600px',height:'400px'}}});
const a=createNode('button',{name:'A',style:{base:{position:'absolute',left:'20px',top:'20px',width:'100px',height:'40px'}},actions:[{id:makeId('act'),event:'click',type:'setState',value:'message=MCP'}]});
const b=createNode('button',{name:'B',style:{base:{position:'absolute',left:'180px',top:'80px',width:'100px',height:'40px'}}});
free.children.push(a,b);project.pages[0].root.children.push(free);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aui-hermes-'));const projectFile=path.join(dir,'designer-project.json');fs.writeFileSync(projectFile,JSON.stringify(project,null,2));
const child=spawn(process.execPath,['integrations/hermes/mcp/server.mjs'],{cwd:process.cwd(),env:{...process.env,ASTRO_UI_PROJECT_ROOT:dir},stdio:['pipe','pipe','inherit']});
let buf='';const pending=[];child.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i);buf=buf.slice(i+1);if(line.trim())pending.shift()?.(JSON.parse(line))}});
const req=(id,method,params={})=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`MCP timeout for ${method}`)),5000);pending.push(v=>{clearTimeout(timer);resolve(v)});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n')});
const toolJson=resp=>JSON.parse(resp.result.content[0].text);
try{
  const init=await req(1,'initialize',{protocolVersion:'2025-11-25'});assert.equal(init.result.serverInfo.name,'astro-ui-designer');assert.equal(init.result.serverInfo.version,'2.18.0');
  const list=await req(2,'tools/list');const names=list.result.tools.map(x=>x.name);for(const n of ['project_summary','validate_project','list_pages','inspect_node','set_node_geometry','arrange_nodes','simulation_start','simulation_event','simulation_state','simulation_reset','export_astro'])assert.ok(names.includes(n),`missing MCP tool ${n}`);
  const summary=toolJson(await req(3,'tools/call',{name:'project_summary',arguments:{}}));assert.ok(summary.pages>=2);
  const inspect=toolJson(await req(4,'tools/call',{name:'inspect_node',arguments:{nodeId:a.id}}));assert.equal(inspect.geometry.left,20);assert.equal(inspect.name,'A');
  const moved=toolJson(await req(5,'tools/call',{name:'set_node_geometry',arguments:{nodeId:a.id,left:44,top:52,width:120,height:48}}));assert.equal(moved.node.geometry.left,44);assert.equal(moved.node.geometry.width,120);
  const arranged=toolJson(await req(6,'tools/call',{name:'arrange_nodes',arguments:{nodeIds:[a.id,b.id],operation:'align-top'}}));assert.equal(arranged.updated,true);assert.equal(arranged.nodes[0].geometry.top,Math.min(...arranged.nodes.map(x=>x.geometry.top)));
  const sim=toolJson(await req(7,'tools/call',{name:'simulation_start',arguments:{pageId:project.pages[0].id,scope:'project'}}));assert.ok(sim.sessionId);
  const event=toolJson(await req(8,'tools/call',{name:'simulation_event',arguments:{sessionId:sim.sessionId,nodeId:a.id,event:'click'}}));assert.equal(event.state.message,'MCP');
  const simState=toolJson(await req(9,'tools/call',{name:'simulation_state',arguments:{sessionId:sim.sessionId}}));assert.equal(simState.state.message,'MCP');assert.ok(simState.events.length>=2);
  const reset=toolJson(await req(10,'tools/call',{name:'simulation_reset',arguments:{sessionId:sim.sessionId}}));assert.equal(reset.state.message,'Hello from state');
  const persisted=JSON.parse(fs.readFileSync(projectFile,'utf8'));const persistedA=persisted.pages[0].root.children.at(-1).children.find(x=>x.id===a.id);assert.equal(persistedA.style.base.left,'44px');
} finally { child.kill();fs.rmSync(dir,{recursive:true,force:true}); }
console.log('hermes-mcp.test.mjs passed');

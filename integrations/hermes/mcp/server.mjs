#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { validateProject } from '../../../standalone/js/validator.js';
import { generateAstroProject } from '../../../standalone/js/astro-exporter.js';
import { findProjectNode, findParent, deepClone } from '../../../standalone/js/model.js';
import { alignRects, distributeRects, tidyRects, reorderChildren } from '../../../standalone/js/advanced-manual-edit.js';
import { createSimulationSession, dispatchSimulationEvent, resetSimulation, simulationSummary, simulationHotspots } from '../../../standalone/js/simulation.js';

const root=path.resolve(process.env.ASTRO_UI_PROJECT_ROOT||process.cwd());
const sessions=new Map();
const PROJECT_FILES=['designer-project.json','.astro-ui.json'];

function projectPath(){for(const name of PROJECT_FILES){const p=path.join(root,name);if(fs.existsSync(p))return p}return null}
function loadProject(){const p=projectPath();if(!p)throw new Error('No designer-project.json or .astro-ui.json found in project root');return {path:p,project:JSON.parse(fs.readFileSync(p,'utf8'))}}
function saveProject(file,project){const temp=`${file}.tmp-${process.pid}`;fs.writeFileSync(temp,JSON.stringify(project,null,2)+'\n','utf8');fs.renameSync(temp,file)}
function safeOut(rel='hermes-export'){const p=path.resolve(root,String(rel||'hermes-export'));if(p!==root&&!p.startsWith(root+path.sep))throw new Error('Output must stay inside the project root');return p}
function numberPx(value){if(value==null||value==='')return null;const m=String(value).trim().match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(?:px)?$/i);return m?Number(m[1]):null}
function finiteNumber(value,label){const n=Number(value);if(!Number.isFinite(n))throw new Error(`${label} must be a finite number`);return n}
function nodeGeometry(node,bp='base'){
  const style={...(node.style?.base||{}),...(bp&&bp!=='base'?(node.style?.[bp]||{}):{})};
  return {id:node.id,left:numberPx(style.left),top:numberPx(style.top),width:numberPx(style.width),height:numberPx(style.height),position:style.position||'flow',rotation:numberPx(style.rotate)||Number(node.design?.manualLayout?.rotation)||0};
}
function geometryTarget(node,bp='base'){node.style||={base:{}};node.style.base||={};if(bp&&bp!=='base'){node.style[bp]||={};return node.style[bp]}return node.style.base}
function nodeSummary(hit,bp='base'){const n=hit.node;return {id:n.id,type:n.type,name:n.name,owner:{id:hit.owner.id,name:hit.owner.name,kind:hit.kind},geometry:nodeGeometry(n,bp),locked:Boolean(n.meta?.locked),hidden:Boolean(n.meta?.hidden),children:(n.children||[]).map(c=>({id:c.id,type:c.type,name:c.name})),actions:deepClone(n.actions||[]),bindings:deepClone(n.bindings||{}),interactions:deepClone(n.design?.interactions||[])}}
function projectSummary(project){return {name:project.name||'',schemaVersion:project.schemaVersion,pages:project.pages?.length||0,components:project.components?.length||0,assets:project.assets?.length||0,variables:project.variables?.length||0,sourceFiles:project.workspace?.files?.length||0,simulation:deepClone(project.simulation?.settings||{})}}
function requireHit(project,id){const hit=findProjectNode(project,String(id||''));if(!hit)throw new Error(`Node not found: ${id}`);return hit}
function commonParent(hitList){if(!hitList.length)return null;const rootNode=hitList[0].root,parent=findParent(rootNode,hitList[0].node.id);if(!parent)return null;for(const h of hitList.slice(1)){if(h.root!==rootNode||findParent(rootNode,h.node.id)?.id!==parent.id)return null}return {root:rootNode,parent}}
function explicitRects(hitList,bp){return hitList.map(h=>{const g=nodeGeometry(h.node,bp);if([g.left,g.top,g.width,g.height].some(v=>v==null))throw new Error(`Node ${h.node.id} needs explicit pixel left/top/width/height for spatial MCP arrangement`);return {...g}})}
function applyPositionPatches(project,hitList,patches,bp){const map=new Map(patches.map(x=>[x.id,x]));for(const h of hitList){const p=map.get(h.node.id);if(!p)continue;const t=geometryTarget(h.node,bp);t.position=t.position&&t.position!=='static'?t.position:'absolute';if(p.left!=null)t.left=`${Math.round(p.left)}px`;if(p.top!=null)t.top=`${Math.round(p.top)}px`;if(p.width!=null)t.width=`${Math.max(1,Math.round(p.width))}px`;if(p.height!=null)t.height=`${Math.max(1,Math.round(p.height))}px`}}

const tools=[
  {name:'project_summary',description:'Summarize the Astro UI Designer project model and simulation configuration.',inputSchema:{type:'object',properties:{}}},
  {name:'validate_project',description:'Validate the designer project model and return issues.',inputSchema:{type:'object',properties:{}}},
  {name:'list_pages',description:'List project page entities, routes, filenames, and root node IDs.',inputSchema:{type:'object',properties:{}}},
  {name:'inspect_node',description:'Inspect one designer node semantically, including geometry, actions, bindings, and prototype interactions.',inputSchema:{type:'object',required:['nodeId'],properties:{nodeId:{type:'string'},breakpoint:{type:'string',default:'base'}}}},
  {name:'set_node_geometry',description:'Set explicit node geometry in the designer model at a breakpoint. This mutates only the designer project JSON.',inputSchema:{type:'object',required:['nodeId'],properties:{nodeId:{type:'string'},breakpoint:{type:'string',default:'base'},left:{type:'number'},top:{type:'number'},width:{type:'number'},height:{type:'number'},rotation:{type:'number'},position:{type:'string',enum:['flow','relative','absolute','fixed','sticky']}}}},
  {name:'arrange_nodes',description:'Apply semantic alignment, distribution, tidy spacing, or layer ordering to selected sibling nodes. Spatial operations require explicit pixel geometry.',inputSchema:{type:'object',required:['nodeIds','operation'],properties:{nodeIds:{type:'array',items:{type:'string'},minItems:1},operation:{type:'string',enum:['align-left','align-hcenter','align-right','align-top','align-vcenter','align-bottom','distribute-h','distribute-v','tidy-h','tidy-v','front','back','forward','backward']},breakpoint:{type:'string',default:'base'},gap:{type:'number'}}}},
  {name:'simulation_start',description:'Start an in-memory deterministic page/project simulation session. No arbitrary user code is executed.',inputSchema:{type:'object',properties:{pageId:{type:'string'},flowId:{type:'string'},scope:{type:'string',enum:['page','project']},viewport:{type:'string'},fixtureId:{type:'string'}}}},
  {name:'simulation_event',description:'Dispatch a declarative event to a node in an MCP simulation session and return updated state/navigation.',inputSchema:{type:'object',required:['sessionId','nodeId'],properties:{sessionId:{type:'string'},nodeId:{type:'string'},event:{type:'string',default:'click'},value:{},interactionId:{type:'string'}}}},
  {name:'simulation_state',description:'Read current route, state, history, overlays, hotspots, and recent events from a simulation session.',inputSchema:{type:'object',required:['sessionId'],properties:{sessionId:{type:'string'}}}},
  {name:'simulation_reset',description:'Reset an MCP simulation session to a clean deterministic state.',inputSchema:{type:'object',required:['sessionId'],properties:{sessionId:{type:'string'},pageId:{type:'string'},scope:{type:'string',enum:['page','project']}}}},
  {name:'export_astro',description:'Generate ordinary Astro source files into a contained output directory.',inputSchema:{type:'object',properties:{outputDir:{type:'string'}}}},
];

async function call(name,args={}){
  const loaded=loadProject(),project=loaded.project;
  if(name==='project_summary')return projectSummary(project);
  if(name==='validate_project')return {issues:validateProject(project)};
  if(name==='list_pages')return {pages:(project.pages||[]).map((p,i)=>({index:i,id:p.id,name:p.name,route:p.route,filename:p.filename,rootId:p.root?.id||''}))};
  if(name==='inspect_node')return nodeSummary(requireHit(project,args.nodeId),args.breakpoint||'base');
  if(name==='set_node_geometry'){
    const hit=requireHit(project,args.nodeId),t=geometryTarget(hit.node,args.breakpoint||'base');
    if(args.position==='flow'){for(const k of ['position','left','right','top','bottom','inset'])delete t[k]}
    else if(args.position)t.position=args.position;
    if(args.left!=null){t.left=`${Math.round(finiteNumber(args.left,'left'))}px`;if(!t.position||t.position==='static')t.position='absolute'}
    if(args.top!=null){t.top=`${Math.round(finiteNumber(args.top,'top'))}px`;if(!t.position||t.position==='static')t.position='absolute'}
    if(args.width!=null)t.width=`${Math.max(1,Math.round(finiteNumber(args.width,'width')))}px`;
    if(args.height!=null)t.height=`${Math.max(1,Math.round(finiteNumber(args.height,'height')))}px`;
    if(args.rotation!=null){hit.node.design||={};hit.node.design.manualLayout||={};hit.node.design.manualLayout.rotation=Math.round(finiteNumber(args.rotation,'rotation'));if(hit.node.design.manualLayout.rotation)t.rotate=`${hit.node.design.manualLayout.rotation}deg`;else delete t.rotate}
    saveProject(loaded.path,project);return {updated:true,node:nodeSummary(hit,args.breakpoint||'base')};
  }
  if(name==='arrange_nodes'){
    const ids=[...new Set((args.nodeIds||[]).map(String))],hits=ids.map(id=>requireHit(project,id)),common=commonParent(hits);if(!common)throw new Error('arrange_nodes requires selected nodes with the same parent');
    const op=String(args.operation||''),bp=args.breakpoint||'base';
    if(['front','back','forward','backward'].includes(op)){common.parent.children=reorderChildren(common.parent.children,ids,op);saveProject(loaded.path,project);return {updated:true,operation:op,order:common.parent.children.map(c=>c.id)}}
    const rects=explicitRects(hits,bp);let patches=[];
    const align={ 'align-left':'left','align-hcenter':'hcenter','align-right':'right','align-top':'top','align-vcenter':'vcenter','align-bottom':'bottom' };
    if(align[op])patches=alignRects(rects,align[op]);
    else if(op==='distribute-h'||op==='distribute-v')patches=distributeRects(rects,op.endsWith('-h')?'h':'v',{gap:args.gap??null});
    else if(op==='tidy-h'||op==='tidy-v')patches=tidyRects(rects,op.endsWith('-h')?'h':'v',args.gap??null);
    else throw new Error(`Unsupported arrange operation: ${op}`);
    applyPositionPatches(project,hits,patches,bp);saveProject(loaded.path,project);return {updated:true,operation:op,nodes:hits.map(h=>nodeSummary(h,bp))};
  }
  if(name==='simulation_start'){
    const session=createSimulationSession(project,{pageId:args.pageId||'',flowId:args.flowId||'',scope:args.scope||'project',viewport:args.viewport||'desktop',fixtureId:args.fixtureId||''});sessions.set(session.id,{projectFile:loaded.path,session});return {...simulationSummary(project,session),sessionId:session.id,hotspots:simulationHotspots(project,session)};
  }
  if(name==='simulation_event'){
    const holder=sessions.get(args.sessionId);if(!holder)throw new Error('Simulation session not found');const latest=loadProject().project;
    const context={};if(Object.prototype.hasOwnProperty.call(args,'value'))context.value=args.value;if(args.interactionId)context.interactionId=args.interactionId;
    const result=dispatchSimulationEvent(latest,holder.session,args.nodeId,args.event||'click',context);return {...result,sessionId:holder.session.id,summary:simulationSummary(latest,holder.session),recentEvents:holder.session.events.slice(-20)};
  }
  if(name==='simulation_state'){
    const holder=sessions.get(args.sessionId);if(!holder)throw new Error('Simulation session not found');const latest=loadProject().project;return {...simulationSummary(latest,holder.session),sessionId:holder.session.id,hotspots:simulationHotspots(latest,holder.session),events:holder.session.events.slice(-100),nodeOverrides:deepClone(holder.session.nodeOverrides)};
  }
  if(name==='simulation_reset'){
    const holder=sessions.get(args.sessionId);if(!holder)throw new Error('Simulation session not found');const latest=loadProject().project;holder.session=resetSimulation(latest,holder.session,{pageId:args.pageId||'',scope:args.scope||holder.session.scope});holder.session.id=args.sessionId;sessions.set(args.sessionId,holder);return {...simulationSummary(latest,holder.session),sessionId:args.sessionId};
  }
  if(name==='export_astro'){
    const out=safeOut(args.outputDir||'hermes-export'),files=generateAstroProject(project);for(const [rel,text] of Object.entries(files)){const f=safeOut(path.join(path.relative(root,out),rel));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,text)}return {outputDir:path.relative(root,out),files:Object.keys(files)};
  }
  throw new Error(`Unknown tool: ${name}`);
}

function reply(id,result,error=null){process.stdout.write(JSON.stringify(error?{jsonrpc:'2.0',id,error:{code:-32000,message:error.message||String(error)}}:{jsonrpc:'2.0',id,result})+'\n')}
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on('line',async line=>{let m;try{m=JSON.parse(line)}catch{return}try{
  if(m.method==='initialize')return reply(m.id,{protocolVersion:m.params?.protocolVersion||'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'astro-ui-designer',version:'2.18.0'}});
  if(m.method==='tools/list')return reply(m.id,{tools});
  if(m.method==='tools/call')return reply(m.id,{content:[{type:'text',text:JSON.stringify(await call(m.params?.name,m.params?.arguments||{}),null,2)}]});
  if(m.method==='ping')return reply(m.id,{});
  if(m.id!=null)reply(m.id,null,new Error(`Unknown method: ${m.method}`));
}catch(error){if(m.id!=null)reply(m.id,null,error)}});

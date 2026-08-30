#!/usr/bin/env node
import readline from 'node:readline';
import { ProjectService, resolveProjectArg } from './project-service.mjs';

const SERVER = { name: 'astro-ui-designer', version: '2.7.0' };
const MODERN_PROTOCOL = '2026-07-28';
const LEGACY_PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26'];
const { projectPath, readOnly } = resolveProjectArg();
const service = new ProjectService({ projectPath, readOnly });
const capabilities = { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false }, prompts: { listChanged: false } };

const tools = [
  tool('project_summary','Read the current Astro UI Designer project summary, revision, workspace path, counts and output settings.',{}),
  tool('list_pages','List project pages, routes, source filenames and root node IDs.',{}),
  tool('list_components','List reusable components, props, slots and story counts.',{}),
  tool('list_component_types','List visual component types available for add_node, including defaults and whether they accept children.',{}),
  tool('get_node','Read one design node by stable node ID.',{nodeId:str('Stable node ID')},['nodeId']),
  tool('search_design','Search node names, types, text, props, DOM IDs and CSS classes.',{query:str('Search text'),limit:num('Maximum results, default 50')},['query']),
  tool('validate_project','Run the designer structural/project validator.',{}),
  tool('audit_project','Run accessibility, contrast, responsive, SEO and/or performance audits.',{kinds:arrEnum(['accessibility','contrast','responsive','seo','performance'],'Audit groups; omit for all.')}),
  tool('find_usages','Find project-wide usages of a component, asset, mixin, token, global variant, query or context.',{kind:enm(['component','asset','mixin','token','globalVariant','query','context'],'Reference kind'),id:str('Reference ID')},['kind','id']),
  tool('list_platforms','List import/export adapters and fidelity notes.',{}),
  tool('generated_source','Read generated Astro/project source without writing it.',{file:str('Optional generated project path, e.g. src/pages/index.astro')}),
  tool('create_page','Create a new Astro page document and save the designer project.',{name:str('Page name'),route:str('Route such as /settings'),title:str('SEO title'),description:str('SEO description'),expectedRevision:rev()},['name']),
  tool('add_node','Insert a visual node below a parent node and save the project.',{parentId:str('Parent node ID'),type:str('Component type from list_component_types'),name:str('Optional instance name'),props:obj('Prop overrides'),style:obj('Breakpoint style object, e.g. {base:{padding:"16px"}}'),meta:obj('Safe metadata overrides'),index:num('Optional insertion index'),expectedRevision:rev()},['parentId','type']),
  tool('update_node','Patch node name, props, style, metadata, variant/state or visibility condition.',{nodeId:str('Node ID'),patch:obj('Patch: name, props, style, meta, variant, componentState, visibilityCondition'),expectedRevision:rev()},['nodeId','patch']),
  tool('delete_node','Delete a non-root design node.',{nodeId:str('Node ID'),expectedRevision:rev()},['nodeId']),
  tool('add_action','Attach a web action to a node.',{nodeId:str('Node ID'),event:str('Event such as click/input/change'),type:str('Action type such as navigate/show/hide/toggleClass/setState/playAnimation'),target:str('Target node/state/action target'),value:{},condition:str('Optional expression condition'),expectedRevision:rev()},['nodeId','event','type']),
  tool('add_animation','Create or apply an animation to a node. Supports preset or property/from/to with CSS/WAAPI controls.',{nodeId:str('Node ID'),preset:enm(['fadeIn','fadeUp','scaleIn','slideLeft','pulse','spin'],'Optional preset'),property:str('CSS/animation property'),from:str('Start value'),to:str('End value'),duration:num('Duration milliseconds'),engine:enm(['auto','css','waapi'],'Export backend'),trigger:enm(['manual','load','hover','focus','click','inView','scroll'],'Animation trigger'),expectedRevision:rev()},['nodeId']),
  tool('add_story','Create a Component Lab story for a reusable component.',{componentId:str('Reusable component ID'),name:str('Story name'),args:obj('Initial component args'),expectedRevision:rev()},['componentId']),
  tool('create_query','Create a local/server data query in the composition model.',{name:str('Query name'),kind:enm(['static','collection','http','graphql','expression'],'Query kind'),url:str('HTTP/GraphQL URL'),method:str('HTTP method'),headers:obj('Headers'),body:{},collection:str('Astro collection name'),expression:str('Restricted expression'),mockData:{},variables:obj('Query variables'),expectedRevision:rev()},['name','kind']),
  tool('apply_template','Instantiate a saved Composition template under a parent node.',{templateId:str('Template ID'),parentId:str('Parent node ID'),index:num('Optional insertion index'),expectedRevision:rev()},['templateId','parentId']),
  tool('export_project','Write generated output inside the project workspace. Astro is full-fidelity; other targets use the configured interchange adapters.',{target:enm(['astro','react','vue','svelte','html','svg','neutral','figma','penpot'],'Export target'),outputDir:str('Relative output directory inside workspace, default hermes-export')},['target']),
];

const resources = [
  { uri: 'aui://project/summary', name: 'Project summary', description: 'Current project revision, counts and output settings.', mimeType: 'application/json' },
  { uri: 'aui://project/validation', name: 'Project validation', description: 'Current structural validation diagnostics.', mimeType: 'application/json' },
  { uri: 'aui://component-registry', name: 'Component registry', description: 'Visual component types available for insertion.', mimeType: 'application/json' },
  { uri: 'aui://platform-adapters', name: 'Platform adapters', description: 'Current import/export target capabilities and fidelity notes.', mimeType: 'application/json' },
];

const prompts = [
  { name:'build-page', description:'Plan and build a validated Astro page through the Astro UI Designer semantic model.', arguments:[{name:'requirements',description:'Page requirements and desired behavior',required:true}] },
  { name:'review-ui', description:'Review the current design for structural, responsive, accessibility, SEO and performance issues.', arguments:[] },
  { name:'component-quality', description:'Review reusable components and Component Lab stories before export.', arguments:[] },
];

function tool(name, description, properties, required = []) { return { name, description, inputSchema: { type:'object', properties, required, additionalProperties:false } }; }
function str(description){return {type:'string',description}}
function num(description){return {type:'number',description}}
function obj(description){return {type:'object',description,additionalProperties:true}}
function enm(values,description){return {type:'string',enum:values,description}}
function arrEnum(values,description){return {type:'array',items:{type:'string',enum:values},description}}
function rev(){return {type:'string',description:'Optional revision returned by a recent read. Use it to prevent overwriting concurrent changes.'}}

function send(message) { process.stdout.write(JSON.stringify(message) + '\n'); }
function result(id, value) { send({ jsonrpc:'2.0', id, result:value }); }
function error(id, code, message, data) { send({ jsonrpc:'2.0', id, error:{ code, message, ...(data === undefined ? {} : {data}) } }); }
function content(value) { const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2); return { content:[{type:'text',text}], structuredContent: typeof value === 'object' && value !== null ? value : undefined, isError:false }; }
function instructions(){return 'Use project_summary before mutations. Prefer stable node IDs, pass expectedRevision for edits, validate/audit after changes, and export only after errors are resolved. The server is scoped to one designer-project.json and never exposes a generic filesystem or shell tool.'}

async function dispatch(msg) {
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return;
  if (msg.id == null) return handleNotification(msg);
  try {
    switch (msg.method) {
      case 'server/discover': return result(msg.id,{supportedVersions:[MODERN_PROTOCOL,...LEGACY_PROTOCOLS],capabilities,instructions:instructions(),_meta:{'io.modelcontextprotocol/serverInfo':SERVER}});
      case 'initialize': {
        const requested = msg.params?.protocolVersion;
        const protocolVersion = LEGACY_PROTOCOLS.includes(requested) ? requested : LEGACY_PROTOCOLS[0];
        return result(msg.id,{protocolVersion,capabilities,serverInfo:SERVER,instructions:instructions()});
      }
      case 'ping': return result(msg.id,{});
      case 'tools/list': return result(msg.id,{tools});
      case 'tools/call': return result(msg.id,await callToolSafely(msg.params?.name,msg.params?.arguments || {}));
      case 'resources/list': return result(msg.id,{resources});
      case 'resources/read': return result(msg.id,readResource(msg.params?.uri));
      case 'prompts/list': return result(msg.id,{prompts});
      case 'prompts/get': return result(msg.id,getPrompt(msg.params?.name,msg.params?.arguments || {}));
      default: return error(msg.id,-32601,`Method not found: ${msg.method}`);
    }
  } catch (e) {
    const code = e?.code === 'REVISION_CONFLICT' ? -32009 : -32000;
    return error(msg.id,code,e?.message || String(e),{name:e?.name || 'Error'});
  }
}
function handleNotification(msg) { if (process.env.AUI_MCP_DEBUG) process.stderr.write(`[mcp notification] ${msg.method}\n`); }
async function callToolSafely(name,args) {
  try { return await callTool(name,args); }
  catch (e) {
    return { content:[{type:'text',text:e?.message || String(e)}], isError:true, structuredContent:{code:e?.code || 'TOOL_ERROR', message:e?.message || String(e)} };
  }
}
async function callTool(name,args) {
  let value;
  switch(name){
    case 'project_summary': value=service.summary(); break;
    case 'list_pages': value=service.listPages(); break;
    case 'list_components': value=service.listComponents(); break;
    case 'list_component_types': value={types:service.componentRegistry()}; break;
    case 'get_node': value=service.getNode(requireString(args,'nodeId')); break;
    case 'search_design': value=service.search(requireString(args,'query'),Math.max(1,Math.min(200,Number(args.limit)||50))); break;
    case 'validate_project': value=service.validate(); break;
    case 'audit_project': value=service.audit(args.kinds); break;
    case 'find_usages': value=service.usage({kind:requireString(args,'kind'),id:requireString(args,'id')}); break;
    case 'list_platforms': value={platforms:listPlatforms()}; break;
    case 'generated_source': value=service.generatedSource(args.file || ''); break;
    case 'create_page': value=service.createPage(args); break;
    case 'add_node': value=service.addNode(args); break;
    case 'update_node': value=service.updateNode(args); break;
    case 'delete_node': value=service.deleteNode(args); break;
    case 'add_action': value=service.addAction(args); break;
    case 'add_animation': value=service.addAnimation(args); break;
    case 'add_story': value=service.addStory(args); break;
    case 'create_query': value=service.createQuery(args); break;
    case 'apply_template': value=service.applyTemplate(args); break;
    case 'export_project': value=service.exportProject(args); break;
    default: throw new Error(`Unknown tool: ${name}`);
  }
  return content(value);
}
function listPlatforms(){return service ? (awaitableListPlatforms()) : []}
function awaitableListPlatforms(){
  // Keep the server dependency-free; ProjectService already imports the adapter registry.
  return [
    {id:'astro',label:'Astro project',canExport:true,canImport:true,note:'Native/full fidelity'},
    {id:'penpot',label:'Penpot v3 (.penpot)',canExport:true,canImport:true,note:'Clean-room open ZIP/JSON adapter'},
    {id:'figma',label:'Figma REST-style JSON bridge',canExport:true,canImport:true,note:'Not native .fig'},
    {id:'neutral',label:'Neutral Designer JSON',canExport:true,canImport:true},
    {id:'html',label:'Static HTML',canExport:true,canImport:true},
    {id:'svg',label:'SVG',canExport:true,canImport:true},
    {id:'react',label:'React / JSX',canExport:true,canImport:false},
    {id:'vue',label:'Vue SFC',canExport:true,canImport:false},
    {id:'svelte',label:'Svelte',canExport:true,canImport:false},
  ];
}
function requireString(args,key){const v=args?.[key];if(typeof v!=='string'||!v.trim())throw new Error(`${key} must be a non-empty string.`);return v}
function readResource(uri) {
  let data;
  if(uri==='aui://project/summary')data=service.summary();
  else if(uri==='aui://project/validation')data=service.validate();
  else if(uri==='aui://component-registry')data={types:service.componentRegistry()};
  else if(uri==='aui://platform-adapters')data={platforms:awaitableListPlatforms()};
  else throw new Error(`Unknown resource: ${uri}`);
  return {contents:[{uri,mimeType:'application/json',text:JSON.stringify(data,null,2)}]};
}
function getPrompt(name,args) {
  if(name==='build-page')return {description:'Build an Astro UI Designer page safely.',messages:[{role:'user',content:{type:'text',text:`Build this page through the Astro UI Designer MCP tools: ${args.requirements||''}\nStart with project_summary and list_component_types. Reuse existing components where suitable. Make changes with expectedRevision, then validate_project and audit_project. Fix errors before export_project(target=astro).`}}]};
  if(name==='review-ui')return {description:'Review the current UI.',messages:[{role:'user',content:{type:'text',text:'Review the current Astro UI Designer project. Run project_summary, validate_project, and audit_project. Search/get specific nodes as needed. Report concrete issues by node ID and propose minimal fixes; do not mutate unless explicitly asked.'}}]};
  if(name==='component-quality')return {description:'Review components and stories.',messages:[{role:'user',content:{type:'text',text:'Review reusable components and their Component Lab stories. List components, inspect relevant nodes, validate/audit the project, and identify missing stories, accessibility issues, responsive problems, or brittle component contracts.'}}]};
  throw new Error(`Unknown prompt: ${name}`);
}

try { service.summary(); } catch (e) { process.stderr.write(`[astro-ui-designer MCP] ${e.message}\n`); }
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
let queue = Promise.resolve();
rl.on('line', line => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch (e) { error(null,-32700,'Parse error'); return; }
  queue = queue.then(() => dispatch(msg)).catch(e => process.stderr.write(`[astro-ui-designer MCP] ${e.stack || e}\n`));
});

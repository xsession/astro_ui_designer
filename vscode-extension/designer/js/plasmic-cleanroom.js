import { makeId, deepClone, collectProjectNodes, findProjectNode, walk } from './model.js';

export const PLASMIC_CLEANROOM_VERSION = 1;

export function ensureCompositionModel(project) {
  project.schemaVersion = Math.max(Number(project.schemaVersion || 1), 7);
  project.composition ??= {
    version: 1,
    globalVariants: [],
    activeGlobalVariants: {},
    mixins: [],
    globalContexts: [],
    queries: [],
    templates: [],
    refactors: { history: [] },
  };
  const c = project.composition;
  c.globalVariants ??= [];
  c.activeGlobalVariants ??= {};
  c.mixins ??= [];
  c.globalContexts ??= [];
  c.queries ??= [];
  c.templates ??= [];
  c.refactors ??= { history: [] };
  for (const ext of project.workspace?.externalComponents || []) normalizeCodeComponentContract(ext);
  for (const { node } of collectProjectNodes(project)) ensureCompositionNode(node);
  return project;
}

export function ensureCompositionNode(node) {
  node.composition ??= { mixins: [], globalVariantStyles: [], queryBindings: {}, contextBindings: {} };
  node.composition.mixins ??= [];
  node.composition.globalVariantStyles ??= [];
  node.composition.queryBindings ??= {};
  node.composition.contextBindings ??= {};
  return node;
}

export function normalizeCodeComponentContract(descriptor) {
  descriptor.contract ??= {};
  const c = descriptor.contract;
  c.displayName ??= descriptor.name || descriptor.symbol || 'Code Component';
  c.description ??= '';
  c.section ??= 'Code Components';
  c.props ??= deepClone(descriptor.props || []);
  c.slots ??= deepClone(descriptor.slots || []);
  c.states ??= [];
  c.events ??= [];
  c.providesData ??= [];
  c.globalActions ??= [];
  c.styleScope ??= 'root';
  c.canHaveChildren ??= Boolean(c.slots?.length);
  c.defaultStyles ??= {};
  c.metadata ??= {};
  descriptor.props = c.props;
  descriptor.slots = c.slots;
  return descriptor;
}

export function registerCodeComponentContract(project, descriptor) {
  ensureCompositionModel(project);
  const id = descriptor.id || makeId('codecmp');
  const item = normalizeCodeComponentContract({
    id,
    name: descriptor.name || descriptor.symbol || 'CodeComponent',
    symbol: descriptor.symbol || descriptor.name || 'CodeComponent',
    importPath: descriptor.importPath || '',
    framework: descriptor.framework || 'astro',
    sourceFile: descriptor.sourceFile || '',
    props: deepClone(descriptor.props || []),
    slots: deepClone(descriptor.slots || []),
    contract: deepClone(descriptor.contract || {}),
  });
  const list = project.workspace.externalComponents;
  const i = list.findIndex(x => x.id === id || (x.importPath === item.importPath && x.symbol === item.symbol));
  if (i >= 0) list[i] = item; else list.push(item);
  return item;
}

export function addGlobalVariantGroup(project, name = 'Theme', options = ['default', 'alternate']) {
  ensureCompositionModel(project);
  const g = { id: makeId('global-variant'), name, options: options.map((x,i)=>({ id: makeId('variant-option'), name:String(x), value:String(x), order:i })), description: '' };
  project.composition.globalVariants.push(g);
  project.composition.activeGlobalVariants[g.id] = g.options[0]?.value || '';
  return g;
}

export function setGlobalVariant(project, groupId, value) {
  ensureCompositionModel(project);
  const g = project.composition.globalVariants.find(x => x.id === groupId);
  if (!g || !g.options.some(x => x.value === value)) return false;
  project.composition.activeGlobalVariants[groupId] = value;
  return true;
}

export function addNodeGlobalVariantStyle(node, groupId, value, style = {}) {
  ensureCompositionNode(node);
  const r = { id: makeId('global-variant-style'), groupId, value, style: deepClone(style) };
  node.composition.globalVariantStyles.push(r);
  return r;
}

export function effectiveCompositionStyle(project, node, base = {}) {
  ensureCompositionModel(project); ensureCompositionNode(node);
  const out = { ...base };
  for (const mixinId of node.composition.mixins || []) {
    const m = project.composition.mixins.find(x => x.id === mixinId);
    if (m) Object.assign(out, m.style || {});
  }
  for (const r of node.composition.globalVariantStyles || []) {
    if (project.composition.activeGlobalVariants?.[r.groupId] === r.value) Object.assign(out, r.style || {});
  }
  return out;
}

export function addMixin(project, name = 'Mixin', style = {}) {
  ensureCompositionModel(project);
  const m = { id: makeId('mixin'), name, description: '', style: deepClone(style), tags: [] };
  project.composition.mixins.push(m); return m;
}
export function applyMixin(node, mixinId) { ensureCompositionNode(node); if (!node.composition.mixins.includes(mixinId)) node.composition.mixins.push(mixinId); return node; }
export function removeMixin(node, mixinId) { ensureCompositionNode(node); node.composition.mixins = node.composition.mixins.filter(x=>x!==mixinId); return node; }

export function addGlobalContext(project, name = 'AppContext') {
  ensureCompositionModel(project);
  const ctx = { id: makeId('context'), name, description: '', values: {}, actions: [], providesData: true };
  project.composition.globalContexts.push(ctx); return ctx;
}
export function addGlobalAction(context, name='action', parameters=[]) { const a={id:makeId('global-action'),name,parameters:deepClone(parameters),description:''};context.actions??=[];context.actions.push(a);return a; }

export function addQuery(project, name='query', kind='collection') {
  ensureCompositionModel(project);
  const q={id:makeId('query'),name,kind,scope:'universal',source:'',method:'GET',params:[],headers:{},expression:'',collection:'',mockData:[],cache:{mode:'default',ttl:0},description:''};
  project.composition.queries.push(q);return q;
}

export function evaluateQuery(project, query, input = {}) {
  ensureCompositionModel(project);
  if (!query) return { ok:false, data:null, error:'Query not found' };
  if (query.kind === 'collection') {
    const c = project.content?.collections?.find(x => x.id === query.collection || x.name === query.collection);
    return c ? { ok:true, data:deepClone(c.entries || []), error:'' } : { ok:false, data:[], error:'Collection not found' };
  }
  if (query.kind === 'static' || query.kind === 'json') return { ok:true, data:deepClone(query.mockData ?? []), error:'' };
  if (query.kind === 'expression') {
    const key=String(query.expression||'').trim();
    if (/^input\.[A-Za-z_$][\w$]*$/.test(key)) return {ok:true,data:deepClone(input[key.slice(6)]),error:''};
    return {ok:false,data:null,error:'Only input.<name> expressions execute inside the offline editor.'};
  }
  return { ok:true, data:deepClone(query.mockData ?? []), error:'Network/server query preview uses mock data in the editor.' };
}

export function bindNodeQuery(node, prop, queryId, path='') { ensureCompositionNode(node); node.composition.queryBindings[prop]={queryId,path}; return node; }
export function bindNodeContext(node, prop, contextId, path='') { ensureCompositionNode(node); node.composition.contextBindings[prop]={contextId,path}; return node; }

export function createTemplate(project, { name='Section template', kind='section', root=null, description='', category='Custom', tags=[] }={}) {
  ensureCompositionModel(project);
  const t={id:makeId('template'),name,kind,description,category,tags:[...tags],root:root?deepClone(root):null,createdAt:new Date().toISOString()};
  project.composition.templates.push(t);return t;
}
export function instantiateTemplate(template) {
  if (!template?.root) return null;
  const copy=deepClone(template.root);
  walk(copy,n=>{n.id=makeId(n.type||'node');n.name=n.name||n.type||'Node';});
  return copy;
}

function includesToken(v, token) { return typeof v === 'string' && v.includes(`var(--${token})`); }
export function findUsages(project, ref) {
  ensureCompositionModel(project);
  const out=[]; const push=(kind,owner,node,detail)=>out.push({kind,ownerId:owner?.id||'',ownerName:owner?.name||'',nodeId:node?.id||'',nodeName:node?.name||'',detail});
  for(const {node,owner} of collectProjectNodes(project)){
    if(ref.kind==='component'&&node.type==='componentInstance'&&node.props?.definitionId===ref.id)push('component',owner,node,'component instance');
    if(ref.kind==='asset'&&Object.values(node.props||{}).some(v=>String(v).includes(`asset:${ref.id}`)))push('asset',owner,node,'asset property');
    if(ref.kind==='mixin'&&(node.composition?.mixins||[]).includes(ref.id))push('mixin',owner,node,'style mixin');
    if(ref.kind==='token')for(const [bp,style] of Object.entries(node.style||{}))for(const [k,v] of Object.entries(style||{}))if(includesToken(v,ref.id))push('token',owner,node,`${bp}.${k}`);
    if(ref.kind==='globalVariant'&&(node.composition?.globalVariantStyles||[]).some(x=>x.groupId===ref.id))push('globalVariant',owner,node,'global variant style');
    if(ref.kind==='query'&&Object.values(node.composition?.queryBindings||{}).some(x=>x.queryId===ref.id))push('query',owner,node,'query binding');
    if(ref.kind==='context'&&Object.values(node.composition?.contextBindings||{}).some(x=>x.contextId===ref.id))push('context',owner,node,'context binding');
  }
  return out;
}

export function replaceComponentUsages(project, fromId, toId) {
  let count=0; for(const {node} of collectProjectNodes(project)) if(node.type==='componentInstance'&&node.props?.definitionId===fromId){node.props.definitionId=toId;count++;}
  project.composition?.refactors?.history?.push({at:new Date().toISOString(),type:'replace-component',fromId,toId,count}); return count;
}

export function compositionSummary(project) {
  ensureCompositionModel(project); const c=project.composition;
  return {globalVariants:c.globalVariants.length,mixins:c.mixins.length,contexts:c.globalContexts.length,queries:c.queries.length,templates:c.templates.length};
}

export function exportCompositionManifest(project) {
  ensureCompositionModel(project);
  return {version:PLASMIC_CLEANROOM_VERSION,globalVariants:deepClone(project.composition.globalVariants),mixins:deepClone(project.composition.mixins),globalContexts:deepClone(project.composition.globalContexts),queries:deepClone(project.composition.queries),templates:(project.composition.templates||[]).map(({root,...x})=>({...x,hasRoot:Boolean(root)})),externalComponents:deepClone(project.workspace?.externalComponents||[])};
}

export function generateQueryModule(project) {
  ensureCompositionModel(project);
  const lines=[`// Generated by Astro UI Designer. Queries execute in your app, not through a hosted visual-builder proxy.`,`export const uiQueries = {`];
  for(const q of project.composition.queries){
    const id=JSON.stringify(q.name); let body='';
    if(q.kind==='collection') body=`async (ctx = {}) => ctx.collections?.[${JSON.stringify(q.collection)}] ?? []`;
    else if(q.kind==='static'||q.kind==='json') body=`async () => ${JSON.stringify(q.mockData??[],null,2)}`;
    else if(q.kind==='graphql') body=`async (ctx = {}) => { const r = await fetch(${JSON.stringify(q.source||'')}, { method: 'POST', headers: { 'content-type':'application/json', ...(${JSON.stringify(q.headers||{})}) }, body: JSON.stringify({ query: ${JSON.stringify(q.expression||'')}, variables: ctx }) }); if(!r.ok) throw new Error('GraphQL query failed: '+r.status); return r.json(); }`;
    else if(q.kind==='http') body=`async (ctx = {}) => { const r = await fetch(${JSON.stringify(q.source||'')}, { method: ${JSON.stringify(q.method||'GET')}, headers: ${JSON.stringify(q.headers||{})} }); if(!r.ok) throw new Error('HTTP query failed: '+r.status); return r.json(); }`;
    else body=`async (ctx = {}) => ctx[${JSON.stringify(q.expression||q.name)}]`;
    lines.push(`  ${id}: ${body},`);
  }
  lines.push(`} as const;`,`export type UiQueryName = keyof typeof uiQueries;`,`export async function runUiQuery(name: UiQueryName, ctx: Record<string, unknown> = {}) { return uiQueries[name](ctx as never); }`,` `);
  return lines.join('\n');
}

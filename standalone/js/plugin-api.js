import { COMPONENTS, ACTION_TYPES } from './registry.js';

const plugins=[];
const contributionKinds=['dataSources','importers','deployers','assistants','testAdapters','sourceAdapters','tokenAdapters'];
const contributions=Object.fromEntries(contributionKinds.map(k=>[k,[]]));

function normalizeContribution(pluginId,kind,item,index){
  if(typeof item==='function') return {id:`${pluginId}:${kind}:${index}`,label:item.name||`${kind} ${index+1}`,run:item,pluginId};
  return {pluginId,id:item?.id||`${pluginId}:${kind}:${index}`,...item};
}

export function registerDesignerPlugin(plugin){
  if(!plugin?.id) throw new Error('Plugin id is required');
  if(plugins.some(p=>p.id===plugin.id)) throw new Error(`Plugin already registered: ${plugin.id}`);
  if(plugin.components) for(const [id,spec] of Object.entries(plugin.components)) { if(COMPONENTS[id]) throw new Error(`Component type already exists: ${id}`); COMPONENTS[id]=spec; }
  if(plugin.actions) ACTION_TYPES.push(...plugin.actions);
  for(const kind of contributionKinds){
    const values=Array.isArray(plugin[kind])?plugin[kind]:(plugin[kind]?[plugin[kind]]:[]);
    values.forEach((item,i)=>contributions[kind].push(normalizeContribution(plugin.id,kind,item,i)));
  }
  plugins.push(plugin);
  plugin.activate?.({components:COMPONENTS,actions:ACTION_TYPES,contributions,registerContribution:(kind,item)=>{
    if(!contributions[kind]) throw new Error(`Unknown contribution kind: ${kind}`);
    contributions[kind].push(normalizeContribution(plugin.id,kind,item,contributions[kind].length));
  }});
}

export const getDesignerPlugins=()=>plugins.slice();
export const getDesignerContributions=(kind)=>kind ? (contributions[kind]||[]).slice() : Object.fromEntries(Object.entries(contributions).map(([k,v])=>[k,v.slice()]));
export const DESIGNER_CONTRIBUTION_KINDS=Object.freeze([...contributionKinds]);

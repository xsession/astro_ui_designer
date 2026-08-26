import { COMPONENTS } from './registry.js';
import { collectProjectNodes, walk } from './model.js';
import { getDesignerPlugins } from './plugin-api.js';
import { validateAnimation } from './animation.js';

export function validateProject(project) {
  const issues=[]; const ids=new Set(); const namesByScope=new Map();
  const add=(severity,code,message,nodeId=null,ownerId=null,fix=null)=>issues.push({id:`${code}-${issues.length}`,severity,code,message,nodeId,ownerId,fix});
  if(!project.name?.trim()) add('error','P001','Project name is empty.');
  const routes=new Map(), files=new Map();
  for(const page of project.pages||[]){
    if(routes.has(page.route)) add('error','P010',`Duplicate route: ${page.route}`,page.root?.id,page.id); else routes.set(page.route,page.id);
    if(files.has(page.filename)) add('error','P012',`Duplicate page filename: ${page.filename}`,page.root?.id,page.id); else files.set(page.filename,page.id);
    if(!page.route?.startsWith('/')) add('warning','P011',`Route should start with /: ${page.route}`,page.root?.id,page.id);
    if(!page.seo?.title?.trim()) add('warning','SEO01',`Page ${page.name} has no SEO title.`,page.root?.id,page.id);
  }

  const componentNames=new Map(), componentFiles=new Map();
  for(const c of project.components||[]){
    if(componentNames.has(c.name)) add('error','CMP10',`Duplicate component name: ${c.name}`,c.root?.id,c.id); else componentNames.set(c.name,c.id);
    if(componentFiles.has(c.filename)) add('error','CMP11',`Duplicate component filename: ${c.filename}`,c.root?.id,c.id); else componentFiles.set(c.filename,c.id);
  }
  const assetFiles=new Map(); for(const a of project.assets||[]){if(assetFiles.has(a.filename)) add('error','AST01',`Duplicate asset filename: ${a.filename}`); else assetFiles.set(a.filename,a.id);}
  const sourceFiles=new Set(); for(const f of project.workspace?.files||[]){if(sourceFiles.has(f.filename))add('error','SRC01',`Duplicate source snapshot: ${f.filename}`);sourceFiles.add(f.filename);if(!['designer','hybrid','code'].includes(f.ownership||'hybrid'))add('warning','SRC02',`Unknown source ownership: ${f.ownership}`);}
  const externalIds=new Set(); for(const d of project.workspace?.externalComponents||[]){if(externalIds.has(d.id))add('error','SRC03',`Duplicate external component descriptor: ${d.id}`);externalIds.add(d.id);if(!d.importPath)add('error','SRC04',`External component ${d.name||d.id} has no import path.`);}
  const collectionNames=new Set(); for(const c of project.content?.collections||[]){if(collectionNames.has(c.name))add('error','CNT01',`Duplicate content collection: ${c.name}`);collectionNames.add(c.name);if(!/^[A-Za-z_][\w-]*$/.test(c.name||''))add('warning','CNT02',`Collection name is not generator-friendly: ${c.name}`);const slugs=new Set();for(const e of c.entries||[]){if(slugs.has(e.slug))add('error','CNT03',`Duplicate slug ${e.slug} in collection ${c.name}`);slugs.add(e.slug)}}
  const dsNames=new Set(); for(const d of project.content?.dataSources||[]){if(dsNames.has(d.name))add('error','DATA01',`Duplicate data source: ${d.name}`);dsNames.add(d.name);if(['rest','graphql'].includes(d.kind)&&!d.url)add('warning','DATA02',`Data source ${d.name} has no URL.`);}
  const localeIds=new Set(); for(const l of project.locales?.available||[]){if(localeIds.has(l.id))add('error','LOC01',`Duplicate locale: ${l.id}`);localeIds.add(l.id);}

  for(const item of collectProjectNodes(project)){
    const {node,owner}=item;
    if(ids.has(node.id)) add('error','M001',`Duplicate node id ${node.id}`,node.id,owner.id); ids.add(node.id);
    const spec=COMPONENTS[node.type]; if(!spec){add('error','M002',`Unknown node type ${node.type}`,node.id,owner.id);continue;}
    const own=node.meta?.sourceOwnership||'designer'; if(!['designer','hybrid','code'].includes(own))add('warning','SRC10',`Unknown node source ownership: ${own}`,node.id,owner.id);
    if(node.type==='externalComponent'){if(!node.props?.descriptorId&&!node.props?.importPath)add('error','SRC11','External component has neither descriptor nor import path.',node.id,owner.id);if(node.props?.descriptorId&&!externalIds.has(node.props.descriptorId))add('warning','SRC12',`External descriptor not found: ${node.props.descriptorId}`,node.id,owner.id);}
    if(node.type==='repeater'){const src=node.props?.source;if(src&&!collectionNames.has(src)&&!dsNames.has(src))add('warning','DATA10',`Repeater source not found: ${src}`,node.id,owner.id);}
    if(node.visibilityCondition&&typeof node.visibilityCondition!=='string')add('warning','COND01','Visibility condition must be an expression string.',node.id,owner.id);
    for(const rule of node.containerRules||[]){const min=Number(rule.minWidth||0),max=Number(rule.maxWidth||0);if(min&&max&&min>max)add('error','CQ01',`Container rule minimum ${min}px exceeds maximum ${max}px.`,node.id,owner.id);}
    const stateNames=new Set();for(const st of node.states||[]){if(stateNames.has(st.name))add('warning','STATE01',`Duplicate component state ${st.name}.`,node.id,owner.id);stateNames.add(st.name)}
    for(const ai of validateAnimation(node)) add(ai.code==='ANIM01'||ai.code==='ANIM04'?'error':'warning',ai.code,ai.message,node.id,owner.id);
    const key=`${item.scope}:${owner.id}`; if(!namesByScope.has(key)) namesByScope.set(key,new Set()); const set=namesByScope.get(key); if(set.has(node.name)) add('info','M003',`Duplicate object name ${node.name}`,node.id,owner.id); set.add(node.name);
    if(node.type==='image' && !String(node.props.alt||'').trim()) add('warning','A11Y01','Image is missing alt text.',node.id,owner.id);
    if(node.type==='link' && node.props.target==='_blank') add('info','A11Y02','External/new-tab links should communicate that behavior.',node.id,owner.id);
    if(node.type==='heading'){ const level=Number(node.props.level); if(level<1||level>6) add('error','A11Y03','Heading level must be 1–6.',node.id,owner.id); }
    if(node.type==='input' && node.props.required && node.props.disabled) add('warning','FORM01','Required input is disabled.',node.id,owner.id);
    if(node.type==='componentInstance' && !project.components.some(c=>c.id===node.props.definitionId)) add('error','CMP01','Component instance references a missing definition.',node.id,owner.id);
    if(node.type==='island' && !node.props.importPath) add('error','ISL01','Framework island has no import path.',node.id,owner.id);
    for(const [key,expr] of Object.entries(node.bindings||{})){
      const sm=String(expr).match(/^state\.([A-Za-z_$][\w$]*)$/); if(sm && !(project.variables||[]).some(v=>v.name===sm[1])) add('error','BIND01',`Binding ${key} references missing state variable ${sm[1]}.`,node.id,owner.id);
      const pm=String(expr).match(/^props\.([A-Za-z_$][\w$]*)$/); if(pm && item.scope==='component' && !(owner.props||[]).some(p=>p.name===pm[1])) add('warning','BIND02',`Binding ${key} references undeclared component prop ${pm[1]}.`,node.id,owner.id);
    }
    for(const action of node.actions||[]){
      if(!action.event) add('warning','ACT01','Action has no event.',node.id,owner.id);
      if(['show','hide','toggleClass','scrollTo','setText','setComponentState','playAnimation','pauseAnimation','stopAnimation','reverseAnimation','seekAnimation','startTimeline','stopTimeline'].includes(action.type) && !action.target) add('warning','ACT02',`${action.type} action has no target.`,node.id,owner.id);
      if(action.target && !ids.has(action.target)){ /* second pass below */ }
    }
  }
  const finalIds=new Set(collectProjectNodes(project).map(x=>x.node.id));
  for(const {node,owner} of collectProjectNodes(project)) for(const action of node.actions||[]) if(action.target && !finalIds.has(action.target)) add('error','ACT03',`Action target does not exist: ${action.target}`,node.id,owner.id);
  for(const comp of project.components||[]){
    const variants=new Set();for(const v of comp.variants||[]){if(variants.has(v.name))add('warning','CMP20',`Component ${comp.name} has duplicate variant ${v.name}.`,comp.root?.id,comp.id);variants.add(v.name)}
    const storyNames=new Set();for(const st of comp.stories||[]){if(storyNames.has(st.name))add('warning','TST01',`Component ${comp.name} has duplicate story ${st.name}.`,comp.root?.id,comp.id);storyNames.add(st.name)}
    const slotNames=new Set(); walk(comp.root,n=>{if(n.type==='slot'){const s=n.props.name||'default'; if(slotNames.has(s)) add('warning','CMP02',`Component ${comp.name} defines duplicate slot ${s}.`,n.id,comp.id);slotNames.add(s);}});
  }
  for(const t of project.recordedTests||[]){if(!(t.steps||[]).length)add('info','TST10',`Recorded test ${t.name} has no steps.`);for(const step of t.steps||[])if(step.target&&!finalIds.has(step.target))add('warning','TST11',`Recorded test ${t.name} references missing target ${step.target}.`)}
  for(const plugin of getDesignerPlugins()) for(const fn of plugin.validators||[]) { try { fn(project,(severity,code,message,nodeId=null,ownerId=null)=>add(severity,code,message,nodeId,ownerId)); } catch(e) { add('warning','PLGERR',`Plugin ${plugin.id} validator failed: ${e.message}`); } }
  return issues;
}

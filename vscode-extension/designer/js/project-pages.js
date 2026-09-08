import { createNode, deepClone, makeId, routeToFilename, walk } from './model.js';

function slugify(value='page'){
  return String(value||'page').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'page';
}
function normalizeRoute(route='/'){
  let r=String(route||'/').trim();
  if(!r.startsWith('/'))r=`/${r}`;
  r=r.replace(/\/{2,}/g,'/');
  if(r.length>1)r=r.replace(/\/$/,'');
  return r||'/';
}
function uniqueRoute(project,desired,ignoreId=''){
  const used=new Set((project.pages||[]).filter(p=>p.id!==ignoreId).map(p=>normalizeRoute(p.route)));
  let route=normalizeRoute(desired);
  if(!used.has(route))return route;
  const base=route==='/'?'/page':route;
  let i=2;while(used.has(`${base}-${i}`))i++;
  return `${base}-${i}`;
}
function uniqueName(project,desired='Page',ignoreId=''){
  const used=new Set((project.pages||[]).filter(p=>p.id!==ignoreId).map(p=>String(p.name||'').toLowerCase()));
  const base=String(desired||'Page').trim()||'Page';if(!used.has(base.toLowerCase()))return base;
  let i=2;while(used.has(`${base} ${i}`.toLowerCase()))i++;return `${base} ${i}`;
}
export function createPageEntity(project,{name='New Page',route='',title='',description='',filename=''}={}){
  project.pages??=[];
  const pageName=uniqueName(project,name);
  const requested=route||`/${slugify(pageName)}`;
  const finalRoute=uniqueRoute(project,requested);
  const root=createNode('page',{name:`${pageName.replace(/\s+/g,'')}Page`,props:{title:title||pageName,description:description||''}});
  const page={id:makeId('page-doc'),name:pageName,route:finalRoute,filename:filename||routeToFilename(finalRoute),seo:{title:title||pageName,description:description||'',canonical:'',ogImage:''},root};
  project.pages.push(page);return page;
}
export function updatePageEntity(project,pageId,patch={}){
  const page=(project.pages||[]).find(p=>p.id===pageId);if(!page)return null;
  if(patch.name!=null)page.name=uniqueName(project,patch.name,pageId);
  if(patch.route!=null){page.route=uniqueRoute(project,patch.route,pageId);if(patch.filename==null)page.filename=routeToFilename(page.route)}
  if(patch.filename!=null)page.filename=String(patch.filename||routeToFilename(page.route));
  page.seo??={title:page.name,description:'',canonical:'',ogImage:''};
  for(const key of ['title','description','canonical','ogImage'])if(patch[key]!=null)page.seo[key]=String(patch[key]);
  if(page.root?.props){if(patch.title!=null)page.root.props.title=String(patch.title);if(patch.description!=null)page.root.props.description=String(patch.description)}
  return page;
}
export function duplicatePageEntity(project,pageId){
  const source=(project.pages||[]).find(p=>p.id===pageId);if(!source)return null;
  const copy=deepClone(source);copy.id=makeId('page-doc');copy.name=uniqueName(project,`${source.name} Copy`);copy.route=uniqueRoute(project,source.route==='/'?'/home-copy':`${normalizeRoute(source.route)}-copy`);copy.filename=routeToFilename(copy.route);
  const remap=new Map();
  const visit=n=>{const old=n.id;n.id=makeId(n.type||'node');remap.set(old,n.id);n.name=n.name?`${n.name}Copy`:n.type;for(const a of n.actions||[])a.id=makeId('act');for(const c of n.children||[])visit(c)};visit(copy.root);
  // Repoint action targets inside the duplicated subtree when possible.
  const fix=n=>{for(const a of n.actions||[])if(a.target&&remap.has(a.target))a.target=remap.get(a.target);for(const c of n.children||[])fix(c)};fix(copy.root);
  project.pages.push(copy);return copy;
}
export function deletePageEntity(project,pageId){
  project.pages??=[];if(project.pages.length<=1)return {ok:false,reason:'last-page',removed:null,nextPageId:project.pages[0]?.id||'',repairs:{}};
  const index=project.pages.findIndex(p=>p.id===pageId);if(index<0)return {ok:false,reason:'not-found',removed:null,nextPageId:project.pages[0]?.id||'',repairs:{}};
  const [removed]=project.pages.splice(index,1);const next=project.pages[Math.min(index,project.pages.length-1)]||project.pages[0];
  const removedNodeIds=new Set();if(removed?.root)walk(removed.root,n=>removedNodeIds.add(n.id));
  const repairs={flows:0,recordedTests:0,componentTests:0,testTargetsCleared:0,prototypeDestinations:0,actionTargetsCleared:0,commentsRemoved:0};
  // Repair page-scoped metadata rather than leaving dangling references.
  for(const flow of project.design?.flows||[])if(flow.startPageId===pageId){flow.startPageId=next?.id||'';repairs.flows++}
  const repairTests=(tests,key)=>{for(const test of tests||[]){if(test.pageId===pageId){test.pageId=next?.id||'';test.needsReview='page-deleted';repairs[key]++}for(const item of [...(test.steps||[]),...(test.assertions||[])])if(item.target&&removedNodeIds.has(item.target)){item.target='';item.needsReview='target-page-deleted';repairs.testTargetsCleared++}}};
  repairTests(project.recordedTests,'recordedTests');repairTests(project.componentTests,'componentTests');
  for(const owner of [...(project.pages||[]),...(project.components||[])])if(owner?.root)walk(owner.root,n=>{
    for(const interaction of n.design?.interactions||[])if(interaction.destination===pageId){interaction.destination=next?.id||'';interaction.needsReview='destination-page-deleted';repairs.prototypeDestinations++}
    for(const action of n.actions||[])if(action.target&&removedNodeIds.has(action.target)){action.target='';action.needsReview='target-page-deleted';repairs.actionTargetsCleared++}
  });
  if(project.design?.comments){const before=project.design.comments.length;project.design.comments=project.design.comments.filter(c=>!removedNodeIds.has(c.nodeId));repairs.commentsRemoved=before-project.design.comments.length}
  if(project.editor?.documentTabOrder)project.editor.documentTabOrder=project.editor.documentTabOrder.filter(key=>key!==`page:${pageId}`);
  return {ok:true,reason:'deleted',removed,nextPageId:next?.id||'',repairs};
}
export function movePageEntity(project,pageId,toIndex){
  const pages=project.pages||[],from=pages.findIndex(p=>p.id===pageId);if(from<0)return false;
  const [page]=pages.splice(from,1);pages.splice(Math.max(0,Math.min(pages.length,toIndex)),0,page);return true;
}
export function validatePageEntities(project){
  const issues=[],routes=new Map(),files=new Map();
  for(const p of project.pages||[]){const route=normalizeRoute(p.route),file=String(p.filename||'');if(routes.has(route))issues.push({code:'PAGE_ROUTE_DUP',pageId:p.id,message:`Duplicate route ${route}`});routes.set(route,p.id);if(file&&files.has(file))issues.push({code:'PAGE_FILE_DUP',pageId:p.id,message:`Duplicate page filename ${file}`});if(file)files.set(file,p.id);if(!p.name)issues.push({code:'PAGE_NAME_EMPTY',pageId:p.id,message:'Page name is empty.'})}
  if(!(project.pages||[]).length)issues.push({code:'PAGE_REQUIRED',message:'Project must contain at least one page.'});return issues;
}

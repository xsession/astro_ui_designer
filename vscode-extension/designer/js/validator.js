import { walk } from './model.js';
import { accessibilityAudit, responsiveAudit, seoAudit, performanceAudit, contrastAudit } from './research-features.js';
import { validateAnimation } from './animation.js';
export function validateProject(project){
  const out=[];const add=(severity,code,message,nodeId='',pageId='')=>out.push({severity,code,message,nodeId,pageId});
  if(!project?.pages?.length)add('error','PROJECT_PAGES','Project has no pages.');
  const ids=new Set();
  for(const page of project.pages||[]){if(!page.route)add('warning','PAGE_ROUTE',`${page.name||'Page'} has no route.`,page.root?.id,page.id);walk(page.root,n=>{if(ids.has(n.id))add('error','DUP_ID',`Duplicate node id: ${n.id}`,n.id,page.id);ids.add(n.id);if(n.type==='image'&&!n.props?.src)add('warning','IMG_SRC',`${n.name} has no image source.`,n.id,page.id);for(const issue of validateAnimation(n))add('warning',issue.code,issue.message,n.id,page.id);});}
  for(const fn of [accessibilityAudit,responsiveAudit,seoAudit,performanceAudit,contrastAudit]){try{out.push(...fn(project))}catch{}}
  return out;
}

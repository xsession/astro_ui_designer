import { makeId, deepClone } from './model.js';
export const STORY_VIEWPORTS=[{id:'desktop',label:'Desktop',width:1280,height:800},{id:'tablet',label:'Tablet',width:768,height:900},{id:'mobile',label:'Mobile',width:390,height:844}];
export const STORY_BACKGROUNDS=[{id:'light',label:'Light',value:'#ffffff'},{id:'dark',label:'Dark',value:'#111827'}];
export const STORY_STEP_TYPES=['click','type','select','hover','focus','wait'];export const STORY_ASSERTION_TYPES=['text','visible','hidden','attribute','a11y'];
export function ensureStorybookProject(project){project.storybook??={version:1,settings:{defaultViewport:'desktop',defaultBackground:'light',direction:'ltr',grid:false,outline:false,measure:false,watch:false,coverage:false},tags:[],results:{},visualBaselines:{},docs:{title:`${project.name||'Project'} Component Library`,description:'Generated component documentation.'}};for(const c of project.components||[])ensureComponentStories(c);return project.storybook}
export function ensureComponentStories(c){c.stories??=[];if(!c.stories.length)c.stories.push(createComponentStory(c,'Default'));return c.stories}
export function createComponentStory(c,name='Story'){const s={id:makeId('story'),name,args:{},tags:[],viewport:'desktop',background:'light',steps:[],assertions:[]};if(c?.stories&&!c.stories.includes(s))c.stories.push(s);return s}
export function duplicateComponentStory(c,id){const src=(c.stories||[]).find(x=>x.id===id);if(!src)return null;const x=deepClone(src);x.id=makeId('story');x.name+= ' Copy';c.stories.push(x);return x}
export function createStoryMatrix(c,prop='variant',values=[]){return values.map(v=>{const s=createComponentStory(c,String(v));s.args[prop]=v;return s})}
export function inferControls(c){return (c.props||[]).map(p=>({name:p.name,type:p.type||'string',options:p.options||[]}))}
export function setStoryArg(s,k,v){s.args??={};s.args[k]=v;return s}
export function storyViewport(s){return STORY_VIEWPORTS.find(x=>x.id===(s.viewport||'desktop'))||STORY_VIEWPORTS[0]}
export function storyBackground(s){return STORY_BACKGROUNDS.find(x=>x.id===(s.background||'light'))||STORY_BACKGROUNDS[0]}
export function materializeStoryComponent(c,s){const root=deepClone(c.root);root.props={...(root.props||{}),...(s.args||{})};return root}
export function addStoryStep(s,type='click',target='',value=''){const x={id:makeId('step'),type,target,value};s.steps??=[];s.steps.push(x);return x}
export function addStoryAssertion(s,type='visible',target='',value=''){const x={id:makeId('assert'),type,target,value};s.assertions??=[];s.assertions.push(x);return x}
export function filterStories(list,q=''){q=String(q).toLowerCase();return (list||[]).filter(x=>!q||x.name.toLowerCase().includes(q)||(x.tags||[]).some(t=>String(t).toLowerCase().includes(q)))}
export function overallStatus(results=[]){return results.some(x=>x.status==='failed')?'failed':results.length?'passed':'idle'}
export function createStoryResult(story){return {id:story.id,status:'pending',startedAt:new Date().toISOString(),checks:[]}}
export function setStoryResult(project,id,result){ensureStorybookProject(project);project.storybook.results[id]=result;return result}
export function domVisualFingerprint(value){let h=2166136261,s=typeof value==='string'?value:JSON.stringify(value);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
export function saveVisualBaseline(project,id,value){ensureStorybookProject(project);return project.storybook.visualBaselines[id]={fingerprint:domVisualFingerprint(value),savedAt:new Date().toISOString()}}
export function compareVisualBaseline(project,id,value){const b=project.storybook?.visualBaselines?.[id];return {match:Boolean(b&&b.fingerprint===domVisualFingerprint(value)),baseline:b||null,current:domVisualFingerprint(value)}}
export function generateAutodocs(c){return `# ${c.name}\n\n${c.description||'Reusable Astro UI Designer component.'}\n\n## Props\n${(c.props||[]).map(p=>`- \`${p.name}\`: ${p.type||'string'}`).join('\n')}`}
export function exportPortableStoryManifest(project){return JSON.stringify({version:1,components:(project.components||[]).map(c=>({id:c.id,name:c.name,stories:c.stories||[]}))},null,2)}
export function exportStorybookCsf(c){return `export default { title: ${JSON.stringify(c.name)} };\n${(c.stories||[]).map(s=>`export const ${s.name.replace(/\W+/g,'_')}={args:${JSON.stringify(s.args||{})}};`).join('\n')}`}
export function exportComponentManifest(project){return JSON.stringify({components:(project.components||[]).map(c=>({id:c.id,name:c.name,props:c.props||[],stories:(c.stories||[]).map(s=>s.name)}))},null,2)}
export function storybookSummary(project){ensureStorybookProject(project);return {components:(project.components||[]).length,stories:(project.components||[]).reduce((n,c)=>n+(c.stories||[]).length,0),baselines:Object.keys(project.storybook.visualBaselines||{}).length}}

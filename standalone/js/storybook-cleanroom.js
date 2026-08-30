import { deepClone, makeId, walk } from './model.js';

export const STORYBOOK_CLEANROOM_VERSION = 1;
export const STORY_TEST_TYPES = ['render','interaction','a11y','visual'];
export const STORY_VIEWPORTS = [
  {id:'mobile-small',label:'Mobile S',width:320,height:568},
  {id:'mobile',label:'Mobile',width:390,height:844},
  {id:'tablet',label:'Tablet',width:768,height:1024},
  {id:'desktop',label:'Desktop',width:1280,height:800},
  {id:'wide',label:'Wide',width:1440,height:900},
];
export const STORY_BACKGROUNDS = [
  {id:'light',label:'Light',value:'#ffffff'},
  {id:'gray',label:'Gray',value:'#eef1f4'},
  {id:'dark',label:'Dark',value:'#11161c'},
  {id:'transparent',label:'Transparent',value:'transparent'},
];
export const STORY_STEP_TYPES = ['click','type','select','toggle','hover','focus','key','wait'];
export const STORY_ASSERTION_TYPES = ['visible','hidden','text','value','attribute','count','enabled','disabled'];

export function ensureStorybookProject(project){
  project.storybook ??= {};
  const sb=project.storybook;
  sb.version ??= STORYBOOK_CLEANROOM_VERSION;
  sb.settings ??= {};
  Object.assign(sb.settings,{
    defaultViewport:'desktop',defaultBackground:'light',direction:'ltr',grid:false,outline:false,measure:false,watch:false,coverage:false,testSelection:{render:true,interaction:true,a11y:true,visual:true,coverage:false},
    ...sb.settings,
  });
  sb.tags ??= [
    {id:'dev',label:'Dev',color:'#579bd3'},
    {id:'manifest',label:'Manifest',color:'#4fbf75'},
    {id:'test',label:'Test',color:'#8f79d6'},
    {id:'autodocs',label:'Autodocs',color:'#579bd3'},
    {id:'stable',label:'Stable',color:'#4fbf75'},
    {id:'experimental',label:'Experimental',color:'#d8a94c'},
    {id:'deprecated',label:'Deprecated',color:'#de6b70'},
  ];
  const builtin=[['dev','Dev','#579bd3'],['manifest','Manifest','#4fbf75'],['test','Test','#8f79d6'],['autodocs','Autodocs','#579bd3']];
  for(const [id,label,color] of builtin)if(!sb.tags.some(t=>t.id===id))sb.tags.unshift({id,label,color});
  sb.settings.testSelection={render:true,interaction:true,a11y:true,visual:true,coverage:false,...(sb.settings.testSelection||{})};
  sb.results ??= {};
  sb.visualBaselines ??= {};
  sb.docs ??= {title:`${project.name||'Project'} Component Library`,description:'Generated component documentation.'};
  for(const component of project.components||[]) ensureComponentStories(component,project);
  return sb;
}

export function ensureComponentStories(component,project=null){
  component.stories ??= [];
  component.storyMeta ??= {title:`Components/${component.name}`,tags:['dev','test','autodocs'],description:component.description||'',owner:'',status:'stable'};
  for(const story of component.stories) normalizeStory(story,component,project);
  return component;
}

export function normalizeStory(story,component=null,project=null){
  story.id ||= makeId('story');
  story.name ||= 'Default';
  story.args ??= story.props ? deepClone(story.props) : {};
  delete story.props;
  story.argTypes ??= {};
  story.viewport = normalizeViewport(story.viewport || project?.storybook?.settings?.defaultViewport || 'desktop');
  story.theme ||= project?.theme?.active || 'default';
  story.locale ||= project?.locales?.default || 'en';
  story.background ||= project?.storybook?.settings?.defaultBackground || 'light';
  story.direction ||= project?.storybook?.settings?.direction || 'ltr';
  story.state ||= 'default';
  story.tags ??= [];
  story.globals ??= {};
  story.parameters ??= {layout:'centered',docs:{description:''},a11y:{mode:'todo'},visual:{threshold:0}};
  story.steps ??= [];
  story.assertions ??= [];
  story.notes ??= '';
  story.status ??= 'ready';
  if(component) for(const p of component.props||[]) if(story.args[p.name]===undefined&&p.default!==undefined) story.args[p.name]=scalarForType(p.default,p.type);
  return story;
}

function normalizeViewport(v){
  if(typeof v==='number'){const match=STORY_VIEWPORTS.find(x=>x.width===v);return match?.id||`custom:${v}x800`;}
  return String(v||'desktop');
}
function scalarForType(v,type){if(type==='boolean')return v===true||v==='true';if(type==='number')return Number(v)||0;return v??''}

export function createComponentStory(component,name='Default',project=null){
  ensureComponentStories(component,project);
  const story=normalizeStory({id:makeId('story'),name,args:{},tags:[],steps:[],assertions:[]},component,project);
  component.stories.push(story); return story;
}
export function duplicateComponentStory(component,storyId){
  const source=component.stories?.find(s=>s.id===storyId);if(!source)return null;const copy=deepClone(source);copy.id=makeId('story');copy.name=`${source.name} Copy`;component.stories.push(copy);return copy;
}
export function createStoryMatrix(component,project,{themes=[],viewports=[],locales=[]}={}){
  ensureComponentStories(component,project);const out=[];
  const ts=themes.length?themes:[project.theme?.active||'default'];const vs=viewports.length?viewports:['desktop'];const ls=locales.length?locales:[project.locales?.default||'en'];
  for(const theme of ts)for(const viewport of vs)for(const locale of ls){const s=createComponentStory(component,`${label(viewport)} · ${theme} · ${locale.toUpperCase()}`,project);s.theme=theme;s.viewport=viewport;s.locale=locale;s.tags=['matrix'];out.push(s)}return out;
}
function label(v){return STORY_VIEWPORTS.find(x=>x.id===v)?.label||v}

export function inferControls(component,story){
  const controls=[];for(const p of component?.props||[]){const override=story?.argTypes?.[p.name]||{};let control=override.control||inferControlType(p);if(control===false||override.control?.disable)continue;controls.push({name:p.name,label:override.name||p.name,type:p.type||'string',control:typeof control==='string'?control:control?.type||'text',options:override.options||p.options||[],min:override.min,max:override.max,step:override.step,description:override.description||p.description||'',value:story?.args?.[p.name]??p.default??defaultValue(p.type)});}return controls;
}
function inferControlType(p){if(p.options?.length||p.type==='enum')return 'select';if(p.type==='boolean')return 'boolean';if(p.type==='number')return 'number';if(/color/i.test(p.name))return 'color';if(/date/i.test(p.name))return 'date';if(p.type==='object'||p.type==='any')return 'object';return 'text'}
function defaultValue(type){return type==='boolean'?false:type==='number'?0:''}

export function setStoryArg(story,name,value,component){const p=component?.props?.find(x=>x.name===name);story.args??={};story.args[name]=scalarForType(value,p?.type);return story.args[name]}
export function storyViewport(story){const v=String(story?.viewport||'desktop');if(v.startsWith('custom:')){const m=v.match(/custom:(\d+)x(\d+)/);return {id:v,label:'Custom',width:Number(m?.[1])||1280,height:Number(m?.[2])||800}}return STORY_VIEWPORTS.find(x=>x.id===v)||STORY_VIEWPORTS.find(x=>x.id==='desktop')}
export function storyBackground(story){return STORY_BACKGROUNDS.find(x=>x.id===(story?.background||'light'))||STORY_BACKGROUNDS[0]}

export function materializeStoryComponent(component,story){
  const root=deepClone(component.root);const args={};for(const p of component.props||[])args[p.name]=story.args?.[p.name]??p.default??defaultValue(p.type);
  walk(root,node=>{node.meta={...(node.meta||{})};node.meta.storySourceId=node.id;node.id=`story-${story.id}-${node.id}`;for(const [key,expr] of Object.entries(node.bindings||{})){const m=String(expr).trim().match(/^props\.([A-Za-z_$][\w$]*)$/);if(m)node.props={...(node.props||{}),[key]:args[m[1]]};}if(story.state&&story.state!=='default'){const st=(node.states||[]).find(x=>x.name===story.state);if(st){node.props={...(node.props||{}),...(st.props||{})};node.style={...(node.style||{}),base:{...(node.style?.base||{}),...(st.style||{})}}}}});return root;
}

export function addStoryStep(story,type='click',target='',value=''){story.steps??=[];const step={id:makeId('story-step'),type,target,value,selector:'',delay:0};story.steps.push(step);return step}
export function addStoryAssertion(story,type='visible',target='',value=true){story.assertions??=[];const a={id:makeId('story-assert'),type,target,value,attribute:''};story.assertions.push(a);return a}

export function filterStories(project,{query='',includeTags=[],excludeTags=[],failuresOnly=false}={}){
  ensureStorybookProject(project);const q=String(query).trim().toLowerCase(),inc=new Set(includeTags),exc=new Set(excludeTags),out=[];
  for(const component of project.components||[]){ensureComponentStories(component,project);for(const story of component.stories||[]){const tags=new Set([...(component.storyMeta?.tags||[]),...(story.tags||[])]);if(q&&!`${component.storyMeta?.title||component.name} ${story.name} ${[...tags].join(' ')}`.toLowerCase().includes(q))continue;if(inc.size&&![...inc].some(x=>tags.has(x)))continue;if([...exc].some(x=>tags.has(x)))continue;if(failuresOnly){const r=project.storybook.results?.[story.id];if(!r||overallStatus(r)!=='fail')continue}out.push({component,story,tags:[...tags],result:project.storybook.results?.[story.id]||null})}}
  return out;
}
export function overallStatus(result){if(!result)return 'idle';const vals=STORY_TEST_TYPES.map(k=>result[k]?.status).filter(Boolean);if(vals.includes('fail'))return 'fail';if(vals.includes('warn'))return 'warn';if(vals.length&&vals.every(x=>x==='pass'||x==='skip'))return 'pass';if(vals.includes('running'))return 'running';return 'idle'}

export function createStoryResult(){return {render:{status:'idle',messages:[]},interaction:{status:'idle',messages:[]},a11y:{status:'idle',messages:[]},visual:{status:'idle',messages:[]},coverage:{nodes:0,visited:0,percent:0},updatedAt:''}}
export function setStoryResult(project,storyId,type,status,messages=[]){ensureStorybookProject(project);const r=project.storybook.results[storyId]??=createStoryResult();r[type]={status,messages:Array.isArray(messages)?messages:[String(messages)]};r.updatedAt=new Date().toISOString();return r}

export function domVisualFingerprint(root){if(!root)return '';const parts=[],base=root.getBoundingClientRect();for(const el of root.querySelectorAll('*')){const r=el.getBoundingClientRect(),cs=getComputedStyle(el);parts.push([el.tagName,el.getAttribute('data-story-source-id')||'',Math.round(r.x-base.x),Math.round(r.y-base.y),Math.round(r.width),Math.round(r.height),cs.display,cs.position,cs.color,cs.backgroundColor,cs.fontSize,cs.fontWeight,cs.borderRadius,cs.opacity,cs.transform,el.textContent?.trim().slice(0,80)].join('|'))}return hashString(parts.join('\n'))}
export function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
export function saveVisualBaseline(project,storyId,fingerprint){ensureStorybookProject(project);project.storybook.visualBaselines[storyId]={fingerprint,updatedAt:new Date().toISOString()};return project.storybook.visualBaselines[storyId]}
export function compareVisualBaseline(project,storyId,fingerprint){const b=project.storybook?.visualBaselines?.[storyId];if(!b)return {status:'missing',baseline:null,current:fingerprint};return {status:b.fingerprint===fingerprint?'pass':'fail',baseline:b.fingerprint,current:fingerprint}}

export function generateAutodocs(component,project){ensureComponentStories(component,project);const props=(component.props||[]).map(p=>`| \`${p.name}\` | ${p.type||'string'} | ${p.default??''} | ${p.description||''} |`).join('\n');const stories=(component.stories||[]).map(s=>`- **${s.name}** — ${(s.tags||[]).join(', ')||'untagged'}`).join('\n');return `# ${component.name}\n\n${component.storyMeta?.description||component.description||''}\n\n## Props\n\n| Name | Type | Default | Description |\n| --- | --- | --- | --- |\n${props||'| — | — | — | No declared props |'}\n\n## Stories\n\n${stories||'_No stories yet._'}\n\n## Usage\n\n\`\`\`astro\n---\nimport ${component.name} from '../components/${component.filename}';\n---\n<${component.name} />\n\`\`\`\n`}

export function exportPortableStoryManifest(project){ensureStorybookProject(project);return {format:'astro-ui-portable-stories',version:1,generatedAt:new Date().toISOString(),project:project.name,components:(project.components||[]).map(c=>({id:c.id,name:c.name,title:c.storyMeta?.title||`Components/${c.name}`,description:c.storyMeta?.description||'',tags:c.storyMeta?.tags||[],props:deepClone(c.props||[]),stories:(c.stories||[]).map(s=>deepClone(s))})),settings:deepClone(project.storybook.settings),tags:deepClone(project.storybook.tags)}}

export function exportStorybookCsf(component,{framework='react',importPath=`./${component.filename||component.name}`}={}){
  ensureComponentStories(component);
  const hasTests=(component.stories||[]).some(s=>(s.steps||[]).length||(s.assertions||[]).length);
  const testImport=hasTests?`import { expect, userEvent } from 'storybook/test';\n`:'';
  const storyObj=s=>{
    const lines=[`export const ${safeIdent(s.name)}: Story = {`,`  args: ${indentJson(s.args||{},2)},`,`  tags: ${JSON.stringify(s.tags||[])},`,`  globals: ${indentJson({viewport:s.viewport,theme:s.theme,locale:s.locale,background:s.background,direction:s.direction},2)},`,`  parameters: ${indentJson(s.parameters||{},2)},`];
    const play=storyPlayFunction(s);if(play)lines.push(`  play: ${play},`);lines.push('};');return lines.join('\n');
  };
  const fw=framework==='vue'?'@storybook/vue3-vite':framework==='svelte'?'@storybook/svelte-vite':'@storybook/react-vite';
  return `import type { Meta, StoryObj } from '${fw}';\n${testImport}import ${component.name} from '${importPath}';\n\nconst meta = {\n  title: ${JSON.stringify(component.storyMeta?.title||`Components/${component.name}`)},\n  component: ${component.name},\n  tags: ${JSON.stringify(component.storyMeta?.tags||[])},\n} satisfies Meta<typeof ${component.name}>;\nexport default meta;\ntype Story = StoryObj<typeof meta>;\n\n${(component.stories||[]).map(storyObj).join('\n\n')}\n`;
}
function indentJson(value,spaces=2){return JSON.stringify(value,null,2).replace(/\n/g,`\n${' '.repeat(spaces)}`)}
function storyPlayFunction(story){const steps=story.steps||[],assertions=story.assertions||[];if(!steps.length&&!assertions.length)return '';
  const q=id=>`canvasElement.querySelector('[data-ui-id="${escapeJs(id)}"]')`;
  const out=['async ({ canvasElement }) => {'];
  for(const step of steps){const target=q(step.target||'');if(step.delay)out.push(`    await new Promise((r) => setTimeout(r, ${Math.max(0,Number(step.delay)||0)}));`);if(step.type==='click')out.push(`    await userEvent.click(${target});`);else if(step.type==='type')out.push(`    await userEvent.type(${target}, ${JSON.stringify(String(step.value??''))});`);else if(step.type==='select')out.push(`    await userEvent.selectOptions(${target}, ${JSON.stringify(String(step.value??''))});`);else if(step.type==='toggle')out.push(`    await userEvent.click(${target});`);else if(step.type==='hover')out.push(`    await userEvent.hover(${target});`);else if(step.type==='focus')out.push(`    ${target}?.focus();`);else if(step.type==='key')out.push(`    await userEvent.keyboard(${JSON.stringify(String(step.value||'{Enter}'))});`);else if(step.type==='wait')out.push(`    await new Promise((r) => setTimeout(r, ${Math.max(0,Number(step.value)||100)}));`)}
  for(const a of assertions){const target=q(a.target||'');if(a.type==='visible')out.push(`    await expect(${target}).toBeVisible();`);else if(a.type==='hidden')out.push(`    await expect(${target}).not.toBeVisible();`);else if(a.type==='text')out.push(`    await expect(${target}).toHaveTextContent(${JSON.stringify(String(a.value??''))});`);else if(a.type==='value')out.push(`    await expect(${target}).toHaveValue(${JSON.stringify(String(a.value??''))});`);else if(a.type==='attribute')out.push(`    await expect(${target}).toHaveAttribute(${JSON.stringify(a.attribute||'')}, ${JSON.stringify(String(a.value??''))});`);else if(a.type==='enabled')out.push(`    await expect(${target}).toBeEnabled();`);else if(a.type==='disabled')out.push(`    await expect(${target}).toBeDisabled();`);else if(a.type==='count')out.push(`    await expect(canvasElement.querySelectorAll('[data-ui-id="${escapeJs(a.target||'')}"]').length).toBe(${Number(a.value)||0});`)}
  out.push('  }');return out.join('\n');
}
function escapeJs(v){return String(v??'').replace(/\\/g,'\\\\').replace(/"/g,'\\"')}

export function exportComponentManifest(project){
  ensureStorybookProject(project);
  return {format:'astro-ui-component-manifest',version:1,generatedAt:new Date().toISOString(),project:project.name,components:(project.components||[]).map(c=>({id:c.id,name:c.name,title:c.storyMeta?.title||`Components/${c.name}`,description:c.storyMeta?.description||c.description||'',owner:c.storyMeta?.owner||'',status:c.storyMeta?.status||'stable',tags:c.storyMeta?.tags||[],props:deepClone(c.props||[]),slots:collectSlots(c.root),stories:(c.stories||[]).map(s=>({id:s.id,name:s.name,tags:s.tags||[],args:deepClone(s.args||{}),viewport:s.viewport,theme:s.theme,locale:s.locale,testStatus:overallStatus(project.storybook.results?.[s.id]||null)})),documentation:generateAutodocs(c,project)}))};
}
function collectSlots(root){const slots=[];walk(root,n=>{if(n.type==='slot')slots.push({id:n.id,name:n.props?.name||n.name||'default'})});return slots}

function safeIdent(v){let s=String(v||'Story').replace(/[^A-Za-z0-9_$]+/g,' ').trim().split(/\s+/).map((x,i)=>i?x[0]?.toUpperCase()+x.slice(1):x).join('');if(!/^[A-Za-z_$]/.test(s))s=`Story${s}`;return s||'Story'}

export function storybookSummary(project){ensureStorybookProject(project);let stories=0,passing=0,failing=0,warning=0,untested=0;for(const c of project.components||[])for(const s of c.stories||[]){stories++;const st=overallStatus(project.storybook.results[s.id]);if(st==='pass')passing++;else if(st==='fail')failing++;else if(st==='warn')warning++;else untested++}return {stories,passing,failing,warning,untested,baselines:Object.keys(project.storybook.visualBaselines||{}).length}}

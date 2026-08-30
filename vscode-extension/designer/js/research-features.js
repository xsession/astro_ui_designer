import { makeId, deepClone, walk, allNodes } from './model.js';

export const RESEARCH_FEATURE_VERSION = 1;

export function ensureResearchModel(project) {
  project.schemaVersion = Math.max(Number(project.schemaVersion || 1), 6);
  project.workspace ??= { rootPath: '', files: [], sourceMappings: [], externalComponents: [], preview: { url: '', running: false }, lastScan: '' };
  project.content ??= { collections: [], dataSources: [] };
  project.locales ??= { default: project.settings?.language || 'en', available: [{ id: project.settings?.language || 'en', label: (project.settings?.language || 'en').toUpperCase() }], translations: {} };
  project.componentTests ??= [];
  project.recordedTests ??= [];
  project.editor ??= { permissionMode: 'designer', activeLocale: project.locales.default, sourceOwnershipDefault: 'hybrid' };
  project.tokenFormat ??= { type: 'dtcg', version: '2025.10' };
  for (const page of project.pages || []) ensureNodeResearch(page.root);
  for (const component of project.components || []) {
    component.variants ??= [];
    component.stories ??= [];
    ensureNodeResearch(component.root);
  }
  return project;
}

export function ensureNodeResearch(node) {
  if (!node) return node;
  node.meta ??= {};
  node.meta.sourceOwnership ??= 'designer';
  node.meta.exposed ??= { content: true, style: false, structure: false, actions: false };
  node.variant ??= '';
  node.componentState ??= 'default';
  node.states ??= [];
  node.containerRules ??= [];
  node.timeline ??= { duration: 500, delay: 0, easing: 'ease', iterations: 1, direction: 'normal', fill: 'both', playbackRate: 1, reducedMotion: 'disable', engine: 'auto', trigger: 'manual', scroll: { timeline: 'view', source: 'nearest', axis: 'block', rangeStart: 'entry 0%', rangeEnd: 'cover 100%' }, tracks: [] };
  node.visibilityCondition ??= '';
  node.dataContext ??= {};
  for (const child of node.children || []) ensureNodeResearch(child);
  return node;
}

const propInterface = /interface\s+Props\s*\{([\s\S]*?)\}/m;
const astroPropsType = /type\s+Props\s*=\s*\{([\s\S]*?)\}/m;
const propLine = /([A-Za-z_$][\w$]*)\s*(\?)?\s*:\s*([^;\n}]+)/g;

export function inferPropsFromAstro(source) {
  const match = source.match(propInterface) || source.match(astroPropsType);
  if (!match) return [];
  const out = [];
  let m;
  while ((m = propLine.exec(match[1]))) {
    const rawType = m[3].trim();
    const literals = [...rawType.matchAll(/["']([^"']+)["']/g)].map(x => x[1]);
    let type = 'string';
    if (/\bboolean\b/.test(rawType)) type = 'boolean';
    else if (/\bnumber\b/.test(rawType)) type = 'number';
    else if (literals.length) type = 'enum';
    out.push({ name: m[1], optional: Boolean(m[2]), type, options: literals, rawType });
  }
  return out;
}

export function scanAstroSource(source, filename = 'Component.astro') {
  const imports = [...source.matchAll(/import\s+([\w{},*\s]+)\s+from\s+["']([^"']+)["']/g)].map(m => ({ symbol: m[1].trim(), path: m[2] }));
  const uiIds = [...source.matchAll(/data-ui-id=["']([^"']+)["']/g)].map(m => m[1]);
  const slots = [...source.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?\s*\/?\s*>/g)].map(m => m[1] || 'default');
  const props = inferPropsFromAstro(source);
  const componentLike = !filename.includes('/pages/') && !/^index\.astro$/i.test(filename.split('/').pop() || '');
  return {
    id: makeId('src'), filename, kind: componentLike ? 'component' : 'page', props, slots,
    imports, uiIds, source, ownership: 'hybrid', modified: false,
  };
}

export function sourceMapFromText(source, filename = '') {
  const mappings = [];
  const re = /<([A-Za-z][\w:.-]*)([^>]*?)data-ui-id=["']([^"']+)["']([^>]*)>/g;
  let m;
  while ((m = re.exec(source))) {
    const before = source.slice(0, m.index);
    const line = before.split('\n').length;
    const col = m.index - before.lastIndexOf('\n');
    mappings.push({ id: makeId('map'), nodeId: m[3], filename, line, column: col, tag: m[1], start: m.index, end: re.lastIndex });
  }
  return mappings;
}


export function patchAstroNodeByUiId(source,nodeId,patch={}) {
  const escaped=String(nodeId).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`<([A-Za-z][\\w:.-]*)([^>]*?\\sdata-ui-id=["']${escaped}["'][^>]*)>`,'m');
  const m=String(source).match(re); if(!m)return {source:String(source),changed:false,reason:'mapping-not-found'};
  let attrs=m[2];
  const setAttr=(name,value)=>{const ar=new RegExp(`(\\s${name}=["'])[^"']*(["'])`);if(value==null||value===''){attrs=attrs.replace(new RegExp(`\\s${name}=["'][^"']*["']`),'');return;}const esc=String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;');attrs=ar.test(attrs)?attrs.replace(ar,` ${name}="${esc}"`):`${attrs} ${name}="${esc}"`;};
  for(const [key,value] of Object.entries(patch.attributes||{}))setAttr(key,value);
  let out=String(source).slice(0,m.index)+`<${m[1]}${attrs}>`+String(source).slice(m.index+m[0].length);
  if(patch.text!=null){const start=m.index+`<${m[1]}${attrs}>`.length;const close=new RegExp(`</${m[1]}\\s*>`,'g');close.lastIndex=start;const cm=close.exec(out);if(cm){const inner=out.slice(start,cm.index);if(!/[<>]/.test(inner)){const text=String(patch.text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');out=out.slice(0,start)+text+out.slice(cm.index);}}}
  return {source:out,changed:out!==String(source),reason:'ok'};
}
export function addSourceSnapshot(project, filename, source) {
  ensureResearchModel(project);
  const scanned = scanAstroSource(source, filename);
  const existing = project.workspace.files.find(f => f.filename === filename);
  if (existing) Object.assign(existing, scanned);
  else project.workspace.files.push(scanned);
  project.workspace.sourceMappings = project.workspace.sourceMappings.filter(m => m.filename !== filename).concat(sourceMapFromText(source, filename));
  return scanned;
}

export function registerExternalComponent(project, descriptor) {
  ensureResearchModel(project);
  const id = descriptor.id || makeId('extcmp');
  const item = {
    id, name: descriptor.name || descriptor.symbol || 'ExternalComponent', symbol: descriptor.symbol || descriptor.name || 'ExternalComponent',
    importPath: descriptor.importPath || descriptor.filename || '', framework: descriptor.framework || 'astro',
    props: deepClone(descriptor.props || []), slots: deepClone(descriptor.slots || []), sourceFile: descriptor.sourceFile || '',
  };
  const i = project.workspace.externalComponents.findIndex(x => x.id === id || (x.importPath === item.importPath && x.symbol === item.symbol));
  if (i >= 0) project.workspace.externalComponents[i] = item; else project.workspace.externalComponents.push(item);
  return item;
}

export function createVariant(component, name = 'Variant') {
  component.variants ??= [];
  const v = { id: makeId('variant'), name, props: {}, style: {}, description: '' };
  component.variants.push(v); return v;
}

export function createNodeState(node, name = 'state') {
  ensureNodeResearch(node);
  const s = { id: makeId('state'), name, props: {}, style: {}, description: '' };
  node.states.push(s); return s;
}

export function createContainerRule(node, label = 'Container rule') {
  ensureNodeResearch(node);
  const r = { id: makeId('cq'), label, containerName: '', minWidth: '', maxWidth: '', style: {} };
  node.containerRules.push(r); return r;
}

export function createTimelineTrack(node, property = 'opacity') {
  ensureNodeResearch(node);
  node.timeline.duration = Math.max(node.timeline.duration || 0, 300);
  const track = { id: makeId('track'), property, keyframes: [{ at: 0, value: '' }, { at: 1, value: '' }] };
  node.timeline.tracks.push(track); return track;
}

export function inferFreeformLayout(nodes) {
  const items = (nodes || []).map(n => ({ node: n, left: px(n.style?.base?.left), top: px(n.style?.base?.top), width: px(n.style?.base?.width, 100), height: px(n.style?.base?.height, 40) }));
  if (items.length < 2) return { kind: 'none', confidence: 0, reason: 'Select at least two freeform children.' };
  const xs = items.map(i => i.left).sort((a,b)=>a-b), ys = items.map(i => i.top).sort((a,b)=>a-b);
  const xSpread = xs.at(-1) - xs[0], ySpread = ys.at(-1) - ys[0];
  const row = xSpread >= ySpread * 1.35;
  const col = ySpread >= xSpread * 1.35;
  if (row || col) {
    const sorted = [...items].sort((a,b) => row ? a.left-b.left : a.top-b.top);
    const gaps = [];
    for (let i=1;i<sorted.length;i++) gaps.push(row ? sorted[i].left-(sorted[i-1].left+sorted[i-1].width) : sorted[i].top-(sorted[i-1].top+sorted[i-1].height));
    const gap = Math.max(0, Math.round(gaps.reduce((a,b)=>a+b,0)/Math.max(1,gaps.length)));
    return { kind: row ? 'row' : 'column', confidence: .9, gap, alignItems: 'center', reason: `${row?'Horizontal':'Vertical'} sequence detected.` };
  }
  const uniqueRows = cluster(ys, 24), uniqueCols = cluster(xs, 24);
  if (uniqueRows.length > 1 && uniqueCols.length > 1) return { kind: 'grid', confidence: .75, columns: uniqueCols.length, rows: uniqueRows.length, gap: 16, reason: `${uniqueRows.length}×${uniqueCols.length} alignment detected.` };
  return { kind: 'stack', confidence: .45, gap: 12, reason: 'Overlapping/irregular geometry; stack is safest.' };
}
function cluster(values, tolerance) { const out=[]; for(const v of values){const x=out.find(n=>Math.abs(n-v)<=tolerance);if(x==null)out.push(v);} return out.sort((a,b)=>a-b); }
function px(v, fallback=0){const n=parseFloat(String(v??''));return Number.isFinite(n)?n:fallback;}

export function dtcgFromTheme(project, themeId = project.theme?.active) {
  const tokens = project.theme?.themes?.[themeId]?.tokens || {};
  const root = {};
  for (const [key,value] of Object.entries(tokens)) {
    const parts = key.split('-'); let at = root;
    for (let i=0;i<parts.length-1;i++) at = at[parts[i]] ??= {};
    const leaf = parts.at(-1); const type = tokenType(value);
    at[leaf] = { $type: type, $value: dtcgValue(type, value) };
  }
  return { $schema: 'https://tr.designtokens.org/format/', ...root };
}
function tokenType(v){const s=String(v);if(/^#|^rgb|^hsl/.test(s))return 'color';if(/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw)$/.test(s))return 'dimension';if(/ms$|s$/.test(s)&&/^\d/.test(s))return 'duration';return 'string';}
function dtcgValue(type,v){if(type==='dimension'){const m=String(v).match(/^(-?[\d.]+)([A-Za-z%]+)$/);return m?{value:Number(m[1]),unit:m[2]}:v;}if(type==='duration'){const m=String(v).match(/^([\d.]+)(ms|s)$/);return m?{value:Number(m[1]),unit:m[2]}:v;}return v;}

export function importDtcgTokens(project, doc, themeId = project.theme?.active || 'default') {
  const flat = {};
  function rec(obj, path=[]) { for (const [k,v] of Object.entries(obj||{})) { if(k.startsWith('$')) continue; if(v && typeof v==='object' && '$value' in v){let val=v.$value;if(val&&typeof val==='object'&&'value'in val&&'unit'in val)val=`${val.value}${val.unit}`;flat[[...path,k].join('-')]=val;} else if(v&&typeof v==='object')rec(v,[...path,k]); } }
  rec(doc);
  project.theme ??= {active:themeId,themes:{}}; project.theme.themes[themeId] ??= {label:themeId,tokens:{}}; Object.assign(project.theme.themes[themeId].tokens,flat);
  return flat;
}

export function evaluateExpression(expr, context={}) {
  let s=String(expr||'').trim(); if(!s)return true;
  if(s.length>500 || /(?:__proto__|prototype|constructor)/.test(s))return false;
  if(!/^[\w.$\s'"!=<>?:&|()+\-*/%]+$/.test(s))return false;
  const read=(root,path)=>{let value=root;for(const key of path.split('.').slice(1)){if(!/^[A-Za-z_$][\w$]*$/.test(key))return undefined;value=value?.[key]}return value};
  s=s.replace(/\b(?:state|props|data)(?:\.[A-Za-z_$][\w$]*)+\b/g,path=>JSON.stringify(read(context[path.split('.')[0]]||{},path)) ?? 'null');
  s=s.replace(/\blocale\b/g,JSON.stringify(context.locale||''));
  const literals=[];s=s.replace(/(['"])(?:\\.|(?!\1).)*\1/g,m=>{literals.push(m);return `__STR${literals.length-1}__`});
  const withoutStrings=s.replace(/__STR\d+__/g,'');
  const identifiers=withoutStrings.match(/[A-Za-z_$][\w$]*/g)||[];
  if(identifiers.some(x=>!['true','false','null','undefined'].includes(x)))return false;
  s=s.replace(/__STR(\d+)__/g,(_,i)=>literals[Number(i)]);
  if(/[;{}[\]`]/.test(s))return false;
  try { return Boolean(Function(`"use strict"; return (${s});`)()); } catch { return false; }
}

export function addContentCollection(project, name='content') {
  ensureResearchModel(project);
  const c={id:makeId('collection'),name,mode:'build',loader:'glob',base:`./src/content/${name}`,pattern:'**/*.{md,mdx,json}',schema:[{name:'title',type:'string',required:true}],entries:[]};
  project.content.collections.push(c);return c;
}
export function addCollectionEntry(collection, values={}) { const e={id:makeId('entry'),slug:`entry-${collection.entries.length+1}`,values:{...values}};collection.entries.push(e);return e; }
export function addDataSource(project, kind='rest') { ensureResearchModel(project);const d={id:makeId('data'),name:`${kind}Source`,kind,url:'',method:'GET',sample:[],headers:{},query:'',collection:''};project.content.dataSources.push(d);return d; }

export function setTranslation(project, locale, nodeId, prop, value) { ensureResearchModel(project);project.locales.translations[locale]??={};project.locales.translations[locale][nodeId]??={};project.locales.translations[locale][nodeId][prop]=value; }
export function getTranslation(project, locale, nodeId, prop, fallback='') { return project.locales?.translations?.[locale]?.[nodeId]?.[prop] ?? fallback; }

export function responsiveAudit(project, widths=[320,375,390,414,768,1024,1280,1440,1920]) {
  ensureResearchModel(project); const issues=[];
  for(const page of project.pages||[]) walk(page.root,n=>{
    const base=n.style?.base||{};
    const fixedW=px(base.width,NaN), left=px(base.left,0), right=px(base.right,0);
    for(const width of widths){
      if(Number.isFinite(fixedW)&&fixedW+left+right>width+1)issues.push({severity:'warning',code:'RESP_OVERFLOW',width,pageId:page.id,nodeId:n.id,message:`${n.name} fixed width ${fixedW}px may overflow ${width}px viewport.`});
      if(base.whiteSpace==='nowrap'&&String(n.props?.text||'').length>42&&width<=390)issues.push({severity:'warning',code:'RESP_NOWRAP',width,pageId:page.id,nodeId:n.id,message:`${n.name} uses nowrap with long text at ${width}px.`});
    }
  }); return issues;
}

export function accessibilityAudit(project) {
  ensureResearchModel(project); const issues=[];
  for(const page of project.pages||[]) walk(page.root,n=>{
    if(n.type==='image'&&!String(n.props?.alt||'').trim())issues.push({severity:'error',code:'A11Y_ALT',nodeId:n.id,pageId:page.id,message:`${n.name} is missing alt text.`});
    if(n.type==='button'&&!String(n.props?.text||n.meta?.ariaLabel||'').trim())issues.push({severity:'error',code:'A11Y_NAME',nodeId:n.id,pageId:page.id,message:`${n.name} has no accessible name.`});
    if(n.meta?.tabIndex!==''&&Number(n.meta?.tabIndex)>0)issues.push({severity:'warning',code:'A11Y_TABINDEX',nodeId:n.id,pageId:page.id,message:`${n.name} uses positive tabindex; DOM order is usually safer.`});
  });return issues;
}


function tokenResolved(project,value){const m=String(value||'').match(/^var\(--([^)]+)\)$/);if(!m)return value;return project.theme?.themes?.[project.theme?.active]?.tokens?.[m[1]]||value;}
function rgb(value){const s=String(value||'').trim();if(/^#[0-9a-f]{3}$/i.test(s))return [...s.slice(1)].map(x=>parseInt(x+x,16));if(/^#[0-9a-f]{6}$/i.test(s))return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];const m=s.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)/i);return m?[Number(m[1]),Number(m[2]),Number(m[3])]:null;}
function luminance(c){return c.map(v=>{const x=v/255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=rgb(a),y=rgb(b);if(!x||!y)return null;const l1=luminance(x),l2=luminance(y);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);}

export function seoAudit(project){ensureResearchModel(project);const issues=[];for(const page of project.pages||[]){const title=String(page.seo?.title||page.root?.props?.title||page.name||'').trim(),description=String(page.seo?.description||page.root?.props?.description||'').trim();if(!title)issues.push({severity:'error',code:'SEO_TITLE',pageId:page.id,nodeId:page.root?.id,message:`${page.name} has no page title.`});else if(title.length>60)issues.push({severity:'warning',code:'SEO_TITLE_LEN',pageId:page.id,nodeId:page.root?.id,message:`${page.name} title is ${title.length} characters; consider keeping it near 60 or fewer.`});if(!description)issues.push({severity:'warning',code:'SEO_DESCRIPTION',pageId:page.id,nodeId:page.root?.id,message:`${page.name} has no meta description.`});else if(description.length>170)issues.push({severity:'warning',code:'SEO_DESCRIPTION_LEN',pageId:page.id,nodeId:page.root?.id,message:`${page.name} meta description is ${description.length} characters.`});if(page.route!=='/'&&!page.seo?.canonical)issues.push({severity:'info',code:'SEO_CANONICAL',pageId:page.id,nodeId:page.root?.id,message:`${page.name} has no explicit canonical URL.`});}return issues;}

export function performanceAudit(project){ensureResearchModel(project);const issues=[];for(const asset of project.assets||[]){const size=Number(asset.size)||0;if(size>2_000_000)issues.push({severity:'warning',code:'PERF_ASSET_SIZE',message:`Asset ${asset.filename||asset.name} is ${(size/1_000_000).toFixed(1)} MB.`});}for(const page of project.pages||[])walk(page.root,n=>{if(n.type==='image'&&n.props?.loading==='eager'&&!n.props?.width&&!n.style?.base?.width)issues.push({severity:'info',code:'PERF_EAGER_IMAGE',pageId:page.id,nodeId:n.id,message:`${n.name} is eager-loaded without an explicit width.`});if(n.type==='video'&&n.props?.autoplay)issues.push({severity:'warning',code:'PERF_AUTOPLAY_VIDEO',pageId:page.id,nodeId:n.id,message:`${n.name} autoplays video; verify bandwidth and reduced-motion behavior.`});});return issues;}

export function contrastAudit(project){ensureResearchModel(project);const issues=[];for(const page of project.pages||[])walk(page.root,n=>{const st=n.style?.base||{},fg=tokenResolved(project,st.color),bg=tokenResolved(project,st.background||st.backgroundColor);if(!fg||!bg)return;const ratio=contrast(fg,bg);if(ratio!=null&&ratio<4.5)issues.push({severity:'warning',code:'A11Y_CONTRAST',pageId:page.id,nodeId:n.id,message:`${n.name} text contrast is ${ratio.toFixed(2)}:1; normal text generally needs 4.5:1.`});});return issues;}

export function createStory(component, name='Default') { component.stories ??=[]; const s={id:makeId('story'),name,props:{},viewport:1280,theme:'default',locale:'en',state:'default'};component.stories.push(s);return s; }
export function createRecordedTest(project, name='Interaction test') { ensureResearchModel(project);const t={id:makeId('test'),name,pageId:project.pages?.[0]?.id||'',steps:[],assertions:[]};project.recordedTests.push(t);return t; }
export function addTestStep(test,type='click',target='',value=''){const step={id:makeId('step'),type,target,value};test.steps.push(step);return step;}

export function summarizeResearchFeatures(project) {
  ensureResearchModel(project);
  const roots=[...(project.pages||[]).map(p=>p.root),...(project.components||[]).map(c=>c.root)]; let states=0,cq=0,timelines=0,conditions=0;
  for(const r of roots)walk(r,n=>{states+=n.states?.length||0;cq+=n.containerRules?.length||0;timelines+=(n.timeline?.tracks?.length||0);conditions+=n.visibilityCondition?1:0;});
  return { sourceFiles:project.workspace.files.length, externalComponents:project.workspace.externalComponents.length, collections:project.content.collections.length, dataSources:project.content.dataSources.length, locales:project.locales.available.length, variants:(project.components||[]).reduce((a,c)=>a+(c.variants?.length||0),0), states, containerRules:cq, timelineTracks:timelines, conditions, tests:project.recordedTests.length, stories:(project.components||[]).reduce((a,c)=>a+(c.stories?.length||0),0) };
}

/**
 * Source round-trip workspace primitives for Astro UI Designer.
 *
 * The module is intentionally framework-neutral. It keeps source identity,
 * change review and preview configuration separate from the canvas model so
 * adapters can be added without changing editor internals.
 */

const WEB_STYLE_PROPERTIES = Object.freeze([
  'display','position','left','top','right','bottom','width','height','minWidth','maxWidth','minHeight','maxHeight',
  'margin','marginTop','marginRight','marginBottom','marginLeft','padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
  'gap','rowGap','columnGap','flex','flexDirection','flexWrap','justifyContent','alignItems','alignContent','gridTemplateColumns','gridTemplateRows',
  'color','background','backgroundColor','backgroundImage','border','borderColor','borderWidth','borderStyle','borderRadius','boxShadow','opacity',
  'fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textAlign','textDecoration','textTransform',
  'overflow','overflowX','overflowY','transform','filter','backdropFilter','zIndex'
]);

const BACKEND_MATRIX = Object.freeze({
  astro: {
    id:'astro', label:'Astro', family:'web', extensions:['.astro','.css','.scss','.sass','.less'],
    supported:['data-ui-id anchored attribute edits','Plain-text content edits','CSS declaration edits','Responsive CSS selector edits'],
    partial:['Component prop expressions','Class-list changes when expressions are present'],
    unsupported:['Arbitrary frontmatter rewrites','Blind component-tree rewrites'],
    preview:{label:'Astro dev server',launchMode:'command-url',command:'npm',args:['run','dev','--','--host','127.0.0.1'],cwd:'.',url:'http://127.0.0.1:4321',readyPattern:'Local|localhost|127.0.0.1'}
  },
  react: {
    id:'react', label:'React', family:'web', extensions:['.tsx','.jsx','.css','.scss','.sass','.less'],
    supported:['data-ui-id/class anchored CSS edits','Plain JSX text edits','Simple literal prop edits'],
    partial:['JSX expressions','CSS-in-JS literals'],
    unsupported:['Arbitrary hook/control-flow rewrites','Unanchored tree rewrites'],
    preview:{label:'React dev server',launchMode:'command-url',command:'npm',args:['run','dev','--','--host','127.0.0.1'],cwd:'.',url:'http://127.0.0.1:5173',readyPattern:'ready|localhost|127.0.0.1'}
  },
  'vanilla-js': {
    id:'vanilla-js', label:'Vanilla JS', family:'web', extensions:['.html','.htm','.css','.js'],
    supported:['data-ui-id/id/class anchored HTML edits','Plain text edits','CSS declaration edits'],
    partial:['Inline script literal updates'],
    unsupported:['Arbitrary JavaScript control-flow rewrites'],
    preview:{label:'Web preview server',launchMode:'command-url',command:'npm',args:['run','dev','--','--host','127.0.0.1'],cwd:'.',url:'http://127.0.0.1:5173',readyPattern:'ready|localhost|127.0.0.1'}
  },
  'vanilla-ts': {
    id:'vanilla-ts', label:'Vanilla TS', family:'web', extensions:['.html','.htm','.css','.ts'],
    supported:['data-ui-id/id/class anchored HTML edits','Plain text edits','CSS declaration edits'],
    partial:['Simple TypeScript literal updates'],
    unsupported:['Arbitrary TypeScript control-flow rewrites'],
    preview:{label:'Web preview server',launchMode:'command-url',command:'npm',args:['run','dev','--','--host','127.0.0.1'],cwd:'.',url:'http://127.0.0.1:5173',readyPattern:'ready|localhost|127.0.0.1'}
  },
  vue: {
    id:'vue', label:'Vue', family:'web', extensions:['.vue','.css','.scss','.sass','.less'],
    supported:['Template data-ui-id/class anchored CSS edits','Plain template text edits'],
    partial:['Literal template props','Scoped-style selectors'],
    unsupported:['Arbitrary script setup/control-flow rewrites'],
    preview:{label:'Vue dev server',launchMode:'command-url',command:'npm',args:['run','dev','--','--host','127.0.0.1'],cwd:'.',url:'http://127.0.0.1:5173',readyPattern:'ready|localhost|127.0.0.1'}
  },
  svelte: {
    id:'svelte', label:'Svelte', family:'web', extensions:['.svelte','.css','.scss','.sass','.less'],
    supported:['Template data-ui-id/class anchored CSS edits','Plain template text edits'],
    partial:['Literal component props','Component-local style selectors'],
    unsupported:['Arbitrary reactive/script rewrites'],
    preview:{label:'Svelte dev server',launchMode:'command-url',command:'npm',args:['run','dev','--','--host','127.0.0.1'],cwd:'.',url:'http://127.0.0.1:5173',readyPattern:'ready|localhost|127.0.0.1'}
  },
  tkinter: {
    id:'tkinter', label:'Tkinter', family:'python', extensions:['.py'],
    supported:['Stable widget-symbol mappings','Geometry/config value review'],
    partial:['Literal text/color/font patch adapters'],
    unsupported:['Blind pack/grid/place migrations','Callback/control-flow rewrites'],
    preview:{label:'Tkinter application',launchMode:'command',command:'python',args:['main.py'],cwd:'.',url:'',readyPattern:''}
  },
  nicegui: {
    id:'nicegui', label:'NiceGUI', family:'python', extensions:['.py'],
    supported:['Stable symbol/line mappings','Style/text review'],
    partial:['Literal .style() and label text patch adapters'],
    unsupported:['Arbitrary Python control-flow rewrites'],
    preview:{label:'NiceGUI application',launchMode:'command-url',command:'python',args:['main.py'],cwd:'.',url:'http://127.0.0.1:8080',readyPattern:'Uvicorn running|localhost|127.0.0.1'}
  },
  lvgl: {
    id:'lvgl', label:'LVGL', family:'embedded', extensions:['.c','.h','.cpp','.hpp'],
    supported:['Stable object-symbol mappings','Geometry/style setter review'],
    partial:['Literal lv_obj/lv_style setter patch adapters'],
    unsupported:['Callback logic rewrites','Complex style-class rewrites'],
    preview:{label:'LVGL simulator',launchMode:'command',command:'',args:[],cwd:'.',url:'',readyPattern:''}
  },
  pwtk: {
    id:'pwtk', label:'pwtk Blocks', family:'python', extensions:['.py','.json','.html'],
    supported:['Block / GUI-block symbol mappings from App & layout.json','Refresh-timer (timer_vals) review','Pin/mirror state review','App handler (@on) mapping'],
    partial:['Block container re-arrangement in layout.json','Descriptor field edits'],
    unsupported:['Blind CANopen/communication logic rewrites','render_custom_html template rewrites'],
    preview:{label:'pwtk device GUI app',launchMode:'command-url',command:'python',args:['main.py'],cwd:'.',url:'http://127.0.0.1:8080',readyPattern:'localhost|127.0.0.1|eel'}
  }
});

export const ROUNDTRIP_BACKENDS = Object.freeze(Object.keys(BACKEND_MATRIX));
export const ROUNDTRIP_SYNC_MODES = Object.freeze(['source-to-design','design-to-source','bidirectional-reviewed']);
export const ROUNDTRIP_DIRTY_STATES = Object.freeze(['clean','source-dirty','design-dirty','both-dirty']);
export const ROUNDTRIP_STYLE_PROPERTIES = WEB_STYLE_PROPERTIES;

export function getRoundTripBackend(id='astro') {
  return BACKEND_MATRIX[id] || null;
}

export function listRoundTripBackends() {
  return ROUNDTRIP_BACKENDS.map(id=>structured(BACKEND_MATRIX[id]));
}

function structured(value){return JSON.parse(JSON.stringify(value));}
export function normalizeSourcePath(path=''){return String(path||'').replace(/\\+/g,'/').replace(/^\.\//,'').replace(/\/{2,}/g,'/');}
function ext(path=''){const s=normalizeSourcePath(path).toLowerCase();const i=s.lastIndexOf('.');return i>=0?s.slice(i):'';}
function fileName(file){return normalizeSourcePath(file?.filename||file?.path||file?.relativePath||'');}
function fileContent(file){return String(file?.content??file?.source??'');}

export function sourceFingerprint(content='') {
  // FNV-1a 32 bit: fast, deterministic and available in browser + Node.
  let h=0x811c9dc5;
  const text=String(content);
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,0x01000193)>>>0;
  }
  return h.toString(16).padStart(8,'0');
}

export function detectRoundTripBackend(files=[]) {
  const items=(files||[]).map(f=>({name:fileName(f),extension:ext(fileName(f)),content:fileContent(f)}));
  const joined=items.map(x=>x.content).join('\n');
  const extensions=new Set(items.map(x=>x.extension));
  if(extensions.has('.astro')||/---[\s\S]*?---\s*<[A-Za-z]/m.test(joined))return 'astro';
  if(extensions.has('.vue')||/<template[\s>]/i.test(joined)&&/<script(?:\s+setup)?[\s>]/i.test(joined))return 'vue';
  if(extensions.has('.svelte')||/<svelte:(?:head|window|component)\b/i.test(joined))return 'svelte';
  if(extensions.has('.tsx')||extensions.has('.jsx')||/\bfrom\s+["']react["']|\bimport\s+React\b|\bReact\.createElement\b/.test(joined))return 'react';
  if(extensions.has('.py')){
    if(/\b(?:from\s+nicegui\s+import|import\s+nicegui)\b/.test(joined))return 'nicegui';
    if(/\b(?:import\s+tkinter|from\s+tkinter\s+import)\b/.test(joined))return 'tkinter';
  }
  if(/\bfrom\s+pwtk\s+import\b/.test(joined)||/\bimport\s+pwtk\b/.test(joined)||/set_block_container\s*\(/.test(joined)||/class\s+\w+\s*\(\s*pwtk\.App\s*\)/.test(joined)||/\(\s*pwtk\.(?:Block|BundleBlock)\s*\)/.test(joined))return 'pwtk';
  if([...extensions].some(x=>['.c','.h','.cpp','.hpp'].includes(x))&&/\blv_(?:obj|label|btn|style|screen|display)_/.test(joined))return 'lvgl';
  if(extensions.has('.html')||extensions.has('.htm'))return extensions.has('.ts')?'vanilla-ts':'vanilla-js';
  return null;
}

function importSpecifiers(source=''){
  const out=[];
  const patterns=[
    /\bimport(?:[\s\S]*?from\s*)?["']([^"']+)["']/g,
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
    /\bfrom\s+["']([^"']+)["']/g
  ];
  for(const re of patterns){let m;while((m=re.exec(source)))out.push(m[1]);}
  return [...new Set(out)];
}
function dirname(path){const p=normalizeSourcePath(path);const i=p.lastIndexOf('/');return i>=0?p.slice(0,i):'';}
function joinPath(base,relative){const raw=[base,relative].filter(Boolean).join('/');const parts=[];for(const part of raw.split('/')){if(!part||part==='.')continue;if(part==='..')parts.pop();else parts.push(part);}return parts.join('/');}
function resolveImport(from,spec,names){
  if(!spec.startsWith('.'))return null;
  const base=joinPath(dirname(from),spec);
  const candidates=[base,`${base}.astro`,`${base}.tsx`,`${base}.ts`,`${base}.jsx`,`${base}.js`,`${base}.vue`,`${base}.svelte`,`${base}.css`,`${base}.scss`,`${base}/index.astro`,`${base}/index.tsx`,`${base}/index.ts`,`${base}/index.jsx`,`${base}/index.js`];
  return candidates.find(x=>names.has(x))||null;
}
function chooseEntry(files,backend,explicit=''){
  const normalized=(files||[]).map(f=>fileName(f)).filter(Boolean);
  if(explicit&&normalized.includes(normalizeSourcePath(explicit)))return normalizeSourcePath(explicit);
  const patterns=backend==='astro'?[/src\/pages\/index\.astro$/i,/index\.astro$/i]:backend==='react'?[/src\/(?:main|app)\.(?:tsx|jsx)$/i,/(?:main|app)\.(?:tsx|jsx)$/i]:backend==='vue'?[/src\/App\.vue$/i,/App\.vue$/i]:backend==='svelte'?[/src\/routes\/\+page\.svelte$/i,/App\.svelte$/i]:[/index\.html$/i];
  for(const re of patterns){const hit=normalized.find(x=>re.test(x));if(hit)return hit;}
  return normalized.find(x=>!['.css','.scss','.sass','.less','.json','.md'].includes(ext(x)))||normalized[0]||'';
}

export function buildRoundTripGraph(files=[],options={}){
  const items=(files||[]).map(f=>({filename:fileName(f),content:fileContent(f)})).filter(f=>f.filename);
  const names=new Set(items.map(f=>f.filename));
  const backend=options.backend||detectRoundTripBackend(items)||'astro';
  const entryFile=chooseEntry(items,backend,options.entryFile||'');
  const byName=new Map(items.map(f=>[f.filename,f]));
  const reachable=new Set();
  const queue=entryFile?[entryFile]:[];
  while(queue.length){
    const name=queue.shift();if(!name||reachable.has(name)||!byName.has(name))continue;reachable.add(name);
    for(const spec of importSpecifiers(byName.get(name).content)){
      const resolved=resolveImport(name,spec,names);if(resolved&&!reachable.has(resolved))queue.push(resolved);
    }
  }
  if(!reachable.size)items.forEach(f=>reachable.add(f.filename));
  const styleFiles=items.filter(f=>['.css','.scss','.sass','.less'].includes(ext(f.filename))).map(f=>f.filename);
  const componentRoots=items.filter(f=>/\/(?:components|widgets|ui)\//i.test(`/${f.filename}`)&&!styleFiles.includes(f.filename)).map(f=>f.filename);
  const sourceFiles=items.map(f=>({filename:f.filename,fingerprint:sourceFingerprint(f.content),language:ext(f.filename).slice(1),reachable:reachable.has(f.filename)}));
  return {
    version:1,mode:options.projectPath?'project':'files',backend,projectPath:options.projectPath||'',entryFile,
    reachableFiles:[...reachable],styleFiles,componentRoots,files:sourceFiles
  };
}

export function createSourceIdentity(input={}){
  const relativeFilePath=normalizeSourcePath(input.relativeFilePath||input.filename||'');
  const selectorPath=input.selectorPath||input.selector||null;
  const nodePath=String(input.nodePath||input.nodeId||selectorPath||'').trim();
  return {
    relativeFilePath,
    symbolPath:input.symbolPath||input.symbol||null,
    selectorPath,
    nodePath,
    confidence:clamp01(input.confidence??(selectorPath?1:(input.symbolPath?0.95:0.7))),
    sourceFingerprint:String(input.sourceFingerprint||input.fingerprint||''),
    updatedAt:input.updatedAt||new Date().toISOString()
  };
}
function clamp01(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;}

export function ensureRoundTripProject(project){
  if(!project||typeof project!=='object')throw new Error('Project object is required');
  project.workspace??={rootPath:'',files:[],sourceMappings:[],externalComponents:[],preview:{url:'',running:false},lastScan:''};
  const rt=project.workspace.roundTrip??={};
  rt.version=2;
  rt.syncMode=ROUNDTRIP_SYNC_MODES.includes(rt.syncMode)?rt.syncMode:'bidirectional-reviewed';
  rt.backend=getRoundTripBackend(rt.backend)?rt.backend:'astro';
  rt.sourceDirtyFiles=Array.isArray(rt.sourceDirtyFiles)?[...new Set(rt.sourceDirtyFiles.map(normalizeSourcePath))]:[];
  rt.designDirty=Boolean(rt.designDirty);
  rt.mappings=Array.isArray(rt.mappings)?rt.mappings:[];
  rt.previewProfiles=rt.previewProfiles&&typeof rt.previewProfiles==='object'?rt.previewProfiles:{};
  rt.lastGraph=rt.lastGraph||null;
  rt.lastReview=rt.lastReview||null;
  rt.lastPatchPlan=rt.lastPatchPlan||null;
  rt.astIndex=rt.astIndex&&typeof rt.astIndex==='object'?rt.astIndex:{};
  rt.history=Array.isArray(rt.history)?rt.history:[];
  rt.audit=Array.isArray(rt.audit)?rt.audit:[];
  rt.watcher=rt.watcher&&typeof rt.watcher==='object'?rt.watcher:{running:false,token:'',lastEventAt:'',ignored:[]};
  rt.conversion=rt.conversion&&typeof rt.conversion==='object'?rt.conversion:{lastImport:null,lastExport:null};
  return rt;
}

export function upsertSourceIdentity(project,nodeId,identity){
  const rt=ensureRoundTripProject(project);const next=createSourceIdentity(identity);
  const i=rt.mappings.findIndex(x=>x.nodeId===nodeId);
  const row={nodeId,...next};if(i>=0)rt.mappings[i]=row;else rt.mappings.push(row);return structured(row);
}

export function deriveRoundTripDirtyState(sourceDirty,designDirty){
  const s=Array.isArray(sourceDirty)?sourceDirty.length>0:Boolean(sourceDirty),d=Boolean(designDirty);
  return s&&d?'both-dirty':s?'source-dirty':d?'design-dirty':'clean';
}

export function relevantChangedFiles(graph,changedFiles=[]){
  const normalized=[...new Set((changedFiles||[]).map(normalizeSourcePath).filter(Boolean))];
  if(!graph||graph.mode!=='project')return normalized;
  const tracked=new Set([...(graph.reachableFiles||[]),...(graph.styleFiles||[]),graph.entryFile,...(graph.componentRoots||[])].filter(Boolean).map(normalizeSourcePath));
  return normalized.filter(x=>tracked.has(x));
}

export function shouldAutoRefreshRoundTrip(syncMode,dirtyState,changedFiles=[]){
  if(!(changedFiles||[]).length)return false;
  if(syncMode==='design-to-source')return false;
  if(syncMode==='bidirectional-reviewed'&&(dirtyState==='design-dirty'||dirtyState==='both-dirty'))return false;
  return true;
}

export function getPreviewProfile(backend='astro',overrides={}){
  const base=getRoundTripBackend(backend)?.preview||BACKEND_MATRIX.astro.preview;
  return {...structured(base),backend,...structured(overrides||{}),args:Array.isArray(overrides?.args)?[...overrides.args]:[...(base.args||[])]};
}

function cssName(property=''){return String(property).replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`);}
function cssValue(value){return value==null?'':String(value).trim();}
function replaceCssDeclaration(block,property,value){
  const prop=cssName(property),safe=prop.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`(^|[;\\n\\r]\\s*)(${safe})\\s*:\\s*([^;}]*)`,'i');
  if(re.test(block))return block.replace(re,(all,prefix,name)=>`${prefix}${name}: ${value}`);
  const trimmed=block.replace(/\s*$/,'');
  const sep=trimmed&&!/[;\n]\s*$/.test(trimmed)?';':'';
  return `${trimmed}${sep}\n  ${prop}: ${value};\n`;
}
function patchCssSelector(source,selector,changes){
  const safe=String(selector||'').trim();if(!safe)return {ok:false,source,reason:'selector-missing'};
  let start=-1,open=-1;
  for(let from=0;;){const i=source.indexOf(safe,from);if(i<0)break;let j=i+safe.length;while(/\s/.test(source[j]||''))j++;if(source[j]==='{'){start=i;open=j;break}from=i+safe.length;}
  if(open<0)return {ok:false,source,reason:'selector-not-found'};
  let depth=1,quote='',escape=false,close=-1;
  for(let i=open+1;i<source.length;i++){
    const ch=source[i];if(escape){escape=false;continue}if(ch==='\\'){escape=true;continue}if(quote){if(ch===quote)quote='';continue}if(ch==='"'||ch==="'"){quote=ch;continue}if(ch==='{')depth++;else if(ch==='}'&&--depth===0){close=i;break}
  }
  if(close<0)return {ok:false,source,reason:'selector-block-unclosed'};
  let body=source.slice(open+1,close);
  for(const change of changes){if(change.domain==='style'||WEB_STYLE_PROPERTIES.includes(change.property))body=replaceCssDeclaration(body,change.property,cssValue(change.value));}
  const next=source.slice(0,open+1)+body+source.slice(close);
  return {ok:next!==source,source:next,reason:next!==source?'ok':'no-style-changes',anchor:{start,open,close}};
}
function patchUiIdMarkup(source,nodeId,changes){
  if(!nodeId)return {ok:false,source,reason:'node-id-missing'};
  const escaped=String(nodeId).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`<([A-Za-z][\\w:.-]*)([^>]*?\\sdata-ui-id=["']${escaped}["'][^>]*)>`,'m');
  const m=String(source).match(re);if(!m)return {ok:false,source,reason:'data-ui-id-not-found'};
  let attrs=m[2];
  const setAttr=(name,value)=>{const key=String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const attrRe=new RegExp(`(\\s${key}=["'])[^"']*(["'])`);if(value==null||value===''){attrs=attrs.replace(new RegExp(`\\s${key}=["'][^"']*["']`),'');return;}const safe=String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;');attrs=attrRe.test(attrs)?attrs.replace(attrRe,` ${name}="${safe}"`):`${attrs} ${name}="${safe}"`;};
  for(const change of changes.filter(x=>x.domain==='attribute'))setAttr(change.property,change.value);
  let out=String(source).slice(0,m.index)+`<${m[1]}${attrs}>`+String(source).slice(m.index+m[0].length);
  const textChange=changes.find(x=>x.domain==='text'||x.property==='text'||x.property==='content');
  if(textChange){const start=m.index+`<${m[1]}${attrs}>`.length;const close=new RegExp(`</${m[1]}\\s*>`,'g');close.lastIndex=start;const cm=close.exec(out);if(cm){const inner=out.slice(start,cm.index);if(!/[<>]/.test(inner)){const text=String(textChange.value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');out=out.slice(0,start)+text+out.slice(cm.index);}}}
  return {ok:out!==source,source:out,reason:out!==source?'ok':'no-markup-changes',anchor:{start:m.index,end:m.index+m[0].length}};
}


function replacePythonKeywordArgs(raw,changes,map={}){
  let out=String(raw);
  for(const change of changes){const key=map[change.property]||change.property;if(!key)continue;const re=new RegExp(`(\\b${String(key).replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}\\s*=\\s*)([\"'][^\"']*[\"']|-?\\d+(?:\\.\\d+)?|True|False)`);const value=typeof change.value==='number'||/^-?\\d+(?:\\.\\d+)?$/.test(String(change.value))?String(change.value):JSON.stringify(String(change.value));if(re.test(out))out=out.replace(re,`$1${value}`);else out=out.replace(/\)\s*$/,`, ${key}=${value})`);}return out;
}
function patchTkinterSource(source,identity,changes){
  const symbol=identity.symbolPath||identity.nodePath;if(!symbol)return {ok:false,source,reason:'symbol-missing'};let out=String(source),changed=false;
  const ctor=new RegExp(`(^\\s*${String(symbol).replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}\\s*=\\s*(?:(?:tk|ttk|tkinter)\\.)?[A-Za-z_]\\w*\\s*\\()([^\\n]*)(\\)\\s*$)`,'m');
  const cm=out.match(ctor);if(cm){const relevant=changes.filter(x=>['text','attribute','style'].includes(x.domain));const map={color:'fg',backgroundColor:'bg',fontFamily:'font'};const inner=replacePythonKeywordArgs(cm[2]+')',relevant,map).replace(/\)\s*$/,'');const repl=cm[1]+inner+cm[3];out=out.slice(0,cm.index)+repl+out.slice(cm.index+cm[0].length);changed=out!==source;}
  const geom=changes.filter(x=>x.domain==='style'&&['left','top','width','height'].includes(x.property));if(geom.length){const gm=new RegExp(`(^\\s*${String(symbol).replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}\\.place\\s*\\()([^\\n]*)(\\)\\s*$)`,'m'),m=out.match(gm);if(m){const map={left:'x',top:'y',width:'width',height:'height'},clean=geom.map(c=>({...c,value:parseFloat(String(c.value))||0})),inner=replacePythonKeywordArgs(m[2]+')',clean,map).replace(/\)\s*$/,'');out=out.slice(0,m.index)+m[1]+inner+m[3]+out.slice(m.index+m[0].length);changed=true;}}
  return {ok:changed,source:out,reason:changed?'ok':'symbol-or-literal-not-found'};
}
function patchNiceGuiSource(source,identity,changes){
  const symbol=identity.symbolPath||identity.nodePath;let out=String(source),changed=false;const textChange=changes.find(x=>x.domain==='text'||x.property==='text');
  if(textChange&&symbol){const re=new RegExp(`(^\\s*${String(symbol).replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}\\s*=\\s*ui\\.[A-Za-z_]\\w*\\s*\\()([\"'])[^\"']*\\2`,'m'),m=out.match(re);if(m){const q=m[2],val=String(textChange.value).replaceAll('\\\\','\\\\\\\\').replaceAll(q,`\\\\${q}`);out=out.slice(0,m.index)+m[0].replace(new RegExp(`${q}[^${q}]*${q}$`),`${q}${val}${q}`)+out.slice(m.index+m[0].length);changed=true;}}
  return {ok:changed,source:out,reason:changed?'ok':'symbol-or-literal-not-found'};
}
function patchLvglSource(source,identity,changes){
  const symbol=identity.symbolPath||identity.nodePath;if(!symbol)return {ok:false,source,reason:'symbol-missing'};let out=String(source),changed=false;const safe=String(symbol).replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&');
  const text=changes.find(x=>x.domain==='text'||x.property==='text');if(text){const re=new RegExp(`(lv_label_set_text\\s*\\(\\s*${safe}\\s*,\\s*)\"(?:\\\\.|[^\"\\\\])*\"`);const val=JSON.stringify(String(text.value));if(re.test(out)){out=out.replace(re,`$1${val}`);changed=true;}}
  const style=Object.fromEntries(changes.filter(x=>x.domain==='style').map(x=>[x.property,x.value]));if('left'in style||'top'in style){const re=new RegExp(`(lv_obj_set_pos\\s*\\(\\s*${safe}\\s*,\\s*)-?\\d+\\s*,\\s*-?\\d+`);if(re.test(out)){out=out.replace(re,`$1${parseInt(style.left??0,10)||0}, ${parseInt(style.top??0,10)||0}`);changed=true;}}
  if('width'in style||'height'in style){const re=new RegExp(`(lv_obj_set_size\\s*\\(\\s*${safe}\\s*,\\s*)-?\\d+\\s*,\\s*-?\\d+`);if(re.test(out)){out=out.replace(re,`$1${parseInt(style.width??100,10)||100}, ${parseInt(style.height??30,10)||30}`);changed=true;}}
  return {ok:changed,source:out,reason:changed?'ok':'setter-not-found'};
}
function patchPwtkSource(source,identity,changes){
  // pwtk layout changes are anchored in layout.json via the "Group, Name" key (symbolPath).
  const key=identity.symbolPath||identity.nodePath;if(!key)return {ok:false,source,reason:'symbol-missing'};
  let layout;try{layout=JSON.parse(String(source))}catch{return {ok:false,source:source,reason:'layout-json-not-json'}};
  if(typeof layout!=='object'||layout===null)return {ok:false,source:source,reason:'layout-json-not-object'};
  const containers=layout.block_containers||{},pinned=layout.pinned_blocks||{},timers=layout.timer_vals||{};
  const containerOf=(k)=>{for(const cid of Object.keys(containers))if((containers[cid]||[]).includes(k))return cid;return null;};
  let changed=false;
  for(const change of changes){
    const prop=change.property;
    if(prop==='timer'||prop==='refreshTime'||prop==='refreshMs'){
      const cid=containerOf(key)||Object.keys(containers)[0];const value=Number(change.value);
      if(cid===undefined||!Number.isFinite(value))continue;timers[key]=value;changed=true;continue;
    }
    if(prop==='pinned'||prop==='pin'||prop==='mirror'){
      const on=change.value===true||change.value===1||String(change.value).toLowerCase()==='true';
      const cid=containerOf(key)||Object.keys(containers)[0];
      if(cid===undefined)continue;
      if(on){pinned[key]=cid;changed=changed||!('key'in pinned&&pinned[key]===cid);}else{delete pinned[key];changed=true;}continue;
    }
    if(prop==='container'||prop==='target'){
      const from=containerOf(key);if(!from)continue;const to=String(change.value).startsWith('#')?String(change.value):`#${String(change.value)}`;
      if(containers[from]){containers[from]=containers[from].filter(x=>x!==key);if(!containers[from].length)delete containers[from];}
      containers[to]=containers[to]||[];if(!containers[to].includes(key))containers[to].push(key);
      if(pinned[key])pinned[key]=to;changed=true;continue;
    }
    if(prop==='name'||prop==='block'){
      const to=String(change.value).trim();if(!to||to===key)continue;const [g,n]=String(key).split(',');const toKey=`${g?g+', ':''}${to}`;
      for(const cid of Object.keys(containers)){containers[cid]=(containers[cid]||[]).map(x=>x===key?toKey:x);if(pinned[key]===cid)pinned[toKey]=cid,delete pinned[key];if(timers[key]!=null){timers[toKey]=timers[key];delete timers[key];}}
      changed=true;continue;
    }
    if(prop==='group'){
      const to=String(change.value).trim();const [,n]=String(key).split(',');const toKey=`${to?to+', ':''}${n}`;
      for(const cid of Object.keys(containers)){containers[cid]=(containers[cid]||[]).map(x=>x===key?toKey:x);if(pinned[key]===cid)pinned[toKey]=cid,delete pinned[key];if(timers[key]!=null){timers[toKey]=timers[key];delete timers[key];}}
      changed=true;continue;
    }
  }
  if(!changed)return {ok:false,source:source,reason:'no-layout-changes'};
  layout.block_containers=containers;layout.pinned_blocks=pinned;layout.timer_vals=timers;
  const out=JSON.stringify(layout,null,4);
  return {ok:out!==source,source:out,reason:out!==source?'ok':'no-layout-changes'};
}

function normalizeChanges(changes=[]){return (changes||[]).filter(Boolean).map((c,i)=>({id:c.id||`${i}:${c.property||c.domain||'change'}`,domain:c.domain||((c.property==='text'||c.property==='content')?'text':WEB_STYLE_PROPERTIES.includes(c.property)?'style':'attribute'),property:String(c.property||''),previousValue:c.previousValue??null,value:c.value??''}));}

export function buildRoundTripPatchPlan(args={}){
  const files=(args.files||[]).map(f=>({filename:fileName(f),content:fileContent(f)}));
  const identity=createSourceIdentity(args.sourceIdentity||{});const backend=args.backend||detectRoundTripBackend(files)||'astro';const matrix=getRoundTripBackend(backend);
  if(!matrix)return {ok:false,message:`Unsupported source backend: ${backend}`,diagnostics:[],confidence:0};
  const file=backend==='pwtk'?(files.find(f=>/layout\.json$/i.test(f.filename))||files[0]):(files.find(f=>f.filename===identity.relativeFilePath)||files[0]);
  if(!file)return {ok:false,message:'No source file is available for the patch.',diagnostics:[],confidence:0};
  const changes=normalizeChanges(args.changes||[]);if(!changes.length)return {ok:false,message:'No changes were requested.',diagnostics:[],confidence:identity.confidence};
  const before=file.content;let out=before;const diagnostics=[];const warnings=[];let strategy='none';let matchedTarget='';
  const markupChanges=changes.filter(c=>c.domain!=='style');const styleChanges=changes.filter(c=>c.domain==='style');
  if(matrix.family==='web'){
    if(markupChanges.length){const nodeId=args.nodeId||identity.nodePath;const result=patchUiIdMarkup(out,nodeId,markupChanges);if(result.ok){out=result.source;strategy='exact-data-ui-id';matchedTarget=String(nodeId);}else diagnostics.push(`Markup patch: ${result.reason}`);}
    if(styleChanges.length){const selector=identity.selectorPath||args.selectorPath||'';const result=patchCssSelector(out,selector,styleChanges);if(result.ok){out=result.source;strategy=strategy==='none'?'exact-selector':`${strategy}+exact-selector`;matchedTarget=matchedTarget||selector;}else diagnostics.push(`Style patch: ${result.reason}`);}
  }else{
    const result=backend==='tkinter'?patchTkinterSource(out,identity,changes):backend==='nicegui'?patchNiceGuiSource(out,identity,changes):backend==='lvgl'?patchLvglSource(out,identity,changes):backend==='pwtk'?patchPwtkSource(out,identity,changes):{ok:false,source:out,reason:'backend-patcher-missing'};
    if(result.ok){out=result.source;strategy='exact-symbol';matchedTarget=identity.symbolPath||identity.nodePath;}else diagnostics.push(`${matrix.label} patch: ${result.reason}`);
  }
  if(args.astAnchor?.exact&&out!==before){strategy=`ast-${strategy}`;}
  if(out===before){return {ok:false,message:'No safe anchored patch could be produced.',diagnostics,warnings,confidence:Math.min(identity.confidence,0.6)};}
  const confidence=clamp01(Math.min(identity.confidence,diagnostics.length?0.82:args.astAnchor?.exact?1:.98));
  const plan={backend,kind:styleChanges.length&&markupChanges.length?'mixed':styleChanges.length?'style':'markup',relativePath:file.filename,targetLabel:matchedTarget||identity.nodePath||identity.symbolPath,existingSource:before,nextSource:out,changes,warnings,diagnostics,dryRun:true,confidence,resolution:{strategy,requestedTarget:identity.selectorPath||identity.nodePath||identity.symbolPath,matchedTarget},baselineFingerprint:sourceFingerprint(before),sourceIdentity:structured(identity),nodeId:args.nodeId||identity.nodePath,selectorPath:identity.selectorPath||args.selectorPath||'',astAnchor:structured(args.astAnchor||null)};
  return {ok:true,plan};
}

export function reviewRoundTripPatch(plan,options={}){
  if(!plan)throw new Error('Patch plan is required');
  const dirty=new Set((options.dirtyFiles||[]).map(normalizeSourcePath));
  const staleSource=dirty.has(normalizeSourcePath(plan.relativePath))||(options.currentSource!=null&&sourceFingerprint(options.currentSource)!==plan.baselineFingerprint);
  const exact=/^(?:ast-)?exact-(?:data-ui-id|selector|symbol)(?:\+exact-selector)?$/.test(plan.resolution?.strategy||'');
  const staleMapping=!exact||plan.resolution?.requestedTarget&&plan.resolution?.matchedTarget&&!String(plan.resolution.requestedTarget).includes(String(plan.resolution.matchedTarget));
  const reasons=[];if(staleSource)reasons.push('Source changed after the patch preview was built.');if(staleMapping)reasons.push('Source identity required a non-exact or drifted anchor.');if(Number(plan.confidence)<0.9)reasons.push(`Patch confidence is ${Math.round(Number(plan.confidence||0)*100)}%.`);
  const status=staleSource?'blocked':(staleMapping||Number(plan.confidence)<0.9||plan.warnings?.length?'warning':'safe');
  return {status,canApply:!staleSource,staleSource,staleMapping,reasons,requiresPerChangeReview:status==='warning'&&plan.changes?.length>1};
}

export function applyRoundTripPatch(plan,currentSource,options={}){
  const review=reviewRoundTripPatch(plan,{...options,currentSource});
  if(!review.canApply)return {ok:false,source:String(currentSource??''),review,message:review.reasons[0]||'Patch is blocked.'};
  return {ok:true,source:plan.nextSource,review,message:review.status==='safe'?'Patch applied.':'Patch applied after review.'};
}

export function summarizeRoundTripWorkspace(project){
  const rt=ensureRoundTripProject(project);const files=project.workspace?.files||[];const graph=buildRoundTripGraph(files,{backend:rt.backend,projectPath:project.workspace?.rootPath||'',entryFile:rt.lastGraph?.entryFile||''});rt.lastGraph=graph;
  const dirtyState=deriveRoundTripDirtyState(rt.sourceDirtyFiles,rt.designDirty);
  return {backend:graph.backend,label:getRoundTripBackend(graph.backend)?.label||graph.backend,syncMode:rt.syncMode,dirtyState,sourceFiles:files.length,reachableFiles:graph.reachableFiles.length,styleFiles:graph.styleFiles.length,mappings:rt.mappings.length,canAutoRefresh:shouldAutoRefreshRoundTrip(rt.syncMode,dirtyState,relevantChangedFiles(graph,rt.sourceDirtyFiles)),capabilities:structured(getRoundTripBackend(graph.backend)),graph:structured(graph)};
}


export function filterRoundTripPatchPlan(plan,selectedChangeIds=[]){
  if(!plan)throw new Error('Patch plan is required');const ids=new Set(selectedChangeIds||[]);const changes=(plan.changes||[]).filter(c=>ids.has(c.id));if(!changes.length)return {ok:false,message:'Select at least one change.'};return buildRoundTripPatchPlan({backend:plan.backend,files:[{filename:plan.relativePath,content:plan.existingSource}],sourceIdentity:plan.sourceIdentity,nodeId:plan.nodeId,selectorPath:plan.selectorPath,changes,astAnchor:plan.astAnchor});
}
export function checkpointRoundTripSource(project,{nodeId='',relativePath='',source='',reason='before-apply',plan=null,label=''}={}){
  const rt=ensureRoundTripProject(project),item={id:`rt-history-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,at:new Date().toISOString(),nodeId,relativePath:normalizeSourcePath(relativePath),reason,label:label||reason,source:String(source),fingerprint:sourceFingerprint(source),backend:plan?.backend||rt.backend,changes:structured(plan?.changes||[])};rt.history.unshift(item);if(rt.history.length>100)rt.history.length=100;return structured(item);
}
export function listRoundTripHistory(project,{nodeId='',relativePath='',limit=100}={}){const rt=ensureRoundTripProject(project);return rt.history.filter(x=>(!nodeId||x.nodeId===nodeId)&&(!relativePath||x.relativePath===normalizeSourcePath(relativePath))).slice(0,Math.max(1,limit)).map(structured);}
export function buildRoundTripRollbackPlan(project,checkpointId,currentSource){const rt=ensureRoundTripProject(project),cp=rt.history.find(x=>x.id===checkpointId);if(!cp)return {ok:false,message:'Source checkpoint not found.'};const before=String(currentSource??'');return {ok:true,plan:{backend:cp.backend||rt.backend,kind:'rollback',relativePath:cp.relativePath,targetLabel:cp.nodeId||cp.relativePath,existingSource:before,nextSource:cp.source,changes:[{id:`rollback:${cp.id}`,domain:'source',property:'checkpoint',previousValue:sourceFingerprint(before),value:cp.fingerprint}],warnings:[],diagnostics:[],dryRun:true,confidence:1,resolution:{strategy:'exact-checkpoint',requestedTarget:cp.id,matchedTarget:cp.id},baselineFingerprint:sourceFingerprint(before),sourceIdentity:createSourceIdentity({relativeFilePath:cp.relativePath,nodePath:cp.nodeId,confidence:1,sourceFingerprint:sourceFingerprint(before)}),nodeId:cp.nodeId,checkpointId:cp.id}};}
export function recordRoundTripAudit(project,event,data={}){const rt=ensureRoundTripProject(project),row={id:`rt-audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,at:new Date().toISOString(),event,...structured(data)};rt.audit.unshift(row);if(rt.audit.length>250)rt.audit.length=250;return structured(row);}
export function applyRoundTripWatcherEvents(project,graph,events=[]){
  const rt=ensureRoundTripProject(project),changed=relevantChangedFiles(graph,(events||[]).map(e=>typeof e==='string'?e:e.relativePath||e.filename||e.path).filter(Boolean));for(const file of changed)if(!rt.sourceDirtyFiles.includes(file))rt.sourceDirtyFiles.push(file);if(changed.length)rt.watcher.lastEventAt=new Date().toISOString();const dirtyState=deriveRoundTripDirtyState(rt.sourceDirtyFiles,rt.designDirty);return {changedFiles:changed,dirtyState,autoRefresh:shouldAutoRefreshRoundTrip(rt.syncMode,dirtyState,changed)?changed:[]};
}
export function clearRoundTripSourceDirty(project,files=[]){const rt=ensureRoundTripProject(project),clear=new Set((files||[]).map(normalizeSourcePath));rt.sourceDirtyFiles=clear.size?rt.sourceDirtyFiles.filter(x=>!clear.has(x)):[];return deriveRoundTripDirtyState(rt.sourceDirtyFiles,rt.designDirty);}
export function setRoundTripDesignDirty(project,dirty=true){const rt=ensureRoundTripProject(project);rt.designDirty=Boolean(dirty);return deriveRoundTripDirtyState(rt.sourceDirtyFiles,rt.designDirty);}
function projectNode(project,id){let found=null;const visit=n=>{if(!n||found)return;if(n.id===id){found=n;return}for(const c of n.children||[])visit(c)};for(const p of project.pages||[])visit(p.root);for(const c of project.components||[])visit(c.root);return found;}
export function reconcileDesignFromAst(project,{relativePath='',inspection=null,source=''}={}){
  const rt=ensureRoundTripProject(project),path=normalizeSourcePath(relativePath),nodes=inspection?.nodes||[],updated=[];rt.astIndex[path]={...structured(inspection||{}),sourceFingerprint:sourceFingerprint(source),updatedAt:new Date().toISOString()};
  for(const mapping of rt.mappings.filter(m=>m.relativeFilePath===path)){
    const visual=projectNode(project,mapping.nodeId);if(!visual)continue;const src=nodes.find(n=>(mapping.nodePath&&n.dataUiId===mapping.nodePath)||(mapping.symbolPath&&n.symbolPath===mapping.symbolPath)||(mapping.selectorPath&&n.selectorPath===mapping.selectorPath));if(!src)continue;
    if(src.text!=null&&visual.props&&Object.prototype.hasOwnProperty.call(visual.props,'text'))visual.props.text=src.text;
    if(src.style&&typeof src.style==='object'){visual.style??={};visual.style.base??={};Object.assign(visual.style.base,src.style);}
    if(src.attributes&&visual.props){for(const [k,v] of Object.entries(src.attributes)){if(k in visual.props&&typeof v!=='object')visual.props[k]=v;}}
    mapping.confidence=Math.max(Number(mapping.confidence||0),Number(src.confidence||.9));mapping.sourceFingerprint=sourceFingerprint(source);mapping.updatedAt=new Date().toISOString();updated.push(mapping.nodeId);
  }
  if(updated.length){clearRoundTripSourceDirty(project,[path]);recordRoundTripAudit(project,'source-to-design',{relativePath:path,nodeIds:updated,parser:inspection?.parser||'portable'});}return {updatedNodeIds:updated,inspection:rt.astIndex[path]};
}
export function changesFromDesignAgainstInspection(project,nodeId,inspection){const rt=ensureRoundTripProject(project),mapping=rt.mappings.find(m=>m.nodeId===nodeId),visual=projectNode(project,nodeId);if(!mapping||!visual)return [];const src=(inspection?.nodes||[]).find(n=>(mapping.nodePath&&n.dataUiId===mapping.nodePath)||(mapping.symbolPath&&n.symbolPath===mapping.symbolPath)||(mapping.selectorPath&&n.selectorPath===mapping.selectorPath));if(!src)return [];const changes=[];if(visual.props?.text!=null&&src.text!=null&&String(visual.props.text)!==String(src.text))changes.push({id:`text:${nodeId}`,domain:'text',property:'text',previousValue:src.text,value:visual.props.text});for(const [k,v] of Object.entries(visual.style?.base||{})){const old=src.style?.[k];if(v!=null&&String(v)!==String(old??''))changes.push({id:`style:${k}`,domain:'style',property:k,previousValue:old??null,value:v});}return changes;}

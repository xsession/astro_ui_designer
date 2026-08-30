import { COMPONENTS } from './registry.js';
import { allNodes } from './model.js';
import { getDesignerPlugins } from './plugin-api.js';
import { ensureAnimation, resolveAnimationEngine, generateAnimationCss, animationRuntimePayload } from './animation.js';
import { ensureStorybookProject, exportPortableStoryManifest, exportComponentManifest, generateAutodocs } from './storybook-cleanroom.js';
import { ensureCompositionModel, effectiveCompositionStyle, generateQueryModule, exportCompositionManifest } from './plasmic-cleanroom.js';

const esc = (v='') => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escAttr = (v='') => esc(v).replace(/"/g,'&quot;');
const slug = (v) => String(v||'node').replace(/[^A-Za-z0-9_-]/g,'-');
const symbol = (v) => { const s=String(v||'Component').replace(/[^A-Za-z0-9_$]/g,'_'); return /^[A-Za-z_$]/.test(s)?s:`_${s}`; };
const kebab = (v) => v.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`);
const boolAttr = (name,v) => v ? name : '';

function decodeBase64(data='') { const bin=atob(data); const out=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i); return out; }
function binding(node,key){ return String(node.bindings?.[key]||'').trim(); }
function stateInitial(ctx,name){ const v=ctx?.project?.variables?.find(x=>x.name===name); return v ? v.initial : ''; }
function exprOrAttr(node,key,value,ctx){ const b=binding(node,key); if(!b) return `"${escAttr(value ?? '')}"`; const m=b.match(/^state\.([A-Za-z_$][\w$]*)$/); if(m) return JSON.stringify(stateInitial(ctx,m[1])); return `{${b}}`; }
function actionAttr(node){ if(!node.actions?.length) return ''; const json=JSON.stringify(node.actions.map(({id,...a})=>a)); return `data-ui-actions="${escAttr(json)}"`; }
function prototypeAttr(node,ctx){ const items=node.design?.interactions||[]; if(!items.length)return ''; const normalized=items.map(({id,...i})=>{const x={...i};if(i.destination){const page=ctx?.project?.pages?.find(p=>p.id===i.destination);if(page)x.url=page.route||'/';}return x});return `data-ui-prototype="${escAttr(JSON.stringify(normalized))}"`; }

function commonAttrs(node, extra=[], ctx=null) {
  const classes=[`ui-${slug(node.id)}`,node.meta?.className||''].filter(Boolean).join(' '); const attrs=[`class="${escAttr(classes)}"`,`data-ui-id="${escAttr(node.id)}"`]; if(node.meta?.domId) attrs.push(`id="${escAttr(node.meta.domId)}"`);
  if(node.meta?.slot) attrs.push(`slot="${escAttr(node.meta.slot)}"`);
  if(node.meta?.role) attrs.push(`role="${escAttr(node.meta.role)}"`);
  if(node.meta?.ariaLabel) attrs.push(`aria-label="${escAttr(node.meta.ariaLabel)}"`);
  if(node.meta?.title) attrs.push(`title="${escAttr(node.meta.title)}"`);
  if(node.meta?.tabIndex!==''&&node.meta?.tabIndex!=null) attrs.push(`tabindex="${escAttr(node.meta.tabIndex)}"`);
  if(node.meta?.hidden) attrs.push('hidden');
  if(node.variant) attrs.push(`data-ui-variant="${escAttr(node.variant)}"`);
  if(node.componentState) attrs.push(`data-ui-state="${escAttr(node.componentState)}"`);
  if(node.visibilityCondition) attrs.push(`data-ui-visible-if="${escAttr(node.visibilityCondition)}"`);
  if(Object.keys(node.composition?.queryBindings||{}).length) attrs.push(`data-ui-query-bindings="${escAttr(JSON.stringify(node.composition.queryBindings))}"`);
  if(Object.keys(node.composition?.contextBindings||{}).length) attrs.push(`data-ui-context-bindings="${escAttr(JSON.stringify(node.composition.contextBindings))}"`);
  if(node.timeline?.tracks?.length){const a=ensureAnimation(node);attrs.push(`data-ui-timeline="ui-animation-${slug(node.id)}"`,`data-ui-timeline-duration="${Number(a.duration)||500}"`,`data-ui-animation-engine="${resolveAnimationEngine(a)}"`,`data-ui-animation-trigger="${escAttr(a.trigger||'manual')}"`);if(resolveAnimationEngine(a)==='waapi'||['manual','click','inView'].includes(a.trigger))attrs.push(`data-ui-animation-id="${escAttr(node.id)}"`);}
  const aa=actionAttr(node); if(aa) attrs.push(aa); const pa=prototypeAttr(node,ctx); if(pa) attrs.push(pa); if(node.design?.fixedOnScroll) attrs.push('data-ui-fixed-scroll'); if(node.design?.clipContent) attrs.push('data-ui-clip-content');
  for(const key of ['text','value','checked','disabled','src','href']){const m=binding(node,key).match(/^state\.([A-Za-z_$][\w$]*)$/);if(m)attrs.push(`data-ui-bind-${key}=\"${escAttr(m[1])}\"`);}
  for(const a of extra) if(a) attrs.push(a);
  return attrs.join(' ');
}

function renderPropsObject(json) { try { const o=JSON.parse(json||'{}'); return Object.entries(o).map(([k,v])=>`${k}={${JSON.stringify(v)}}`).join(' '); } catch { return ''; } }

function renderNode(node, ctx, depth=2) {
  const spec=COMPONENTS[node.type]; if(!spec) return '';
  const indent='  '.repeat(depth); const p=node.props||{};
  if(node.type==='componentInstance'){
    const def=ctx.project.components.find(c=>c.id===p.definitionId); if(!def) return `${indent}<!-- Missing component ${escAttr(p.definitionId)} -->`;
    const sym=ctx.componentSymbols.get(def.id); const attrs=commonAttrs(node,[],ctx);
    const propAttrs=(def.props||[]).filter(cp=>Object.prototype.hasOwnProperty.call(p.propValues||{},cp.name)).map(cp=>{let v=p.propValues[cp.name]; if(cp.type==='number')v=Number(v); else if(cp.type==='boolean')v=(v===true||v==='true'); return `${cp.name}={${JSON.stringify(v)}}`;}).join(' ');
    const children=(node.children||[]).map(c=>renderNode(c,ctx,depth+1)).join('\n');
    return children ? `${indent}<div ${attrs}>\n${indent}  <${sym}${propAttrs?` ${propAttrs}`:''}>\n${children}\n${indent}  </${sym}>\n${indent}</div>` : `${indent}<div ${attrs}><${sym}${propAttrs?` ${propAttrs}`:''} /></div>`;
  }
  if(node.type==='externalComponent'){
    const desc=ctx.project.workspace?.externalComponents?.find(x=>x.id===p.descriptorId)||{};
    const sym=symbol(p.symbol||desc.symbol||desc.name||'ExternalComponent'); const importPath=p.importPath||desc.importPath||''; if(importPath)ctx.externals.set(`${sym}|${importPath}`,{sym,path:importPath});
    let client=''; const framework=p.framework||desc.framework||'astro'; if(framework!=='astro'){if(p.client==='media')client=` client:media="${escAttr(p.media||'(max-width: 50em)')}"`;else if(p.client==='only')client=` client:only="${escAttr(framework)}"`;else if(p.client&&p.client!=='none')client=` client:${p.client}`;}
    const props=renderPropsObject(p.propsJson); const children=(node.children||[]).map(c=>renderNode(c,ctx,depth+1)).join('\n');
    return children?`${indent}<${sym}${client}${props?` ${props}`:''}>\n${children}\n${indent}</${sym}>`:`${indent}<${sym}${client}${props?` ${props}`:''} />`;
  }
  if(node.type==='repeater'){
    const name=String(p.source||'').trim(); if(!name){const children=(node.children||[]).map(c=>renderNode(c,ctx,depth+1)).join('\n');return `${indent}<div ${commonAttrs(node,[],ctx)}>${children?`\n${children}\n${indent}`:''}</div>`;}
    const variable=`__collection_${slug(name).replace(/-/g,'_')}`; ctx.collections.set(name,variable); const alias=String(p.itemAlias||'item').replace(/[^A-Za-z0-9_$]/g,'_')||'item';
    let expr=variable; if(p.filter)expr+=`.filter((${alias}) => (${p.filter}))`; if(p.sort)expr+=`.toSorted((a,b)=>String(a.data?.[${JSON.stringify(p.sort)}]??'').localeCompare(String(b.data?.[${JSON.stringify(p.sort)}]??'')))`; if(Number(p.limit)>0)expr+=`.slice(0,${Number(p.limit)})`;
    const body=(node.children||[]).map(c=>renderNode(c,ctx,depth+2)).join('\n'); return `${indent}<div ${commonAttrs(node,[],ctx)}>\n${indent}  {${expr}.map((${alias}) => (\n${indent}    <div data-ui-repeat-item>\n${body}\n${indent}    </div>\n${indent}  ))}\n${indent}</div>`;
  }
  if(node.type==='island'){
    const sym=symbol(p.symbol||'InteractiveWidget'); ctx.islands.set(`${sym}|${p.importPath}`,{sym,path:p.importPath}); let client=''; if(p.client==='media') client=` client:media=\"${escAttr(p.media||'(max-width: 50em)')}\"`; else if(p.client==='only') client=` client:only=\"${escAttr(p.framework||'react')}\"`; else if(p.client && p.client!=='none') client=` client:${p.client}`; const props=renderPropsObject(p.propsJson); return `${indent}<${sym}${client}${props?` ${props}`:''} />`;
  }
  if(node.type==='slot'){
    const name=p.name?` name="${escAttr(p.name)}"`:''; const fallback=(node.children||[]).map(c=>renderNode(c,ctx,depth+1)).join('\n'); return fallback ? `${indent}<slot${name}>\n${fallback}\n${indent}</slot>` : `${indent}<slot${name} />`;
  }
  if(node.type==='svgPath'){
    const attrs=commonAttrs(node,[],ctx); const d=escAttr(p.path||node.design?.vector?.path||'');
    return `${indent}<svg ${attrs} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" /></svg>`;
  }
  if(node.type==='rawSvg'){
    const attrs=commonAttrs(node,[],ctx); const markup=String(p.markup||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi,'');
    return `${indent}<div ${attrs} set:html={${JSON.stringify(markup)}}></div>`;
  }
  let tag=node.type==='heading'?`h${Math.min(6,Math.max(1,Number(p.level)||2))}`:(spec.tag||'div');
  if(node.type==='list') tag=p.ordered?'ol':'ul';
  const extra=[];
  if(node.type==='section'&&p.ariaLabel) extra.push(`aria-label=${exprOrAttr(node,'ariaLabel',p.ariaLabel,ctx)}`);
  if(node.type==='nav'&&p.ariaLabel) extra.push(`aria-label="${escAttr(p.ariaLabel)}"`);
  if(node.type==='link'){ extra.push(`href=${exprOrAttr(node,'href',ctx.assetUrl(p.href||'#'),ctx)}`); if(p.target) extra.push(`target="${escAttr(p.target)}"`, p.target==='_blank'?'rel="noopener noreferrer"':''); }
  if(node.type==='image'){ const sb=binding(node,'src'); const sm=sb.match(/^state\.([A-Za-z_$][\w$]*)$/); const src=sb?(sm?`"${escAttr(ctx.assetUrl(String(stateInitial(ctx,sm[1])||'')))}"`:`{${sb}}`):`"${escAttr(ctx.assetUrl(p.src||''))}"`; extra.push(`src=${src}`,`alt=${exprOrAttr(node,'alt',p.alt||'',ctx)}`,`loading="${escAttr(p.loading||'lazy')}"`); }
  if(node.type==='video'){ extra.push(`src="${escAttr(ctx.assetUrl(p.src||''))}"`,p.poster?`poster="${escAttr(ctx.assetUrl(p.poster))}"`:'',boolAttr('controls',p.controls),boolAttr('autoplay',p.autoplay),boolAttr('muted',p.muted),boolAttr('loop',p.loop)); }
  if(node.type==='button'){const dm=binding(node,'disabled').match(/^state\.([A-Za-z_$][\w$]*)$/);extra.push(`type="${escAttr(p.buttonType||'button')}"`,boolAttr('disabled',dm?Boolean(stateInitial(ctx,dm[1])):p.disabled));}
  if(node.type==='label'&&p.htmlFor) extra.push(`for="${escAttr(p.htmlFor)}"`);
  if(node.type==='form') extra.push(`method="${escAttr(p.method||'post')}"`,p.action?`action="${escAttr(p.action)}"`:'',boolAttr('novalidate',p.noValidate));
  if(node.type==='input'){
    extra.push(`type="${escAttr(p.inputType||'text')}"`,`name="${escAttr(p.name||'')}"`,`placeholder="${escAttr(p.placeholder||'')}"`,p.value!==''||binding(node,'value')?`value=${exprOrAttr(node,'value',p.value,ctx)}`:'',boolAttr('required',p.required),boolAttr('disabled',p.disabled),p.min!==''?`min="${escAttr(p.min)}"`:'',p.max!==''?`max="${escAttr(p.max)}"`:'',p.minLength!==''?`minlength="${escAttr(p.minLength)}"`:'',p.maxLength!==''?`maxlength="${escAttr(p.maxLength)}"`:'',p.pattern?`pattern="${escAttr(p.pattern)}"`:'',p.autocomplete?`autocomplete="${escAttr(p.autocomplete)}"`:'');
  }
  if(node.type==='textarea') extra.push(`name="${escAttr(p.name||'')}"`,`placeholder="${escAttr(p.placeholder||'')}"`,`rows="${escAttr(p.rows||5)}"`,boolAttr('required',p.required),boolAttr('disabled',p.disabled),p.minLength!==''?`minlength="${escAttr(p.minLength)}"`:'',p.maxLength!==''?`maxlength="${escAttr(p.maxLength)}"`:'');
  if(node.type==='select') extra.push(`name="${escAttr(p.name||'')}"`,boolAttr('required',p.required),boolAttr('disabled',p.disabled));
  if(node.type==='checkbox'||node.type==='radio'){const cm=binding(node,'checked').match(/^state\.([A-Za-z_$][\w$]*)$/);extra.push(`type="${node.type}"`,`name="${escAttr(p.name||'')}"`,`value="${escAttr(p.value||'')}"`,boolAttr('checked',cm?Boolean(stateInitial(ctx,cm[1])):p.checked),boolAttr('required',p.required));}
  if(node.type==='icon'&&p.ariaLabel) extra.push(`aria-label="${escAttr(p.ariaLabel)}"`);
  const attrs=commonAttrs(node,extra,ctx);
  if(['image','input','divider'].includes(node.type)) return `${indent}<${tag} ${attrs} />`;
  if(node.type==='video') return `${indent}<video ${attrs}></video>`;
  if(node.type==='textarea') return `${indent}<textarea ${attrs}></textarea>`;
  if(node.type==='select'){
    const opts=String(p.options||'').split(/\r?\n/).filter(Boolean).map(line=>{const [label,value=label]=line.split('|');return `${indent}  <option value="${escAttr(value)}">${esc(label)}</option>`;}).join('\n');
    return `${indent}<select ${attrs}>\n${opts}\n${indent}</select>`;
  }
  if(node.type==='checkbox'||node.type==='radio') return `${indent}<label class="ui-control-wrap"><input ${attrs} /> <span>${esc(p.label||node.type)}</span></label>`;
  if(node.type==='fieldset'){
    const children=(node.children||[]).map(c=>renderNode(c,ctx,depth+1)).join('\n'); return `${indent}<fieldset ${attrs}>\n${indent}  <legend>${esc(p.legend||'')}</legend>${children?`\n${children}`:''}\n${indent}</fieldset>`;
  }
  if(node.type==='list'){
    const items=String(p.items||'').split(/\r?\n/).filter(Boolean).map(x=>`${indent}  <li>${esc(x)}</li>`).join('\n'); return `${indent}<${tag} ${attrs}>\n${items}\n${indent}</${tag}>`;
  }
  let inner='';
  if(['heading','text','badge','button','link','label','icon'].includes(node.type)) { const b=binding(node,'text'); const m=b.match(/^state\.([A-Za-z_$][\w$]*)$/); inner=b?(m?esc(stateInitial(ctx,m[1])):`{${b}}`):esc(p.text||''); }
  else if(node.children?.length) inner=`\n${node.children.map(c=>renderNode(c,ctx,depth+1)).join('\n')}\n${indent}`;
  return `${indent}<${tag} ${attrs}>${inner}</${tag}>`;
}

function cssBlock(node,bp='base',project=null) { let style={...(node.style?.[bp]||{})}; if(bp==='base'&&project)style=effectiveCompositionStyle(project,node,style); if(bp==='base'&&node.design?.fixedOnScroll){style.position='fixed'; if(style.top==null&&style.left==null)style.top='0px';} if(bp==='base'&&node.design?.clipContent)style.overflow='hidden'; const pairs=Object.entries(style).filter(([,v])=>v!==''&&v!=null); if(!pairs.length) return ''; return `.ui-${slug(node.id)} {\n${pairs.map(([k,v])=>`  ${kebab(k)}: ${v};`).join('\n')}\n}`; }
function cssForRoot(root,breakpoints,project){ const nodes=allNodes(root); let out=nodes.map(n=>cssBlock(n,'base',project)).filter(Boolean).join('\n\n'); for(const bp of breakpoints.filter(b=>b.id!=='base').sort((a,b)=>b.width-a.width)){ const css=nodes.map(n=>cssBlock(n,bp.id,project)).filter(Boolean).join('\n\n'); if(css) out+=`\n\n@media (max-width: ${bp.width}px) {\n${css.split('\n').map(l=>`  ${l}`).join('\n')}\n}`; }
  for(const n of nodes){for(const r of n.containerRules||[]){const pairs=Object.entries(r.style||{}).filter(([,v])=>v!==''&&v!=null);if(!pairs.length)continue;const cond=[];if(r.minWidth)cond.push(`(min-width: ${r.minWidth})`);if(r.maxWidth)cond.push(`(max-width: ${r.maxWidth})`);const name=r.containerName?`${r.containerName} / `:'';out+=`\n\n@container ${name}${cond.join(' and ')||'(min-width: 0px)'} {\n  .ui-${slug(n.id)} {\n${pairs.map(([k,v])=>`    ${kebab(k)}: ${v};`).join('\n')}\n  }\n}`;}
    if(n.states?.length)for(const st of n.states){const pairs=Object.entries(st.style||{}).filter(([,v])=>v!==''&&v!=null);if(pairs.length)out+=`\n\n.ui-${slug(n.id)}[data-ui-state="${escAttr(st.name)}"] {\n${pairs.map(([k,v])=>`  ${kebab(k)}: ${v};`).join('\n')}\n}`;}
    if(n.timeline?.tracks?.length&&resolveAnimationEngine(ensureAnimation(n))==='css'){const animationCss=generateAnimationCss(n,`.ui-${slug(n.id)}`);if(animationCss)out+=`\n\n${animationCss}`;}
  } return out; }
function hasActions(root){ return allNodes(root).some(n=>n.actions?.length || n.design?.interactions?.length || n.visibilityCondition || n.timeline?.tracks?.length || Object.keys(n.bindings||{}).some(k=>String(n.bindings[k]).includes('state.'))); }
function pageNeedsRuntime(root,project,seen=new Set()){ if(hasActions(root)) return true; for(const n of allNodes(root)){ if(n.type!=='componentInstance') continue; const id=n.props?.definitionId; if(!id||seen.has(id)) continue; seen.add(id); const d=project.components.find(c=>c.id===id); if(d && pageNeedsRuntime(d.root,project,seen)) return true; } return false; }

function importsForRoot(root,project){ const componentSymbols=new Map(); const islands=new Map(); const externals=new Map(); const collections=new Map(); for(const n of allNodes(root)){ if(n.type==='componentInstance'){ const d=project.components.find(c=>c.id===n.props.definitionId); if(d) componentSymbols.set(d.id,symbol(d.name)); } if(n.type==='island') islands.set(`${symbol(n.props.symbol)}|${n.props.importPath}`,{sym:symbol(n.props.symbol),path:n.props.importPath}); if(n.type==='externalComponent'&&n.props?.importPath) externals.set(`${symbol(n.props.symbol)}|${n.props.importPath}`,{sym:symbol(n.props.symbol),path:n.props.importPath}); if(n.type==='repeater'&&n.props?.source) collections.set(n.props.source,`__collection_${slug(n.props.source).replace(/-/g,'_')}`); } return {componentSymbols,islands,externals,collections}; }
function importLines(imports,project,basePath='../components/'){
  const lines=[]; for(const [id,sym] of imports.componentSymbols){ const d=project.components.find(c=>c.id===id); if(d) lines.push(`import ${sym} from '${basePath}${d.filename||`${sym}.astro`}';`); }
  for(const item of imports.islands.values()) lines.push(`import ${item.sym} from '${item.path}';`); for(const item of imports.externals?.values?.()||[]) lines.push(`import ${item.sym} from '${item.path}';`); if(imports.collections?.size){lines.push(`import { getCollection } from 'astro:content';`);for(const [name,v] of imports.collections)lines.push(`const ${v} = await getCollection(${JSON.stringify(name)});`);} return lines;
}

function renderPage(page,project){
  const imports=importsForRoot(page.root,project);
  const ctx={project,componentSymbols:imports.componentSymbols,islands:imports.islands,externals:imports.externals,collections:imports.collections,assetUrl:(src)=>assetUrl(project,src)};
  const children=(page.root.children||[]).map(c=>renderNode(c,ctx,2)).join('\n');
  const title=page.seo?.title||page.root.props?.title||page.name;
  const desc=page.seo?.description||page.root.props?.description||'';
  const levels=(String(page.filename||'index.astro').match(/\//g)||[]).length+1;
  const up='../'.repeat(levels);
  const front=[`import BaseLayout from '${up}layouts/BaseLayout.astro';`,`import '${up}styles/global.css';`,...importLines(imports,project,`${up}components/`)].join('\n');
  const script=pageNeedsRuntime(page.root,project)?`\n  <script>import '${up}scripts/ui-runtime.ts';</script>`:'';
  return `---\n${front}\n---\n\n<BaseLayout title=${JSON.stringify(title)} description=${JSON.stringify(desc)} canonical=${JSON.stringify(page.seo?.canonical||'')} ogImage=${JSON.stringify(assetUrl(project,page.seo?.ogImage||''))}>\n  <main class="ui-${slug(page.root.id)}" data-ui-id="${escAttr(page.root.id)}">\n${children}\n  </main>${script}\n</BaseLayout>\n`;
}

function renderComponent(def,project){
  const imports=importsForRoot(def.root,project); imports.componentSymbols.delete(def.id);
  const ctx={project,componentSymbols:imports.componentSymbols,islands:imports.islands,externals:imports.externals,collections:imports.collections,assetUrl:(src)=>assetUrl(project,src)};
  const content=renderNode(def.root,ctx,0); const lines=importLines(imports,project,'./');
  const typeMap={string:'string',number:'number',boolean:'boolean',any:'any'};
  const props=def.props||[]; const variants=def.variants||[];
  if(props.length||variants.length){
    lines.push(`interface Props { ${[...props.map(p=>`${p.name}?: ${typeMap[p.type]||'string'}`),...(variants.length?[`variant?: ${variants.map(v=>JSON.stringify(v.name)).join(' | ')}`]:[])].join('; ')} }`);
    const defaults=Object.fromEntries(props.map(p=>{let v=p.default??'';if(p.type==='number')v=Number(v)||0;else if(p.type==='boolean')v=(v===true||v==='true');return [p.name,v]})); if(variants.length)defaults.variant=variants[0].name;
    lines.push(`const props = { ...${JSON.stringify(defaults)}, ...Astro.props } as Required<Props>;`);
  } else lines.push(`const props = Astro.props as Record<string, unknown>;`);
  let rendered=content; if(variants.length)rendered=rendered.replace(/data-ui-id="([^"]+)"/,`data-ui-id="$1" data-variant={props.variant}`); const front=`---\n${lines.join('\n')}\n---\n\n`; return `${front}${rendered}\n`;
}
function themeCss(project){ const themes=project.theme?.themes||{}; const active=project.theme?.active||Object.keys(themes)[0]; const t=themes[active]?.tokens||{}; const vars=Object.entries(t).map(([k,v])=>`  --${k}: ${v};`).join('\n'); return `:root {\n${vars}\n  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n}\n\n* { box-sizing: border-box; }\nhtml { scroll-behavior: smooth; }\nbody { margin: 0; min-width: 320px; background: var(--color-bg); color: var(--color-text); }\nbutton,input,textarea,select { font: inherit; }\nimg,video { max-width: 100%; }\n.ui-control-wrap { display: inline-flex; gap: 8px; align-items: center; }\n`;
}
function assetUrl(project,src){ if(!String(src).startsWith('asset:')) return src; const id=String(src).slice(6); const a=project.assets?.find(x=>x.id===id); return a?`/assets/${a.filename}`:''; }
function runtimeSource(project){ const initial={}; for(const v of project.variables||[]) initial[v.name]=v.initial; return `import { uiAnimationDefinitions } from './ui-animation-definitions';\n\ntype UIAction={event?:string;type?:string;target?:string;value?:string;condition?:string};
type UIAnimationPayload={engine?:'css'|'waapi';trigger?:string;keyframes?:Keyframe[];options?:Record<string,any>;playbackRate?:number;reducedMotion?:'disable'|'shorten'|'allow';scroll?:Record<string,string>};
const state:Record<string,any>=${JSON.stringify(initial,null,2)};
const animationStore=new WeakMap<HTMLElement,Animation>();
function target(id?:string){return id?document.querySelector<HTMLElement>(\`[data-ui-id="\${CSS.escape(id)}"]\`):null;}
function interpolate(v=''){return v.replace(/\\{\\{state\\.([A-Za-z_$][\\w$]*)\\}\\}/g,(_,k)=>String(state[k]??''));}
function conditionOk(c=''){if(!c)return true;const m=c.match(/^state\\.([A-Za-z_$][\\w$]*)\\s*(===|==|!==|!=)?\\s*(.*)$/);if(!m)return true;const val=state[m[1]];if(!m[2])return Boolean(val);let rhs=m[3].trim().replace(/^['"]|['"]$/g,'');return (m[2]==='!='||m[2]==='!==')?String(val)!==rhs:String(val)===rhs;}
function refreshVisibility(){document.querySelectorAll<HTMLElement>('[data-ui-visible-if]').forEach(el=>{const c=el.dataset.uiVisibleIf||'';el.hidden=!conditionOk(c);});}
function refreshBindings(){document.querySelectorAll<HTMLElement>('[data-ui-bind-text]').forEach(el=>{const k=el.dataset.uiBindText||'';el.textContent=String(state[k]??'');});document.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-ui-bind-value]').forEach(el=>{const k=el.dataset.uiBindValue||'';el.value=String(state[k]??'');});document.querySelectorAll<HTMLInputElement>('[data-ui-bind-checked]').forEach(el=>{const k=el.dataset.uiBindChecked||'';el.checked=Boolean(state[k]);});document.querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-ui-bind-disabled]').forEach(el=>{const k=el.dataset.uiBindDisabled||'';el.disabled=Boolean(state[k]);});document.querySelectorAll<HTMLImageElement>('[data-ui-bind-src]').forEach(el=>{const k=el.dataset.uiBindSrc||'';el.src=String(state[k]??'');});document.querySelectorAll<HTMLAnchorElement>('[data-ui-bind-href]').forEach(el=>{const k=el.dataset.uiBindHref||'';el.href=String(state[k]??'');});refreshVisibility();}
function animationPayload(el:HTMLElement):UIAnimationPayload|null{const id=el.dataset.uiAnimationId||'';return (uiAnimationDefinitions as Record<string,UIAnimationPayload>)[id]||null}
function makeWaapi(el:HTMLElement,restart=true){const p=animationPayload(el);if(!p?.keyframes?.length)return null;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce&&p.reducedMotion==='disable')return null;let a=animationStore.get(el);if(a&&restart)a.cancel();if(!a||restart){const opts={...(p.options||{})};if(opts.iterations==='Infinity')opts.iterations=Infinity;if(reduce&&p.reducedMotion==='shorten'){opts.duration=Math.min(Number(opts.duration)||500,80);opts.iterations=1;}a=el.animate(p.keyframes,opts);a.playbackRate=Number(p.playbackRate)||1;animationStore.set(el,a);}return a;}
function controlAnimation(el:HTMLElement|null,command:string,value=''){if(!el)return;const p=animationPayload(el);const css=p?.engine==='css'||el.dataset.uiAnimationEngine==='css';if(css){if(command==='play'){el.classList.remove('ui-animation-running');void el.offsetWidth;el.classList.add('ui-animation-running');el.style.animationPlayState='running';}else if(command==='pause')el.style.animationPlayState='paused';else if(command==='stop'){el.classList.remove('ui-animation-running');el.style.animation='';}else if(command==='reverse'){el.style.animationDirection=el.style.animationDirection==='reverse'?'normal':'reverse';el.classList.add('ui-animation-running');}return;}let a=animationStore.get(el);if(command==='play'){a=makeWaapi(el,true);a?.play();}else if(command==='pause'){a??=makeWaapi(el,false);a?.pause();}else if(command==='stop'){a?.cancel();animationStore.delete(el);}else if(command==='reverse'){a??=makeWaapi(el,false);a?.reverse();}else if(command==='seek'){a??=makeWaapi(el,false);if(a){a.pause();const d=Number(p?.options?.duration)||500;a.currentTime=Math.max(0,Math.min(100,Number(value)||0))/100*d;}}}
function setupAnimations(){document.querySelectorAll<HTMLElement>('[data-ui-animation-id]').forEach(el=>{const p=animationPayload(el);if(!p)return;const play=()=>controlAnimation(el,'play');if(p.trigger==='load')play();else if(p.trigger==='hover'){el.addEventListener('pointerenter',play);el.addEventListener('pointerleave',()=>controlAnimation(el,'stop'));}else if(p.trigger==='focus'){el.addEventListener('focusin',play);el.addEventListener('focusout',()=>controlAnimation(el,'stop'));}else if(p.trigger==='click')el.addEventListener('click',play);else if(p.trigger==='inView'){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))play()},{threshold:.15});io.observe(el);}else if(p.trigger==='scroll'&&p.engine==='waapi'){let raf=0;const update=()=>{raf=0;let a=animationStore.get(el);if(!a){a=makeWaapi(el,false);a?.pause();}if(!a)return;const r=el.getBoundingClientRect(),span=innerHeight+r.height,progress=Math.max(0,Math.min(1,(innerHeight-r.top)/span));a.currentTime=progress*(Number(p.options?.duration)||1000);};addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});update();}});}
function prototypeTarget(id?:string){return id?target(id):null}
function generatedOverlay(url:string,opts:any={}){if(!url)return null;const existing=document.querySelector<HTMLElement>('[data-ui-generated-overlay="'+CSS.escape(url)+'"]');if(existing)return existing;const wrap=document.createElement('div');wrap.dataset.uiGeneratedOverlay=url;wrap.dataset.uiPrototypeOverlayOpen='true';Object.assign(wrap.style,{position:'fixed',inset:'0',zIndex:'9998',display:'grid',placeItems:'center',background:opts?.backdrop===false?'transparent':'rgba(0,0,0,.2)'});const frame=document.createElement('iframe');frame.src=url;frame.title='Prototype overlay';Object.assign(frame.style,{width:'min(92vw,1100px)',height:'min(88vh,780px)',border:'0',background:'#fff',boxShadow:'0 20px 70px rgba(0,0,0,.35)'});wrap.appendChild(frame);if(opts?.closeOutside!==false)wrap.addEventListener('pointerdown',e=>{if(e.target===wrap)wrap.remove()});document.body.appendChild(wrap);return wrap;}
function openOverlay(el:HTMLElement|null,opts:any={},url=''){if(!el){generatedOverlay(url,opts);return;}el.hidden=false;el.dataset.uiPrototypeOverlayOpen='true';el.style.position='fixed';el.style.zIndex='9999';if(opts?.position==='top-left'){el.style.left='24px';el.style.top='24px';}else{el.style.left='50%';el.style.top='50%';el.style.transform='translate(-50%,-50%)';}}
function closeOverlay(el:HTMLElement|null){if(!el)return;if(el.dataset.uiGeneratedOverlay){el.remove();return;}el.hidden=true;delete el.dataset.uiPrototypeOverlayOpen;}
function runPrototype(i:any,event:Event,source:HTMLElement){const t=prototypeTarget(i.destination);switch(i.action){case'navigate':event.preventDefault();location.href=i.url||'/';break;case'openOverlay':openOverlay(t,i.overlay,i.url);break;case'toggleOverlay':{const generated=i.url?document.querySelector<HTMLElement>('[data-ui-generated-overlay="'+CSS.escape(i.url)+'"]'):null;const targetEl=t||generated;if(targetEl)closeOverlay(targetEl);else openOverlay(null,i.overlay,i.url);break}case'closeOverlay':closeOverlay(t||source.closest<HTMLElement>('[data-ui-prototype-overlay-open]')||document.querySelector<HTMLElement>('[data-ui-generated-overlay]'));break;case'previous':history.back();break;case'openUrl':if(i.url)window.open(i.url,'_blank','noopener');break;}}
function setupPrototypeInteractions(){document.querySelectorAll<HTMLElement>('[data-ui-prototype]').forEach(el=>{let items:any[]=[];try{items=JSON.parse(el.dataset.uiPrototype||'[]')}catch{}for(const i of items){const fire=(e:Event)=>runPrototype(i,e,el);if(i.trigger==='click')el.addEventListener('click',fire);else if(i.trigger==='mouseenter')el.addEventListener('pointerenter',fire);else if(i.trigger==='mouseleave')el.addEventListener('pointerleave',fire);else if(i.trigger==='delay')setTimeout(()=>fire(new Event('ui-delay')),Math.max(0,Number(i.delay)||0));}})}
function run(a:UIAction,event:Event,source:HTMLElement){if(!conditionOk(a.condition||''))return;const t=target(a.target);const v=interpolate(a.value||'');switch(a.type){case'navigate':event.preventDefault();location.href=v||'/';break;case'openUrl':event.preventDefault();if(v)window.open(v,'_blank','noopener');break;case'previous':history.back();break;case'openOverlay':openOverlay(t);break;case'toggleOverlay':if(t)(t.hidden||!t.dataset.uiPrototypeOverlayOpen)?openOverlay(t):closeOverlay(t);break;case'closeOverlay':closeOverlay(t||source.closest<HTMLElement>('[data-ui-prototype-overlay-open]'));break;case'show':if(t)t.hidden=false;break;case'hide':if(t)t.hidden=true;break;case'toggleClass':if(t)t.classList.toggle(v||'active');break;case'scrollTo':t?.scrollIntoView({behavior:'smooth',block:'start'});break;case'setState':{const i=v.indexOf('=');if(i>0){const k=v.slice(0,i).trim();let x:any=v.slice(i+1).trim();if(x==='true'||x==='false')x=x==='true';else if(!Number.isNaN(Number(x))&&x!=='')x=Number(x);state[k]=x;refreshBindings();}break;}case'toggleState':state[v]=!state[v];refreshBindings();break;case'setText':if(t)t.textContent=v;break;case'emit':source.dispatchEvent(new CustomEvent(v,{bubbles:true,detail:{state}}));break;case'submit':source.closest('form')?.requestSubmit();break;case'setComponentState':if(t)t.dataset.uiState=v||'default';break;case'playAnimation':case'startTimeline':controlAnimation(t,'play');break;case'pauseAnimation':controlAnimation(t,'pause');break;case'stopAnimation':case'stopTimeline':controlAnimation(t,'stop');break;case'reverseAnimation':controlAnimation(t,'reverse');break;case'seekAnimation':controlAnimation(t,'seek',v);break;}}
function dispatch(event:Event){const el=(event.target as HTMLElement|null)?.closest<HTMLElement>('[data-ui-actions]');if(!el)return;let actions:UIAction[]=[];try{actions=JSON.parse(el.dataset.uiActions||'[]')}catch{}for(const a of actions){const expected=a.event==='focus'?'focusin':a.event==='blur'?'focusout':a.event;if(expected===event.type)run(a,event,el);}}
for(const n of ['click','input','change','submit','reset','focusin','focusout','play','pause','ended'])document.addEventListener(n,dispatch);refreshBindings();setupAnimations();setupPrototypeInteractions();
`;}


function animationDefinitionsSource(project){const defs={};for(const owner of [...(project.pages||[]),...(project.components||[])])for(const n of allNodes(owner.root))if(n.timeline?.tracks?.length&&(resolveAnimationEngine(ensureAnimation(n))==='waapi'||['manual','click','inView'].includes(n.timeline.trigger)))defs[n.id]=animationRuntimePayload(n);return `export const uiAnimationDefinitions = ${JSON.stringify(defs,null,2)} as const;\n`; }

function dtcgTokens(project){const tokens=project.theme?.themes?.[project.theme?.active]?.tokens||{};const out={$schema:'https://tr.designtokens.org/format/'};for(const [key,value] of Object.entries(tokens)){const parts=key.split('-');let at=out;for(let i=0;i<parts.length-1;i++)at=at[parts[i]]??={};let type=/^#|^rgb|^hsl/.test(String(value))?'color':/^-?[\d.]+(px|rem|em|%|vh|vw)$/.test(String(value))?'dimension':'string';let v=value;if(type==='dimension'){const m=String(value).match(/^(-?[\d.]+)([A-Za-z%]+)$/);if(m)v={value:Number(m[1]),unit:m[2]};}at[parts.at(-1)]={$type:type,$value:v};}return out;}
function zodType(f){let t=f.type==='number'?'z.number()':f.type==='boolean'?'z.boolean()':'z.string()';if(!f.required)t+='.optional()';return t;}
function contentConfig(project){const lines=[`import { defineCollection } from 'astro:content';`,`import { z } from 'astro/zod';`,`import { glob } from 'astro/loaders';`,''];for(const c of project.content.collections||[]){const n=symbol(c.name);lines.push(`const ${n}=defineCollection({ loader: glob({ pattern: ${JSON.stringify(c.pattern||'**/*.{md,mdx,json}')}, base: ${JSON.stringify(c.base||`./src/content/${c.name}`)} }), schema: z.object({ ${(c.schema||[]).map(f=>`${JSON.stringify(f.name)}: ${zodType(f)}`).join(', ')} }) });`);}lines.push(`export const collections={${(project.content.collections||[]).map(c=>symbol(c.name)).join(',')}};`);return lines.join('\n')+'\n';}
function liveContentConfig(project){const sources=(project.content.dataSources||[]).filter(d=>d.kind==='live-collection');return `// Generated live-collection stubs. Replace loader bodies with project-specific API code.\nimport { defineLiveCollection } from 'astro:content';\n${sources.map(d=>`const ${symbol(d.name)}=defineLiveCollection({loader:{name:${JSON.stringify(d.name)},loadCollection:async()=>({entries:[]}),loadEntry:async()=>undefined}});`).join('\n')}\nexport const collections={${sources.map(d=>symbol(d.name)).join(',')}};\n`;}

export function generateAstroProject(project){
  ensureStorybookProject(project); ensureCompositionModel(project);
  const files={}; const settings=project.settings||{}; const deps={astro:settings.astroVersion||'^7.2.0',...(settings.dependencies||{})};
  files['package.json']=JSON.stringify({name:project.name||'astro-ui-project',private:true,type:'module',version:'1.0.0',scripts:{dev:'astro dev',start:'astro dev',build:'astro build',preview:'astro preview'},dependencies:deps},null,2)+'\n';
  const config=[]; config.push(`import { defineConfig } from 'astro/config';`); for(const i of settings.integrations||[]) if(i.import&&i.symbol) config.push(`import ${i.symbol} from '${i.import}';`); const ints=(settings.integrations||[]).filter(i=>i.symbol).map(i=>`${i.symbol}(${i.options||''})`); config.push(`\nexport default defineConfig({${settings.site?`\n  site: ${JSON.stringify(settings.site)},`:''}${settings.base&&settings.base!=='/'?`\n  base: ${JSON.stringify(settings.base)},`:''}${settings.output?`\n  output: ${JSON.stringify(settings.output)},`:''}${ints.length?`\n  integrations: [${ints.join(', ')}],`:''}\n});\n`); files['astro.config.mjs']=config.join('\n');
  files['tsconfig.json']=JSON.stringify({extends:'astro/tsconfigs/strict'},null,2)+'\n';
  files['src/layouts/BaseLayout.astro']=`---\n${settings.viewTransitions?"import { ClientRouter } from 'astro:transitions';\n":''}interface Props{title:string;description?:string;canonical?:string;ogImage?:string;}\nconst{title,description='',canonical='',ogImage=''}=Astro.props;\n---\n<!doctype html>\n<html lang="${escAttr(settings.language||'en')}"${(project.composition?.globalVariants||[]).map(g=>` data-ui-global-${slug(g.name)}="${escAttr(project.composition.activeGlobalVariants?.[g.id]||g.options?.[0]?.value||'')}"`).join('')}>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width" />\n    <meta name="description" content={description} />\n    {canonical && <link rel="canonical" href={canonical} />}\n    {ogImage && <meta property="og:image" content={ogImage} />}\n    <title>{title}</title>${settings.viewTransitions?'\n    <ClientRouter />':''}\n  </head>\n  <body><slot /></body>\n</html>\n`;
  for(const c of project.components||[]) files[`src/components/${c.filename||`${symbol(c.name)}.astro`}`]=renderComponent(c,project);
  for(const p of project.pages||[]) files[`src/pages/${p.filename||'index.astro'}`]=renderPage(p,project);
  const bps=settings.breakpoints||[]; let css=themeCss(project); for(const c of project.components||[]) css+=`\n/* Component: ${c.name} */\n${cssForRoot(c.root,bps,project)}\n`; for(const p of project.pages||[]) css+=`\n/* Page: ${p.name} */\n${cssForRoot(p.root,bps,project)}\n`; files['src/styles/global.css']=css;
  if((project.pages||[]).some(p=>hasActions(p.root))||(project.components||[]).some(c=>hasActions(c.root))){ files['src/scripts/ui-animation-definitions.ts']=animationDefinitionsSource(project); files['src/scripts/ui-runtime.ts']=runtimeSource(project); }
  for(const a of project.assets||[]) if(a.base64) files[`public/assets/${a.filename}`]=decodeBase64(a.base64);
  // Research-derived interoperable project metadata.
  files['tokens/design-tokens.json']=JSON.stringify(dtcgTokens(project),null,2)+'\n';
  if(project.locales?.available?.length) files['src/i18n/ui-translations.json']=JSON.stringify(project.locales,null,2)+'\n';
  if(project.content?.collections?.length){ files['src/content.config.ts']=contentConfig(project); for(const c of project.content.collections){for(const e of c.entries||[]){files[`src/content/${slug(c.name)}/${slug(e.slug||e.id)}.json`]=JSON.stringify(e.values||{},null,2)+'\n';}} }
  if(project.content?.dataSources?.some(d=>d.kind==='live-collection')) files['src/live.config.ts']=liveContentConfig(project);
  files['tests/ui-designer.tests.json']=JSON.stringify({stories:(project.components||[]).flatMap(c=>(c.stories||[]).map(s=>({...s,componentId:c.id,componentName:c.name}))),tests:project.recordedTests||[],storyResults:project.storybook?.results||{}},null,2)+'\n';
  files['component-lab/portable-stories.json']=JSON.stringify(exportPortableStoryManifest(project),null,2)+'\n';
  files['component-lab/component-manifest.json']=JSON.stringify(exportComponentManifest(project),null,2)+'\n';
  files['component-lab/test-results.json']=JSON.stringify({results:project.storybook?.results||{},visualBaselines:project.storybook?.visualBaselines||{}},null,2)+'\n';
  files['src/data/ui-queries.ts']=generateQueryModule(project);
  files['src/composition/ui-composition.json']=JSON.stringify(exportCompositionManifest(project),null,2)+'\n';
  files['src/composition/ui-contexts.json']=JSON.stringify(project.composition?.globalContexts||[],null,2)+'\n';
  for(const c of project.components||[]) files[`component-lab/docs/${slug(c.name)}.md`]=generateAutodocs(c,project);
  // Preserve imported code-component snapshots so exported projects retain BYO component source.
  for(const snap of project.workspace?.files||[]){
    const rel=String(snap.filename||'').replace(/^\/+/, '');
    if(!rel.startsWith('src/')||!snap.source||files[rel]!=null)continue;
    if(snap.kind==='component'||/\.(tsx?|jsx?|vue|svelte|astro)$/i.test(rel))files[rel]=String(snap.source);
  }
  files['designer-source-map.json']=JSON.stringify({workspace:project.workspace||{},generatedAt:new Date().toISOString()},null,2)+'\n';
  files['designer-project.json']=JSON.stringify(project,null,2)+'\n';
  for(const plugin of getDesignerPlugins()) if(typeof plugin.transformAstroFiles==='function') plugin.transformAstroFiles(files,project);
  files['README.md']=`# ${project.name}\n\nGenerated by Astro UI Designer Pro.\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`;
  return files;
}
export function renderAstroCodePreview(project,file=null){ const files=generateAstroProject(project); if(file&&files[file]!=null) return typeof files[file]==='string'?files[file]:'[binary asset]'; const p=project.pages?.[0]?.filename||'index.astro'; return files[`src/pages/${p}`]||''; }

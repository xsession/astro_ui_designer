// Clean-room design-tool capabilities inspired only by public Penpot documentation.
import { makeId, allNodes, deepClone } from './model.js';

export const BLEND_MODES=['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
export const CONSTRAINTS=['left','right','left-right','center','scale'];
export const PROTOTYPE_TRIGGERS=['click','mouseenter','mouseleave','delay'];
export const PROTOTYPE_ACTIONS=['navigate','openOverlay','toggleOverlay','closeOverlay','previous','openUrl'];
export const EXPORT_FORMATS=['svg','png','jpeg','webp'];

export function ensureDesignProject(project){
  project.design ||= {};
  project.design.guides ||= [];
  project.design.comments ||= [];
  project.design.flows ||= [];
  project.design.libraries ||= [];
  project.design.review ||= {showResolved:false};
  project.design.inspect ||= {showMeasurements:true,showCode:true};
  project.design.interchange ||= {lastImport:null,lastExport:null};
  for(const owner of [...(project.pages||[]),...(project.components||[])]) for(const node of allNodes(owner.root)) ensureDesignNode(node);
  return project.design;
}

export function ensureDesignNode(node){
  node.design ||= {};
  node.design.constraints ||= {horizontal:'left',vertical:'top'};
  node.design.effects ||= {fills:[],strokes:[],shadows:[],blurs:[],blendMode:'normal'};
  node.design.exportPresets ||= [];
  node.design.interactions ||= [];
  node.design.fixedOnScroll ||= false;
  node.design.clipContent ||= false;
  node.design.aspectLocked ||= false;
  node.design.vector ||= {kind:'none',path:'',booleanOperation:'none'};
  node.design.libraryRef ||= '';
  return node.design;
}

export function addGuide(project,axis='x',position=100,name=''){ensureDesignProject(project);const g={id:makeId('guide'),axis:axis==='y'?'y':'x',position:Number(position)||0,name:name||`${axis.toUpperCase()} ${position}`};project.design.guides.push(g);return g}
export function removeGuide(project,id){ensureDesignProject(project);const i=project.design.guides.findIndex(x=>x.id===id);if(i>=0)project.design.guides.splice(i,1)}
export function addComment(project,nodeId,text,author='Reviewer'){ensureDesignProject(project);const c={id:makeId('comment'),nodeId,text:String(text||''),author,createdAt:new Date().toISOString(),resolved:false,replies:[]};project.design.comments.push(c);return c}
export function replyComment(project,id,text,author='Reviewer'){const c=(project.design?.comments||[]).find(x=>x.id===id);if(!c)return null;const r={id:makeId('reply'),text:String(text||''),author,createdAt:new Date().toISOString()};c.replies.push(r);return r}
export function toggleCommentResolved(project,id){const c=(project.design?.comments||[]).find(x=>x.id===id);if(c)c.resolved=!c.resolved;return c}
export function addFlow(project,name,startPageId){ensureDesignProject(project);const f={id:makeId('flow'),name:name||`Flow ${project.design.flows.length+1}`,startPageId:startPageId||project.pages?.[0]?.id||'',description:''};project.design.flows.push(f);return f}
export function addInteraction(node,patch={}){ensureDesignNode(node);const i={id:makeId('interaction'),trigger:'click',action:'navigate',destination:'',url:'',delay:300,overlay:{position:'center',closeOutside:true,backdrop:true,relativeTo:'trigger'},animation:'dissolve',...patch};node.design.interactions.push(i);return i}
export function addExportPreset(node,patch={}){ensureDesignNode(node);const p={id:makeId('export'),format:'svg',scale:1,suffix:'',...patch};node.design.exportPresets.push(p);return p}
export function addShadow(node,patch={}){ensureDesignNode(node);const s={id:makeId('shadow'),type:'drop',x:0,y:6,blur:18,spread:0,color:'#00000033',visible:true,...patch};node.design.effects.shadows.push(s);applyEffectsToStyle(node);return s}
export function addBlur(node,patch={}){ensureDesignNode(node);const b={id:makeId('blur'),type:'layer',value:8,visible:true,...patch};node.design.effects.blurs.push(b);applyEffectsToStyle(node);return b}
export function addStroke(node,patch={}){ensureDesignNode(node);const s={id:makeId('stroke'),color:'#64748b',width:1,style:'solid',dash:0,gap:0,visible:true,...patch};node.design.effects.strokes.push(s);applyEffectsToStyle(node);return s}
export function addFill(node,patch={}){ensureDesignNode(node);const f={id:makeId('fill'),type:'solid',color:'#ffffff',opacity:1,gradient:'',visible:true,...patch};node.design.effects.fills.push(f);applyEffectsToStyle(node);return f}

function shadowCss(s){if(!s.visible)return '';const inset=s.type==='inner'?'inset ':'';return `${inset}${Number(s.x)||0}px ${Number(s.y)||0}px ${Number(s.blur)||0}px ${Number(s.spread)||0}px ${s.color||'#0003'}`}
export function applyEffectsToStyle(node){const d=ensureDesignNode(node),base=node.style.base ||= {};const fills=d.effects.fills.filter(x=>x.visible);if(fills.length){const f=fills.at(-1);base.background=f.type==='gradient'&&f.gradient?f.gradient:f.color||base.background}
 const strokes=d.effects.strokes.filter(x=>x.visible);if(strokes.length){const s=strokes.at(-1);base.border=`${Number(s.width)||1}px ${s.style||'solid'} ${s.color||'#64748b'}`;if(s.style==='dashed'&&Number(s.dash)>0)base.borderStyle='dashed'}
 const shadows=d.effects.shadows.map(shadowCss).filter(Boolean);if(shadows.length)base.boxShadow=shadows.join(', ');else if(d.effects.shadows.length)delete base.boxShadow;
 const layer=d.effects.blurs.filter(x=>x.visible&&x.type==='layer');const back=d.effects.blurs.filter(x=>x.visible&&x.type==='background');if(layer.length)base.filter=`blur(${Math.max(...layer.map(x=>Number(x.value)||0))}px)`;else if(d.effects.blurs.length)delete base.filter;if(back.length)base.backdropFilter=`blur(${Math.max(...back.map(x=>Number(x.value)||0))}px)`;else if(d.effects.blurs.length)delete base.backdropFilter;base.mixBlendMode=d.effects.blendMode||'normal';return base}

export function inspectNode(node){ensureDesignNode(node);const style=node.style?.base||{};const css=Object.entries(style).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>`  ${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}: ${v};`).join('\n');const attrs=[node.meta?.domId?`id="${node.meta.domId}"`:'',node.meta?.className?`class="${node.meta.className}"`:''].filter(Boolean).join(' ');const tag=({heading:'h2',text:'p',button:'button',link:'a',image:'img'}[node.type]||'div');const content=node.props?.text||'';const html=tag==='img'?`<img ${attrs} />`:`<${tag}${attrs?' '+attrs:''}>${content}</${tag}>`;return {css:`.ui-${node.id.replace(/[^\w-]/g,'-')} {\n${css}\n}`,html,geometry:{width:style.width||'auto',height:style.height||'auto',x:style.left||'auto',y:style.top||'auto'},constraints:node.design.constraints,effects:node.design.effects}}

export function prototypeSummary(project){ensureDesignProject(project);let interactions=0;for(const owner of [...(project.pages||[]),...(project.components||[])])for(const n of allNodes(owner.root))interactions+=(n.design?.interactions||[]).length;return {flows:project.design.flows.length,comments:project.design.comments.length,guides:project.design.guides.length,interactions}}

export function publishLibrarySnapshot(project,name='Project Library'){
  ensureDesignProject(project);
  const lib={id:makeId('library'),name:String(name||'Project Library'),createdAt:new Date().toISOString(),components:deepClone(project.components||[]),theme:deepClone(project.theme||{}),tokenFormat:deepClone(project.tokenFormat||{})};
  project.design.libraries.push(lib);return lib;
}
export function applyLibrarySnapshot(project,id){
  ensureDesignProject(project);const lib=project.design.libraries.find(x=>x.id===id);if(!lib)return false;
  const byName=new Map((project.components||[]).map(x=>[x.name,x]));for(const c of lib.components||[]){const existing=byName.get(c.name);if(existing)Object.assign(existing,deepClone(c),{id:existing.id});else project.components.push(deepClone(c));}
  if(lib.theme)project.theme=deepClone(lib.theme);if(lib.tokenFormat)project.tokenFormat=deepClone(lib.tokenFormat);return true;
}
export function exportLibrarySnapshot(project,id){const lib=(project.design?.libraries||[]).find(x=>x.id===id);if(!lib)throw new Error('Library not found');return JSON.stringify({format:'astro-ui-library',version:1,library:lib},null,2)}
export function importLibrarySnapshot(project,data){ensureDesignProject(project);const v=typeof data==='string'?JSON.parse(data):data;if(v.format!=='astro-ui-library'||!v.library)throw new Error('Not an Astro UI library');const lib=deepClone(v.library);lib.id=makeId('library');lib.importedAt=new Date().toISOString();project.design.libraries.push(lib);return lib}

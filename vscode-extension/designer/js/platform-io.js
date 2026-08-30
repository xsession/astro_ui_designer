import { createProject, createNode, makeId, deepClone } from './model.js';
import { createZip } from './zip.js';
import { ensureDesignProject, ensureDesignNode, applyEffectsToStyle } from './penpot-cleanroom.js';

const dec=new TextDecoder();
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slug=v=>String(v||'page').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'page';
const uuid=()=>globalThis.crypto?.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)});
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;

async function unzipEntries(input){
  const data=input instanceof Uint8Array?input:new Uint8Array(input);
  const dv=new DataView(data.buffer,data.byteOffset,data.byteLength);
  let eocd=-1;
  for(let i=data.length-22;i>=Math.max(0,data.length-65557);i--)if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}
  if(eocd<0)throw new Error('ZIP end record not found');
  const count=dv.getUint16(eocd+10,true),central=dv.getUint32(eocd+16,true);let p=central;const out={};
  for(let n=0;n<count;n++){
    if(dv.getUint32(p,true)!==0x02014b50)throw new Error('Invalid ZIP central directory');
    const method=dv.getUint16(p+10,true),comp=dv.getUint32(p+20,true),nameLen=dv.getUint16(p+28,true),extraLen=dv.getUint16(p+30,true),commentLen=dv.getUint16(p+32,true),localOff=dv.getUint32(p+42,true);
    const name=dec.decode(data.slice(p+46,p+46+nameLen));
    const localNameLen=dv.getUint16(localOff+26,true),localExtra=dv.getUint16(localOff+28,true),start=localOff+30+localNameLen+localExtra;
    let body=data.slice(start,start+comp);
    if(method===8){
      if(typeof DecompressionStream==='undefined')throw new Error('Deflate ZIP import requires browser DecompressionStream support');
      const stream=new Blob([body]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      body=new Uint8Array(await new Response(stream).arrayBuffer());
    } else if(method!==0) throw new Error(`Unsupported ZIP compression method ${method}`);
    out[name]=body;p+=46+nameLen+extraLen+commentLen;
  }
  return out;
}

function rgbaFromFigma(color,opacity=1){if(!color)return '';return `rgba(${Math.round(num(color.r)*255)},${Math.round(num(color.g)*255)},${Math.round(num(color.b)*255)},${num(opacity,1)})`}
function extractPenpotText(content){let out='';const walk=x=>{if(x==null)return;if(typeof x==='string'){out+=x;return}if(Array.isArray(x)){x.forEach(walk);return}if(typeof x==='object'){if(typeof x.text==='string')out+=x.text;if(x.children)walk(x.children)}};walk(content);return out}
function normalizePenpotInteraction(x={}){return {id:x.id||makeId('interaction'),trigger:x.trigger||x.eventType||'click',action:x.action||x.actionType||'navigate',destination:x.destination||x.destinationId||'',url:x.url||'',delay:num(x.delay,300),overlay:deepClone(x.overlay||{position:'center',closeOutside:true,backdrop:true,relativeTo:'trigger'}),animation:x.animation||'dissolve'}}

function styleFromPenpot(s){
  const st={position:'absolute',left:`${num(s.x)}px`,top:`${num(s.y)}px`,width:`${num(s.width,240)}px`,height:`${num(s.height,80)}px`};
  const fill=(s.fills||[]).find(x=>x?.color||x?.fillColor);if(fill)st.background=fill.color||fill.fillColor;
  if(s.opacity!=null)st.opacity=String(s.opacity);
  if(s.blendMode||s['blend-mode'])st.mixBlendMode=s.blendMode||s['blend-mode'];
  const r=s.r1??s.rx;if(r!=null)st.borderRadius=[s.r1??r,s.r2??r,s.r3??r,s.r4??r].map(x=>`${num(x)}px`).join(' ');
  const stroke=(s.strokes||[])[0];if(stroke?.color||stroke?.strokeColor)st.border=`${num(stroke.width||stroke.strokeWidth,1)}px ${stroke.style==='dashed'?'dashed':'solid'} ${stroke.color||stroke.strokeColor}`;
  const shadows=s.shadow||s.shadows||[];if(shadows.length)st.boxShadow=shadows.map(x=>`${/inner/.test(x.style||x.type||'')?'inset ':''}${num(x.offsetX??x.x)}px ${num(x.offsetY??x.y)}px ${num(x.blur)}px ${num(x.spread)}px ${x.color||'#00000033'}`).join(', ');
  const blur=Array.isArray(s.blur)?s.blur[0]:s.blur;if(blur?.value){if(/background/.test(blur.type||''))st.backdropFilter=`blur(${num(blur.value)}px)`;else st.filter=`blur(${num(blur.value)}px)`}
  return st;
}
function populatePenpotEffects(node,s){
  const d=ensureDesignNode(node);d.effects.blendMode=s.blendMode||s['blend-mode']||'normal';
  d.effects.fills=(s.fills||[]).map(x=>({id:makeId('fill'),type:x.gradient?'gradient':'solid',color:x.color||x.fillColor||'#ffffff',opacity:num(x.opacity,1),gradient:x.gradient||'',visible:x.visible!==false}));
  d.effects.strokes=(s.strokes||[]).map(x=>({id:makeId('stroke'),color:x.color||x.strokeColor||'#64748b',width:num(x.width||x.strokeWidth,1),style:x.style==='dashed'?'dashed':'solid',dash:num(x.dash),gap:num(x.gap),visible:x.visible!==false}));
  d.effects.shadows=(s.shadow||s.shadows||[]).map(x=>({id:makeId('shadow'),type:/inner/.test(x.style||x.type||'')?'inner':'drop',x:num(x.offsetX??x.x),y:num(x.offsetY??x.y),blur:num(x.blur),spread:num(x.spread),color:x.color||'#00000033',visible:x.visible!==false}));
  const blurs=s.blur?(Array.isArray(s.blur)?s.blur:[s.blur]):[];d.effects.blurs=blurs.map(x=>({id:makeId('blur'),type:/background/.test(x.type||'')?'background':'layer',value:num(x.value),visible:x.visible!==false}));
  applyEffectsToStyle(node);
}
function nodeFromPenpot(s){
  const map={frame:'freeform',group:'group',rect:'shapeRect',circle:'shapeEllipse',ellipse:'shapeEllipse',path:'svgPath',text:'text',image:'image',bool:'svgPath','svg-raw':'rawSvg'};
  const type=map[s.type]||'group',p={};
  if(type==='text')p.text=extractPenpotText(s.content)||s.name||'Text';
  if(type==='svgPath')p.path=typeof s.content==='string'?s.content:(s.content?.d||s.pathData||'');
  if(type==='rawSvg')p.markup=typeof s.content==='string'?s.content:'';
  if(type==='image'&&s.metadata?.uri)p.src=s.metadata.uri;
  const n=createNode(type,{name:s.name||type,props:p,style:{base:styleFromPenpot(s)}});
  n.meta.locked=Boolean(s.blocked);n.meta.hidden=Boolean(s.hidden);ensureDesignNode(n);populatePenpotEffects(n,s);
  n.design.constraints={horizontal:s.constraintsH||s['constraints-h']||'left',vertical:s.constraintsV||s['constraints-v']||'top'};
  n.design.fixedOnScroll=Boolean(s.fixedScroll||s['fixed-scroll']);n.design.clipContent=s.showContent===false||s['show-content']===false;
  n.design.exportPresets=(s.exports||[]).map(x=>({id:makeId('export'),format:String(x.type||x.format||'svg').toLowerCase(),scale:num(x.scale,1),suffix:x.suffix||''}));
  n.design.interactions=(s.interactions||[]).map(normalizePenpotInteraction);
  n.design.vector={kind:type==='svgPath'?'path':type==='rawSvg'?'raw-svg':'none',path:p.path||'',booleanOperation:s.boolType||s['bool-type']||'none'};
  return n;
}

export async function importPenpotV3(input){
  const bytes=input instanceof Uint8Array?input:new Uint8Array(await input.arrayBuffer());const z=await unzipEntries(bytes);
  if(!z['manifest.json'])throw new Error('Penpot archive is missing manifest.json');
  const manifest=JSON.parse(dec.decode(z['manifest.json']));if(manifest.type!=='penpot/export-files')throw new Error('Not a Penpot v3 export-files archive');
  const first=manifest.files?.[0];if(!first)throw new Error('Penpot archive contains no files');
  const project=createProject();project.name=first.name||'penpot-import';project.pages=[];ensureDesignProject(project);
  const prefix=`files/${first.id}/pages/`;
  const pageMeta=Object.keys(z).filter(k=>k.startsWith(prefix)&&k.endsWith('.json')&&k.slice(prefix.length).split('/').length===1);
  for(const pk of pageMeta.sort()){
    const meta=JSON.parse(dec.decode(z[pk])),pageId=meta.id||pk.slice(prefix.length,-5),shapePrefix=`${prefix}${pageId}/`,shapes={};
    for(const sk of Object.keys(z).filter(k=>k.startsWith(shapePrefix)&&k.endsWith('.json'))){const s=JSON.parse(dec.decode(z[sk]));shapes[s.id]=s}
    const root=createNode('page',{name:meta.name||'Page',style:{base:{minHeight:'100vh',background:meta.background||'#ffffff'}}}),built={};
    for(const s of Object.values(shapes))built[s.id]=nodeFromPenpot(s);
    for(const s of Object.values(shapes)){const n=built[s.id],parent=built[s.parentId||s['parent-id']];if(parent)parent.children.push(n);else root.children.push(n)}
    const page={id:makeId('page-doc'),route:project.pages.length?`/${slug(meta.name||'page')}`:'/',filename:project.pages.length?`${slug(meta.name||'page')}/index.astro`:'index.astro',name:meta.name||'Page',seo:{title:meta.name||'Page',description:'Imported from Penpot',canonical:'',ogImage:''},root};project.pages.push(page);
    const guides=meta.guides||{};for(const [axis,list] of Object.entries(guides))for(const g of Array.isArray(list)?list:[])project.design.guides.push({id:makeId('guide'),axis:/vert|x/i.test(axis)?'x':'y',position:num(g.position??g),name:g.name||'Penpot guide'});
    for(const [id,f] of Object.entries(meta.flows||{}))project.design.flows.push({id,name:f.name||'Flow',startPageId:page.id,description:f.description||''});
  }
  if(!project.pages.length)project.pages=createProject().pages;
  const tokenKey=`files/${first.id}/tokens.json`;if(z[tokenKey])try{project.design.importedPenpotTokens=JSON.parse(dec.decode(z[tokenKey]))}catch{}
  project.design.interchange.lastImport={platform:'penpot',at:new Date().toISOString(),source:first.name,formatVersion:manifest.version};return project;
}

function penpotShape(node,parentId,frameId){
  const id=uuid(),st=node.style?.base||{},d=ensureDesignNode(node),typeMap={freeform:'frame',group:'group',shapeRect:'rect',shapeEllipse:'circle',svgPath:'path',rawSvg:'svg-raw',text:'text',heading:'text',image:'image'};
  const type=typeMap[node.type]||((node.children||[]).length?'group':'rect'),x=num(parseFloat(st.left)),y=num(parseFloat(st.top)),width=num(parseFloat(st.width),240),height=num(parseFloat(st.height),80);
  const s={id,name:node.name||node.type,type,x,y,width,height,selrect:{x,y,width,height},points:[{x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}],transform:[1,0,0,1,0,0],transformInverse:[1,0,0,1,0,0],parentId,frameId,opacity:st.opacity==null?1:num(st.opacity,1),blendMode:d.effects.blendMode||st.mixBlendMode||'normal',blocked:Boolean(node.meta?.locked),hidden:Boolean(node.meta?.hidden),constraintsH:d.constraints.horizontal,constraintsV:d.constraints.vertical,fixedScroll:Boolean(d.fixedOnScroll),showContent:!d.clipContent,interactions:deepClone(d.interactions||[]),exports:deepClone(d.exportPresets||[]),shapes:[]};
  const fills=d.effects.fills.filter(x=>x.visible);if(fills.length)s.fills=fills.map(x=>({color:x.color,opacity:x.opacity,gradient:x.gradient||undefined}));else if(st.background&&!String(st.background).includes('gradient'))s.fills=[{color:st.background,opacity:1}];
  const strokes=d.effects.strokes.filter(x=>x.visible);if(strokes.length)s.strokes=strokes.map(x=>({color:x.color,width:x.width,style:x.style,dash:x.dash,gap:x.gap}));
  if(st.borderRadius){const r=num(parseFloat(st.borderRadius));s.r1=s.r2=s.r3=s.r4=r}
  if(d.effects.shadows.length)s.shadow=d.effects.shadows.filter(x=>x.visible).map(x=>({style:x.type==='inner'?'inner-shadow':'drop-shadow',offsetX:x.x,offsetY:x.y,blur:x.blur,spread:x.spread,color:x.color}));
  const blur=d.effects.blurs.find(x=>x.visible);if(blur)s.blur={type:blur.type==='background'?'background-blur':'layer-blur',value:num(blur.value)};
  if(type==='text')s.content=node.props?.text||node.name;if(type==='path'||type==='svg-raw')s.content=node.props?.path||node.props?.markup||'';return s;
}
export function exportPenpotV3(project){
  ensureDesignProject(project);const fileId=uuid(),files={},features=['fdata/path-data','fdata/shape-data-type','design-tokens/v1','variants/v1','layout/grid','components/v2'];
  files['manifest.json']=JSON.stringify({version:1,type:'penpot/export-files',generatedBy:'astro-ui-designer/2.4.0',refer:'astro-ui-designer',files:[{id:fileId,name:project.name,features}],relations:[]},null,2);
  files[`files/${fileId}.json`]=JSON.stringify({id:fileId,name:project.name,revn:1,vern:0,createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString(),isShared:false,features,migrations:[],options:{componentsV2:true}},null,2);
  for(const [pageIndex,pg] of (project.pages||[]).entries()){
    const pageId=uuid(),meta={id:pageId,name:pg.name,index:pageIndex,options:{},background:pg.root?.style?.base?.background||'#ffffff',flows:{},guides:{vertical:project.design.guides.filter(g=>g.axis==='x').map(g=>({position:g.position,name:g.name})),horizontal:project.design.guides.filter(g=>g.axis==='y').map(g=>({position:g.position,name:g.name}))}};
    for(const f of project.design.flows.filter(x=>x.startPageId===pg.id))meta.flows[f.id]={name:f.name,description:f.description||''};files[`files/${fileId}/pages/${pageId}.json`]=JSON.stringify(meta,null,2);
    const add=(node,parentId='00000000-0000-0000-0000-000000000000',frameId='00000000-0000-0000-0000-000000000001')=>{const s=penpotShape(node,parentId,frameId);for(const c of node.children||[])s.shapes.push(add(c,s.id,s.type==='frame'?s.id:frameId));files[`files/${fileId}/pages/${pageId}/${s.id}.json`]=JSON.stringify(s,null,2);return s.id};
    for(const n of pg.root.children||[])add(n);
  }
  files[`files/${fileId}/tokens.json`]=JSON.stringify(project.design.importedPenpotTokens||project.theme||{},null,2);return createZip(files);
}

function nodeHtml(n){
  const st=n.style?.base||{},style=Object.entries(st).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>`${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}:${v}`).join(';'),attrs=`data-ui-id="${esc(n.id)}"${style?` style="${esc(style)}"`:''}`;
  if(n.type==='text'||n.type==='heading')return `<${n.type==='heading'?'h2':'p'} ${attrs}>${esc(n.props?.text||'')}</${n.type==='heading'?'h2':'p'}>`;
  if(n.type==='image')return `<img ${attrs} src="${esc(n.props?.src||'')}" alt="${esc(n.props?.alt||'')}" />`;
  if(n.type==='svgPath')return `<svg ${attrs} viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${esc(n.props?.path||'')}" /></svg>`;
  if(n.type==='rawSvg')return `<div ${attrs}>${String(n.props?.markup||'').replace(/<script[\s\S]*?<\/script>/gi,'')}</div>`;
  const children=(n.children||[]).map(nodeHtml).join('');return `<div ${attrs}>${children}</div>`;
}
function jsxNode(n,depth=2){const pad='  '.repeat(depth),st=n.style?.base||{},style=Object.keys(st).length?` style={${JSON.stringify(st)}}`:'';if(n.type==='text'||n.type==='heading')return `${pad}<${n.type==='heading'?'h2':'p'}${style}>${esc(n.props?.text||'')}</${n.type==='heading'?'h2':'p'}>`;if(n.type==='image')return `${pad}<img${style} src=${JSON.stringify(n.props?.src||'')} alt=${JSON.stringify(n.props?.alt||'')} />`;const c=(n.children||[]).map(x=>jsxNode(x,depth+1)).join('\n');return `${pad}<div${style}>${c?`\n${c}\n${pad}`:''}</div>`}

export function exportStaticHtml(project){const pages={};for(const p of project.pages||[])pages[p.filename?.replace(/\.astro$/,'.html')||'index.html']=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(p.seo?.title||p.name)}</title></head><body>${(p.root.children||[]).map(nodeHtml).join('')}</body></html>`;return pages}
export function exportReact(project){const p=project.pages?.[0];return `export default function App(){\n  return (\n    <main>\n${(p?.root.children||[]).map(n=>jsxNode(n,3)).join('\n')}\n    </main>\n  );\n}\n`}
export function exportVue(project){return `<template>\n${(project.pages?.[0]?.root.children||[]).map(nodeHtml).join('\n')}\n</template>\n\n<script setup lang="ts">\n</script>\n`}
export function exportSvelte(project){return `<script lang="ts">\n</script>\n\n${(project.pages?.[0]?.root.children||[]).map(nodeHtml).join('\n')}\n`}
export function exportSvg(project,width=1280,height=720){
  const p=project.pages?.[0];const render=n=>{const st=n.style?.base||{},x=num(parseFloat(st.left),20),y=num(parseFloat(st.top),20),w=num(parseFloat(st.width),240),h=num(parseFloat(st.height),70),fill=st.background&&!String(st.background).includes('gradient')?st.background:'#ffffff';if(n.type==='text'||n.type==='heading')return `<text x="${x}" y="${y+24}" font-size="${num(parseFloat(st.fontSize),16)}" fill="${st.color||'#111'}">${esc(n.props?.text||'')}</text>`;if(n.type==='shapeEllipse')return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}" />`;if(n.type==='svgPath')return `<path d="${esc(n.props?.path||'')}" transform="translate(${x} ${y})" fill="${fill}" />`;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${num(parseFloat(st.borderRadius))}" fill="${fill}" stroke="#64748b"/>`};return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${(p?.root.children||[]).map(render).join('\n')}</svg>`;
}
export function exportNeutralJson(project){return JSON.stringify({format:'astro-ui-interchange',version:2,project},null,2)}
export function exportFigmaJson(project){
  const figNode=n=>{const st=n.style?.base||{},types={freeform:'FRAME',group:'GROUP',shapeRect:'RECTANGLE',shapeEllipse:'ELLIPSE',text:'TEXT',heading:'TEXT',svgPath:'VECTOR',image:'RECTANGLE'},o={id:n.id,name:n.name||n.type,type:types[n.type]||'FRAME',absoluteBoundingBox:{x:num(parseFloat(st.left)),y:num(parseFloat(st.top)),width:num(parseFloat(st.width),240),height:num(parseFloat(st.height),80)},children:(n.children||[]).map(figNode)};if(n.type==='text'||n.type==='heading')o.characters=n.props?.text||'';if(st.background&&/^#/.test(st.background)){const h=st.background.slice(1),full=h.length===3?h.split('').map(x=>x+x).join(''):h.slice(0,6);o.fills=[{type:'SOLID',color:{r:parseInt(full.slice(0,2),16)/255,g:parseInt(full.slice(2,4),16)/255,b:parseInt(full.slice(4,6),16)/255},opacity:1}]}return o};
  return JSON.stringify({name:project.name,document:{id:'0:0',name:project.name,type:'DOCUMENT',children:(project.pages||[]).map((p,i)=>({id:`page:${i}`,name:p.name,type:'CANVAS',children:(p.root.children||[]).map(figNode)}))},schemaVersion:0,generator:'astro-ui-designer-figma-bridge'},null,2);
}

export function importFigmaJson(data){
  const src=typeof data==='string'?JSON.parse(data):data,project=createProject();project.name=src.name||'figma-import';project.pages=[];ensureDesignProject(project);
  for(const pg of (src.document?.children||[]).filter(x=>x.type==='CANVAS')){const root=createNode('page',{name:pg.name||'Page'});root.children=(pg.children||[]).map(figmaNode);project.pages.push({id:makeId('page-doc'),route:project.pages.length?`/${slug(pg.name)}`:'/',filename:project.pages.length?`${slug(pg.name)}/index.astro`:'index.astro',name:pg.name||'Page',seo:{title:pg.name||'Page',description:'Imported from Figma REST-style JSON',canonical:'',ogImage:''},root})}
  if(!project.pages.length)project.pages=createProject().pages;project.design.interchange.lastImport={platform:'figma-json',at:new Date().toISOString(),source:src.name||''};return project;
}
function figmaNode(x){
  const map={FRAME:'freeform',GROUP:'group',RECTANGLE:'shapeRect',ELLIPSE:'shapeEllipse',TEXT:'text',VECTOR:'svgPath',COMPONENT:'freeform',INSTANCE:'freeform'},type=map[x.type]||'group',bb=x.absoluteBoundingBox||{},st={position:'absolute',left:`${num(bb.x)}px`,top:`${num(bb.y)}px`,width:`${num(bb.width,200)}px`,height:`${num(bb.height,80)}px`};const fill=(x.fills||[]).find(v=>v.type==='SOLID'&&v.color);if(fill)st.background=rgbaFromFigma(fill.color,fill.opacity??1);const n=createNode(type,{name:x.name||type,props:type==='text'?{text:x.characters||x.name||'Text'}:{},style:{base:st}});ensureDesignNode(n);n.children=(x.children||[]).map(figmaNode);return n;
}

function attrsToMap(src=''){const out={};for(const m of src.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))out[m[1].toLowerCase()]=m[2]??m[3]??m[4]??'';return out}
function parseInlineStyle(src=''){const out={};for(const part of String(src).split(';')){const i=part.indexOf(':');if(i<0)continue;const k=part.slice(0,i).trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v=part.slice(i+1).trim();if(k&&v)out[k]=v}return out}
function basicMarkupTree(text){
  const root={tag:'root',attrs:{},children:[]};const stack=[root],re=/<\/?[A-Za-z][^>]*>|[^<]+/g;let m;
  while((m=re.exec(text))){const t=m[0];if(t.startsWith('</')){if(stack.length>1)stack.pop();continue}if(t.startsWith('<')){if(/^<!|^<\?/.test(t))continue;const mm=t.match(/^<([\w:-]+)([\s\S]*?)\/?\s*>$/);if(!mm)continue;const node={tag:mm[1].toLowerCase(),attrs:attrsToMap(mm[2]),children:[]};stack.at(-1).children.push(node);if(!/\/$/.test(t)&&!['img','input','br','hr','meta','link','source','path','rect','circle','ellipse','line','polyline','polygon'].includes(node.tag))stack.push(node)}else if(t.trim())stack.at(-1).children.push({tag:'#text',text:t,attrs:{},children:[]})
  }return root;
}
function htmlTreeNode(x){if(x.tag==='#text')return null;const text=(x.children||[]).filter(c=>c.tag==='#text').map(c=>c.text).join('').trim(),map={section:'section',nav:'nav',header:'header',footer:'footer',button:'button',a:'link',img:'image',input:'input',textarea:'textarea',select:'select',form:'form',label:'label',h1:'heading',h2:'heading',h3:'heading',h4:'heading',h5:'heading',h6:'heading',p:'text',span:'text'},type=map[x.tag]||'container',props={};if(/h[1-6]/.test(x.tag)){props.text=text;props.level=Number(x.tag.slice(1))}else if(type==='text'||type==='button'||type==='link'||type==='label')props.text=text;if(type==='link')props.href=x.attrs.href||'#';if(type==='image'){props.src=x.attrs.src||'';props.alt=x.attrs.alt||''}if(type==='input'){props.inputType=x.attrs.type||'text';props.name=x.attrs.name||'';props.placeholder=x.attrs.placeholder||''}const n=createNode(type,{name:x.attrs.id||x.attrs.class||x.tag,props,style:{base:parseInlineStyle(x.attrs.style||'')}});n.meta.domId=x.attrs.id||'';n.meta.className=x.attrs.class||'';n.children=(x.children||[]).map(htmlTreeNode).filter(Boolean);return n}
export function importHtmlText(text){const tree=basicMarkupTree(String(text)),body=tree.children.find(x=>x.tag==='html')?.children?.find(x=>x.tag==='body')||tree.children.find(x=>x.tag==='body')||tree;const p=createProject();p.name='html-import';p.pages[0].name='Imported HTML';p.pages[0].root.children=(body.children||[]).map(htmlTreeNode).filter(Boolean);ensureDesignProject(p);p.design.interchange.lastImport={platform:'html',at:new Date().toISOString()};return p}

function svgTreeNode(x){if(x.tag==='#text')return null;const a=x.attrs||{},style={position:'absolute',left:`${num(a.x??a.cx)-(/circle|ellipse/.test(x.tag)?num(a.r??a.rx):0)}px`,top:`${num(a.y??a.cy)-(/circle|ellipse/.test(x.tag)?num(a.r??a.ry):0)}px`},props={};let type='group';if(x.tag==='rect'){type='shapeRect';style.width=`${num(a.width,100)}px`;style.height=`${num(a.height,100)}px`;if(a.rx)style.borderRadius=`${num(a.rx)}px`}else if(x.tag==='circle'||x.tag==='ellipse'){type='shapeEllipse';style.width=`${num(a.r?num(a.r)*2:num(a.rx)*2,100)}px`;style.height=`${num(a.r?num(a.r)*2:num(a.ry)*2,100)}px`}else if(x.tag==='path'){type='svgPath';props.path=a.d||'';style.width='100px';style.height='100px'}else if(x.tag==='text'){type='text';props.text=(x.children||[]).filter(c=>c.tag==='#text').map(c=>c.text).join('').trim();style.width='200px';style.height='32px'}else if(x.tag==='image'){type='image';props.src=a.href||a['xlink:href']||'';style.width=`${num(a.width,100)}px`;style.height=`${num(a.height,100)}px`}else if(x.tag==='svg'||x.tag==='g'){type='group';style.width=`${num(a.width,300)}px`;style.height=`${num(a.height,200)}px`}if(a.fill&&a.fill!=='none')style.background=a.fill;if(a.opacity)style.opacity=a.opacity;const n=createNode(type,{name:a.id||x.tag,props,style:{base:style}});ensureDesignNode(n);if(a.stroke)n.design.effects.strokes=[{id:makeId('stroke'),color:a.stroke,width:num(a['stroke-width'],1),style:a['stroke-dasharray']?'dashed':'solid',dash:0,gap:0,visible:true}];n.children=(x.children||[]).map(svgTreeNode).filter(Boolean);return n}
export function importSvgText(text){const tree=basicMarkupTree(String(text)),svg=tree.children.find(x=>x.tag==='svg')||tree;const p=createProject();p.name='svg-import';p.pages[0].name='Imported SVG';const n=svgTreeNode(svg);p.pages[0].root.children=n?.children?.length?n.children:[n].filter(Boolean);ensureDesignProject(p);p.design.interchange.lastImport={platform:'svg',at:new Date().toISOString()};return p}

export function importNeutralJson(data){const v=typeof data==='string'?JSON.parse(data):data;if(v.format!=='astro-ui-interchange'||!v.project)throw new Error('Not Astro UI interchange JSON');const p=deepClone(v.project);ensureDesignProject(p);return p}

export const PLATFORM_ADAPTERS={
  penpot:{label:'Penpot v3 (.penpot)',extensions:['.penpot'],canImport:true,canExport:true,importFile:importPenpotV3,exportProject:exportPenpotV3,binary:true,note:'Clean-room v3 interchange; validate complex files in Penpot.'},
  figma:{label:'Figma REST-style JSON bridge',extensions:['.figma.json','.json'],canImport:true,canExport:true,importText:importFigmaJson,exportText:exportFigmaJson,note:'Bridge JSON, not native closed .fig.'},
  neutral:{label:'Neutral Designer JSON',extensions:['.aui.json'],canImport:true,canExport:true,importText:importNeutralJson,exportText:exportNeutralJson},
  html:{label:'Static HTML',extensions:['.html','.htm'],canImport:true,canExport:true,importText:importHtmlText,exportFiles:exportStaticHtml},
  svg:{label:'SVG',extensions:['.svg'],canImport:true,canExport:true,importText:importSvgText,exportText:exportSvg},
  react:{label:'React / JSX',extensions:['.jsx'],canImport:false,canExport:true,exportText:exportReact},
  vue:{label:'Vue SFC',extensions:['.vue'],canImport:false,canExport:true,exportText:exportVue},
  svelte:{label:'Svelte',extensions:['.svelte'],canImport:false,canExport:true,exportText:exportSvelte},
};
export function listPlatformAdapters(){return Object.entries(PLATFORM_ADAPTERS).map(([id,v])=>({id,...v}))}

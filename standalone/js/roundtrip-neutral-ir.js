export const NEUTRAL_UI_IR_VERSION=2;
let neutralCounter=1;
const nid=(prefix='n')=>`${prefix}-${(neutralCounter++).toString(36)}`;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const escHtml=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const escJs=v=>JSON.stringify(String(v??''));
const kebab=v=>String(v||'').replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`);
const camel=v=>String(v||'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());

export function createNeutralNode(overrides={}){
  return {id:overrides.id||nid('node'),type:overrides.type||'element',tag:overrides.tag||'div',name:overrides.name||overrides.tag||'Element',text:overrides.text||'',attrs:clone(overrides.attrs||{}),style:clone(overrides.style||{}),events:clone(overrides.events||{}),layout:clone(overrides.layout||{}),source:clone(overrides.source||{}),opaque:clone(overrides.opaque||null),children:(overrides.children||[]).map(createNeutralNode)};
}
export function createNeutralDocument({backend='unknown',filename='',root=null,diagnostics=[],metadata={}}={}){
  return {version:NEUTRAL_UI_IR_VERSION,backend,filename,root:root||createNeutralNode({type:'root',tag:'root',name:'Root'}),diagnostics:[...diagnostics],metadata:clone(metadata)};
}
export function walkNeutral(node,fn,parent=null){if(!node)return;fn(node,parent);for(const child of node.children||[])walkNeutral(child,fn,node);}
export function findNeutral(node,predicate){let out=null;walkNeutral(node,n=>{if(!out&&predicate(n))out=n});return out;}

function sourceTypeForTag(tag=''){
  const t=String(tag).toLowerCase();
  if(/^h[1-6]$/.test(t))return 'heading';if(t==='p'||t==='span'||t==='label')return 'text';if(t==='img')return 'image';if(t==='button')return 'button';if(t==='input'||t==='textarea'||t==='select')return 'input';if(t==='form')return 'form';if(t==='section')return 'section';if(t==='header')return 'header';if(t==='nav')return 'nav';if(t==='main')return 'main';if(t==='footer')return 'footer';return /^[A-Z]/.test(tag)?'component':'element';
}
function parseAttrText(raw=''){
  const attrs={};let i=0;
  while(i<raw.length){while(/\s/.test(raw[i]||''))i++;if(i>=raw.length)break;let name='';while(i<raw.length&&!/[\s=/>]/.test(raw[i]))name+=raw[i++];if(!name){i++;continue}while(/\s/.test(raw[i]||''))i++;if(raw[i]!=='='){attrs[name]=true;continue}i++;while(/\s/.test(raw[i]||''))i++;const q=raw[i];let value='';
    if(q==='"'||q==="'"){i++;while(i<raw.length&&raw[i]!==q){value+=raw[i++]}if(raw[i]===q)i++;attrs[name]=value;continue}
    if(q==='{'){let depth=0;do{const ch=raw[i++];value+=ch;if(ch==='{')depth++;else if(ch==='}')depth--}while(i<raw.length&&depth>0);attrs[name]={expression:value.slice(1,-1).trim()};continue}
    while(i<raw.length&&!/\s|>/.test(raw[i]))value+=raw[i++];attrs[name]=value;
  }
  return attrs;
}
function parseInlineStyle(value){
  if(!value||typeof value!=='string')return {};const out={};for(const part of value.split(';')){const i=part.indexOf(':');if(i<0)continue;const k=part.slice(0,i).trim(),v=part.slice(i+1).trim();if(k&&v)out[camel(k)]=v;}return out;
}
function parseCssRules(source=''){
  const rules=[];const re=/([^{}]+)\{([^{}]*)\}/g;let m;while((m=re.exec(source))){const selector=m[1].trim();if(!selector||selector.startsWith('@'))continue;rules.push({selector,style:parseInlineStyle(m[2])});}return rules;
}
function applicableRule(node,rule){
  const sels=rule.selector.split(',').map(x=>x.trim());return sels.some(sel=>{
    if(sel.startsWith('.'))return String(node.attrs.class||node.attrs.className||'').split(/\s+/).includes(sel.slice(1));
    if(sel.startsWith('#'))return node.attrs.id===sel.slice(1);
    return sel.toLowerCase()===String(node.tag).toLowerCase();
  });
}
function extractStyleBlocks(source){let css='';const stripped=String(source).replace(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style\s*>/gi,(all,body)=>{css+=`${body}\n`;return ''});return {stripped,css};}
function stripBackendPreamble(source,backend){let s=String(source);if(backend==='astro')s=s.replace(/^\s*---[\s\S]*?---\s*/,'');if(backend==='vue')s=s.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script\s*>/gi,'');if(backend==='svelte')s=s.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script\s*>/gi,'');return s;}

export function parseMarkupNeutral(source,{backend='vanilla-js',filename='index.html'}={}){
  const diagnostics=[];const {stripped,css}=extractStyleBlocks(stripBackendPreamble(source,backend));
  const root=createNeutralNode({type:'root',tag:'root',name:'Root',source:{filename}}),stack=[root];let textStart=0,i=0;
  const addText=(text,start,end)=>{const clean=String(text).replace(/\s+/g,' ').trim();if(!clean)return;const p=stack.at(-1);if(p&&p.type!=='root'&&!(p.children||[]).length&&!p.text)p.text=clean;else p.children.push(createNeutralNode({type:'text',tag:'#text',name:'Text',text:clean,source:{filename,start,end}}));};
  while(i<stripped.length){if(stripped[i]!=='<'){i++;continue}addText(stripped.slice(textStart,i),textStart,i);
    if(stripped.startsWith('<!--',i)){const end=stripped.indexOf('-->',i+4);i=end<0?stripped.length:end+3;textStart=i;continue}
    let j=i+1,quote='',brace=0;for(;j<stripped.length;j++){const ch=stripped[j];if(quote){if(ch==='\\'){j++;continue}if(ch===quote)quote='';continue}if(ch==='"'||ch==="'"){quote=ch;continue}if(ch==='{'){brace++;continue}if(ch==='}'){brace=Math.max(0,brace-1);continue}if(ch==='>'&&brace===0)break}if(j>=stripped.length){diagnostics.push('Unclosed markup tag.');break}
    const raw=stripped.slice(i+1,j).trim();const closing=raw.startsWith('/'),selfClosing=/\/$/.test(raw);if(closing){const name=raw.slice(1).trim().split(/\s+/)[0];for(let k=stack.length-1;k>0;k--){if(String(stack[k].tag).toLowerCase()===name.toLowerCase()){stack.length=k;break}}i=j+1;textStart=i;continue}
    if(raw.startsWith('!')||raw.startsWith('?')){i=j+1;textStart=i;continue}
    const cleanRaw=raw.replace(/\/$/,'').trim(),nameMatch=cleanRaw.match(/^([^\s/>]+)/);if(!nameMatch){i=j+1;textStart=i;continue}const tag=nameMatch[1],attrText=cleanRaw.slice(tag.length),attrs=parseAttrText(attrText);
    const node=createNeutralNode({type:sourceTypeForTag(tag),tag,name:String(attrs['data-ui-name']||attrs.id||tag),attrs,style:parseInlineStyle(typeof attrs.style==='string'?attrs.style:''),source:{filename,start:i,end:j+1,nodeId:typeof attrs['data-ui-id']==='string'?attrs['data-ui-id']:null,selector:typeof attrs.class==='string'?`.${attrs.class.split(/\s+/)[0]}`:typeof attrs.className==='string'?`.${attrs.className.split(/\s+/)[0]}`:attrs.id?`#${attrs.id}`:null}});
    stack.at(-1).children.push(node);if(!selfClosing&&!['img','input','br','hr','meta','link','source','area','base','embed','param','track','wbr'].includes(tag.toLowerCase()))stack.push(node);
    i=j+1;textStart=i;
  }
  addText(stripped.slice(textStart),textStart,stripped.length);
  const rules=parseCssRules(css);walkNeutral(root,n=>{for(const r of rules)if(applicableRule(n,r))Object.assign(n.style,r.style)});
  return createNeutralDocument({backend,filename,root,diagnostics,metadata:{cssRules:rules.length}});
}

function literal(v){const s=String(v??'').trim();if((s.startsWith('"')&&s.endsWith('"'))||(s.startsWith("'")&&s.endsWith("'")))return s.slice(1,-1).replace(/\\([\\"'])/g,'$1');if(/^\d+(?:\.\d+)?$/.test(s))return Number(s);if(s==='True'||s==='true')return true;if(s==='False'||s==='false')return false;return {expression:s};}
function splitArgs(raw=''){
  const out=[];let cur='',quote='',depth=0;for(let i=0;i<raw.length;i++){const ch=raw[i];if(quote){cur+=ch;if(ch==='\\'){cur+=raw[++i]||'';continue}if(ch===quote)quote='';continue}if(ch==='"'||ch==="'"){quote=ch;cur+=ch;continue}if('([{'.includes(ch)){depth++;cur+=ch;continue}if(')]}'.includes(ch)){depth--;cur+=ch;continue}if(ch===','&&depth===0){out.push(cur.trim());cur='';continue}cur+=ch}if(cur.trim())out.push(cur.trim());return out;
}
function kwargs(raw=''){const parts=splitArgs(raw),pos=[],kw={};for(const p of parts){const i=p.indexOf('=');if(i>0&&/^[A-Za-z_]\w*$/.test(p.slice(0,i).trim()))kw[p.slice(0,i).trim()]=literal(p.slice(i+1));else pos.push(literal(p));}return {pos,kw};}
function pythonStyleFromKw(kw={}){const s={};const map={bg:'backgroundColor',background:'backgroundColor',fg:'color',foreground:'color',width:'width',height:'height',font:'fontFamily',padx:'paddingLeft',pady:'paddingTop'};for(const [k,v] of Object.entries(kw))if(map[k]&&typeof v!=='object')s[map[k]]=typeof v==='number'&&['width','height'].includes(map[k])?String(v):String(v);return s;}

export function parseTkinterNeutral(source,{filename='main.py'}={}){
  const root=createNeutralNode({type:'root',tag:'root',name:'TkRoot',source:{filename}}),symbols=new Map(),pending=[];symbols.set('root',root);symbols.set('self',root);
  const lines=String(source).split(/\r?\n/);for(let lineNo=0;lineNo<lines.length;lineNo++){const line=lines[lineNo],m=line.match(/^\s*([A-Za-z_]\w*)\s*=\s*(?:(?:tk|ttk|tkinter)\.)?([A-Za-z_]\w*)\s*\((.*)\)\s*$/);if(m){const [,symbol,klass,argsRaw]=m,{pos,kw}=kwargs(argsRaw);if(/^(?:Tk|Toplevel)$/i.test(klass)){root.name=symbol;root.tag=`tk.${klass}`;root.attrs={...root.attrs,symbol};root.source={filename,line:lineNo+1,symbolPath:symbol};symbols.set(symbol,root);continue}const parentRaw=pos[0],parentName=typeof parentRaw==='object'?parentRaw.expression:String(parentRaw||'root').replace(/^self\./,'');const text=typeof kw.text==='object'?'':String(kw.text??'');const tag=klass.toLowerCase(),node=createNeutralNode({type:/label/.test(tag)?'text':/button/.test(tag)?'button':/entry|text/.test(tag)?'input':/frame|canvas/.test(tag)?'container':'element',tag:`tk.${klass}`,name:symbol,text,attrs:{...kw,symbol},style:pythonStyleFromKw(kw),source:{filename,line:lineNo+1,symbolPath:symbol,parentSymbol:parentName}});symbols.set(symbol,node);pending.push({node,parentName});continue}
    const g=line.match(/^\s*([A-Za-z_]\w*)\.(pack|grid|place)\s*\((.*)\)/);if(g&&symbols.has(g[1])){const {kw}=kwargs(g[3]),n=symbols.get(g[1]);n.layout={manager:g[2],...kw};for(const [k,v] of Object.entries(kw)){if(typeof v==='number'&&['x','y','width','height'].includes(k))n.style[k==='x'?'left':k==='y'?'top':k]=`${v}px`;}continue}
    const cfg=line.match(/^\s*([A-Za-z_]\w*)\.(?:config|configure)\s*\((.*)\)/);if(cfg&&symbols.has(cfg[1])){const {kw}=kwargs(cfg[2]),n=symbols.get(cfg[1]);if(typeof kw.text!=='object'&&kw.text!=null)n.text=String(kw.text);Object.assign(n.attrs,kw);Object.assign(n.style,pythonStyleFromKw(kw));}
  }
  for(const item of pending){const parent=symbols.get(item.parentName)||root;parent.children.push(item.node)}return createNeutralDocument({backend:'tkinter',filename,root,diagnostics:[],metadata:{symbols:symbols.size-2}});
}

export function parseNiceGuiNeutral(source,{filename='main.py'}={}){
  const root=createNeutralNode({type:'root',tag:'root',name:'NiceGUI',source:{filename}}),contexts=[{indent:-1,node:root}],symbols=new Map();const lines=String(source).split(/\r?\n/);
  for(let lineNo=0;lineNo<lines.length;lineNo++){const line=lines[lineNo],indent=(line.match(/^\s*/)?.[0]||'').replace(/\t/g,'    ').length;while(contexts.length>1&&indent<=contexts.at(-1).indent)contexts.pop();
    const withM=line.match(/^\s*with\s+ui\.(row|column|card|grid|tabs|tab_panels)\s*\((.*)\)\s*(?:as\s+([A-Za-z_]\w*))?\s*:/);if(withM){const node=createNeutralNode({type:'container',tag:`ui.${withM[1]}`,name:withM[3]||withM[1],attrs:{symbol:withM[3]||''},source:{filename,line:lineNo+1,symbolPath:withM[3]||null}});contexts.at(-1).node.children.push(node);if(withM[3])symbols.set(withM[3],node);contexts.push({indent,node});continue}
    const m=line.match(/^\s*(?:([A-Za-z_]\w*)\s*=\s*)?ui\.(label|button|input|textarea|select|image|icon|card|row|column|grid|link)\s*\((.*)\)/);if(!m)continue;const [,symbol,kind,argsRaw]=m,{pos,kw}=kwargs(argsRaw),first=pos[0],text=typeof first==='string'?first:(typeof kw.text==='string'?kw.text:'');const node=createNeutralNode({type:kind==='label'?'text':kind==='button'?'button':/input|textarea|select/.test(kind)?'input':/row|column|grid|card/.test(kind)?'container':kind==='image'?'image':'element',tag:`ui.${kind}`,name:symbol||kind,text,attrs:{...kw,symbol:symbol||''},source:{filename,line:lineNo+1,symbolPath:symbol||null}});contexts.at(-1).node.children.push(node);if(symbol)symbols.set(symbol,node);
  }
  return createNeutralDocument({backend:'nicegui',filename,root,diagnostics:[],metadata:{symbols:symbols.size}});
}

export function parseLvglNeutral(source,{filename='ui.c'}={}){
  const root=createNeutralNode({type:'root',tag:'root',name:'LVGL',source:{filename}}),symbols=new Map(),pending=[];const text=String(source);
  const createRe=/(?:lv_obj_t\s*\*\s*)?([A-Za-z_]\w*)\s*=\s*lv_([A-Za-z0-9_]+)_create\s*\(\s*([A-Za-z_]\w*|NULL)\s*\)\s*;/g;let m;while((m=createRe.exec(text))){const [,symbol,kind,parent]=m,node=createNeutralNode({type:kind==='label'?'text':kind==='btn'?'button':/cont|obj|screen/.test(kind)?'container':'element',tag:`lv_${kind}`,name:symbol,attrs:{symbol},source:{filename,start:m.index,end:createRe.lastIndex,symbolPath:symbol,parentSymbol:parent}});symbols.set(symbol,node);pending.push({node,parent});}
  for(const {node,parent} of pending)(symbols.get(parent)||root).children.push(node);
  const apply=(re,fn)=>{let x;while((x=re.exec(text))){const n=symbols.get(x[1]);if(n)fn(n,x)}};
  apply(/lv_label_set_text\s*\(\s*([A-Za-z_]\w*)\s*,\s*"((?:\\.|[^"\\])*)"\s*\)\s*;/g,(n,x)=>n.text=x[2].replace(/\\n/g,'\n').replace(/\\"/g,'"'));
  apply(/lv_obj_set_pos\s*\(\s*([A-Za-z_]\w*)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g,(n,x)=>Object.assign(n.style,{position:'absolute',left:`${x[2]}px`,top:`${x[3]}px`}));
  apply(/lv_obj_set_size\s*\(\s*([A-Za-z_]\w*)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g,(n,x)=>Object.assign(n.style,{width:`${x[2]}px`,height:`${x[3]}px`}));
  return createNeutralDocument({backend:'lvgl',filename,root,diagnostics:[],metadata:{symbols:symbols.size}});
}

export function importSourceToNeutral({backend,source,filename=''}){
  if(backend==='tkinter')return parseTkinterNeutral(source,{filename:filename||'main.py'});if(backend==='nicegui')return parseNiceGuiNeutral(source,{filename:filename||'main.py'});if(backend==='lvgl')return parseLvglNeutral(source,{filename:filename||'ui.c'});return parseMarkupNeutral(source,{backend,filename:filename||'index.html'});
}
export function mergeNeutralDocuments(documents=[]){const root=createNeutralNode({type:'root',tag:'root',name:'Project'}),diagnostics=[];for(const doc of documents||[]){root.children.push(...clone(doc.root?.children||[]));diagnostics.push(...(doc.diagnostics||[]))}return createNeutralDocument({backend:documents[0]?.backend||'unknown',filename:documents[0]?.filename||'',root,diagnostics,metadata:{documents:documents.length}});}
export function importFilesToNeutral(files=[],{backend='unknown',entryFile=''}={}){const normalized=(files||[]).map(f=>({filename:String(f.filename||f.path||''),source:String(f.content??f.source??'')}));const sourceFiles=normalized.filter(f=>f.filename&&f.source);const preferred=entryFile?sourceFiles.find(f=>f.filename===entryFile):null;const relevant=preferred?[preferred]:sourceFiles;return mergeNeutralDocuments(relevant.map(f=>importSourceToNeutral({backend,source:f.source,filename:f.filename})));}

function styleString(style={}){return Object.entries(style).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>`${kebab(k)}: ${v}`).join('; ');}
function attrPairs(node,{react=false}={}){const attrs={...(node.attrs||{})};delete attrs.symbol;delete attrs['data-ui-name'];if(node.source?.nodeId&&!attrs['data-ui-id'])attrs['data-ui-id']=node.source.nodeId;if(Object.keys(node.style||{}).length&&!attrs.style)attrs.style=styleString(node.style);const out=[];for(let [k,v] of Object.entries(attrs)){if(k==='style'&&react){const entries=Object.entries(node.style||{}).map(([sk,sv])=>`${JSON.stringify(sk)}:${JSON.stringify(String(sv))}`);if(entries.length)out.push(`style={{${entries.join(',')}}}`);continue}if(k==='class'&&react)k='className';if(v===true)out.push(k);else if(v&&typeof v==='object'&&'expression'in v)out.push(`${k}={${v.expression}}`);else if(v!=null&&v!==false)out.push(`${k}=${JSON.stringify(String(v))}`);}return out.join(' ');}
const nativeVoid=new Set(['img','input','br','hr','meta','link','source','area','base','embed','param','track','wbr']);
function nodeMarkup(node,{react=false,indent=0}={}){const pad='  '.repeat(indent);if(node.tag==='#text')return `${pad}${escHtml(node.text)}`;let tag=node.tag||'div';if(/^ui\.|^tk\.|^lv_/.test(tag))tag='div';const attrs=attrPairs(node,{react}),open=`<${tag}${attrs?` ${attrs}`:''}>`;if(nativeVoid.has(tag.toLowerCase()))return `${pad}<${tag}${attrs?` ${attrs}`:''}${react?' /':''}>`;const body=[];if(node.text)body.push(`${'  '.repeat(indent+1)}${escHtml(node.text)}`);for(const c of node.children||[])body.push(nodeMarkup(c,{react,indent:indent+1}));if(!body.length)return `${pad}<${tag}${attrs?` ${attrs}`:''}></${tag}>`;return `${pad}${open}\n${body.join('\n')}\n${pad}</${tag}>`;}
function bodyMarkup(root,opts={}){return (root.children||[]).map(n=>nodeMarkup(n,opts)).join('\n');}

export function generateAstroFromNeutral(doc,{componentName='ImportedUI'}={}){return {[`${componentName}.astro`]:`---\n// Generated from Astro UI Designer neutral IR.\n---\n${bodyMarkup(doc.root)}\n`};}
export function generateReactFromNeutral(doc,{componentName='ImportedUI'}={}){const jsx=bodyMarkup(doc.root,{react:true,indent:2});return {[`${componentName}.tsx`]:`import React from 'react';\n\nexport default function ${componentName}(){\n  return (\n    <>\n${jsx}\n    </>\n  );\n}\n`};}
export function generateVueFromNeutral(doc,{componentName='ImportedUI'}={}){return {[`${componentName}.vue`]:`<template>\n${bodyMarkup(doc.root,{indent:1})}\n</template>\n\n<script setup lang="ts">\n// Generated from Astro UI Designer neutral IR.\n</script>\n`};}
export function generateSvelteFromNeutral(doc,{componentName='ImportedUI'}={}){return {[`${componentName}.svelte`]:`<script lang="ts">\n// Generated from Astro UI Designer neutral IR.\n</script>\n\n${bodyMarkup(doc.root)}\n`};}
export function generateVanillaFromNeutral(doc){return {'index.html':`<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Imported UI</title></head><body>\n${bodyMarkup(doc.root,{indent:1})}\n</body></html>\n`};}

function pyIdent(name='widget'){return String(name||'widget').replace(/\W+/g,'_').replace(/^\d/,'_$&')||'widget';}
export function generateTkinterFromNeutral(doc){const lines=['import tkinter as tk','','root = tk.Tk()','root.title("Imported UI")'];let counter=0;const emit=(node,parent='root')=>{const sym=pyIdent(node.attrs?.symbol||node.name||`widget_${++counter}`),text=node.text?`, text=${escJs(node.text)}`:'';let klass=node.type==='text'?'Label':node.type==='button'?'Button':node.type==='input'?'Entry':'Frame';lines.push(`${sym} = tk.${klass}(${parent}${text})`);if(node.style?.left||node.style?.top||node.style?.width||node.style?.height){const n=v=>parseInt(String(v||'0'),10)||0;lines.push(`${sym}.place(x=${n(node.style.left)}, y=${n(node.style.top)}, width=${n(node.style.width)||100}, height=${n(node.style.height)||30})`)}else lines.push(`${sym}.pack()`);for(const c of node.children||[])emit(c,sym)};for(const c of doc.root.children||[])emit(c);lines.push('','root.mainloop()','');return {'main.py':lines.join('\n')};}
export function generateNiceGuiFromNeutral(doc){const lines=['from nicegui import ui',''];const emit=(node,indent=0)=>{const p='    '.repeat(indent),kind=node.type==='text'?'label':node.type==='button'?'button':node.type==='input'?'input':node.type==='image'?'image':node.type==='container'?'column':'element';if(kind==='column'){lines.push(`${p}with ui.column():`);if((node.children||[]).length)for(const c of node.children)emit(c,indent+1);else lines.push(`${p}    pass`);return}if(kind==='element')lines.push(`${p}ui.element('div')`);else lines.push(`${p}ui.${kind}(${node.text?escJs(node.text):''})`);};for(const c of doc.root.children||[])emit(c);lines.push('','ui.run()','');return {'main.py':lines.join('\n')};}
export function generateLvglFromNeutral(doc){const c=['#include <lvgl.h>','','void build_ui(lv_obj_t * parent) {'];let counter=0;const emit=(node,parent='parent',indent='    ')=>{const sym=pyIdent(node.attrs?.symbol||node.name||`obj_${++counter}`),kind=node.type==='text'?'label':node.type==='button'?'button':'obj';c.push(`${indent}lv_obj_t * ${sym} = lv_${kind}_create(${parent});`);if(node.text)c.push(`${indent}lv_label_set_text(${sym}, ${JSON.stringify(node.text)});`);const n=v=>parseInt(String(v||'0'),10)||0;if(node.style?.left||node.style?.top)c.push(`${indent}lv_obj_set_pos(${sym}, ${n(node.style.left)}, ${n(node.style.top)});`);if(node.style?.width||node.style?.height)c.push(`${indent}lv_obj_set_size(${sym}, ${n(node.style.width)||100}, ${n(node.style.height)||30});`);for(const child of node.children||[])emit(child,sym,indent)};for(const node of doc.root.children||[])emit(node);c.push('}','');return {'ui.c':c.join('\n'),'ui.h':'#pragma once\n#include <lvgl.h>\nvoid build_ui(lv_obj_t * parent);\n'};}

export function generateNeutralBackend(doc,backend,options={}){if(backend==='astro')return generateAstroFromNeutral(doc,options);if(backend==='react')return generateReactFromNeutral(doc,options);if(backend==='vue')return generateVueFromNeutral(doc,options);if(backend==='svelte')return generateSvelteFromNeutral(doc,options);if(backend==='tkinter')return generateTkinterFromNeutral(doc,options);if(backend==='nicegui')return generateNiceGuiFromNeutral(doc,options);if(backend==='lvgl')return generateLvglFromNeutral(doc,options);return generateVanillaFromNeutral(doc,options);}

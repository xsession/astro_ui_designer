import { createProject, createNode, makeId, deepClone } from './model.js';
import { generateAstroProject } from './astro-exporter.js';
export const PLATFORM_ADAPTERS=[
{id:'astro',label:'Astro',direction:'both'},{id:'html',label:'HTML',direction:'both'},{id:'react',label:'React',direction:'both'},{id:'vue',label:'Vue',direction:'both'},{id:'svelte',label:'Svelte',direction:'both'},{id:'svg',label:'SVG',direction:'both'},{id:'penpot-v3',label:'Penpot v3',direction:'both'},{id:'figma-json',label:'Figma JSON bridge',direction:'both'},{id:'neutral-json',label:'Neutral UI JSON',direction:'both'}];
export const listPlatformAdapters=()=>deepClone(PLATFORM_ADAPTERS);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function htmlNode(n){const tag=({heading:'h2',text:'p',button:'button',link:'a',image:'img',section:'section',header:'header',footer:'footer',nav:'nav'}[n.type]||'div');const attrs=`data-ui-id="${esc(n.id)}"${n.meta?.className?` class="${esc(n.meta.className)}"`:''}`;if(tag==='img')return `<img ${attrs} src="${esc(n.props?.src||'')}" alt="${esc(n.props?.alt||'')}"/>`;const text=['heading','text','button','link','badge','label'].includes(n.type)?esc(n.props?.text||''):'';return `<${tag} ${attrs}>${text}${(n.children||[]).map(htmlNode).join('')}</${tag}>`}
function activeRoot(project){return project.pages?.[0]?.root||createNode('page')}
export function exportStaticHtml(project){return `<!doctype html><html><body>${htmlNode(activeRoot(project))}</body></html>`}
export function exportReact(project){return `export default function DesignerPage(){return <>${htmlNode(activeRoot(project)).replace(/class=/g,'className=')}</>}`}
export function exportVue(project){return `<template>${htmlNode(activeRoot(project))}</template>\n<script setup>\n</script>`}
export function exportSvelte(project){return `<script>\n</script>\n${htmlNode(activeRoot(project))}`}
export function exportSvg(project){return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${htmlNode(activeRoot(project))}</div></foreignObject></svg>`}
export function exportNeutralJson(project){return JSON.stringify({format:'astro-ui-neutral',version:1,project},null,2)}
export function exportFigmaJson(project){return JSON.stringify({format:'figma-bridge',version:1,document:{name:project.name,project}},null,2)}
export function exportPenpotV3(project){return JSON.stringify({format:'penpot-v3-cleanroom',version:3,project},null,2)}
function fromText(text,name='Imported'){const p=createProject();p.name=name;const root=p.pages[0].root,section=createNode('section',{name:'ImportedSource'}),code=createNode('text',{name:'ImportedMarkup',props:{text:String(text).slice(0,20000)},meta:{sourceOwnership:'code'}});section.children.push(code);root.children=[section];return p}
export function importHtmlText(text){return fromText(text,'HTML import')}
export function importSvgText(text){return fromText(text,'SVG import')}
export function importNeutralJson(text){const x=typeof text==='string'?JSON.parse(text):text;return deepClone(x.project||x)}
export function importFigmaJson(text){const x=typeof text==='string'?JSON.parse(text):text;return deepClone(x.document?.project||x.project||createProject())}
export function importPenpotV3(text){const x=typeof text==='string'?JSON.parse(text):text;return deepClone(x.project||createProject())}

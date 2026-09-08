import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COMPONENTS } from '../standalone/js/registry.js';
import { STATIC_CONTROL_TOOLTIPS, MENU_TOOLTIPS, DOCK_PANEL_TOOLTIPS, tooltipForDescriptor, TOOLTIP_TARGET_SELECTOR } from '../standalone/js/tooltips.js';

const html=fs.readFileSync(new URL('../standalone/index.html',import.meta.url),'utf8');
const attr=(raw,name)=>raw.match(new RegExp(`${name}=["']([^"']*)["']`,'i'))?.[1]||'';
const dataAttrs=raw=>Object.fromEntries([...raw.matchAll(/data-([a-z0-9-]+)=["']([^"']*)["']/gi)].map(m=>[m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),m[2]]));
const strip=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

// Every static button in the shell must resolve to a tooltip.
const buttons=[...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
assert.ok(buttons.length>50,'expected a dense UI shell');
for(const m of buttons){
  const raw=m[1], text=strip(m[2]);
  const tip=tooltipForDescriptor({
    id:attr(raw,'id'),title:attr(raw,'title'),ariaLabel:attr(raw,'aria-label'),role:attr(raw,'role'),
    className:attr(raw,'class'),tagName:'BUTTON',text,dataset:dataAttrs(raw)
  });
  assert.ok(tip,`missing tooltip for static button: ${attr(raw,'id')||text||raw}`);
}

// All top-level menus have purpose-specific help, not only a generic label.
for(const id of ['file','edit','form','layout','view','project','build','help'])assert.ok(MENU_TOOLTIPS[id]?.length>20,`missing menu tooltip: ${id}`);

// Every registered dock tab has a semantic description.
for(const m of html.matchAll(/data-(?:left|right|bottom)-tab=["']([^"']+)["']/g))assert.ok(DOCK_PANEL_TOOLTIPS[m[1]],`missing dock tooltip: ${m[1]}`);

// Every palette component can generate an insertion tooltip.
for(const [type,spec] of Object.entries(COMPONENTS)){
  if(type==='page'||spec.paletteHidden)continue;
  const tip=tooltipForDescriptor({tagName:'BUTTON',dataset:{add:type},text:spec.label});
  assert.match(tip,new RegExp(spec.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
}

// Dynamic relocation/menu controls are covered too.
for(const desc of [
  {dataset:{dockMove:'left'},tagName:'BUTTON',text:'Dock Left'},
  {dataset:{dockFloat:''},tagName:'BUTTON',text:'Float'},
  {dataset:{dockReset:''},tagName:'BUTTON',text:'Reset all docks'},
  {dataset:{floatDock:'right'},tagName:'BUTTON',text:'R'},
  {dataset:{floatHome:''},tagName:'BUTTON',text:'↩'},
  {dataset:{dockPanel:'bottom:objects'},tagName:'BUTTON',text:'Object Tree'},
  {dataset:{style:'display:flex'},tagName:'BUTTON',text:'Flex'},
  {dataset:{textAlign:'center'},tagName:'BUTTON',text:'Center'}
]) assert.ok(tooltipForDescriptor(desc));

assert.match(TOOLTIP_TARGET_SELECTOR,/button/);
assert.ok(Object.keys(STATIC_CONTROL_TOOLTIPS).length>=35);
console.log('tooltips.test.mjs passed');
